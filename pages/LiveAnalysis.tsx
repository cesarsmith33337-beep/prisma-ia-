import * as React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import { ScreenCaptureControl } from '../components/ScreenCaptureControl';
import SignalPanel from '../components/SignalPanel';
import { useRealTimeEngine } from '../hooks/useRealTimeEngine';
import type { CaptureError, Signal } from '../types';
import { useAiMemory } from '../context/AiMemoryContext';
import { eventBus } from '../services/eventBus';

const LiveAnalysis: React.FC = () => {
    const { signals, addSignal } = useAiMemory();
    const [liveSignals, setLiveSignals] = React.useState<Signal[]>([]);
    const [captureError, setCaptureError] = React.useState<CaptureError | null>(null);
    
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const streamRef = React.useRef<MediaStream | null>(null);

    const getFrameAsDataUrl = React.useCallback((): string | null => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && video.readyState >= 2 && video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                return canvas.toDataURL('image/jpeg', 0.8);
            }
        }
        return null;
    }, []);

    const { isRunning, start, stop } = useRealTimeEngine(getFrameAsDataUrl);

    React.useEffect(() => {
        const handleNewSignal = (signalData: Omit<Signal, 'id' | 'time' | 'status'>) => {
            const newSignal: Signal = {
                ...signalData,
                id: Date.now(),
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                status: 'PENDING',
            };
            addSignal(signalData);
            setLiveSignals(prev => [newSignal, ...prev]);
            toast.success(`Sinal ${signalData.direction} gerado por ${signalData.strategy}!`);
        };
        
        eventBus.on('realTime:signal', handleNewSignal);

        return () => {
            eventBus.off('realTime:signal', handleNewSignal);
        }
    }, [addSignal]);


    const stopCapture = React.useCallback(() => {
        stop();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCaptureError(null);
    }, [stop]);

    const startCapture = async () => {
        setCaptureError(null);
        setLiveSignals([]);
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'never', frameRate: 10 } as any,
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();

                videoRef.current.onloadedmetadata = () => {
                   start();
                }
            }
            stream.getVideoTracks()[0].addEventListener('ended', stopCapture);

        } catch (err: any) {
            console.error("Error starting screen capture:", err);
             if (err.name === 'NotAllowedError') {
                setCaptureError({
                    title: "Permissão Negada",
                    message: "Você precisa permitir o compartilhamento de tela para a análise funcionar."
                });
            } else {
                 setCaptureError({
                    title: "Erro na Captura",
                    message: `Não foi possível iniciar a captura. Erro: ${err.name}.`
                });
            }
            stop();
        }
    };

    React.useEffect(() => {
        return () => {
            if (isRunning) stopCapture();
        };
    }, [isRunning, stopCapture]);

    return (
        <div className="space-y-6">
             <div className="text-center">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl lg:text-4xl font-black text-white mb-4"
                >
                   Análise IA em Tempo Real
                </motion.h1>
                <motion.p 
                     initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-gray-300 text-lg max-w-3xl mx-auto">
                    Inicie a leitura para que a PRISMA IA analise o gráfico com suas estratégias e gere sinais precisos.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="lg:col-span-1"
                >
                   <ScreenCaptureControl
                        isCapturing={isRunning}
                        startCapture={startCapture}
                        stopCapture={stopCapture}
                        captureError={captureError}
                        videoRef={videoRef}
                        canvasRef={canvasRef}
                    />
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <SignalPanel signals={liveSignals} />
                </motion.div>
            </div>
        </div>
    );
};

export default LiveAnalysis;