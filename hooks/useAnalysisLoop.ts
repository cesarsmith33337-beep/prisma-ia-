import { useState, useRef, useCallback } from 'react';

export const useAnalysisLoop = (
    analysisFunction: (frame: string) => Promise<void>
) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const analysisTimeoutRef = useRef<number | null>(null);
    const analysisIntervalRef = useRef<number | null>(null);
    const getFrameRef = useRef<() => string | null>(null);
    const isProcessingRef = useRef(false);

    const stopAnalysisLoop = useCallback(() => {
        if (analysisTimeoutRef.current) {
            clearTimeout(analysisTimeoutRef.current);
            analysisTimeoutRef.current = null;
        }
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
            analysisIntervalRef.current = null;
        }
        setIsAnalyzing(false);
        isProcessingRef.current = false;
    }, []);

    const startAnalysisLoop = useCallback((getFrame: () => string | null, timeframeMillis: number) => {
        stopAnalysisLoop();
        getFrameRef.current = getFrame;
        setIsAnalyzing(true);
        isProcessingRef.current = false;

        const TRIGGER_OFFSET_MS = 5000; // Analisar 5 segundos antes do fechamento da vela

        const performAnalysis = async () => {
            if (isProcessingRef.current) {
                console.warn("Análise anterior ainda em andamento. Pulando este ciclo.");
                return;
            }

            if (getFrameRef.current) {
                const frame = getFrameRef.current();
                if (frame) {
                    isProcessingRef.current = true;
                    try {
                        await analysisFunction(frame);
                    } catch (error) {
                        console.error("Erro durante a execução da análise:", error);
                    } finally {
                        isProcessingRef.current = false;
                    }
                }
            }
        };

        const scheduleNextAnalysis = () => {
            const now = Date.now();
            const millisIntoCurrentCandle = now % timeframeMillis;
            const timeUntilNextCandle = timeframeMillis - millisIntoCurrentCandle;
            
            let initialDelay = timeUntilNextCandle - TRIGGER_OFFSET_MS;
            if (initialDelay < 0) {
                 // Já estamos na janela de gatilho, mas a análise inicial pode já ter sido feita.
                 // Vamos agendar para a próxima vela para evitar sinais duplicados.
                 initialDelay += timeframeMillis;
            }

            // Agendando a primeira análise
            analysisTimeoutRef.current = window.setTimeout(() => {
                performAnalysis();
                // Após a primeira, as subsequentes ocorrem em um intervalo fixo
                analysisIntervalRef.current = window.setInterval(performAnalysis, timeframeMillis);
            }, initialDelay);
        };

        scheduleNextAnalysis();

    }, [analysisFunction, stopAnalysisLoop]);

    return { isAnalyzing, startAnalysisLoop, stopAnalysisLoop };
};