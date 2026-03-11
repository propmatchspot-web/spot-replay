/**
 * HistData CSV Import Script
 * Run this to import forex historical data into Supabase cache
 * 
 * Usage: npx ts-node scripts/import-histdata.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const CACHE_URL = process.env.SUPABASE_CACHE_URL
const CACHE_KEY = process.env.SUPABASE_CACHE_SERVICE_KEY || process.env.SUPABASE_CACHE_ANON_KEY

if (!CACHE_URL || !CACHE_KEY) {
    console.error('❌ Missing SUPABASE_CACHE_URL or SUPABASE_CACHE_SERVICE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(CACHE_URL, CACHE_KEY)

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
 * Parse HistData CSV file
 * Format: YYYYMMDD HHMMSS;OPEN;HIGH;LOW;CLOSE;VOLUME
 * or:     YYYYMMDD HHMMSS,OPEN,HIGH,LOW,CLOSE,VOLUME
 */
async function parseHistDataCSV(filePath: string, symbol: string): Promise<Candle[]> {
    const candles: Candle[] = []
    const fileStream = fs.createReadStream(filePath)
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    })

    for await (const line of rl) {
        if (!line.trim()) continue

        // Handle both semicolon and comma separators
        const parts = line.includes(';') ? line.split(';') : line.split(',')
        if (parts.length < 5) continue

        try {
            const dateTime = parts[0].trim()
            // Parse datetime: "20231215 120000" -> timestamp
            const year = parseInt(dateTime.slice(0, 4))
            const month = parseInt(dateTime.slice(4, 6)) - 1
            const day = parseInt(dateTime.slice(6, 8))
            const hour = parseInt(dateTime.slice(9, 11))
            const minute = parseInt(dateTime.slice(11, 13))
            const second = parseInt(dateTime.slice(13, 15)) || 0

            const date = new Date(Date.UTC(year, month, day, hour, minute, second))
            const timestamp = Math.floor(date.getTime() / 1000)

            candles.push({
                symbol: symbol.toUpperCase(),
                interval: '1m', // HistData is 1-minute data
                timestamp,
                open: parseFloat(parts[1]),
                high: parseFloat(parts[2]),
                low: parseFloat(parts[3]),
                close: parseFloat(parts[4]),
                volume: parseFloat(parts[5]) || 0
            })
        } catch (err) {
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

    // Group by 5-minute blocks
    const groups: Map<number, Candle[]> = new Map()

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
async function insertCandles(candles: Candle[], batchSize = 1000): Promise<number> {
    let inserted = 0

    for (let i = 0; i < candles.length; i += batchSize) {
        const batch = candles.slice(i, i + batchSize)

        const { error } = await supabase
            .from('forex_candles')
            .upsert(batch, { onConflict: 'symbol,interval,timestamp' })

        if (error) {
            console.error(`  Batch error at ${i}:`, error.message)
        } else {
            inserted += batch.length
            process.stdout.write(`\r  Inserted: ${inserted}/${candles.length}`)
        }
    }

    console.log() // New line
    return inserted
}

async function main() {
    const args = process.argv.slice(2)

    if (args.length < 2) {
        console.log('Usage: npx ts-node scripts/import-histdata.ts <csv-file> <symbol>')
        console.log('Example: npx ts-node scripts/import-histdata.ts ./data/EURUSD_2024.csv EURUSD')
        process.exit(1)
    }

    const csvFile = args[0]
    const symbol = args[1].toUpperCase()

    console.log(`\n📊 Importing ${symbol} from ${csvFile}...\n`)

    // Parse CSV
    console.log('1️⃣ Parsing CSV file...')
    const candles1m = await parseHistDataCSV(csvFile, symbol)
    console.log(`   Found ${candles1m.length.toLocaleString()} 1-minute candles`)

    // Aggregate to 5m
    console.log('\n2️⃣ Aggregating to 5-minute...')
    const candles5m = aggregateTo5m(candles1m)
    console.log(`   Created ${candles5m.length.toLocaleString()} 5-minute candles`)

    // Insert 1m data
    console.log('\n3️⃣ Inserting 1-minute data...')
    await insertCandles(candles1m)

    // Insert 5m data
    console.log('\n4️⃣ Inserting 5-minute data...')
    await insertCandles(candles5m)

    console.log('\n✅ Import complete!')
    console.log(`   ${symbol} 1m: ${candles1m.length.toLocaleString()} candles`)
    console.log(`   ${symbol} 5m: ${candles5m.length.toLocaleString()} candles`)
}

main().catch(console.error)
