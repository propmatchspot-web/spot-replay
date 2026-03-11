import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Required for file uploads in Next.js App Router
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Cache Supabase client
const CACHE_URL = process.env.SUPABASE_CACHE_URL || ''
const CACHE_KEY = process.env.SUPABASE_CACHE_SERVICE_KEY || process.env.SUPABASE_CACHE_ANON_KEY || ''

interface Candle {
    symbol: string
    interval: string
    timestamp: number
    open: number
    high: number
    low: number
    close: number
    volume: number
}

/**
 * Parse HistData CSV format
 * Format: YYYYMMDD HHMMSS;OPEN;HIGH;LOW;CLOSE;VOLUME
 * or:     YYYYMMDD HHMMSS,OPEN,HIGH,LOW,CLOSE,VOLUME
 */
function parseHistDataCSV(content: string, symbol: string): Candle[] {
    const candles: Candle[] = []
    const lines = content.split(/\r?\n/)

    for (const line of lines) {
        if (!line.trim()) continue

        // Handle both semicolon and comma separators
        const parts = line.includes(';') ? line.split(';') : line.split(',')
        if (parts.length < 5) continue

        try {
            const dateTime = parts[0].trim()

            // Parse datetime: "20231215 120000" -> timestamp
            // Also handle format with space like "20231215 120000"
            const cleanDateTime = dateTime.replace(/\s+/g, ' ').trim()

            let year, month, day, hour, minute, second

            if (cleanDateTime.includes(' ')) {
                // Format: "20231215 120000"
                const [datePart, timePart] = cleanDateTime.split(' ')
                year = parseInt(datePart.slice(0, 4))
                month = parseInt(datePart.slice(4, 6)) - 1
                day = parseInt(datePart.slice(6, 8))
                hour = parseInt(timePart.slice(0, 2))
                minute = parseInt(timePart.slice(2, 4))
                second = parseInt(timePart.slice(4, 6)) || 0
            } else {
                // Format: "20231215120000"
                year = parseInt(cleanDateTime.slice(0, 4))
                month = parseInt(cleanDateTime.slice(4, 6)) - 1
                day = parseInt(cleanDateTime.slice(6, 8))
                hour = parseInt(cleanDateTime.slice(8, 10))
                minute = parseInt(cleanDateTime.slice(10, 12))
                second = parseInt(cleanDateTime.slice(12, 14)) || 0
            }

            const date = new Date(Date.UTC(year, month, day, hour, minute, second))
            const timestamp = Math.floor(date.getTime() / 1000)

            if (isNaN(timestamp) || timestamp <= 0) continue

            candles.push({
                symbol: symbol.toUpperCase(),
                interval: '1m',
                timestamp,
                open: parseFloat(parts[1]),
                high: parseFloat(parts[2]),
                low: parseFloat(parts[3]),
                close: parseFloat(parts[4]),
                volume: parseFloat(parts[5]) || 0
            })
        } catch {
            // Skip invalid lines
        }
    }

    return candles
}

/**
 * Aggregate 1m candles to 5m
 */
function aggregateTo5m(candles1m: Candle[]): Candle[] {
    const candles5m: Candle[] = []
    const groups = new Map<number, Candle[]>()

    for (const candle of candles1m) {
        // Round down to nearest 5 minutes
        const block = Math.floor(candle.timestamp / 300) * 300
        if (!groups.has(block)) {
            groups.set(block, [])
        }
        groups.get(block)!.push(candle)
    }

    for (const [blockTime, group] of groups.entries()) {
        if (group.length === 0) continue

        group.sort((a, b) => a.timestamp - b.timestamp)

        candles5m.push({
            symbol: group[0].symbol,
            interval: '5m',
            timestamp: blockTime,
            open: group[0].open,
            high: Math.max(...group.map(c => c.high)),
            low: Math.min(...group.map(c => c.low)),
            close: group[group.length - 1].close,
            volume: group.reduce((sum, c) => sum + c.volume, 0)
        })
    }

    return candles5m.sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Insert candles in batches
 */
async function insertCandles(supabase: any, candles: Candle[], batchSize = 500): Promise<number> {
    let inserted = 0

    for (let i = 0; i < candles.length; i += batchSize) {
        const batch = candles.slice(i, i + batchSize)

        const { error } = await supabase
            .from('forex_candles')
            .upsert(batch, { onConflict: 'symbol,interval,timestamp' })

        if (!error) {
            inserted += batch.length
        }
    }

    return inserted
}

export async function POST(request: NextRequest) {
    if (!CACHE_URL || !CACHE_KEY) {
        return NextResponse.json({
            error: 'Cache database not configured. Add SUPABASE_CACHE_URL and SUPABASE_CACHE_ANON_KEY to .env.local'
        }, { status: 400 })
    }

    try {
        // Parse JSON body
        const body = await request.json()
        const { chunk, chunkIndex, totalChunks, symbol, filename, isLast } = body

        if (!chunk) {
            return NextResponse.json({ error: 'No chunk provided' }, { status: 400 })
        }

        if (!symbol) {
            return NextResponse.json({ error: 'No symbol provided' }, { status: 400 })
        }

        console.log(`[Import] Processing chunk ${chunkIndex + 1}/${totalChunks} for ${symbol}...`)

        // Parse this chunk's CSV data
        const candles1m = parseHistDataCSV(chunk, symbol)
        console.log(`[Import] Chunk ${chunkIndex + 1}: Parsed ${candles1m.length} 1m candles`)

        if (candles1m.length === 0 && chunkIndex === 0) {
            // First chunk should have data
            return NextResponse.json({
                error: 'No valid candles found in file. Check file format.'
            }, { status: 400 })
        }

        // Aggregate to 5m
        const candles5m = aggregateTo5m(candles1m)

        // Insert into database
        const supabase = createClient(CACHE_URL, CACHE_KEY)

        const inserted1m = await insertCandles(supabase, candles1m)
        const inserted5m = await insertCandles(supabase, candles5m)

        console.log(`[Import] Chunk ${chunkIndex + 1}: Inserted ${inserted1m} 1m, ${inserted5m} 5m`)

        return NextResponse.json({
            success: true,
            chunk: chunkIndex + 1,
            total: totalChunks,
            imported1m: inserted1m,
            imported5m: inserted5m
        })

    } catch (err: any) {
        console.error('[Import] Error:', err)
        return NextResponse.json({
            error: err.message || 'Import failed'
        }, { status: 500 })
    }
}
