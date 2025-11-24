


import * as React from 'react';
import { TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Signal } from '../types';

interface SignalPanelProps {
  signals: Signal[];
}

const SignalPanel: React.FC<SignalPanelProps> = ({ signals }) => {
  return (
    <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Zap className="w-6 h-6 mr-3 text-yellow-400 animate-pulse" />
          Sinais Gerados pela IA
        </h3>
        <span className="text-sm text-gray-400">
          {signals.length} {signals.length === 1 ? 'sinal' : 'sinais'}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence>
          {signals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aguardando sinais...</p>
              <p className="text-sm mt-1">Os sinais da IA aparecerão aqui</p>
            </div>
          ) : (
            signals.map((signal) => (
              <motion.div
                key={signal.id}
                layout
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="bg-gray-900/50 rounded-lg p-4 border border-purple-800/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      signal.direction === 'CALL' 
                        ? 'bg-lime-500/20 text-lime-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {signal.direction === 'CALL' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{signal.asset} @ {signal.price}</p>
                      <p className="text-gray-400 text-sm">{signal.direction}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{signal.time}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                   <div className="flex items-center">
                      <span className="text-gray-400 w-14">Entrada:</span>
                      {signal.entrySuggestion === 'IMMEDIATE' ? (
                          <span className="flex items-center gap-1.5 font-medium text-yellow-400">
                              <Zap size={14} className="flex-shrink-0" />
                              Imediata (Vela Atual)
                          </span>
                      ) : (
                          <span className="flex items-center gap-1.5 font-medium text-purple-400">
                              <Clock size={14} className="flex-shrink-0" />
                              Próxima Vela
                          </span>
                      )}
                    </div>
                  <div>
                    <span className="text-gray-400 w-14 inline-block align-top">Motivo:</span>
                    <p className="text-gray-300 mt-1 text-xs leading-relaxed inline-block w-[calc(100%-60px)]">
                      {signal.reason}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignalPanel;