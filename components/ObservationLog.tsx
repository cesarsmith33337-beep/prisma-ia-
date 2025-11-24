import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, BrainCircuit, BookOpen, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Observation } from '../types';

interface ObservationLogProps {
  observations: Observation[];
  onClear: () => void;
}

const getOutcomeIcon = (outcome: Observation['outcome']) => {
    switch(outcome) {
        case 'BULLISH': return <TrendingUp className="w-5 h-5 text-lime-400" />;
        case 'BEARISH': return <TrendingDown className="w-5 h-5 text-red-400" />;
        case 'DOJI': return <Minus className="w-5 h-5 text-yellow-400" />;
    }
}

const getOutcomeBgColor = (outcome: Observation['outcome']) => {
    switch(outcome) {
        case 'BULLISH': return 'bg-lime-500/20';
        case 'BEARISH': return 'bg-red-500/20';
        case 'DOJI': return 'bg-yellow-500/20';
    }
}

export const ObservationLog: React.FC<ObservationLogProps> = ({ observations, onClear }) => {
  return (
    <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <BrainCircuit className="w-6 h-6 mr-3 text-cyan-400 animate-pulse" />
          Memória de Análise (Aprendizado)
        </h3>
        <div className="flex items-center gap-2">
            <button onClick={onClear} title="Limpar Memória de Observações" className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-xs text-red-300 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence>
          {observations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aguardando observações...</p>
              <p className="text-sm mt-1">As teses da IA sobre cada vela aparecerão aqui.</p>
            </div>
          ) : (
            observations.map((obs) => (
              <motion.div
                key={obs.id}
                layout
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="bg-gray-900/50 rounded-lg p-4 border border-purple-800/50 flex items-start gap-3"
              >
                <div className={`p-2 rounded-lg ${getOutcomeBgColor(obs.outcome)}`}>
                    {getOutcomeIcon(obs.outcome)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {obs.reason}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};