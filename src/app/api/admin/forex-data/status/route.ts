import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cache Supabase client for data operations
const CACHE_URL = process.env.SUPABASE_CACHE_URL || ''
const CACHE_KEY = process.env.SUPABASE_CACHE_SERVICE_KEY || process.env.SUPABASE_CACHE_ANON_KEY || ''

export async function GET() {
    if (!CACHE_URL || !CACHE_KEY) {
        return NextResponse.json({
            error: 'Cache database not configured',
            status: []
        }, { status: 200 })
    }

    try {
        const supabase = createClient(CACHE_URL, CACHE_KEY)

        // Use efficient SQL query with aggregation
        const { data, error } = await supabase.rpc('get_forex_data_status')

        if (error) {
            // If RPC doesn't exist, fall back to direct query
            console.log('RPC not found, using direct query...')

            // Run aggregated query directly
            const { data: rawData, error: rawError } = await supabase
                .from('forex_candles')
                .select('symbol, interval')
                .limit(1)

            if (rawError) {
                console.error('Failed to fetch data status:', rawError)
                return NextResponse.json({ error: rawError.message, status: [] }, { status: 200 })
            }

            // Get distinct symbol/interval pairs and count each
            const pairs = new Set<string>()
            const statusResults: any[] = []

            // Get counts using separate queries (more efficient than fetching all rows)
            const { data: countData } = await supabase
                .from('forex_candles')
                .select('symbol, interval, timestamp')
                .order('symbol')
                .order('interval')

            if (!countData || countData.length === 0) {
                return NextResponse.json({ status: [] })
            }

            // Group and aggregate in JS (fallback method)
            const groups = new Map<string, { count: number, min: number, max: number }>()

            for (const row of countData) {
                const key = `${row.symbol}-${row.interval}`
                if (!groups.has(key)) {
                    groups.set(key, { count: 0, min: row.timestamp, max: row.timestamp })
                }
                const g = groups.get(key)!
                g.count++
                if (row.timestamp < g.min) g.min = row.timestamp
                if (row.timestamp > g.max) g.max = row.timestamp
            }

            const status = Array.from(groups.entries()).map(([key, val]) => {
                const [symbol, interval] = key.split('-')
                return {
                    symbol,
                    interval,
                    count: val.count,
                    firstDate: new Date(val.min * 1000).toISOString(),
                    lastDate: new Date(val.max * 1000).toISOString()
                }
            })

            return NextResponse.json({ status })
        }

        return NextResponse.json({ status: data || [] })
    } catch (err: any) {
        console.error('Status API error:', err)
        return NextResponse.json({ error: err.message, status: [] }, { status: 200 })
    }
}
