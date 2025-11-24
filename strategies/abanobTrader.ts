import type { Candle, ChartData } from "../types";

export const abanobTrader = {
  name: 'Abanob – Fake-Out 3 Pavios',
  timeframe: [1, 5],
  pair: ['EURUSD', 'GBPUSD'],

  filters: [
    {
      id: 'fakeOut',
      description: '3 velas com pavios falsos (close volta para dentro)',
      check: (candles: Candle[]) => {
        if (!candles || candles.length < 3) return false;
        const lastThree = candles.slice(-3);
        return lastThree.every((c: Candle) => {
          const wick = c.upperWick > c.lowerWick ? c.upperWick : c.lowerWick;
          return c.body > 0 && wick > c.body * 1.5;
        });
      },
    },
  ],

  triggers: [
    {
      id: 'ignition',
      check: (c: Candle) => c.body >= 0.0003 && c.close !== c.open,
    },
  ],

  entryRule: {
    type: 'CURRENT_CANDLE_CLOSE',
    direction: (ctx: ChartData) => (ctx.lastCandle.close > ctx.lastCandle.open ? 'CALL' : 'PUT'),
  },
  expiry: 3,
};
