import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, BookOpen, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { useAiMemory } from '../context/AiMemoryContext';

export const WelcomeGuide: React.FC = () => {
    const { historicalReport, observations } = useAiMemory();

    // Do not show the guide if the user has already interacted and has a custom report or more than the initial observations.
    const hasLearned = historicalReport?.strategicSummary && (!historicalReport.strategicSummary.startsWith('**Dossiê Estratégico Mestre v2.0') || observations.length > 3);

    if (hasLearned) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-purple-900/80 to-indigo-900/80 rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20 mb-6">
            <div className="flex items-center gap-4 mb-4">
                <BrainCircuit className="w-10 h-10 text-cyan-400 flex-shrink-0" />
                <div>
                    <h2 className="text-2xl font-bold text-white">Bem-vindo à PRISMA IA!</h2>
                    <p className="text-gray-300">Sua IA está pronta para aprender. Forneça conhecimento para começar a receber sinais precisos.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Link to="/live-analysis" className="bg-purple-600/50 hover:bg-purple-600/80 text-white p-4 rounded-lg transition-all group">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-purple-300" />
                        <div>
                            <h3 className="font-bold">1. Crie um Relatório Histórico</h3>
                            <p className="text-sm text-purple-200">Use a captura de tela para dar à IA o contexto do ativo.</p>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </Link>
                <Link to="/link-analysis" className="bg-purple-600/50 hover:bg-purple-600/80 text-white p-4 rounded-lg transition-all group">
                    <div className="flex items-center gap-3">
                        <LinkIcon className="w-8 h-8 text-purple-300" />
                        <div>
                            <h3 className="font-bold">2. Adicione Conhecimento Externo</h3>
                            <p className="text-sm text-purple-200">Alimente a IA com estratégias de canais de traders.</p>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </Link>
            </div>
        </div>
    );
}