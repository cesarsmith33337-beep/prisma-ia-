import type { Candle, ChartData } from "../types";

export const realTraders = {
  name: 'Real Traders – Falso Rompimento Duplo',
  timeframe: [1, 5],
  pair: ['EURUSD', 'GBPUSD', 'USDCHF', 'XAUUSD'],

  filters: [
    {
      id: 'doubleTap',
      description: 'Dois toques consecutivos no mesmo nível sem romper',
      check: (_: Candle, highs: number[], lows: number[]) => (highs && highs.length >= 2) || (lows && lows.length >= 2),
    },
  ],

  triggers: [
    {
      id: 'closeAboveBelow',
      description: 'Vela fecha de volta para dentro da zona após o toque',
      check: (c: Candle, highs: number[], lows: number[]) =>
        (highs && highs.length > 0 && c.close < highs[highs.length -1]) || 
        (lows && lows.length > 0 && c.close > lows[lows.length - 1]),
    },
  ],

  entryRule: {
    type: 'CURRENT_CANDLE_CLOSE',
    direction: (ctx: ChartData) => {
        // Se fechou acima de um fundo (falso rompimento de baixa), é CALL
        if (ctx.swingLows && ctx.swingLows.length > 0 && ctx.lastCandle.close > ctx.swingLows[ctx.swingLows.length - 1]) {
            return 'CALL';
        }
        // Se fechou abaixo de um topo (falso rompimento de alta), é PUT
        return 'PUT';
    }
  },
  expiry: 3,
};
