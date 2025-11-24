import type { Candle, ChartData } from "../types";

export const psarFlip = {
  name: 'PSAR-Flip',
  timeframe: [1, 5],
  pair: ['EURUSD', 'GBPUSD'],

  filters: [
    {
      id: 'sarFlip',
      description: 'PSAR trocou de lado',
      check: (sarHistory?: number[], candles?: Candle[]) => {
        if (!sarHistory || sarHistory.length < 2 || !candles || candles.length < 2) return false;
        
        const [prevSar, currentSar] = sarHistory.slice(-2);
        const [prevCandle, currentCandle] = candles.slice(-2);

        // Flip para alta (SAR estava acima, agora está abaixo)
        const flipUp = prevSar > prevCandle.high && currentSar < currentCandle.low;
        // Flip para baixa (SAR estava abaixo, agora está acima)
        const flipDown = prevSar < prevCandle.low && currentSar > currentCandle.high;

        return flipUp || flipDown;
      },
    },
  ],

  triggers: [{ id: 'followSar', check: (c: Candle, sarHistory?: number[]) => sarHistory !== undefined && sarHistory.length > 0 }],

  entryRule: {
    type: 'NEXT_CANDLE_OPEN',
    direction: (ctx: ChartData) => {
        const currentSar = ctx.sarHistory?.[ctx.sarHistory.length - 1];
        const lastClose = ctx.lastCandle.close;
        // Se SAR está abaixo do preço, tendência de alta -> CALL
        return currentSar !== undefined && currentSar < lastClose ? 'CALL' : 'PUT';
    }
  },
  expiry: 2,
};