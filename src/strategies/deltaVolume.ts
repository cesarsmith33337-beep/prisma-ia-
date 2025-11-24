import type { Candle, ChartData } from "../types";

export const deltaVolume = {
  name: 'Delta-Volume – Venda/Compra agressiva',
  timeframe: [1],
  pair: ['EURUSD', 'GBPUSD'],

  filters: [
    {
      id: 'deltaFlip',
      description: 'Delta muda de positivo > negativo ou vice-versa',
      check: (deltaHistory?: number[]) => {
        if (!deltaHistory || deltaHistory.length < 2) return false;
        const [a, b] = deltaHistory.slice(-2);
        return (a > 0 && b < 0) || (a < 0 && b > 0);
      },
    },
  ],

  triggers: [{ id: 'followDelta', check: (c: Candle, deltaHistory?: number[]) => deltaHistory !== undefined && deltaHistory.length > 0 }],

  entryRule: {
    type: 'CURRENT_CANDLE_CLOSE',
    direction: (ctx: ChartData) => (ctx.deltaHistory && ctx.deltaHistory[ctx.deltaHistory.length - 1] > 0 ? 'CALL' : 'PUT'),
  },
  expiry: 1, // M1 puro
};