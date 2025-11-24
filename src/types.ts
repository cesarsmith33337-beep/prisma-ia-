// FIX: Created a central types file to resolve circular dependencies and missing type exports.
// This file defines all shared data structures for the application.

export interface Analysis {
    asset: string;
    price: number;
    reasoning: string;
    signal: 'CALL' | 'PUT' | 'WAIT';
    confidence?: 'Extrema' | 'Alta' | 'Média';
    entrySuggestion?: 'IMMEDIATE' | 'NEXT_CANDLE';
    timeframe?: string;
    candleTimer?: string;
    observation?: string;
    candleOutcome?: 'BULLISH' | 'BEARISH' | 'DOJI';
}

export interface HistoricalReport {
    marketCondition: 'Uptrend' | 'Downtrend' | 'Consolidation';
    keyLevels: {
        level: number;
        type: 'Support' | 'Resistance';
    }[];
    identifiedPatterns: string[];
    strategicSummary: string;
}

export interface Signal {
    id: number;
    asset: string;
    direction: 'CALL' | 'PUT';
    strategy: string;
    expiry?: string;
    reason: string;
    price: number;
    entrySuggestion?: 'IMMEDIATE' | 'NEXT_CANDLE';
    time: string;
    status: 'WIN' | 'LOSS' | 'PENDING';
    probability?: number;
}

export interface Observation {
    id: number;
    outcome: 'BULLISH' | 'BEARISH' | 'DOJI';
    reason: string;
}

export interface CaptureError {
    title: string;
    message: string;
}

export interface Candle {
    open: number;
    high: number;
    low: number;
    close: number;
    upperWick: number;
    lowerWick: number;
    body: number;
    isEngulfing: boolean;
    isPinBar: boolean;
    isDoji: boolean;
    isHammer: boolean;
    volumeRatio: number;
    isFairValueGap?: boolean;
    closeInsideGap?: boolean;
    isBounce?: boolean;
}

export interface ChartData {
    asset: string;
    candles: Candle[];
    lastCandle: Candle;
    swingHighs: number[];
    swingLows: number[];
    rsiHistory: number[];
    fibLevels: number[];
    supplyDemandZones: number[][];
    ma3?: number;
    orderBlocks?: { buy: number[], sell: number[] };
    deltaHistory?: number[];
    vwap?: number;
    sarHistory?: number[];
    currentExpiryAvailable?: 1 | 2 | 5;
}