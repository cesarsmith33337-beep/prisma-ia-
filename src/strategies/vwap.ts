import type { Candle, ChartData } from "../types";

export const vwap = {
  name: 'VWAP-Bounce',
  timeframe: [1, 5],
  pair: ['EURUSD', 'GBPUSD'],

  filters: [
    {
      id: 'vwapTouch',
      description: 'Preço tocou VWAP (±3 pips)',
      check: (c: Candle, vwapVal?: number) => {
          if(vwapVal === undefined) return false;
          return Math.abs(c.close - vwapVal) <= 0.0003;
      }
    },
  ],

  triggers: [{ id: 'bounce', check: (c: Candle) => c.isBounce === true }],

  entryRule: {
    type: 'CURRENT_CANDLE_CLOSE',
    direction: (ctx: ChartData) => (ctx.lastCandle.close > (ctx.vwap ?? 0) ? 'CALL' : 'PUT'),
  },
  expiry: 3,
};