import TradingView from '@mathieuc/tradingview'
import { Candle } from '@/lib/types'
import { fetchBinanceData } from './binance'
import { fetchDukascopyData } from './dukascopy-service'
import { AssetCategory, ASSET_CATEGORIES, TV_SYMBOL_MAP } from './assets'

/**
 * Auto-detect asset category from symbol name.
 * Assets are now stored as clean names (no prefixes), so we just
 * strip any incoming prefix and do a direct match.
 */
export function detectCategory(symbol: string): AssetCategory | undefined {
    const clean = symbol
        .replace('BINANCE:', '')
        .replace('FX:', '')
        .replace('OANDA:', '')
        .replace('FOREX:', '')
        .replace('TVC:', '')
        .replace('NASDAQ:', '')
        .replace('NYSE:', '')
        .toUpperCase()

    // Direct match against clean asset names
    for (const [cat, assets] of Object.entries(ASSET_CATEGORIES)) {
        for (const asset of assets) {
            if (clean === asset.toUpperCase()) {
                return cat as AssetCategory
            }
        }
    }

    // Heuristic fallbacks for unlisted but common patterns
    if (clean.endsWith('USDT') || clean.endsWith('BUSD') || clean.endsWith('BTC')) return 'CRYPTO'
    if (clean.includes('XAU') || clean.includes('XAG') || clean.includes('OIL') || clean.includes('PLATINUM') || clean.includes('PALLADIUM')) return 'METALS'
    if (clean.length === 6 && /^[A-Z]+$/.test(clean)) return 'FOREX' // 6-letter pair like EURUSD, GBPJPY

    return undefined // Will fall through to TradingView as last resort
}

/**
 * Enhanced Data Fetcher that routes to the correct API based on Asset Category.
 * 
 * Routing Logic:
 * - FOREX, METALS -> Dukascopy (Tick data)
 * - CRYPTO -> Binance (Direct API)
 * - INDICES, STOCKS -> TradingView (Wrapper)
 * 
 * If category is not provided, it will be auto-detected from the symbol name.
 */
export async function fetchHistoricalData(
    symbol: string,
    timeframe: string = '1D',
    range: number = 1000,
    endTime?: number,
    category?: AssetCategory,
    startTime?: number
): Promise<Candle[]> {

    // Auto-detect category if not provided
    const resolvedCategory = category || detectCategory(symbol)

    if (resolvedCategory) {
        console.log(`[DataService] Routing ${symbol} → ${resolvedCategory} (${category ? 'explicit' : 'auto-detected'})`)
    } else {
        console.log(`[DataService] No category for ${symbol}, falling back to TradingView`)
    }

    // 1. DUKASCOPY (Forex & Metals — ONLY provider, no fallbacks)
    if (resolvedCategory === 'FOREX' || resolvedCategory === 'METALS') {
        console.log(`[DataService] 🔒 DUKASCOPY ONLY for ${symbol} (${resolvedCategory}) — no fallback`)
        return await fetchDukascopyData(symbol, timeframe, range, endTime, startTime)
    }

    // 2. BINANCE (Crypto)
    if (resolvedCategory === 'CRYPTO') {
        return await fetchBinanceData(symbol, timeframe, range, undefined, endTime)
    }

    // 3. Safety net: If no category was detected but symbol LOOKS like forex,
    //    force Dukascopy — never let forex pairs slip through to TradingView
    if (!resolvedCategory) {
        const clean = symbol.replace(/^(FX|OANDA|FOREX|TVC|BINANCE|NASDAQ|NYSE):/, '').toUpperCase()
        const looksLikeForex = clean.length === 6 && /^[A-Z]+$/.test(clean)
        const containsCurrency = /^(EUR|USD|GBP|JPY|AUD|NZD|CAD|CHF|XAU|XAG)/i.test(clean) 
            || /(EUR|USD|GBP|JPY|AUD|NZD|CAD|CHF)$/i.test(clean)
        
        if (looksLikeForex || containsCurrency) {
            console.log(`[DataService] 🔒 Unrecognized but looks forex: ${symbol} → forcing DUKASCOPY`)
            return await fetchDukascopyData(symbol, timeframe, range, endTime, startTime)
        }
    }

    // 4. TRADINGVIEW (Indices, Stocks only)
    return await fetchTradingViewData(symbol, timeframe, range, endTime)
}

/**
 * TradingView Data Fetcher (Unofficial Wrapper)
 */
async function fetchTradingViewData(
    symbol: string,
    timeframe: string = '1D',
    range: number = 1000,
    endTime?: number
): Promise<Candle[]> {
    return new Promise((resolve, reject) => {
        const client = new TradingView.Client()
        const chart = new client.Session.Chart()

        chart.setMarket(symbol, {
            timeframe: timeframe,
            range: range,
            to: endTime ? Math.floor(endTime / 1000) : undefined
        } as any)

        chart.onUpdate(() => {
            if (!chart.periods || chart.periods.length === 0) {
                return
            }

            const candles: Candle[] = chart.periods.map((p: any) => ({
                time: p.time,
                open: p.open,
                high: p.max,
                low: p.min,
                close: p.close,
                volume: p.volume
            }))

            candles.sort((a, b) => a.time - b.time)

            client.end()
            resolve(candles)
        })

        chart.onError((err: any) => {
            client.end()
            reject(err)
        })
    })
}

export interface SymbolInfo {
    symbol: string
    description: string
    exchange: string
    type: string
}

export async function searchSymbols(query: string): Promise<SymbolInfo[]> {
    try {
        const results = await (TradingView as any).searchMarket(query)
        return results.map((r: any) => ({
            symbol: r.symbol || r.id || r,
            description: r.description || '',
            exchange: r.exchange || '',
            type: r.type || ''
        }))
    } catch (e) {
        console.error('Search error', e)
        return []
    }
}

export const fetchHistoricalCandles = fetchHistoricalData
