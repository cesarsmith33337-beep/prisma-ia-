import React from 'react';
import { TrendingUp, Activity, Volume2, Zap } from 'lucide-react';

interface IndicatorPanelProps {
  indicators: {
    rsi: number;
    macd: number;
    zigzag: 'TOP' | 'BOTTOM' | 'MIDDLE';
    volume: 'HIGH' | 'MEDIUM' | 'LOW';
    momentum: 'STRONG' | 'MEDIUM' | 'WEAK';
  };
}

const IndicatorPanel: React.FC<IndicatorPanelProps> = ({ indicators }) => {
  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-red-400 bg-red-500/20';
    if (rsi < 30) return 'text-green-400 bg-green-500/20';
    return 'text-yellow-400 bg-yellow-500/20';
  };

  const getRSILabel = (rsi: number) => {
    if (rsi > 70) return 'Sobrecomprado';
    if (rsi < 30) return 'Sobrevendido';
    return 'Neutro';
  };

  const getZigZagLabel = (zigzag: string) => {
    switch (zigzag) {
        case 'TOP': return 'Topo';
        case 'BOTTOM': return 'Fundo';
        default: return 'Meio';
    }
  }

  const getZigZagColor = (zigzag: string) => {
    switch (zigzag) {
        case 'TOP': return 'text-red-400';
        case 'BOTTOM': return 'text-green-400';
        default: return 'text-yellow-400';
    }
  }

  const getVolumeColor = (volume: string) => {
    switch (volume) {
        case 'HIGH': return 'text-green-400';
        case 'MEDIUM': return 'text-yellow-400';
        case 'LOW': return 'text-red-400';
        default: return 'text-gray-400';
    }
  }
  
  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
        case 'STRONG': return 'text-green-400';
        case 'MEDIUM': return 'text-yellow-400';
        case 'WEAK': return 'text-red-400';
        default: return 'text-gray-400';
    }
  }

  return (
    <div className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/30 space-y-4">
        <div className="bg-[#100e19] rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">RSI (14)</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getRSIColor(indicators.rsi)}`}>
              {getRSILabel(indicators.rsi)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-lg">{indicators.rsi.toFixed(1)}</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                indicators.rsi > 70 ? 'bg-red-500' :
                indicators.rsi < 30 ? 'bg-green-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${indicators.rsi}%` }}
            />
          </div>
        </div>

        <div className="bg-[#100e19] rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">MACD (12,26,9)</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-center justify-between">
            <span className={`font-bold text-lg ${
              indicators.macd > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {indicators.macd.toFixed(4)}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              indicators.macd > 0 ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
            }`}>
              {indicators.macd > 0 ? 'BULLISH' : 'BEARISH'}
            </span>
          </div>
        </div>

        <div className="bg-[#100e19] rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm font-medium">ZigZag</span>
                <span className={`font-bold text-lg ${getZigZagColor(indicators.zigzag)}`}>
                    {getZigZagLabel(indicators.zigzag)}
                </span>
            </div>
        </div>

        <div className="bg-[#100e19] rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm font-medium">Volume</span>
                <span className={`font-bold text-lg ${getVolumeColor(indicators.volume)}`}>
                    {indicators.volume}
                </span>
            </div>
        </div>

        <div className="bg-[#100e19] rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm font-medium">Momentum</span>
                <span className={`font-bold text-lg ${getMomentumColor(indicators.momentum)}`}>
                    {indicators.momentum}
                </span>
            </div>
        </div>
    </div>
  );
};

export default IndicatorPanel;