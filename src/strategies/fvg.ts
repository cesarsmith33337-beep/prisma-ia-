import type { Candle, ChartData } from "../types";

function checkFvg(candles: Candle[]): 'BUY' | 'SELL' | null {
    if (!candles || candles.length < 3) return null;
    const [a, b, c] = candles;
    
    // Gap de compra (preço deve subir para preencher)
    if (c.low > a.high) {
        return 'BUY';
    }
    // Gap de venda (preço deve descer para preencher)
    if (c.high < a.low) {
        return 'SELL';
    }
    return null;
}

export const fvg = {
  name: 'Fair-Value-Gap',
  timeframe: [1, 5],
  pair: ['EURUSD', 'GBPUSD', 'USDJPY'],

  filters: [
    {
      id: 'gapExists',
      description: 'Existe gap de 3 velas (shadow não se sobrepõe)',
      check: (candles: Candle[]) => checkFvg(candles.slice(-3)) !== null,
    },
  ],

  triggers: [{ id: 'retest', check: (c: Candle) => c.closeInsideGap === true }],

  entryRule: {
    type: 'CURRENT_CANDLE_CLOSE',
    direction: (ctx: ChartData) => {
        // Re-avalia o tipo de gap com as 3 últimas velas
        const gapType = checkFvg(ctx.candles.slice(-3));
        // Se é um FVG de compra (espaço vazio em baixo), esperamos uma alta -> CALL
        return gapType === 'BUY' ? 'CALL' : 'PUT';
    },
  },
  expiry: 3,
};