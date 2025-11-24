import type { Candle, ChartData } from "../types";

// Detecta virada de tendência no M1 em tempo real
export const reversalReader = {
  name: 'Reversal Reader – M1 Real-Time',
  timeframe: [1],
  pair: ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'],

  // 1) FILTROS – estrutura tem que estar clara
  filters: [
    {
      id: 'swingBroken',
      description: 'Último swing high/low rompido e preço voltou 50 % do movimento',
      check: (c: Candle, highs: number[], lows: number[]) => {
        const lastHigh = highs?.[highs.length - 1];
        const lastLow  = lows?.[lows.length - 1];
        if (!lastHigh || !lastLow) return false;

        // rompeu o swing e já recuou 50 %
        const range = lastHigh - lastLow;
        if (range === 0) return false;
        
        if (c.close > lastHigh) {
          return c.close <= lastHigh - range * 0.5;
        }
        if (c.close < lastLow) {
          return c.close >= lastLow + range * 0.5;
        }
        return false;
      },
    },
    {
      id: 'ma3Flipped',
      description: 'Média móvel de 3 períodos virou junto (fechamento cruzou)',
      check: (candles: Candle[], ma3?: number) => {
        if (!candles || candles.length < 4 || ma3 === undefined) return false;
        
        const prevMa3 = candles.slice(-4, -1).reduce((s, c) => s + c.close, 0) / 3;
        const last = candles[candles.length - 1];
        const prevOfLast = candles[candles.length - 2];

        // virada de alta
        if (last.close > ma3 && prevMa3 <= prevOfLast.close) return true;
        // virada de baixa
        if (last.close < ma3 && prevMa3 >= prevOfLast.close) return true;
        return false;
      },
    },
  ],

  // 2) GATILHO – confirmação de reversão na vela
  triggers: [
    {
      id: 'reversalCandle',
      check: (c: Candle) => {
        if (!c || c.body <= 0) return false;
        const wick = Math.max(c.upperWick, c.lowerWick);
        // pavio grande + corpo pequeno = indecisão -> próxima vela confirma
        return wick >= c.body * 2 && c.body <= 0.00015;
      },
    },
  ],

  // 3) ENTRADA – só depois que a próxima vela romper o pavio da reversal
  entryRule: {
    type: 'NEXT_CANDLE_OPEN',
    direction: (ctx: ChartData) => {
      const last = ctx.candles[ctx.candles.length - 1];
      return last.lowerWick > last.upperWick ? 'CALL' : 'PUT';
    },
  },
  expiry: 2, // 2 minutos é suficiente para M1
};