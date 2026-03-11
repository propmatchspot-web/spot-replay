import { Candle } from '@/lib/types'
export type { Candle }

// Map intervals to Binance format (supports both app format and TradingView format)
const intervalMap: Record<string, string> = {
    // App format
    '1m': '1m',
    '3m': '3m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1h': '1h',
    '2h': '2h',
    '4h': '4h',
    '6h': '6h',
    '8h': '8h',
    '12h': '12h',
    '1d': '1d',
    '3d': '3d',
    '1w': '1w',
    '1M': '1M',
    // TradingView format
    '1': '1m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '240': '4h',
    'D': '1d',
    '1D': '1d',
    'W': '1w',
}

export async function fetchBinanceData(
    pair: string,
    interval: string,
    limit: number = 1000,
    startTime?: number,
    endTime?: number
): Promise<Candle[]> {
    const binanceInterval = intervalMap[interval] || '1h'
    // Remove slash e.g. BTC/USDT -> BTCUSDT
    // Ensure uppercase
    const symbol = pair.toUpperCase().replace('/', '').replace(':', '').replace('BINANCE', '')

    try {
        // If limit <= 1000 and no complex time range, just one call
        if (limit <= 1000 && !startTime) {
            return await fetchSingleBatch(symbol, binanceInterval, limit, undefined, endTime)
        }

        // Pagination Logic
        let allCandles: Candle[] = []
        let currentEndTime = endTime || Date.now()
        let remaining = limit

        // Safety break
        let loops = 0
        const MAX_LOOPS = 20

        while (remaining > 0 && loops < MAX_LOOPS) {
            const batchLimit = Math.min(remaining, 1000)
            const batch = await fetchSingleBatch(symbol, binanceInterval, batchLimit, undefined, currentEndTime)

            if (batch.length === 0) break

            allCandles = [...batch, ...allCandles]
            remaining -= batch.length
            loops++

            // Update endTime for next batch (oldest candle time - 1ms)
            currentEndTime = (batch[0].time * 1000) - 1

            if (startTime && currentEndTime < startTime) break
            if (batch.length < batchLimit) break
        }

        return allCandles.sort((a, b) => a.time - b.time)

    } catch (error) {
        console.error('Failed to fetch Binance data:', error)
        return []
    }
}

async function fetchSingleBatch(
    symbol: string,
    interval: string,
    limit: number,
    startTime?: number,
    endTime?: number
): Promise<Candle[]> {
    let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    if (startTime) url += `&startTime=${startTime}`
    if (endTime) url += `&endTime=${endTime}`

    const response = await fetch(url)
    if (!response.ok) return []
    const data = await response.json()
    if (!Array.isArray(data)) return []

    return data.map((d: any[]) => ({
        time: d[0] / 1000,
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5]),
    }))
}
