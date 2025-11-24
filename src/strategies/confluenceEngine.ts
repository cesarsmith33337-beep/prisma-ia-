import type { Signal, ChartData } from "../types";

export const confluenceEngine = {
  name: 'Confluence – 3+ Estratégias Alinhadas',
  timeframe: [1, 5],
  pair: ['EURUSD', 'GBPUSD', 'XAUUSD'],

  filters: [
    {
      id: 'minMatches',
      description: 'Pelo menos 3 estratégias dão o mesmo sinal',
      check: (passedSignals: Omit<Signal, 'id' | 'time' | 'status'>[]) => {
        if (!passedSignals) return false;
        const bullish = passedSignals.filter(s => s.direction === 'CALL').length;
        const bearish = passedSignals.filter(s => s.direction === 'PUT').length;
        return bullish >= 3 || bearish >= 3;
      },
    },
  ],

  triggers: [{ id: 'allGreen', check: () => true }], // O filtro é o próprio gatilho

  entryRule: {
    type: 'NEXT_CANDLE_OPEN',
    direction: (passedSignals: Omit<Signal, 'id' | 'time' | 'status'>[]) => {
        const bullish = passedSignals.filter(s => s.direction === 'CALL').length;
        return bullish >= 3 ? 'CALL' : 'PUT';
    }
  },
  expiry: 3,
};