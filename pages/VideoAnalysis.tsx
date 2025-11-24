import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Film, BrainCircuit, PlusCircle, XCircle, Save } from 'lucide-react';

import { analyzeVideoForKnowledge } from '../services/gemini';
import type { HistoricalReport } from '../types';
import { useAiMemory } from '../context/AiMemoryContext';

interface LinkInput {
    id: number;
    value: string;
}

const VideoAnalysis: React.FC = () => {
    const [links, setLinks] = React.useState<LinkInput[]>([{ id: Date.now(), value: '' }]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [acquiredKnowledges, setAcquiredKnowledges] = React.useState<string[]>([]);
    const { historicalReport, setHistoricalReport } = useAiMemory();
    
    const addLinkInput = () => {
        setLinks([...links, { id: Date.now(), value: '' }]);
    };

    const removeLinkInput = (id: number) => {
        if (links.length > 1) {
            setLinks(links.filter(link => link.id !== id));
        }
    };

    const handleLinkChange = (id: number, value: string) => {
        setLinks(links.map(link => link.id === id ? { ...link, value } : link));
    };

    const handleAnalyze = async () => {
        const validLinks = links.filter(link => link.value.trim());
        if (validLinks.length === 0) {
            toast.error('Por favor, insira pelo menos um link de vídeo válido.');
            return;
        }

        setIsLoading(true);
        setAcquiredKnowledges([]);
        const toastId = toast.loading(`IA está "assistindo" e analisando ${validLinks.length} vídeo(s)...`);
        
        try {
            const promises = validLinks.map(link => analyzeVideoForKnowledge(link.value));
            const results = await Promise.all(promises);
            setAcquiredKnowledges(results);
            toast.success('Conhecimento extraído com sucesso! Revise e salve na memória.', { id: toastId, duration: 4000 });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
            toast.error(`Falha no aprendizado: ${errorMessage}`, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveKnowledge = () => {
        if (acquiredKnowledges.length === 0) {
            toast.error('Nenhum novo conhecimento para salvar. Analise os vídeos primeiro.');
            return;
        }
        
        const toastId = toast.loading('Salvando conhecimento na memória principal...');

        try {
            const knowledgeBlock = acquiredKnowledges.map((k, i) => 
                `**🧠 Inteligência Adquirida [Vídeo ${i+1}] (${new Date().toLocaleDateString()})**\n${k}`
            ).join('\n\n---\n\n');

            if (historicalReport) {
                const updatedSummary = `${historicalReport.strategicSummary}\n\n---\n\n${knowledgeBlock}`;
                setHistoricalReport({ ...historicalReport, strategicSummary: updatedSummary });
            } else {
                 const newReport: HistoricalReport = {
                    strategicSummary: knowledgeBlock,
                    marketCondition: 'Consolidation', // Default
                    keyLevels: [],
                    identifiedPatterns: ['Conhecimento Adquirido via Vídeo'],
                 };
                 setHistoricalReport(newReport);
            }
            toast.success('Conhecimento integrado com sucesso!', { id: toastId });
            setAcquiredKnowledges([]); // Clear after saving

        } catch (error) {
             toast.error('Falha ao salvar o conhecimento.', { id: toastId });
        }
    }


    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-3xl font-bold text-white mb-2">Aquisição de Conhecimento por Vídeo</h1>
                <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                    Cole links de vídeos de trading. A PRISMA IA irá analisar o conteúdo, focar **apenas nas operações vencedoras (WINS)** e extrair os filtros, gatilhos e timing para salvar em sua memória.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/20 max-w-2xl mx-auto"
            >
                <div className="flex flex-col gap-4">
                    <label className="text-sm font-medium text-purple-300">
                        Links de Vídeos do YouTube
                    </label>
                    {links.map((link, index) => (
                        <div key={link.id} className="relative flex items-center gap-2">
                            <Film className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={link.value}
                                onChange={(e) => handleLinkChange(link.id, e.target.value)}
                                placeholder={`https://www.youtube.com/watch?v=...`}
                                className="w-full bg-[#100e19] text-white p-3 pl-10 rounded border border-purple-500/30 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition-all"
                                disabled={isLoading}
                            />
                            <button onClick={() => removeLinkInput(link.id)} disabled={links.length <= 1} className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <XCircle className="w-6 h-6"/>
                            </button>
                        </div>
                    ))}
                    
                    <button onClick={addLinkInput} className="flex items-center justify-center gap-2 text-sm text-purple-300 hover:text-white transition-colors py-2 rounded-lg bg-white/5 hover:bg-white/10">
                        <PlusCircle className="w-4 h-4" />
                        Adicionar mais vídeos
                    </button>

                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 mt-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Aprendendo...
                            </>
                        ) : (
                            <>
                                <BrainCircuit className="w-6 h-6" />
                                Extrair Táticas dos Vídeos
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
            
            <AnimatePresence>
            {acquiredKnowledges.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 max-w-2xl mx-auto"
                >
                    {acquiredKnowledges.map((knowledge, index) => (
                         <div key={index} className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                            <h3 className="text-lg font-bold text-fuchsia-300 mb-3 flex items-center">
                                <BrainCircuit className="w-5 h-5 mr-2" />
                                Conhecimento Adquirido (Vídeo {index + 1})
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{knowledge}</p>
                        </div>
                    ))}
                    <button onClick={handleSaveKnowledge} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200">
                        <Save className="w-5 h-5" />
                        Salvar Conhecimentos na Memória Principal
                    </button>
                </motion.div>
            )}
            </AnimatePresence>

        </div>
    );
};

export default VideoAnalysis;