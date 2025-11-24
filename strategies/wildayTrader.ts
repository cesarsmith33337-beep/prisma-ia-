import type { Candle, ChartData } from "../types";

export const wildayTrader = {
  name: 'Wilday – Consolidação + Breakout Volume',
  timeframe: [1, 5],
  pair: ['EURUSD', 'GBPUSD', 'XAUUSD'],

  filters: [
    {
      id: 'consolidation',
      description: 'Últimas 5 velas com corpo ≤ 0.0002',
      check: (candles: Candle[]) => {
          if(!candles || candles.length < 5) return false;
          return candles.slice(-5).every((c: Candle) => c.body <= 0.0002)
      },
    },
  ],

  triggers: [
    {
      id: 'volumeBreak',
      check: (c: Candle) => c.volumeRatio >= 2.5 && c.body >= 0.0003,
    },
  ],

  entryRule: {
    type: 'CURRENT_CANDLE_CLOSE',
    direction: (ctx: ChartData) => (ctx.lastCandle.close > ctx.lastCandle.open ? 'CALL' : 'PUT'),
  },
  expiry: 3,
};
