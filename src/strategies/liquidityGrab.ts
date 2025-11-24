import type { Candle, ChartData } from "../types";

export const liquidityGrab = {
  name: 'Liquidity-Grab – Varre Stops',
  timeframe: [1],
  pair: ['EURUSD', 'GBPUSD'],

  filters: [
    {
      id: 'sweep',
      description: 'Preço rompeu extremo com pavio longo e volta 70 %',
      check: (c: Candle, highs: number[], lows: number[]) => {
        const lastHigh = highs?.[highs.length - 1];
        const lastLow = lows?.[lows.length - 1];

        // Checa sweep de alta
        if (lastHigh && c.high > lastHigh) {
            const range = c.high - c.low;
            if (range === 0) return false;
            // O fechamento deve retornar para dentro do range da vela, perto do fundo
            const returnedAmount = (c.high - c.close) / range;
            return returnedAmount >= 0.7;
        }

        // Checa sweep de baixa
        if (lastLow && c.low < lastLow) {
            const range = c.high - c.low;
             if (range === 0) return false;
            // O fechamento deve retornar para dentro do range da vela, perto do topo
            const returnedAmount = (c.close - c.low) / range;
            return returnedAmount >= 0.7;
        }
        
        return false;
      },
    },
  ],

  triggers: [{ id: 'returnCandle', check: (c: Candle) => c.close !== c.open }], // Garante que a vela não seja um Doji total

  entryRule: {
    type: 'NEXT_CANDLE_OPEN',
    direction: (ctx: ChartData) => {
      const { lastCandle, swingHighs, swingLows } = ctx;
      const lastHigh = swingHighs?.[swingHighs.length - 1];
      const lastLow = swingLows?.[swingLows.length - 1];
      
      // Se varreu um topo (high > lastHigh), o sinal é PUT
      if (lastHigh && lastCandle.high > lastHigh) {
          return 'PUT';
      }
      // Se varreu um fundo (low < lastLow), o sinal é CALL
      return 'CALL';
    },
  },
  expiry: 2,
};