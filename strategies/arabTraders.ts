import type { Candle, ChartData } from "../types";

export const arabTraders = {
  name: 'Arab Traders – Rejeição + Liquidez',
  timeframe: [1, 5],
  pair: ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'],

  // ==== FILTROS ====
  filters: [
    {
      id: 'liquidityTouch',
      description: 'Preço tocou ou rompeu swing high/low (±2 pips) e voltou',
      check: (c: Candle, highs: number[], lows: number[]) =>
        (highs && highs.some(h => Math.abs(c.close - h) <= 0.0002)) ||
        (lows && lows.some(l => Math.abs(c.close - l) <= 0.0002)),
    },
    {
      id: 'rejection',
      description: 'Pavio ≥ 75 % do corpo na direção oposta da vela',
      check: (c: Candle) =>
        c.body > 0 && (Math.max(c.upperWick, c.lowerWick) / c.body >= 0.75),
    },
  ],

  // ==== GATILHOS ====
  triggers: [
    {
      id: 'engulfing_or_pin',
      check: (c: Candle) => c.isEngulfing || c.isPinBar,
    },
  ],

  // ==== ENTRADA ====
  entryRule: {
    type: 'NEXT_CANDLE_OPEN',
    direction: (ctx: ChartData) => {
      // A direção é baseada em qual pavio foi longo na vela de rejeição
      // A vela de rejeição é a penúltima, antes do gatilho
      const rejectionCandle = ctx.candles.slice(-2)[0]; 
      if (!rejectionCandle) return 'CALL'; // Fallback
      return rejectionCandle.lowerWick > rejectionCandle.upperWick ? 'CALL' : 'PUT';
    },
  },
  expiry: 5,
};
