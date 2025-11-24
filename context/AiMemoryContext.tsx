import React, { createContext, useContext, useState, useEffect, useCallback, PropsWithChildren } from 'react';
import type { Signal, Observation, HistoricalReport } from '../types';

// Define the shape of the context data
interface AiMemoryContextType {
    signals: Signal[];
    observations: Observation[];
    historicalReport: HistoricalReport | null;
    addSignal: (signalData: Omit<Signal, 'id' | 'time' | 'status'>) => void;
    addObservation: (observationData: Omit<Observation, 'id'>) => void;
    setHistoricalReport: React.Dispatch<React.SetStateAction<HistoricalReport | null>>;
    clearMemory: () => void;
}

// Create the context with a default value (or undefined and check for it)
const AiMemoryContext = createContext<AiMemoryContextType | undefined>(undefined);

// Initial state for historical report (pre-seeded knowledge)
const initialHistoricalReport: HistoricalReport = {
    marketCondition: 'Consolidation',
    keyLevels: [
        { level: 1.08500, type: 'Resistance' },
        { level: 1.08200, type: 'Support' }
    ],
    identifiedPatterns: [
        "Price Action Avançado",
        "Lógica do Preço (Comandos, Velas Expiradas)",
        "Análise de Liquidez e Simetria"
    ],
    strategicSummary: `**Dossiê Estratégico Mestre v2.0**
Meu foco é a Lógica do Preço, operando em M1/M5. Minhas táticas se baseiam em:
1.  **Comandos e Velas de Força:** Identifico regiões onde o preço foi defendido com força (comandos) e uso-as como pontos de reversão. Velas de ignição que rompem estruturas são a confirmação da direção.
2.  **Velas Expiradas e Limitação de Preço:** Analiso velas que falharam em continuar um movimento. A falha (expiração) em romper um topo/fundo indica fraqueza e uma provável reversão.
3.  **Liquidez e Captura:** Busco zonas onde a liquidez foi capturada (stop hunts) através de pavios longos que varrem topos/fundos anteriores. A entrada ocorre na direção oposta à captura.
4.  **Simetria de Movimento:** Observo a simetria de velas e movimentos passados para projetar a força e o alvo de movimentos futuros.
5.  **Disciplina Máxima:** Só opero se o cenário atual for uma réplica clara de um desses padrões. Se houver dúvida, eu espero. Paciência é a chave para a alta assertividade.`
};

// Initial state for observations
const initialObservations: Observation[] = [
    { id: 1, outcome: 'BULLISH', reason: 'Forte rejeição de baixa na zona de suporte, com pavio inferior longo, confirmando a zona de demanda.' },
    { id: 2, outcome: 'BEARISH', reason: 'Vela de força rompeu a LTA, indicando continuação do movimento de baixa após o pullback.' },
    { id: 3, outcome: 'DOJI', reason: 'Indecisão no topo do movimento, mostrando exaustão da força compradora perto da resistência.' },
];


// Custom hook to use the context
export const useAiMemory = () => {
    const context = useContext(AiMemoryContext);
    if (context === undefined) {
        throw new Error('useAiMemory must be used within an AiMemoryProvider');
    }
    return context;
};

// Provider component
export const AiMemoryProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [signals, setSignals] = useState<Signal[]>([]);
    const [observations, setObservations] = useState<Observation[]>(initialObservations);
    const [historicalReport, setHistoricalReport] = useState<HistoricalReport | null>(initialHistoricalReport);

    // Load state from localStorage on initial render
    useEffect(() => {
        try {
            const storedSignals = localStorage.getItem('prismaAi_signals');
            if (storedSignals) setSignals(JSON.parse(storedSignals));

            const storedObservations = localStorage.getItem('prismaAi_observations');
            if (storedObservations) setObservations(JSON.parse(storedObservations));
            
            const storedReport = localStorage.getItem('prismaAi_historicalReport');
            if (storedReport) setHistoricalReport(JSON.parse(storedReport));

        } catch (error) {
            console.error("Failed to load AI memory from localStorage", error);
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('prismaAi_signals', JSON.stringify(signals));
        } catch (error) {
            console.error("Failed to save signals to localStorage", error);
        }
    }, [signals]);

    useEffect(() => {
        try {
            localStorage.setItem('prismaAi_observations', JSON.stringify(observations));
        } catch (error) {
            console.error("Failed to save observations to localStorage", error);
        }
    }, [observations]);

     useEffect(() => {
        try {
            localStorage.setItem('prismaAi_historicalReport', JSON.stringify(historicalReport));
        } catch (error) {
            console.error("Failed to save historical report to localStorage", error);
        }
    }, [historicalReport]);


    const addSignal = useCallback((signalData: Omit<Signal, 'id' | 'time' | 'status'>) => {
        const newSignal: Signal = {
            ...signalData,
            id: Date.now(),
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'PENDING',
        };
        setSignals(prevSignals => [newSignal, ...prevSignals]);
    }, []);

    const addObservation = useCallback((observationData: Omit<Observation, 'id'>) => {
        const newObservation: Observation = {
            ...observationData,
            id: Date.now(),
        };
        setObservations(prevObservations => [newObservation, ...prevObservations].slice(0, 50)); // Keep last 50
    }, []);

    const clearMemory = useCallback(() => {
        setObservations([]);
        setHistoricalReport(null);
        // We might not want to clear signals, as they are a historical log.
        // If we do: setSignals([]);
        console.log("AI Memory (Observations & Report) cleared.");
    }, []);


    const value = {
        signals,
        observations,
        historicalReport,
        addSignal,
        addObservation,
        setHistoricalReport,
        clearMemory,
    };

    return (
        <AiMemoryContext.Provider value={value}>
            {children}
        </AiMemoryContext.Provider>
    );
};
