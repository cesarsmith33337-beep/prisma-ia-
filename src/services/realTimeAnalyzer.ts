import { eventBus } from './eventBus';
import { strategies } from '../strategies';
import { extractChartDataFromImage } from './gemini';
import type { ChartData, Signal, Candle } from '../types';


// Helper para gerar um objeto de sinal
const generateSignal = (strategy: any, chartData: ChartData, passedSignals?: Omit<Signal, 'id' | 'time' | 'status'>[]): Omit<Signal, 'id' | 'time' | 'status'> => {
    const { lastCandle } = chartData;
    
    // O contexto para a regra de direção pode ser a chartData ou a lista de sinais (para confluência)
    const context = strategy.name.startsWith('Confluence') ? passedSignals : chartData;

    const direction = strategy.entryRule.direction(context);
    const entrySuggestion = strategy.entryRule.type === 'NEXT_CANDLE_OPEN' ? 'NEXT_CANDLE' : 'IMMEDIATE';
    
    let reason = `${strategy.name} - Filtros e gatilhos atendidos.`;
    if (strategy.name.startsWith('Confluence') && passedSignals) {
        const strategyNames = passedSignals.map(s => s.strategy.split('–')[0].trim()).join(', ');
        reason = `Confluência de ${passedSignals.length} estratégias: ${strategyNames}.`;
    }

    return {
        asset: chartData.asset || 'N/A',
        price: lastCandle.close,
        direction: direction,
        strategy: strategy.name,
        reason: reason,
        entrySuggestion: entrySuggestion,
        expiry: `${strategy.expiry} Minutos`
    };
};

const getContextForCheck = (filterId: string, chartData: ChartData): any[] => {
    const { lastCandle, swingHighs, swingLows, rsiHistory, fibLevels, supplyDemandZones, candles, ma3, orderBlocks, deltaHistory, vwap, sarHistory, currentExpiryAvailable } = chartData;
    
    switch (filterId) {
        case 'consolidation':
        case 'fakeOut':
            return [candles];
        case 'rsiDivergence':
            return [candles, rsiHistory];
        case 'ma3Flipped':
            return [candles, ma3];
        case 'deltaFlip':
            return [deltaHistory];
        case 'sarFlip':
            return [sarHistory, candles];
        case 'supplyDemand':
            return [lastCandle, supplyDemandZones];
        case 'zigzag618':
            return [lastCandle, fibLevels];
        case 'blockTest':
            return [lastCandle, orderBlocks];
        case 'vwapTouch':
            return [lastCandle, vwap];
        case 'brokerOpen':
             return [chartData];
        // Checks needing highs and lows
        case 'liquidityTouch':
        case 'doubleTap':
        case 'closeAboveBelow':
        case 'swingBroken':
        case 'sweep':
            return [lastCandle, swingHighs, swingLows];
        // Default checks for triggers or simple filters
        default:
            return [lastCandle];
    }
}

export async function realTimeAnalyzer(frame: string): Promise<Omit<Signal, 'id' | 'time' | 'status'> | null> {
    try {
        const chartData = await extractChartDataFromImage(frame);
        
        if (!chartData || !chartData.lastCandle) {
            console.warn("Não foi possível extrair dados do gráfico da imagem.");
            return null;
        }

        const confluenceEngine = strategies.find(s => s.name.startsWith('Confluence'));
        const tradingStrategies = strategies.filter(s => !s.name.startsWith('Confluence') && s.entryRule.direction(chartData) !== 'WAIT');

        const passedSignals: Omit<Signal, 'id' | 'time' | 'status'>[] = [];

        for (const strat of tradingStrategies) {
            const filtersPassed = strat.filters.every((f: any) => {
                const context = getContextForCheck(f.id, chartData);
                return f.check(...context);
            });
            if (!filtersPassed) continue;

            const triggersFired = strat.triggers.some((t: any) => {
                 const context = getContextForCheck(t.id, chartData);
                 return t.check(...context);
            });
            if (!triggersFired) continue;
            
            passedSignals.push(generateSignal(strat, chartData));
        }

        // 1. Check for Confluence Signal (highest priority)
        if (confluenceEngine && confluenceEngine.filters[0].check(passedSignals)) {
            const confluenceSignal = generateSignal(confluenceEngine, chartData, passedSignals);
            eventBus.emit('realTime:signal', confluenceSignal);
            console.log("SINAL DE CONFLUÊNCIA GERADO:", confluenceSignal);
            return confluenceSignal;
        }

        // 2. If no confluence, check for the highest priority individual signal
        if (passedSignals.length > 0) {
            const highestPrioritySignal = passedSignals[0]; // The first one found is the highest priority due to array order
            eventBus.emit('realTime:signal', highestPrioritySignal);
            console.log("SINAL GERADO:", highestPrioritySignal);
            return highestPrioritySignal;
        }

    } catch (error) {
        console.error("Erro no realTimeAnalyzer:", error);
        if (error instanceof Error) {
            throw new Error(`Erro da IA: ${error.message}`);
        }
    }
    return null;
}