import TradingView from '@mathieuc/tradingview'
import { Candle } from '@/lib/types'
import { fetchBinanceData } from './binance'
import { fetchDukascopyData } from './dukascopy-service'
import { AssetCategory, ASSET_CATEGORIES, TV_SYMBOL_MAP } from './assets'

/**
 * Auto-detect asset category from symbol name.
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
    if (clean.length === 6 && /^[A-Z]+$/.test(clean)) return 'FOREX'

    return undefined
}

// ============================================================
// HELPER: Run a fetch with a hard timeout (no hanging ever)
// ============================================================
async function withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    label: string
): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`[${label}] timed out after ${ms / 1000}s`)), ms)
        )
    ])
}

// ============================================================
// HELPER: Try a data source, return candles or null on failure
// ============================================================
async function trySource(
    sourceName: string,
    fetchFn: () => Promise<Candle[]>,
    timeoutMs: number = 20000
): Promise<Candle[] | null> {
    try {
        const data = await withTimeout(fetchFn(), timeoutMs, sourceName)
        if (data && data.length > 0) {
            console.log(`[DataService] ✅ ${sourceName} returned ${data.length} candles`)
            return data
        }
        console.warn(`[DataService] ⚠️ ${sourceName} returned 0 candles`)
        return null
    } catch (err: any) {
        console.error(`[DataService] ❌ ${sourceName} failed:`, err?.message || err)
        return null
    }
}

// ============================================================
// TradingView with symbol prefix for forex/metals fallback
// ============================================================
function getTVSymbol(symbol: string, category?: AssetCategory): string {
    const clean = symbol
        .replace('BINANCE:', '')
        .replace('FX:', '')
        .replace('OANDA:', '')
        .replace('FOREX:', '')
        .replace('TVC:', '')
        .replace('NASDAQ:', '')
        .replace('NYSE:', '')
        .toUpperCase()

    // Check explicit map first
    if (TV_SYMBOL_MAP[clean]) return TV_SYMBOL_MAP[clean]

    // Smart prefix by category
    if (category === 'FOREX' || (clean.length === 6 && /^[A-Z]+$/.test(clean))) {
        return `FX:${clean}`
    }
    if (category === 'METALS') {
        if (clean.includes('XAU') || clean.includes('XAG')) return `OANDA:${clean}`
        if (clean.includes('OIL')) return `TVC:US${clean}`
        return `TVC:${clean}`
    }
    if (category === 'CRYPTO' || clean.endsWith('USDT')) {
        return `BINANCE:${clean}`
    }

    return symbol // Return as-is
}

/**
 * ═══════════════════════════════════════════════════════════════
 * BULLETPROOF DATA FETCHER
 * 
 * Every asset category has a PRIMARY + FALLBACK source.
 * If the primary fails or times out → automatically tries fallback.
 * If fallback also fails → tries TradingView as last resort.
 * 
 * Routing:
 * - FOREX:   Dukascopy (20s) → TradingView (15s)
 * - METALS:  Dukascopy (20s) → TradingView (15s)
 * - CRYPTO:  Binance (15s)   → TradingView (15s)
 * - INDICES: TradingView (20s)
 * - STOCKS:  TradingView (20s)
 * - Unknown: TradingView (20s)
 * ═══════════════════════════════════════════════════════════════
 */
export async function fetchHistoricalData(
    symbol: string,
    timeframe: string = '1D',
    range: number = 1000,
    endTime?: number,
    category?: AssetCategory
): Promise<Candle[]> {

    const resolvedCategory = category || detectCategory(symbol)
    console.log(`[DataService] ═══ Fetching ${symbol} | TF: ${timeframe} | Range: ${range} | Category: ${resolvedCategory || 'UNKNOWN'} ═══`)

    // ──────────────────────────────────────────────
    // FOREX & METALS: Dukascopy → TradingView
    // ──────────────────────────────────────────────
    if (resolvedCategory === 'FOREX' || resolvedCategory === 'METALS') {
        // Try 1: Dukascopy (primary, 20s timeout)
        const dukasData = await trySource(
            `Dukascopy:${symbol}`,
            () => fetchDukascopyData(symbol, timeframe, range, endTime),
            20000
        )
        if (dukasData) return dukasData

        // Try 2: TradingView fallback (15s timeout)
        console.log(`[DataService] 🔄 Falling back to TradingView for ${symbol}...`)
        const tvSymbol = getTVSymbol(symbol, resolvedCategory)
        const tvData = await trySource(
            `TradingView:${tvSymbol}`,
            () => fetchTradingViewData(tvSymbol, timeframe, range, endTime),
            15000
        )
        if (tvData) return tvData

        console.error(`[DataService] ❌ ALL sources failed for ${symbol}`)
        return []
    }

    // ──────────────────────────────────────────────
    // CRYPTO: Binance → TradingView
    // ──────────────────────────────────────────────
    if (resolvedCategory === 'CRYPTO') {
        // Try 1: Binance (primary, 15s timeout)
        const binanceData = await trySource(
            `Binance:${symbol}`,
            () => fetchBinanceData(symbol, timeframe, range, undefined, endTime),
            15000
        )
        if (binanceData) return binanceData

        // Try 2: TradingView fallback (15s timeout)
        console.log(`[DataService] 🔄 Falling back to TradingView for ${symbol}...`)
        const tvSymbol = getTVSymbol(symbol, resolvedCategory)
        const tvData = await trySource(
            `TradingView:${tvSymbol}`,
            () => fetchTradingViewData(tvSymbol, timeframe, range, endTime),
            15000
        )
        if (tvData) return tvData

        console.error(`[DataService] ❌ ALL sources failed for ${symbol}`)
        return []
    }

    // ──────────────────────────────────────────────
    // INDICES, STOCKS & UNKNOWN: TradingView only
    // ──────────────────────────────────────────────
    const tvSymbol = getTVSymbol(symbol, resolvedCategory)
    const tvData = await trySource(
        `TradingView:${tvSymbol}`,
        () => fetchTradingViewData(tvSymbol, timeframe, range, endTime),
        20000
    )
    if (tvData) return tvData

    console.error(`[DataService] ❌ TradingView failed for ${symbol}`)
    return []
}

/**
 * TradingView Data Fetcher (Unofficial Wrapper) — with timeout-safe cleanup
 */
async function fetchTradingViewData(
    symbol: string,
    timeframe: string = '1D',
    range: number = 1000,
    endTime?: number
): Promise<Candle[]> {
    return new Promise((resolve, reject) => {
        let resolved = false
        const client = new TradingView.Client()
        const chart = new client.Session.Chart()

        // Safety: auto-cleanup if TradingView never responds
        const safetyTimer = setTimeout(() => {
            if (!resolved) {
                resolved = true
                try { client.end() } catch {}
                reject(new Error('TradingView internal timeout'))
            }
        }, 18000) // 18s internal safety (outer timeout is 20s)

        chart.setMarket(symbol, {
            timeframe: timeframe,
            range: range,
            to: endTime ? Math.floor(endTime / 1000) : undefined
        } as any)

        chart.onUpdate(() => {
            if (resolved) return
            if (!chart.periods || chart.periods.length === 0) return

            resolved = true
            clearTimeout(safetyTimer)

            const candles: Candle[] = chart.periods.map((p: any) => ({
                time: p.time,
                open: p.open,
                high: p.max,
                low: p.min,
                close: p.close,
                volume: p.volume
            }))

            candles.sort((a, b) => a.time - b.time)
            try { client.end() } catch {}
            resolve(candles)
        })

        chart.onError((err: any) => {
            if (resolved) return
            resolved = true
            clearTimeout(safetyTimer)
            try { client.end() } catch {}
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
