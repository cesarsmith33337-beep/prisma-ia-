import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Camera, Zap, TrendingUp, TrendingDown, Clipboard, Clock } from 'lucide-react';

import { realTimeAnalyzer } from '../services/realTimeAnalyzer';
import type { Signal } from '../types';

const ImageAnalysis = () => {
    const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [analysisResult, setAnalysisResult] = React.useState<Omit<Signal, 'id' | 'time' | 'status'> | null>(null);

    const handlePaste = React.useCallback((event: ClipboardEvent) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        setUploadedImage(result);
                        setAnalysisResult(null);
                        toast.success('Imagem colada da área de transferência!');
                    };
                    reader.readAsDataURL(blob);
                }
                event.preventDefault();
                break; 
            }
        }
    }, []);

    React.useEffect(() => {
        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [handlePaste]);

    const onDrop = React.useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setUploadedImage(result);
                setAnalysisResult(null);
                toast.success('Imagem carregada com sucesso!');
            };
            reader.readAsDataURL(file);
        }
    }, []);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
        multiple: false,
    });

    const handleAnalyze = async () => {
        if (!uploadedImage) {
            toast.error('Por favor, carregue uma imagem primeiro.');
            return;
        }
        setIsAnalyzing(true);
        setAnalysisResult(null);
        const toastId = toast.loading('Analisando imagem com o motor de estratégias...');

        try {
            // A função realTimeAnalyzer agora é chamada diretamente, pois ela contém a lógica de extração e análise.
            const result = await realTimeAnalyzer(uploadedImage);
            
            if (result) {
                setAnalysisResult(result);
                toast.success(`Análise concluída: Sinal ${result.direction} encontrado!`, { id: toastId });
            } else {
                setAnalysisResult(null);
                toast.success('Nenhuma oportunidade encontrada com as estratégias atuais.', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'Falha na análise.';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Análise de Imagem de Gráfico</h1>
                <p className="text-gray-400 text-sm">Envie uma screenshot do seu gráfico e receba uma análise instantânea.</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-purple-400">
                    <Clipboard className="w-5 h-5" />
                    <span className="text-sm font-medium">Dica: Copie uma imagem e cole aqui (Ctrl+V)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/20">
                    <div {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500'
                    }`}>
                        <input {...getInputProps()} />
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-white font-semibold">Arraste uma imagem ou clique para selecionar</p>
                        <p className="text-gray-500 text-xs mt-1">PNG, JPG, JPEG</p>
                    </div>

                    {uploadedImage && (
                        <div className="mt-4">
                            <img src={uploadedImage} alt="Gráfico" className="w-full rounded-lg border border-gray-600" />
                            <button onClick={handleAnalyze} disabled={isAnalyzing}
                                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">
                                {isAnalyzing ? (
                                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Analisando...</>
                                ) : (
                                    <><Zap className="w-5 h-5" />Analisar Gráfico</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
                
                <AnimatePresence mode="wait">
                    {isAnalyzing ? (
                         <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/20 flex flex-col items-center justify-center text-center h-full"
                        >
                            <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <h3 className="text-lg font-bold text-white">Analisando...</h3>
                            <p className="text-gray-400 text-sm">O motor da IA está processando o gráfico.</p>
                        </motion.div>
                    ) : analysisResult ? (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/20">
                                <h3 className="text-xl font-bold text-white mb-4">Sinal Gerado</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                         <div className={`p-3 rounded-lg ${ analysisResult.direction === 'CALL' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {analysisResult.direction === 'CALL' ? <TrendingUp /> : <TrendingDown />}
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold text-white">{analysisResult.direction}</h4>
                                            <p className="text-gray-400">{analysisResult.asset}</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{(analysisResult.price || 0).toFixed(5)}</p>
                                </div>
                            </div>

                             <div className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/20">
                                 <h3 className="text-lg font-bold text-white mb-3">Detalhes da Entrada</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Estratégia:</span>
                                        <span className={`font-bold text-purple-300`}>{analysisResult.strategy}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Timing da Entrada:</span>
                                        <span className="font-medium text-white flex items-center gap-1.5">
                                            {analysisResult.entrySuggestion === 'IMMEDIATE' ? <Zap size={14}/> : <Clock size={14}/>}
                                            {analysisResult.entrySuggestion === 'IMMEDIATE' ? 'Imediata (Vela Atual)' : 'Próxima Vela'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Expiração Sugerida:</span>
                                        <span className="font-medium text-white">{analysisResult.expiry}</span>
                                    </div>
                                     <div className="pt-3 border-t border-purple-500/20">
                                        <span className="text-gray-400">Razão:</span>
                                        <p className="text-gray-300 mt-1 text-xs leading-relaxed">{analysisResult.reason}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                             initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/20 flex flex-col items-center justify-center text-center h-full"
                        >
                            <Zap className="w-16 h-16 text-purple-500 mb-4" />
                            <h3 className="text-lg font-bold text-white">Aguardando Análise</h3>
                            <p className="text-gray-400 text-sm">O resultado da IA aparecerá aqui.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default ImageAnalysis;