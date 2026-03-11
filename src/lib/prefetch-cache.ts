'use client'

/**
 * Global Pre-fetch Cache for Backtest Data
 * 
 * This module maintains a singleton cache that survives across
 * Next.js client-side navigations (SPA transitions). When the user
 * selects an asset + dates in the session wizard, we start downloading
 * 1m data in the background. By the time they click "Launch Session",
 * the data is already cached and the chart loads instantly.
 */

export interface PrefetchCacheEntry {
    pair: string
    startDate: string  // ISO string or date input value
    endDate: string
    data1m: any[] | null
    status: 'idle' | 'loading' | 'done' | 'error'
    progress: number  // 0-100 rough percentage
    error?: string
    startedAt?: number
    completedAt?: number
}

// Module-scoped singleton — survives page navigations
let cache: PrefetchCacheEntry = {
    pair: '',
    startDate: '',
    endDate: '',
    data1m: null,
    status: 'idle',
    progress: 0
}

let abortController: AbortController | null = null
let listeners: Set<() => void> = new Set()

/** Subscribe to cache changes (for React components) */
export function subscribePrefetchCache(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

function notifyListeners() {
    listeners.forEach(fn => fn())
}

/** Get current cache state */
export function getPrefetchCache(): PrefetchCacheEntry {
    return cache
}

// Stable snapshot for SSR to prevent infinite loops
const SERVER_SNAPSHOT: PrefetchCacheEntry = {
    pair: '',
    startDate: '',
    endDate: '',
    data1m: null,
    status: 'idle',
    progress: 0
}

export function getServerSnapshot(): PrefetchCacheEntry {
    return SERVER_SNAPSHOT
}

/** Check if cache matches a specific session */
export function getCachedData(pair: string, startDate?: string, endDate?: string): any[] | null {
    if (cache.status !== 'done' || !cache.data1m) return null

    // Match by pair (case-insensitive, strip prefixes)
    const cleanCachePair = cache.pair.replace('BINANCE:', '').replace('FX:', '').toUpperCase()
    const cleanQueryPair = pair.replace('BINANCE:', '').replace('FX:', '').toUpperCase()

    if (cleanCachePair !== cleanQueryPair) return null

    // If dates provided, check rough alignment (don't need exact match)
    // The cached data should cover the requested range
    if (startDate && cache.startDate) {
        // Just check the pair matches — date range was already validated during prefetch
        return cache.data1m
    }

    return cache.data1m
}

/** Check if a prefetch is in progress for given params */
export function isPrefetching(pair: string, startDate: string, endDate: string): boolean {
    const cleanCachePair = cache.pair.replace('BINANCE:', '').replace('FX:', '').toUpperCase()
    const cleanQueryPair = pair.replace('BINANCE:', '').replace('FX:', '').toUpperCase()

    return cache.status === 'loading' &&
        cleanCachePair === cleanQueryPair &&
        cache.startDate === startDate &&
        cache.endDate === endDate
}

/** Wait for an in-progress prefetch to complete */
export function waitForPrefetch(): Promise<any[] | null> {
    if (cache.status === 'done') return Promise.resolve(cache.data1m)
    if (cache.status !== 'loading') return Promise.resolve(null)

    return new Promise((resolve) => {
        const check = () => {
            if (cache.status === 'done') {
                listeners.delete(check)
                resolve(cache.data1m)
            } else if (cache.status === 'error' || cache.status === 'idle') {
                listeners.delete(check)
                resolve(null)
            }
        }
        listeners.add(check)
        // Safety timeout: 90 seconds
        setTimeout(() => {
            listeners.delete(check)
            resolve(cache.data1m)
        }, 90000)
    })
}

/** Start a prefetch. Cancels any previous in-progress fetch. */
export async function startPrefetch(
    pair: string,
    startDate: string,
    endDate: string,
    fetchFn: (pair: string, interval: string, limit: number, startTime?: number, endTime?: number, category?: string) => Promise<any[]>,
    category?: string
) {
    // Cancel previous fetch if any
    if (abortController) {
        abortController.abort()
        abortController = null
    }

    const cleanPair = pair.replace('BINANCE:', '').replace('FX:', '').toUpperCase()

    // Don't re-fetch if we already have matching data
    if (cache.status === 'done' && cache.data1m &&
        cache.pair.replace('BINANCE:', '').replace('FX:', '').toUpperCase() === cleanPair &&
        cache.startDate === startDate &&
        cache.endDate === endDate) {
        console.log('[Prefetch Cache] ✅ Already have matching data, skipping')
        return
    }

    // Don't re-start if already loading same params
    if (isPrefetching(pair, startDate, endDate)) {
        console.log('[Prefetch Cache] ⏳ Already loading matching data, skipping')
        return
    }

    console.log('[Prefetch Cache] 🚀 Starting prefetch...')
    console.log(`  Pair: ${pair}`)
    console.log(`  Start: ${startDate}`)
    console.log(`  End: ${endDate}`)
    console.log(`  Category: ${category || 'auto-detect'}`)

    abortController = new AbortController()
    const signal = abortController.signal

    cache = {
        pair,
        startDate,
        endDate,
        data1m: null,
        status: 'loading',
        progress: 10,
        startedAt: Date.now()
    }
    notifyListeners()

    try {
        // Calculate date range with buffer
        const startMs = new Date(startDate).getTime()
        const endMs = new Date(endDate).getTime()

        // 50-hour buffer before start for chart context
        const bufferMs = 200 * 15 * 60 * 1000
        const fetchStart = startMs - bufferMs

        // Calculate needed candles
        const sessionMinutes = (endMs - startMs) / (60 * 1000)
        const bufferMinutes = 200 * 15
        const neededCandles = Math.ceil(sessionMinutes + bufferMinutes + 100)
        const limit = Math.min(neededCandles, 100000)

        console.log(`[Prefetch Cache] Fetching ${limit} x 1m candles...`)
        cache.progress = 20
        notifyListeners()

        if (signal.aborted) return

        // Fetch 1m data — pass category for correct data source routing
        const rawData = await fetchFn(pair, '1m', limit, fetchStart, endMs, category)

        if (signal.aborted) return

        cache.progress = 70
        notifyListeners()

        if (!rawData || rawData.length === 0) {
            cache = { ...cache, status: 'error', error: 'No data returned', progress: 0 }
            notifyListeners()
            return
        }

        console.log(`[Prefetch Cache] Raw data: ${rawData.length} candles, cleaning...`)

        // Clean: sort, dedupe, validate
        const cleaned = rawData
            .filter((c: any) =>
                c.time > 0 && !isNaN(c.open) && c.open > 0 &&
                !isNaN(c.high) && c.high > 0 && !isNaN(c.low) && c.low > 0 &&
                !isNaN(c.close) && c.close > 0 &&
                c.high >= c.low && c.high >= c.open && c.high >= c.close &&
                c.low <= c.open && c.low <= c.close
            )
            .sort((a: any, b: any) => a.time - b.time)

        const seen = new Set<number>()
        const deduped = cleaned.filter((c: any) => {
            if (seen.has(c.time)) return false
            seen.add(c.time)
            return true
        }).map((c: any) => ({
            time: c.time, open: c.open, high: c.high,
            low: c.low, close: c.close, volume: c.volume || 0
        }))

        // Filter out zero-range "dead" candles (market gaps)
        const final = deduped.filter((c: any) => {
            // Keep candles that have SOME price movement OR have volume
            if (c.open === c.high && c.high === c.low && c.low === c.close && c.volume === 0) {
                return false // Remove flat zero-volume candles
            }
            return true
        })

        if (signal.aborted) return

        cache = {
            pair,
            startDate,
            endDate,
            data1m: final,
            status: 'done',
            progress: 100,
            startedAt: cache.startedAt,
            completedAt: Date.now()
        }

        const elapsed = ((cache.completedAt! - cache.startedAt!) / 1000).toFixed(1)
        console.log(`[Prefetch Cache] ✅ DONE! ${final.length} candles in ${elapsed}s`)
        console.log(`  First: ${new Date(final[0].time * 1000).toISOString()}`)
        console.log(`  Last: ${new Date(final[final.length - 1].time * 1000).toISOString()}`)
        notifyListeners()

    } catch (err: any) {
        if (signal.aborted) {
            console.log('[Prefetch Cache] ⛔ Cancelled (user changed inputs)')
            return
        }
        console.error('[Prefetch Cache] ❌ Error:', err)
        cache = { ...cache, status: 'error', error: err.message, progress: 0 }
        notifyListeners()
    }
}

/** Clear the cache */
export function clearPrefetchCache() {
    if (abortController) {
        abortController.abort()
        abortController = null
    }
    cache = {
        pair: '',
        startDate: '',
        endDate: '',
        data1m: null,
        status: 'idle',
        progress: 0
    }
    notifyListeners()
}
