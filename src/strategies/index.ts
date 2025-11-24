import { confluenceEngine } from './confluenceEngine';
import { reversalReader } from './reversalReader';
import { orderBlock } from './orderBlock';
import { liquidityGrab } from './liquidityGrab';
import { deltaVolume } from './deltaVolume';
import { fvg } from './fvg';
import { vwap } from './vwap';
import { psarFlip } from './psarFlip';
import { brokerFilter } from './brokerFilter';
import { arabTraders } from './arabTraders';
import { realTraders } from './realTraders';
import { saboyaTrader } from './saboyaTrader';
import { wildayTrader } from './wildayTrader';
import { binaryForex } from './binaryForex';
import { abanobTrader } from './abanobTrader';
import { genericChannel } from './genericChannel';

export const strategies = [
    // Meta strategies (highest priority)
    confluenceEngine,
    reversalReader,
    
    // Advanced strategies
    orderBlock,
    liquidityGrab,
    deltaVolume,
    fvg,
    vwap,
    psarFlip,

    // Original strategies
    arabTraders,
    realTraders,
    saboyaTrader,
    wildayTrader,
    binaryForex,
    abanobTrader,
    genericChannel,

    // Filters (last)
    brokerFilter
];