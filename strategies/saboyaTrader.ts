import type { Candle, ChartData } from "../types";

// helper interno
function checkHiddenDivergence(priceCandles: Candle[], rsi: number[]): 'BULLISH' | 'BEARISH' | null {
  // Divergência de Baixa: Preço faz um topo mais alto, RSI faz um topo mais baixo.
  // Divergência de Alta: Preço faz um fundo mais baixo, RSI faz um fundo mais alto.
  if (!priceCandles || priceCandles.length < 3 || !rsi || rsi.length < 3) return null;

  const [p1, p2, p3] = priceCandles.slice(-3);
  const [r1, r2, r3] = rsi.slice(-3);

  // Checagem de divergência de baixa
  if (p3.high > p2.high && r3 < r2 && r3 > 70) {
    return 'BEARISH';
  }
  // Checagem de divergência de alta
  if (p3.low < p2.low && r3 > r2 && r3 < 30) {
    return 'BULLISH';
  }
  return null;
}

export const saboyaTrader = {
  name: 'Saboya – Divergência RSI + Toque de Nível',
  timeframe: [5],
  pair: ['EURUSD', 'GBPUSD', 'USDJPY'],

  filters: [
    {
      id: 'rsiDivergence',
      description: 'RSI mostra divergência com preço',
      check: (candles: Candle[], rsiHistory: number[]) => checkHiddenDivergence(candles, rsiHistory) !== null,
    },
  ],

  triggers: [
    {
      id: 'confirmationCandle',
      check: (c: Candle) => c.isEngulfing,
    },
  ],

  entryRule: {
    type: 'NEXT_CANDLE_OPEN',
    direction: (ctx: ChartData) => {
        const divergence = checkHiddenDivergence(ctx.candles, ctx.rsiHistory);
        return divergence === 'BULLISH' ? 'CALL' : 'PUT';
    },
  },
  expiry: 5,
};
