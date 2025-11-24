import type { Candle, ChartData } from "../types";

export const orderBlock = {
  name: 'Order-Block – Blocos de Compra/Venda',
  timeframe: [1, 5],
  pair: ['EURUSD', 'GBPUSD', 'XAUUSD'],

  filters: [
    {
      id: 'blockTest',
      description: 'Preço retestou bloco anterior (±2 pips)',
      check: (c: Candle, blocks?: { buy: number[], sell: number[] }) => {
          if (!blocks) return false;
          const allBlocks = [...(blocks.buy || []), ...(blocks.sell || [])];
          return allBlocks.some(b => Math.abs(c.close - b) <= 0.0002);
      }
    },
  ],

  triggers: [{ id: 'imbalance', check: (c: Candle) => c.isFairValueGap === true }],

  entryRule: {
    type: 'CURRENT_CANDLE_CLOSE',
    direction: (ctx: ChartData) => {
        // Se testou um bloco de compra, a direção é CALL
        const testedBuyBlock = ctx.orderBlocks?.buy?.some(b => Math.abs(ctx.lastCandle.close - b) <= 0.0002);
        return testedBuyBlock ? 'CALL' : 'PUT';
    }
  },
  expiry: 3,
};