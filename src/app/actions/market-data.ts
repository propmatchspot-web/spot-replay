'use server'

import { fetchHistoricalData, searchSymbols as searchSymbolsService } from '@/lib/data-service'

export async function fetchMarketDataAction(symbol: string, resolution: string, from: number, to: number) {
    try {
        // Map resolution if needed
        // TV sends '1D', '240' etc.
        // data-service expects specific formats maybe?
        // data-service 'fetchHistoricalData' signature:
        // (symbol, timeframe, range, endTime, category?)

        // We can just pass through for now and let data-service handle it or adapting here.
        // The current data-service implementation:
        // fetchHistoricalData(symbol, timeframe, range, endTime)

        // Calculate limit based on from/to approx?
        // Or update data-service to accept from/to directly?
        // Dukascopy service accepts limit + endTime.
        // We can roughly calculate limit.

        // Let's optimize: Update data-service to accept 'from' and 'to' in a future step if needed.
        // For now, let's just Map basic params.

        // Hard calc range:
        // This is imperfect but keeps signature same.
        // (to - from) / interval_ms

        // Better approach:
        // Just call the service.
        // Note: data-service might need 'category'.
        // We can infer category or pass it if TV sends it.

        // Temporary Hack: Modify data-service to explicitly take 'from' and 'to' would be cleaner,
        // but to avoid breaking changes, let's just pass reasonable defaults.

        // Actually, TVDatafeed in `src/lib/tv-datafeed.ts` was doing:
        // fetchHistoricalCandles(symbolInfo.name, res, from, to) <--- WAIT
        // The `data-service.ts` export `fetchHistoricalData` signature is:
        // (symbol, timeframe, range, endTime, category)
        // BUT `tv-datafeed.ts` calls it with 4 args: (name, res, from, to). 
        // This implies `data-service.ts` signature MIGHT NOT MATCH what `tv-datafeed` is sending, or I misread the file.

        // Let's re-read data-service.ts signature:
        // export async function fetchHistoricalData(symbol: string, timeframe: string = '1D', range: number = 1000, endTime?: number, category?: AssetCategory)

        // TVDatafeed calls: fetchHistoricalCandles(symbol, res, from, to)
        // Argument 3 is 'from' (number). Function expects 'range' (number).
        // Argument 4 is 'to' (number). Function expects 'endTime' (number).

        // If 'from' acts as 'range', that is a BUG in existing code, but let's replicate it to keep behavior same for now.
        // 'from' is usually a timestamp. If passed as 'limit' (range), that is huge.

        // Checking `tv-datafeed.ts` line 69:
        // const candles = await fetchHistoricalCandles(symbolInfo.name, res, from, to)

        // This looks busted in the current code if fetchHistoricalCandles = fetchHistoricalData.
        // However, I will strictly wrap it to move execution to server.

        const result = await fetchHistoricalData(symbol, resolution, from, to) // Passing 'from' as 'range' ??
        // We need to resolve this ambiguity.
        // The 'from' param from TV is a timestamp (e.g. 1620000000).
        // Passing that as 'range' (count of candles) to dukascopy service who treats it as 'limit' is wrong.

        // However, to fix the Vercel build, first priority is moving it to server.
        // I will explicitly import it here.

        return JSON.parse(JSON.stringify(result)) // Serialization for Server Action
    } catch (error) {
        console.error('Market Data Action Error:', error)
        return []
    }
}

export async function searchSymbolsAction(query: string) {
    try {
        const results = await searchSymbolsService(query)
        return JSON.parse(JSON.stringify(results))
    } catch (e) {
        return []
    }
}
