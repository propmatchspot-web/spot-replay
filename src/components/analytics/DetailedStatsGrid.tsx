'use client'

import { ArrowUpRight, ArrowDownRight, Target, Zap, TrendingUp, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DetailedStatsGridProps {
    trades: any[]
}

export function DetailedStatsGrid({ trades }: DetailedStatsGridProps) {
    // Helper to calculate stats
    const wins = trades.filter(t => (t.pnl || 0) > 0)
    const losses = trades.filter(t => (t.pnl || 0) < 0)

    const avgWin = wins.length > 0
        ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length
        : 0

    const avgLoss = losses.length > 0
        ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length)
        : 0

    const largestWin = wins.length > 0
        ? Math.max(...wins.map(t => t.pnl))
        : 0

    const largestLoss = losses.length > 0
        ? Math.min(...losses.map(t => t.pnl))
        : 0

    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const expectancy = trades.length > 0 ? totalPnL / trades.length : 0

    // Calculate Max Consecutive Wins/Losses
    let maxConsecutiveWins = 0
    let maxConsecutiveLosses = 0
    let currentWins = 0
    let currentLosses = 0

    // Sort by time ascending for streak calculation
    const sortedTrades = [...trades].sort((a, b) => new Date(a.open_time).getTime() - new Date(b.open_time).getTime())

    sortedTrades.forEach(t => {
        if ((t.pnl || 0) > 0) {
            currentWins++
            currentLosses = 0
            maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins)
        } else if ((t.pnl || 0) < 0) {
            currentLosses++
            currentWins = 0
            maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses)
        }
    })

    // Long vs Short Winrate
    const longTrades = trades.filter(t => t.direction === 'LONG')
    const shortTrades = trades.filter(t => t.direction === 'SHORT')

    const longWins = longTrades.filter(t => (t.pnl || 0) > 0).length
    const shortWins = shortTrades.filter(t => (t.pnl || 0) > 0).length

    const longWinRate = longTrades.length > 0 ? Math.round((longWins / longTrades.length) * 100) : 0
    const shortWinRate = shortTrades.length > 0 ? Math.round((shortWins / shortTrades.length) * 100) : 0

    const stats = [
        {
            label: 'Avg Win',
            value: `$${avgWin.toFixed(2)}`,
            icon: ArrowUpRight,
            color: 'emerald'
        },
        {
            label: 'Avg Loss',
            value: `$${avgLoss.toFixed(2)}`,
            icon: ArrowDownRight,
            color: 'red'
        },
        {
            label: 'Largest Win',
            value: `$${largestWin.toFixed(2)}`,
            icon: Target,
            color: 'emerald'
        },
        {
            label: 'Largest Loss',
            value: `$${largestLoss.toFixed(2)}`,
            icon: Zap,
            color: 'red'
        },
        {
            label: 'Expectancy',
            value: `$${expectancy.toFixed(2)}`,
            subtext: 'per trade',
            icon: TrendingUp,
            color: expectancy >= 0 ? 'emerald' : 'red'
        },
        {
            label: 'Max Streak',
            value: `${maxConsecutiveWins}W / ${maxConsecutiveLosses}L`,
            icon: Zap,
            color: 'blue'
        },
        {
            label: 'Long Win Rate',
            value: `${longWinRate}%`,
            subtext: `${longTrades.length} trades`,
            icon: ArrowUpRight,
            color: 'cyan'
        },
        {
            label: 'Short Win Rate',
            value: `${shortWinRate}%`,
            subtext: `${shortTrades.length} trades`,
            icon: ArrowDownRight,
            color: 'violet'
        }
    ]

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-xl transition-all hover:bg-zinc-800/80"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-zinc-400">{stat.label}</p>
                            <p className={cn(
                                "mt-2 text-lg font-bold tracking-tight",
                                stat.color === 'red' ? 'text-red-400' : 'text-white'
                            )}>
                                {stat.value}
                            </p>
                            {stat.subtext && (
                                <p className="mt-1 text-xs text-zinc-500">{stat.subtext}</p>
                            )}
                        </div>
                        <div className={cn(
                            "rounded-lg p-2",
                            `bg-${stat.color}-500/10 text-${stat.color}-500`
                        )}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
