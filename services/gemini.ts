import { GoogleGenAI, Type } from "@google/genai";
import type { Analysis, HistoricalReport, ChartData } from '../types';
import { eventBus } from './eventBus';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// --- Sistema de Fila de Requisições para Evitar Rate Limit (429) ---

const requestQueue: {
    requestFn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
}[] = [];
let isProcessingQueue = false;
// Intervalo de segurança aumentado para 6 segundos (10 RPM), bem abaixo do
// limite comum de 15 RPM da API, para garantir estabilidade mesmo com múltiplas abas.
const REQUEST_DELAY_MS = 6000; 

async function processQueue() {
    if (isProcessingQueue || requestQueue.length === 0) {
        isProcessingQueue = false;
        eventBus.emit('queue:change', requestQueue.length); // Garante que o estado final seja emitido
        return;
    }
    isProcessingQueue = true;

    const { requestFn, resolve, reject } = requestQueue.shift()!;
    eventBus.emit('queue:change', requestQueue.length); // Emite o novo tamanho da fila após a remoção
    
    try {
        const result = await requestFn();
        resolve(result);
    } catch (error) {
        reject(error);
    }

    setTimeout(() => {
        isProcessingQueue = false;
        processQueue();
    }, REQUEST_DELAY_MS);
}

function addToQueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        requestQueue.push({ requestFn, resolve, reject });
        eventBus.emit('queue:change', requestQueue.length); // Emite o novo tamanho da fila após a adição
        if (!isProcessingQueue) {
            processQueue();
        }
    });
}

// --- Manipulador de Erros Centralizado (Versão Robusta) ---

function handleGeminiError(error: unknown, context: string): never {
    console.error(`Erro ao chamar a API Gemini (${context}):`, error);

    const rateLimitMessage = `Limite de requisições da API atingido. A PRISMA IA está em modo de espera para respeitar os limites. Sua requisição será processada pela fila. Se o erro persistir, verifique seu plano de API ou aguarde um minuto.`;

    // Converte o erro para uma string para uma busca robusta e à prova de falhas de formato.
    const errorString = JSON.stringify(error).toLowerCase();
    
    const isRateLimitError = 
        errorString.includes('429') || 
        errorString.includes('resource_exhausted') || 
        errorString.includes('quota');

    if (isRateLimitError) {
        throw new Error(rateLimitMessage);
    }
    
    // Tenta extrair uma mensagem de erro mais legível do objeto.
    let finalErrorMessage = `Erro na IA durante ${context}.`;
    if (typeof error === 'object' && error !== null) {
        const anyError = error as any;
        const message = anyError.message || anyError.error?.message;
        if (message && typeof message === 'string') {
             try {
                // Tenta parsear se a mensagem for um JSON stringificado
                const parsed = JSON.parse(message);
                finalErrorMessage = `Erro na IA durante ${context}: ${parsed?.error?.message || message}`;
             } catch {
                finalErrorMessage = `Erro na IA durante ${context}: ${message}`;
             }
        } else {
             finalErrorMessage = `Erro durante ${context}: ${JSON.stringify(error)}`;
        }
    } else if (error) {
        finalErrorMessage = `Erro durante ${context}: ${String(error)}`;
    }

    throw new Error(finalErrorMessage);
}


// --- Funções da API ---

function dataUrlToGeminiPart(dataUrl: string) {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
    return {
        inlineData: {
            mimeType,
            data,
        },
    };
}

// FIX: Updated analysis schema to include the 'confidence' field.
const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        asset: { type: Type.STRING, description: "O nome do ativo de negociação, por exemplo 'EUR/USD'." },
        price: { type: Type.NUMBER, description: "O preço de mercado atual do ativo." },
        signal: { type: Type.STRING, enum: ["CALL", "PUT", "WAIT"], description: "O sinal de negociação. Preenchido apenas no modo 'predict'." },
        confidence: { type: Type.STRING, enum: ["Extrema", "Alta", "Média"], description: "O nível de confiança no sinal, baseado na confluência de padrões e na clareza do gatilho." },
        entrySuggestion: { type: Type.STRING, enum: ["IMMEDIATE", "NEXT_CANDLE"], description: "Sugestão de timing para a entrada. 'IMMEDIATE' para entrar nos segundos finais da vela ATUAL. 'NEXT_CANDLE' para entrar na abertura da PRÓXIMA vela. Preenchido apenas quando o sinal for 'CALL' ou 'PUT'." },
        reasoning: { type: Type.STRING, description: "A justificativa técnica para o sinal (modo 'predict') ou para a observação (modo 'observe')." },
        timeframe: { type: Type.STRING, description: "O timeframe do gráfico, se identificável (ex: 'M1', 'M5')." },
        candleTimer: { type: Type.STRING, description: "O tempo restante no cronômetro da vela atual, se visível (ex: '00:12')." },
        observation: { type: Type.STRING, description: "Uma breve tese sobre por que a última vela fechou como fechou. Preenchido apenas no modo 'observe'." },
        candleOutcome: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "DOJI"], description: "O resultado da última vela analisada. Preenchido apenas no modo 'observe'." },
    },
    required: ["asset", "price", "reasoning"]
};

const historicalAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        marketCondition: { type: Type.STRING, enum: ["Uptrend", "Downtrend", "Consolidation"], description: "A condição geral do mercado no gráfico (Tendência de Alta, Baixa ou Consolidação)." },
        keyLevels: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    level: { type: Type.NUMBER, description: "O valor numérico do nível de preço." },
                    type: { type: Type.STRING, enum: ["Support", "Resistance"], description: "O tipo de nível (Suporte ou Resistência)." }
                },
                required: ["level", "type"]
            },
            description: "Uma lista dos mais importantes níveis de suporte e resistência visíveis."
        },
        identifiedPatterns: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Uma lista de padrões técnicos identificados (ex: LTA, LTB, pullback, rompimento, consolidação, canal)."
        },
        strategicSummary: { type: Type.STRING, description: "Um resumo conciso da 'história' que o gráfico está contando e o que esperar a seguir. Esta é a inteligência que será usada para futuras previsões." }
    },
    required: ["marketCondition", "keyLevels", "identifiedPatterns", "strategicSummary"]
};

const knowledgeSchema = {
    type: Type.OBJECT,
    properties: {
        newKnowledge: { type: Type.STRING, description: "Um parágrafo conciso resumindo as estratégias VENCEDORAS aprendidas da fonte externa. Deve ser escrito na primeira pessoa, como se a IA estivesse descrevendo o seu novo manual de táticas." }
    },
    required: ["newKnowledge"]
};


interface AnalyzeImageParams {
    imageDataUrl: string | string[];
    mode: 'predict' | 'observe' | 'historical' | 'recording';
    history?: string[];
    strategicContext?: string;
}

const performAnalyzeImage = async ({ imageDataUrl, mode, history = [], strategicContext }: AnalyzeImageParams): Promise<Analysis | HistoricalReport> => {
    
    const imageParts = Array.isArray(imageDataUrl) 
        ? imageDataUrl.map(dataUrlToGeminiPart) 
        : [dataUrlToGeminiPart(imageDataUrl)];

    const basePrompt = `Você é a PRISMA IA, um mestre trader digital, especialista em análise de Price Action e padrões gráficos para opções binárias de curto prazo (M1, M5).`;

    const observePrompt = `
**MODO APRENDIZADO ATIVADO:**
Sua missão é observar a vela que ACABOU DE FECHAR e construir uma memória de análise contextual.

1.  **Analise a Anatomia da Última Vela:** Olhe para a vela mais recente. Analise seu corpo, seus pavios e onde ela fechou em relação ao contexto (zonas de suporte/resistência, Fibonacci).
2.  **Formule uma Tese de Price Action:** Com base no contexto e na anatomia da vela, explique em uma frase curta e objetiva **POR QUE** essa vela se comportou dessa maneira. Exemplo: "Forte rejeição de baixa na zona de resistência, com pavio superior longo, confirmando a zona de oferta." ou "Volume de compra entrou nos segundos finais, engolfando a vela anterior e rompendo a micro-tendência."
3.  **NÃO ANALISE INDICADORES:** Foque apenas na ação do preço.
4.  **NÃO GERE SINAL:** Neste modo, você apenas observa e aprende. O campo 'signal' deve ser 'WAIT'. Preencha 'observation' e 'candleOutcome'.`;

    // FIX: Updated the prediction prompt to be more detailed and aligned with advanced trading concepts.
    const getPredictPrompt = (strategicCtx: string | null | undefined, hist: string[]) => `
**MODO PREDIÇÃO DE ELITE ATIVADO (LÓGICA DO PREÇO):**
Sua missão é operar como um mestre da Lógica do Preço, usando seu profundo conhecimento para encontrar uma entrada de altíssima probabilidade, baseada nos padrões vencedores que você estudou.

**Contexto Estratégico Principal (Sua Memória e Conhecimento Mestre):**
${strategicCtx || "Nenhuma análise histórica profunda foi realizada ainda."}

**Memória de Análise Recente (Observações):**
${hist.length > 0 ? hist.map(h => `- ${h}`).join('\n') : "Nenhuma observação recente."}

**REGRAS DE ENGAJAMENTO DE UM MESTRE DA LÓGICA DO PREÇO:**
1.  **FOCO TOTAL EM PRICE ACTION E PADRÕES APRENDIDOS:** Sua análise deve se basear 100% no seu 'Contexto Estratégico Principal' (Comandos, Velas Expiradas, Limitação de Preço, Liquidez, Simetria, etc.). **IGNORE INDICADORES PADRÕES COMO RSI, MACD, ETC.**, a menos que façam parte de uma tática específica que você aprendeu.
2.  **NÃO FORCE OPERAÇÕES (DISCIPLINA MÁXIMA):** Se o cenário atual não for uma réplica quase perfeita de um padrão vencedor que você conhece, sua resposta **DEVE SER 'WAIT'**. A paciência é sua maior arma. É melhor não operar do que entrar em um cenário duvidoso.
3.  **CUIDADO COM A VOLATILIDADE SÚBITA:** Se a vela atual ganhar força inesperada CONTRA sua análise, ABORTE e gere 'WAIT'. Proteção de capital é a prioridade.
4.  **DECIDA O TIMING DA ENTRADA:** Se um padrão perfeito for encontrado, defina o 'entrySuggestion' com base no tempo restante e na ação do preço:
    *   **'IMMEDIATE':** Se a confirmação do movimento acontecer AGORA e houver tempo suficiente na vela atual (ex: > 10 segundos restantes) para uma entrada segura.
    *   **'NEXT_CANDLE':** Se a confirmação estiver se formando, mas o tempo na vela atual for muito curto (ex: < 10 segundos), ou se a melhor entrada for na abertura da próxima vela.
5.  **AVALIE A CONFIANÇA:** Com base na clareza e na confluência de fatores, determine o nível de confiança ('Extrema', 'Alta', 'Média'). A confiança 'Extrema' é reservada para cenários de confluência perfeita.

**Sua Missão:**
1.  **Busque o Padrão Perfeito:** Analise o gráfico atual. Ele corresponde a algum dos setups de alta probabilidade do seu 'Contexto Estratégico Principal'? (Ex: Comando defendido, Rejeição em zona de liquidez, Simetria de velas, etc.).
2.  **Gere um Sinal (SE E SOMENTE SE um padrão vencedor for identificado):**
    *   **'CALL' (Compra) / 'PUT' (Venda):** A confluência de fatores é inegável e corresponde a uma estratégia vencedora.
    *   **'WAIT' (Aguardar):** Esta será sua resposta na maioria das vezes. O mercado não apresenta um padrão claro.
3.  **Justificativa Baseada em Conhecimento:** Explique sua decisão, conectando a ação do preço atual a uma tática específica do seu conhecimento de Lógica do Preço.
4.  **NÃO PREENCHA 'observation' ou 'candleOutcome'**.`;
    
    const historicalPrompt = `
**MODO ANÁLISE HISTÓRICA ATIVADO:**
Sua missão é atuar como um analista de mercado sênior. Você recebeu uma imagem panorâmica de um ativo. Vá além do óbvio.

**Sua Missão:**
1.  **Disseque a Ação do Preço:**
    *   **Tendência Principal:** Qual é a narrativa geral? LTA, LTB, Canal, ou Consolidação?
    *   **Níveis-Chave:** Mapeie as zonas de suporte e resistência mais críticas, onde ocorreram as batalhas mais significativas.
    *   **Microestrutura:** Analise a formação das velas em pontos-chave. Houve velas de força rompendo níveis ou pavios longos mostrando rejeição? Como o preço se comportou após os rompimentos (pullbacks, continuações)? Identifique a pressão compradora/vendedora.
2.  **Liste Padrões e Comportamentos:** Descreva em uma lista os principais eventos técnicos observados. Exemplos: "Forte rompimento de LTB com vela de força", "Pullback preciso na zona de 1.08500, que antes era suporte e agora atua como resistência", "Preço mostrando exaustão com pavios longos nos topos".
3.  **Crie um Resumo Estratégico:** Com base em sua análise profunda, escreva um parágrafo conciso que conte a "história" do gráfico. Qual é o plano de fundo? Onde estão os pontos de decisão? Para onde o preço provavelmente está indo? Este resumo será a base para todas as futuras decisões.`;

    const recordingPrompt = `
**MODO ANÁLISE POR GRAVAÇÃO ATIVADO:**
Você recebeu uma sequência de imagens que representam um "vídeo" do usuário explorando o histórico de um gráfico. Sua tarefa é a mesma do modo de Análise Histórica, mas com uma profundidade muito maior, considerando a progressão do tempo.

**Sua Missão:**
1.  **Assista ao "Vídeo":** Analise a sequência de frames para entender a evolução do preço, candle por candle.
2.  **Construa a Narrativa:** Identifique a condição de mercado, mapeie os níveis-chave e, o mais importante, descreva a microestrutura do preço em cada ponto de inflexão. Como os rompimentos aconteceram? Como as reversões foram sinalizadas pelos pavios e corpos das velas?
3.  **Crie um Resumo Estratégico Definitivo:** Com base em toda a sequência, crie um resumo estratégico que capture a essência da movimentação do preço e a psicologia por trás dele. Esta análise será a base mais importante para o futuro.`;


    let prompt: string;
    let schema: object;

    switch (mode) {
        case 'observe':
            prompt = `${basePrompt}\n${observePrompt}`;
            schema = analysisSchema;
            break;
        case 'predict':
            prompt = `${basePrompt}\n${getPredictPrompt(strategicContext, history)}`;
            schema = analysisSchema;
            break;
        case 'historical':
            prompt = `${basePrompt}\n${historicalPrompt}`;
            schema = historicalAnalysisSchema;
            break;
        case 'recording':
            prompt = `${basePrompt}\n${recordingPrompt}`;
            schema = historicalAnalysisSchema;
            break;
        default:
            throw new Error("Modo de análise inválido.");
    }
    
    prompt += "\nSeja preciso. Seja disciplinado. Responda apenas no formato JSON solicitado.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { text: prompt },
                    ...imageParts,
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (!parsedJson) {
            throw new Error("Resposta da IA está vazia.");
        }
        
        return parsedJson;

    } catch (error) {
        handleGeminiError(error, 'análise da imagem');
    }
};

const performAnalyzeSourceForKnowledge = async (sourceUrl: string): Promise<string> => {
    const prompt = `
**MODO AQUISIÇÃO DE CONHECIMENTO DE ELITE ATIVADO:**
Você é a PRISMA IA, um mestre trader. Sua missão é absorver a genialidade de outros traders a partir da fonte: ${sourceUrl}.

**DIRETRIZ PRINCIPAL: FOCO ABSOLUTO EM VITÓRIAS (WINS).**
Aja como se tivesse estudado o conteúdo da fonte. Ignore completamente todas as operações perdedoras (losses), análises incertas ou trades que não aconteceram. Sua única tarefa é construir um **manual de táticas vencedoras**.

**Sua Missão:**
Extraia e sintetize a essência das ESTRATÉGIAS VENCEDORAS. Para cada padrão de vitória, identifique:
1.  **Gatilho de Entrada Preciso:** Qual foi o exato sinal que iniciou a operação vencedora? (Ex: "Rompimento da máxima da vela anterior após um teste de LTA", "Vela de rejeição com pavio longo em uma zona de resistência chave").
2.  **Filtros de Confirmação:** Que condições adicionais precisavam ser atendidas para validar a entrada? (Ex: "Volume acima da média confirmando o rompimento", "RSI indicando sobrecompra", "Confluência com um topo anterior do ZigZag").
3.  **Contexto de Mercado Ideal:** Em que tipo de cenário essas vitórias ocorreram? (Ex: "A favor de uma forte tendência de alta", "Durante uma consolidação em M5, operando as extremidades", "Nos minutos finais de uma vela de M15").
4.  **A Regra de Ouro (Quando NÃO Operar):** Com base nas vitórias, qual é a principal lição sobre quando ficar de fora para evitar perdas? (Ex: "Nunca operar contra velas de força com volume extremo", "Evitar mercados laterais sem volatilidade").

**Formato da Resposta:**
Crie um parágrafo conciso e denso de conhecimento, escrito na primeira pessoa, como se fosse seu novo manual de operações de elite. Exemplo: "Eu aprendi a esperar pacientemente por um pullback em uma LTA clara. Meu gatilho é uma vela de rejeição com pavio inferior longo, confirmada por um aumento de volume. Eu só entro se o RSI estiver saindo da zona de sobrevenda. Evito a todo custo operar contra velas de ignição que rompem estruturas."
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: knowledgeSchema,
            },
        });
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (!parsedJson || !parsedJson.newKnowledge) {
            throw new Error("A IA não conseguiu extrair um novo conhecimento válido.");
        }
        
        return parsedJson.newKnowledge;

    } catch (error) {
       handleGeminiError(error, 'aquisição de conhecimento de link');
    }
};

const performAnalyzeVideoForKnowledge = async (videoUrl: string): Promise<string> => {
    const prompt = `
**MODO AQUISIÇÃO DE CONHECIMENTO POR VÍDEO ATIVADO:**
Você é a PRISMA IA, um mestre trader. Sua missão é "assistir" ao vídeo de trading no link ${videoUrl} e decodificar as táticas vencedoras.

**DIRETRIZ PRINCIPAL: IGNORAR LOSSES E FOCO TOTAL EM WINS.**
Analise as operações mostradas no vídeo. Ignore completamente as que deram errado (loss). Sua única tarefa é extrair o DNA das operações que deram certo (win).

**Sua Missão:**
Para cada operação vencedora identificada no vídeo, extraia e sintetize:
1.  **O Setup (A Preparação):** Qual era o contexto do gráfico antes da entrada? (Ex: "O preço estava em uma LTA clara em M5 e fez um pullback para a média de 20 períodos").
2.  **O Gatilho (O Sinal Exato):** Qual foi a vela ou padrão que confirmou a entrada? (Ex: "Uma vela martelo se formou exatamente na LTA, mostrando rejeição de baixa").
3.  **Os Filtros (A Confirmação Extra):** Havia outros fatores que davam segurança à operação? (Ex: "O volume na vela martelo foi maior que as 5 anteriores", "O RSI estava saindo da zona de sobrevenda").

**Formato da Resposta:**
Crie um parágrafo conciso e denso de conhecimento, escrito na primeira pessoa, como se fosse seu novo manual de operações extraído do vídeo. Exemplo: "Do vídeo, aprendi a tática de esperar o preço tocar uma LTA em M5. O gatilho é um padrão de vela de reversão, como um martelo, e eu só entro se o volume confirmar, mostrando interesse comprador. Esta tática funciona melhor quando o movimento geral do mercado está a favor da tendência."
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: knowledgeSchema,
            },
        });
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (!parsedJson || !parsedJson.newKnowledge) {
            throw new Error("A IA não conseguiu extrair um novo conhecimento válido do vídeo.");
        }
        
        return parsedJson.newKnowledge;

    } catch (error) {
       handleGeminiError(error, 'aquisição de conhecimento de vídeo');
    }
};


const candleSchema = {
    type: Type.OBJECT,
    properties: {
        open: { type: Type.NUMBER },
        high: { type: Type.NUMBER },
        low: { type: Type.NUMBER },
        close: { type: Type.NUMBER },
        upperWick: { type: Type.NUMBER },
        lowerWick: { type: Type.NUMBER },
        body: { type: Type.NUMBER },
        isEngulfing: { type: Type.BOOLEAN },
        isPinBar: { type: Type.BOOLEAN },
        isDoji: { type: Type.BOOLEAN },
        isHammer: { type: Type.BOOLEAN },
        volumeRatio: { type: Type.NUMBER, description: "Ratio of current volume to average volume." }
    },
};

const chartDataSchema = {
    type: Type.OBJECT,
    properties: {
        asset: { type: Type.STRING, description: "O nome do ativo, ex: 'EUR/USD'." },
        candles: {
            type: Type.ARRAY,
            description: "Um array com as últimas 10 velas, da mais antiga para a mais recente.",
            items: candleSchema
        },
        swingHighs: { type: Type.ARRAY, items: { type: Type.NUMBER } },
        swingLows: { type: Type.ARRAY, items: { type: Type.NUMBER } },
        rsiHistory: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "Last 5 RSI values." },
        fibLevels: { type: Type.ARRAY, items: { type: Type.NUMBER } },
        supplyDemandZones: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.NUMBER } } }
    },
    required: ["asset", "candles", "swingHighs", "swingLows", "rsiHistory"]
};


export const extractChartDataFromImage = async (imageDataUrl: string): Promise<ChartData> => {
    const prompt = `Você é um analista de mercado ultra-preciso. Analise a imagem do gráfico M1 ou M5 e retorne um JSON com os seguintes dados:
- asset: O par de moedas ou ativo visível.
- candles: Um array com as últimas 10 velas visíveis, da mais antiga para a mais recente (a última no array é a vela atual/mais recente). Para cada vela, extraia: open, high, low, close, upperWick, lowerWick, body, e booleanos para isEngulfing, isPinBar, isDoji, isHammer. Calcule também volumeRatio (volume atual / média de volume, se visível).
- swingHighs: Os 3 últimos topos (pontos de reversão) mais significativos.
- swingLows: Os 3 últimos fundos (pontos de reversão) mais significativos.
- rsiHistory: O histórico dos últimos 5 valores do RSI (se o indicador for visível).
- fibLevels: Níveis de retração de Fibonacci desenhados no gráfico (se visível).
- supplyDemandZones: Zonas de oferta/demanda desenhadas como um array de arrays [[topo_da_zona, fundo_da_zona]] (se visível).`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { text: prompt },
                    dataUrlToGeminiPart(imageDataUrl)
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: chartDataSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        if (!parsed || !parsed.candles || parsed.candles.length === 0) {
            throw new Error("Resposta da IA para extração de dados do gráfico está inválida ou vazia.");
        }
        
        // Adiciona o campo lastCandle para conveniência
        const parsedJson: ChartData = {
            ...parsed,
            lastCandle: parsed.candles[parsed.candles.length - 1]
        };
        
        return parsedJson;

    } catch (error) {
        handleGeminiError(error, 'extração de dados do gráfico');
    }
};

// --- Funções Exportadas com Gerenciamento de Fila ---

export const analyzeImage = (params: AnalyzeImageParams): Promise<Analysis | HistoricalReport> => {
    return addToQueue(() => performAnalyzeImage(params));
};

export const analyzeSourceForKnowledge = (sourceUrl: string): Promise<string> => {
    return addToQueue(() => performAnalyzeSourceForKnowledge(sourceUrl));
};

export const analyzeVideoForKnowledge = (videoUrl: string): Promise<string> => {
    return addToQueue(() => performAnalyzeVideoForKnowledge(videoUrl));
};
