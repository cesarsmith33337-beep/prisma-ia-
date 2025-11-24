import type { ChartData } from "../types";

export const brokerFilter = {
  name: 'Broker Expiry Filter',
  timeframe: [1, 2, 5],
  pair: ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'AUDUSD'],

  filters: [
    {
      id: 'brokerOpen',
      description: 'Corretora ainda aceita ordem nesse horário',
      check: (ctx: ChartData) => {
        // Esta lógica é uma simulação. A informação real deve vir da extração do Gemini.
        return ctx.currentExpiryAvailable !== undefined;
      },
    },
  ],
  triggers: [{ id: 'always', check: () => true }],
  entryRule: { type: 'CURRENT_CANDLE_CLOSE', direction: () => 'WAIT' }, // Dummy, não deve gerar sinal
  expiry: 1, // será sobrescrito
};