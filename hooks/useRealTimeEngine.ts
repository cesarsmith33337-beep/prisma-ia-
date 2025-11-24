import { useState, useRef, useCallback, useEffect } from 'react';
import { realTimeAnalyzer } from '../services/realTimeAnalyzer';

export const useRealTimeEngine = (getFrame: () => string | null) => {
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const isProcessingRef = useRef(false);

    const stop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
        isProcessingRef.current = false;
    }, []);

    const start = useCallback(() => {
        stop(); // Garante que não haja múltiplos intervalos rodando
        setIsRunning(true);
        isProcessingRef.current = false;
        
        const analyze = async () => {
            if (isProcessingRef.current) {
                console.warn("Análise em tempo real anterior ainda em andamento. Pulando este ciclo.");
                return;
            }
            const frame = getFrame();
            if (!frame) return;

            isProcessingRef.current = true;
            try {
                await realTimeAnalyzer(frame);
            } catch (error) {
                console.error("Erro durante a análise em tempo real:", error);
            } finally {
                isProcessingRef.current = false;
            }
        };

        intervalRef.current = window.setInterval(analyze, 1000); // 1s for M1

    }, [getFrame, stop]);

    // Limpeza ao desmontar o componente
    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return { start, stop, isRunning };
};
