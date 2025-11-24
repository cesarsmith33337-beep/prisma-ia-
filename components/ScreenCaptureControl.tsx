import React from 'react';
import { Video, StopCircle, AlertTriangle } from 'lucide-react';
import type { CaptureError } from '../types';

interface ScreenCaptureControlProps {
    isCapturing: boolean;
    startCapture: () => void;
    stopCapture: () => void;
    captureError: CaptureError | null;
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const ScreenCaptureControl: React.FC<ScreenCaptureControlProps> = ({
    isCapturing,
    startCapture,
    stopCapture,
    captureError,
    videoRef,
    canvasRef
}) => {
   
    const getButtonText = () => {
        return isCapturing ? 'Parar Análise em Tempo Real' : 'Iniciar Leitura Real';
    }

    return (
        <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20 flex flex-col gap-4">
            <div className="aspect-video bg-black rounded-md overflow-hidden relative border-2 border-purple-800/50">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                {!isCapturing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center">
                        <Video className="w-16 h-16 text-purple-600 mb-4" />
                        <p className="text-purple-300">A prévia da tela aparecerá aqui</p>
                    </div>
                )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />

            {captureError && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 mt-0.5 text-red-400 flex-shrink-0" />
                    <div>
                         <p className="font-bold">{captureError.title}</p>
                        <p>{captureError.message}</p>
                    </div>
                </div>
            )}
            
            {isCapturing ? (
                <button
                    onClick={stopCapture}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                    <StopCircle className="w-6 h-6" />
                    {getButtonText()}
                </button>
            ) : (
                <button
                    onClick={startCapture}
                    className="w-full flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                    <Video className="w-6 h-6" />
                    {getButtonText()}
                </button>
            )}
        </div>
    );
};
