import { Candle } from './binance'

export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d'

export function getSecondsInTimeframe(tf: Timeframe): number {
    switch (tf) {
        case '1m': return 60
        case '3m': return 3 * 60
        case '5m': return 5 * 60
        case '15m': return 15 * 60
        case '30m': return 30 * 60
        case '1h': return 60 * 60
        case '4h': return 4 * 60 * 60
        case '1d': return 24 * 60 * 60
    }
}

/**
 * Aggregates a list of base candles into a higher timeframe.
 * @param baseCandles Array of candles in the base timeframe (e.g., 15m)
 * @param targetTimeframe The desired timeframe (e.g., '1h')
 * @returns Array of aggregated candles
 */
export function aggregateCandles(baseCandles: Candle[], targetTimeframe: Timeframe): Candle[] {
    if (baseCandles.length === 0) return []

    const tfSeconds = getSecondsInTimeframe(targetTimeframe)
    const aggregated: Candle[] = []

    let currentCandle: Candle | null = null
    let currentBucketStart = 0

    for (const candle of baseCandles) {
        // Calculate the start time of the bucket this candle belongs to
        // e.g. if tf is 1h (3600s), and candle time is 10:15 (36900s), bucket start is 10:00 (36000s)
        const candleTimeSec = candle.time as number
        const bucketStart = Math.floor(candleTimeSec / tfSeconds) * tfSeconds

        if (currentCandle && bucketStart !== currentBucketStart) {
            // New bucket started, push the previous completed candle
            aggregated.push(currentCandle)
            currentCandle = null
        }

        if (!currentCandle) {
            // Start a new aggregated candle
            currentBucketStart = bucketStart
            currentCandle = {
                time: bucketStart as any, // Cast to any to satisfy lightweight-charts types if needed
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume
            }
        } else {
            // Update existing candle
            currentCandle.high = Math.max(currentCandle.high, candle.high)
            currentCandle.low = Math.min(currentCandle.low, candle.low)
            currentCandle.close = candle.close // Close is always the latest close
            currentCandle.volume += candle.volume
        }
    }

    // Push the last forming candle
    if (currentCandle) {
        aggregated.push(currentCandle)
    }

    return aggregated
}

/**
 * Returns the "forming" state of a higher timeframe candle at a specific point in time,
 * given a history of base candles up to that time.
 */
export function getFormingCandle(baseCandlesSlice: Candle[], targetTimeframe: Timeframe): Candle | null {
    if (baseCandlesSlice.length === 0) return null

    // We only care about the last bucket
    const lastBaseCandle = baseCandlesSlice[baseCandlesSlice.length - 1]
    const tfSeconds = getSecondsInTimeframe(targetTimeframe)
    const bucketStart = Math.floor((lastBaseCandle.time as number) / tfSeconds) * tfSeconds

    // Filter candles that belong to this bucket
    const relevantCandles = []
    for (let i = baseCandlesSlice.length - 1; i >= 0; i--) {
        const c = baseCandlesSlice[i]
        if ((c.time as number) < bucketStart) break
        relevantCandles.unshift(c)
    }

    if (relevantCandles.length === 0) return null

    // Aggregate them
    const formingCandle: Candle = {
        time: bucketStart as any,
        open: relevantCandles[0].open,
        high: relevantCandles[0].high,
        low: relevantCandles[0].low,
        close: relevantCandles[relevantCandles.length - 1].close,
        volume: relevantCandles.reduce((acc, c) => acc + c.volume, 0)
    }

    return formingCandle
}
