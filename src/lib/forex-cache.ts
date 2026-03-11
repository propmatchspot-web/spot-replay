/**
 * Forex Cache Supabase Client
 * Separate Supabase project for caching forex candle data
 */

import { createClient } from '@supabase/supabase-js'

// Cache Supabase credentials (separate from main app)
const CACHE_URL = process.env.SUPABASE_CACHE_URL || ''
const CACHE_KEY = process.env.SUPABASE_CACHE_SERVICE_KEY || process.env.SUPABASE_CACHE_ANON_KEY || ''

// Create cache client only if credentials exist
export const cacheSupabase = CACHE_URL && CACHE_KEY
    ? createClient(CACHE_URL, CACHE_KEY)
    : null

export interface ForexCandle {
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
 * Get cached forex candles from Supabase
 */
export async function getCachedCandles(
    symbol: string,
    interval: string,
    startTime?: number,
    endTime?: number
): Promise<ForexCandle[] | null> {
    if (!cacheSupabase) {
        console.log('[Cache] No cache Supabase configured')
        return null
    }

    try {
        let query = cacheSupabase
            .from('forex_candles')
            .select('timestamp, open, high, low, close, volume')
            .eq('symbol', symbol.toUpperCase())
            .eq('interval', interval)
            .order('timestamp', { ascending: true })

        if (startTime) {
            query = query.gte('timestamp', Math.floor(startTime / 1000))
        }
        if (endTime) {
            query = query.lte('timestamp', Math.floor(endTime / 1000))
        }

        const { data, error } = await query

        if (error) {
            console.error('[Cache] Query error:', error.message)
            return null
        }

        if (data && data.length > 0) {
            console.log(`[Cache] ✅ Found ${data.length} cached candles for ${symbol} ${interval}`)
            return data.map(d => ({
                symbol,
                interval,
                timestamp: d.timestamp,
                open: parseFloat(d.open),
                high: parseFloat(d.high),
                low: parseFloat(d.low),
                close: parseFloat(d.close),
                volume: parseFloat(d.volume || 0)
            }))
        }

        console.log(`[Cache] No cached data for ${symbol} ${interval}`)
        return null
    } catch (err: any) {
        console.error('[Cache] Error:', err.message)
        return null
    }
}

/**
 * Store forex candles in cache
 */
export async function cacheCandles(candles: ForexCandle[]): Promise<boolean> {
    if (!cacheSupabase || candles.length === 0) {
        return false
    }

    try {
        // Batch insert, ignoring duplicates
        const { error } = await cacheSupabase
            .from('forex_candles')
            .upsert(
                candles.map(c => ({
                    symbol: c.symbol.toUpperCase(),
                    interval: c.interval,
                    timestamp: c.timestamp,
                    open: c.open,
                    high: c.high,
                    low: c.low,
                    close: c.close,
                    volume: c.volume || 0
                })),
                { onConflict: 'symbol,interval,timestamp' }
            )

        if (error) {
            console.error('[Cache] Insert error:', error.message)
            return false
        }

        console.log(`[Cache] ✅ Cached ${candles.length} candles`)
        return true
    } catch (err: any) {
        console.error('[Cache] Error:', err.message)
        return false
    }
}

/**
 * Check if cache is configured and available
 */
export function isCacheAvailable(): boolean {
    return cacheSupabase !== null
}
