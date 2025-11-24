import * as React from 'react';
import { TrendingUp, TrendingDown, ChevronsRight, Target, CheckCircle, BrainCircuit, BookOpen, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { HistoricalReport } from '../types';

interface HistoricalReportPanelProps {
  report: HistoricalReport | null;
  onClear: () => void;
}

const getMarketConditionIcon = (condition: HistoricalReport['marketCondition']) => {
    switch(condition) {
        case 'Uptrend': return <TrendingUp className="w-8 h-8 text-lime-400" />;
        case 'Downtrend': return <TrendingDown className="w-8 h-8 text-red-400" />;
        case 'Consolidation': return <ChevronsRight className="w-8 h-8 text-yellow-400" />;
    }
}

const getMarketConditionText = (condition: HistoricalReport['marketCondition']) => {
    switch(condition) {
        case 'Uptrend': return 'Tendência de Alta';
        case 'Downtrend': return 'Tendência de Baixa';
        case 'Consolidation': return 'Consolidação';
    }
}

export const HistoricalReportPanel: React.FC<HistoricalReportPanelProps> = ({ report, onClear }) => {
    if (!report) {
        return (
             <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20 h-full flex flex-col items-center justify-center text-center min-h-[400px]">
                <BookOpen className="w-24 h-24 text-purple-600 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Aguardando Relatório Histórico</h3>
                <p className="text-gray-400 max-w-sm">
                   Ajuste seu gráfico para mostrar a história, selecione o modo "Análise Histórica" e clique em "Gerar Relatório" para que a IA crie o dossiê do ativo.
                </p>
            </div>
        );
    }

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20 space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-purple-500/20 gap-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <BrainCircuit className="w-6 h-6 mr-3 text-cyan-400" />
          Relatório Estratégico da IA
        </h3>
        <div className="flex items-center gap-2">
            <button onClick={onClear} title="Limpar Memória" className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-xs text-red-300 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-800/50">
            <div className="flex items-center gap-4">
                {getMarketConditionIcon(report.marketCondition)}
                <div>
                    <p className="text-gray-400 text-sm">Condição do Mercado</p>
                    <p className="text-white font-bold text-lg">{getMarketConditionText(report.marketCondition)}</p>
                </div>
            </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-800/50">
            <h4 className="text-gray-400 text-sm mb-3 font-medium flex items-center"><Target className="w-4 h-4 mr-2" />Níveis-Chave Identificados</h4>
            <div className="space-y-2">
            {report.keyLevels.map((level, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                    <span className={`font-medium ${level.type === 'Resistance' ? 'text-red-400' : 'text-green-400'}`}>{level.type}</span>
                    <span className="text-gray-300 font-mono">{level.level.toFixed(5)}</span>
                </div>
            ))}
            </div>
        </div>
        
         <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-800/50">
            <h4 className="text-gray-400 text-sm mb-3 font-medium flex items-center"><CheckCircle className="w-4 h-4 mr-2" />Padrões e Comportamentos</h4>
            <ul className="space-y-2 text-sm text-gray-300 list-inside">
                {report.identifiedPatterns.map((pattern, index) => (
                    <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-purple-400 flex-shrink-0" />
                        <span>{pattern}</span>
                    </li>
                ))}
            </ul>
        </div>
      
        <div className="bg-fuchsia-900/30 rounded-lg p-4 border border-fuchsia-700/50 max-h-64 overflow-y-auto">
            <h4 className="text-fuchsia-300 text-sm mb-2 font-medium flex items-center"><BrainCircuit className="w-4 h-4 mr-2" />Resumo Estratégico (Memória Principal)</h4>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{report.strategicSummary}</p>
        </div>
      
    </motion.div>
  );
};