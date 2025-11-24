import type { Candle, ChartData } from "../types";

export const binaryForex = {
  name: 'BinaryForex – Zona S/D + Reversão',
  timeframe: [1, 5],
  pair: ['EURUSD', 'GBPUSD', 'USDCHF'],

  filters: [
    {
      id: 'supplyDemand',
      description: 'Preço dentro da zona desenhada (±3 pips)',
      check: (c: Candle, zones: number[][]) =>
        zones && zones.some(([high, low]) => c.close >= low && c.close <= high),
    },
  ],

  triggers: [
    {
      id: 'reversalCandle',
      check: (c: Candle) => c.isHammer || c.isDoji,
    },
  ],

  entryRule: {
    type: 'NEXT_CANDLE_OPEN',
    direction: (ctx: ChartData) => {
        // Martelo indica reversão de alta, Doji pode ser ambos, mas assume reversão
        const candle = ctx.lastCandle;
        if (candle.isHammer) return 'CALL';
        // Para Doji, verifica se está em um fundo (call) ou topo (put)
        return candle.close > candle.open ? 'PUT' : 'CALL';
    }
  },
  expiry: 5,
};
