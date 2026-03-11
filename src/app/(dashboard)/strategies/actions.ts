'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getStrategies() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: strategies, error } = await supabase
        .from('strategies')
        .select(`
            *,
            trades (
                id,
                pnl,
                outcome
            ),
            backtest_trades (
                id,
                pnl
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching strategies:', error)
        return { success: false, error: error.message }
    }

    // Calculate metrics for each strategy
    const strategiesWithStats = strategies.map((strategy: any) => {
        // Live Trades Stats
        const liveTrades = strategy.trades || []
        const liveTotal = liveTrades.length
        const liveWins = liveTrades.filter((t: any) => t.pnl > 0).length
        const liveWinRate = liveTotal > 0 ? Math.round((liveWins / liveTotal) * 100) : 0
        const liveNetPnl = liveTrades.reduce((acc: number, t: any) => acc + (t.pnl || 0), 0)

        // Backtest Trades Stats
        const backtestTrades = strategy.backtest_trades || []
        const backtestTotal = backtestTrades.length
        const backtestWins = backtestTrades.filter((t: any) => t.pnl > 0).length
        const backtestWinRate = backtestTotal > 0 ? Math.round((backtestWins / backtestTotal) * 100) : 0
        const backtestNetPnl = backtestTrades.reduce((acc: number, t: any) => acc + (t.pnl || 0), 0)

        // Combined Stats (for general overview)
        const totalTrades = liveTotal + backtestTotal
        const totalWins = liveWins + backtestWins
        const winRate = totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100) : 0
        const netPnl = liveNetPnl + backtestNetPnl

        // Calculate Profit Factor (Live Only for now as 'Profit Factor' usually implies money risk)
        // Or we can do combined if PnL is normalized, but often Backtest PnL is hypothetical large numbers.
        // Let's stick to Live Profit Factor for the main stat, or combined if requested.
        // For 'The Playbook', usually users want to see Live performance primarily, with backtest as validation.

        const grossProfit = liveTrades.filter((t: any) => t.pnl > 0).reduce((acc: number, t: any) => acc + t.pnl, 0)
        const grossLoss = Math.abs(liveTrades.filter((t: any) => t.pnl < 0).reduce((acc: number, t: any) => acc + t.pnl, 0))
        const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99.99 : 0

        return {
            ...strategy,
            stats: {
                totalTrades,
                winRate,
                netPnl,
                profitFactor,
                // Granular stats
                live: {
                    totalTrades: liveTotal,
                    winRate: liveWinRate,
                    netPnl: liveNetPnl
                },
                backtest: {
                    totalTrades: backtestTotal,
                    winRate: backtestWinRate,
                    netPnl: backtestNetPnl
                }
            }
        }
    })

    return { success: true, data: strategiesWithStats }
}

export async function createStrategy(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const rules = JSON.parse(formData.get('rules') as string || '[]')
    const timeframes = JSON.parse(formData.get('timeframes') as string || '[]')
    const pairs = JSON.parse(formData.get('pairs') as string || '[]')
    const sessions = JSON.parse(formData.get('sessions') as string || '[]')

    const { error } = await supabase
        .from('strategies')
        .insert({
            user_id: user.id,
            name,
            description,
            rules,
            timeframes,
            pairs,
            sessions
        })

    if (error) {
        console.error('Error creating strategy:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/strategies')
    return { success: true }
}

export async function deleteStrategy(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting strategy:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/strategies')
    return { success: true }
}

export async function getStrategyById(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: strategy, error } = await supabase
        .from('strategies')
        .select(`
            *,
            trades (
                id,
                pair,
                direction,
                entry_price,
                exit_price,
                pnl,
                outcome,
                open_time,
                close_time,
                notes,
                session
            ),
            strategy_examples (
                id,
                image_url,
                notes,
                created_at
            )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('Error fetching strategy:', error)
        return { success: false, error: error.message }
    }

    // Calculate detailed metrics
    const trades = strategy.trades || []
    const totalTrades = trades.length
    const winningTrades = trades.filter((t: any) => t.pnl > 0).length
    const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0
    const netPnl = trades.reduce((acc: number, t: any) => acc + (t.pnl || 0), 0)

    // Profit Factor
    const grossProfit = trades.filter((t: any) => t.pnl > 0).reduce((acc: number, t: any) => acc + t.pnl, 0)
    const grossLoss = Math.abs(trades.filter((t: any) => t.pnl < 0).reduce((acc: number, t: any) => acc + t.pnl, 0))
    const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99.99 : 0

    // Equity Curve
    let cumulativePnl = 0
    const equityCurve = trades
        .sort((a: any, b: any) => new Date(a.open_time).getTime() - new Date(b.open_time).getTime())
        .map((trade: any) => {
            cumulativePnl += trade.pnl || 0
            return {
                date: new Date(trade.open_time).toLocaleDateString(),
                pnl: cumulativePnl,
                tradePnl: trade.pnl
            }
        })

    const stats = {
        totalTrades,
        winRate,
        netPnl,
        profitFactor,
        grossProfit,
        grossLoss,
        avgWin: winningTrades > 0 ? Math.round(grossProfit / winningTrades) : 0,
        avgLoss: (totalTrades - winningTrades) > 0 ? Math.round(grossLoss / (totalTrades - winningTrades)) : 0
    }

    return {
        success: true,
        data: {
            ...strategy,
            stats,
            equityCurve,
            examples: strategy.strategy_examples || []
        }
    }
}

export async function updateStrategyRules(id: string, rules: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('strategies')
        .update({ rules })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating strategy rules:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/strategies/${id}`)
    return { success: true }
}

export async function addStrategyExample(strategyId: string, imageUrl: string, notes: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('strategy_examples')
        .insert({
            strategy_id: strategyId,
            image_url: imageUrl,
            notes
        })

    if (error) {
        console.error('Error adding strategy example:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/strategies/${strategyId}`)
    return { success: true }
}

export async function deleteStrategyExample(id: string, strategyId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Verify ownership via strategy relation (handled by RLS policy but good to be explicit if needed, though RLS is safer)
    // Here we rely on RLS policy "Users can delete their own strategy examples"

    const { error } = await supabase
        .from('strategy_examples')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting strategy example:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/strategies/${strategyId}`)
    return { success: true }
}
