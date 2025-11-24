import type { Candle, ChartData } from "../types";

export const genericChannel = {
  name: 'Genérico – ZigZag 61.8 %',
  timeframe: [1, 5],
  pair: ['EURUSD', 'GBPUSD'],

  filters: [
    {
      id: 'zigzag618',
      description: 'Toque no 61,8 % fibo',
      check: (c: Candle, fibLevels: number[]) =>
        fibLevels && fibLevels.some((l) => Math.abs(c.close - l) <= 0.0002),
    },
  ],

  triggers: [
    {
      id: 'zigzagConfirmation',
      check: (c: Candle) => c.isEngulfing,
    },
  ],

  entryRule: {
    type: 'NEXT_CANDLE_OPEN',
    direction: (ctx: ChartData) => {
      // Se o preço está acima do nível de fibo tocado, é suporte -> CALL
      // Se o preço está abaixo, é resistência -> PUT
      const fibLevel = ctx.fibLevels.find((l) => Math.abs(ctx.lastCandle.close - l) <= 0.0002);
      if (fibLevel === undefined) return 'CALL'; // Fallback
      return ctx.lastCandle.close > fibLevel ? 'CALL' : 'PUT';
    },
  },
  expiry: 5,
};
