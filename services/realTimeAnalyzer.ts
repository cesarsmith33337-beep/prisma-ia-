import { eventBus } from './eventBus';
import { strategies } from '../strategies';
import { extractChartDataFromImage } from './gemini';
import type { ChartData, Signal, Candle } from '../types';


// Helper para gerar um objeto de sinal
const generateSignal = (strategy: any, chartData: ChartData): Omit<Signal, 'id' | 'time' | 'status'> => {
    const { lastCandle } = chartData;
    
    // O contexto passado para a regra de direção precisa de todos os dados do gráfico
    const context = chartData;

    const direction = strategy.entryRule.direction(context);
    const entrySuggestion = strategy.entryRule.type === 'NEXT_CANDLE_OPEN' ? 'NEXT_CANDLE' : 'IMMEDIATE';
    
    return {
        asset: chartData.asset || 'N/A',
        price: lastCandle.close,
        direction: direction,
        strategy: strategy.name,
        reason: `${strategy.name} - Filtros e gatilhos atendidos.`,
        entrySuggestion: entrySuggestion,
        expiry: `${strategy.expiry} Minutos`
    };
};

export async function realTimeAnalyzer(frame: string): Promise<Omit<Signal, 'id' | 'time' | 'status'> | null> {
    try {
        const chartData = await extractChartDataFromImage(frame);
        
        if (!chartData || !chartData.lastCandle) {
            console.warn("Não foi possível extrair dados do gráfico da imagem.");
            return null;
        }

        const { lastCandle, swingHighs, swingLows, rsiHistory, fibLevels, supplyDemandZones, candles } = chartData;

        for (const strat of strategies) {
            // TODO: Adicionar checagem de compatibilidade de timeframe e par se estes dados forem extraídos.
            
            const filtersPassed = strat.filters.every((f: any) => {
                // Despachante de argumentos para as funções de verificação de filtro
                switch (f.id) {
                    case 'consolidation':
                    case 'fakeOut':
                        return f.check(candles);
                    case 'rsiDivergence':
                        return f.check(candles, rsiHistory);
                    case 'supplyDemand':
                        return f.check(lastCandle, supplyDemandZones);
                    case 'zigzag618':
                        return f.check(lastCandle, fibLevels);
                    case 'liquidityTouch':
                    case 'rejection':
                    case 'doubleTap':
                    default:
                        return f.check(lastCandle, swingHighs, swingLows);
                }
            });

            if (!filtersPassed) {
                continue;
            }

            const triggersFired = strat.triggers.some((t: any) => {
                 // A maioria dos gatilhos depende apenas da última vela
                 return t.check(lastCandle, swingHighs, swingLows);
            });

            if (!triggersFired) {
                continue;
            }

            const signalData = generateSignal(strat, chartData);
            eventBus.emit('realTime:signal', signalData);
            console.log("SINAL GERADO:", signalData);
            return signalData;
        }

    } catch (error) {
        console.error("Erro no realTimeAnalyzer:", error);
        // Não lançar erro para não parar o loop, apenas registrar.
        if (error instanceof Error) {
            // Lança um erro mais amigável para a UI
            throw new Error(`Erro da IA: ${error.message}`);
        }
    }
    return null;
}
