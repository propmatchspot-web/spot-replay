'use client'

import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth, isSameMonth, isSameWeek } from 'date-fns'
import { cn } from '@/lib/utils'

interface PeriodBreakdownProps {
    trades: any[]
}

export function PeriodBreakdown({ trades }: PeriodBreakdownProps) {
    // Group by Month
    const monthlyStats = trades.reduce((acc, trade) => {
        const date = new Date(trade.open_time)
        const key = format(date, 'yyyy-MM')

        if (!acc[key]) {
            acc[key] = {
                date: startOfMonth(date),
                pnl: 0,
                trades: 0,
                wins: 0
            }
        }

        acc[key].pnl += (trade.pnl || 0)
        acc[key].trades += 1
        if ((trade.pnl || 0) > 0) acc[key].wins += 1

        return acc
    }, {} as Record<string, any>)

    const months = Object.values(monthlyStats).sort((a: any, b: any) => b.date.getTime() - a.date.getTime())

    // Group by Week (Last 8 weeks)
    const weeklyStats = trades.reduce((acc, trade) => {
        const date = new Date(trade.open_time)
        const key = format(startOfWeek(date), 'yyyy-MM-dd')

        if (!acc[key]) {
            acc[key] = {
                date: startOfWeek(date),
                pnl: 0,
                trades: 0,
                wins: 0
            }
        }

        acc[key].pnl += (trade.pnl || 0)
        acc[key].trades += 1
        if ((trade.pnl || 0) > 0) acc[key].wins += 1

        return acc
    }, {} as Record<string, any>)

    const weeks = Object.values(weeklyStats)
        .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
        .slice(0, 8) // Show last 8 weeks

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Monthly Breakdown */}
            <div className="rounded-3xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-lg font-semibold text-white">Monthly Performance</h3>
                <div className="space-y-3">
                    {months.map((month: any) => (
                        <div key={month.date.toString()} className="flex items-center justify-between rounded-xl bg-zinc-950/50 p-3">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-2 w-2 rounded-full",
                                    month.pnl >= 0 ? "bg-emerald-500" : "bg-red-500"
                                )} />
                                <span className="text-sm font-medium text-zinc-300">
                                    {format(month.date, 'MMMM yyyy')}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "font-mono font-medium",
                                    month.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                                )}>
                                    {month.pnl >= 0 ? '+' : ''}${month.pnl.toFixed(2)}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {month.wins}/{month.trades} wins ({Math.round((month.wins / month.trades) * 100)}%)
                                </p>
                            </div>
                        </div>
                    ))}
                    {months.length === 0 && (
                        <p className="text-center text-sm text-zinc-500">No monthly data yet</p>
                    )}
                </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="rounded-3xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-lg font-semibold text-white">Weekly Performance</h3>
                <div className="space-y-3">
                    {weeks.map((week: any) => (
                        <div key={week.date.toString()} className="flex items-center justify-between rounded-xl bg-zinc-950/50 p-3">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-2 w-2 rounded-full",
                                    week.pnl >= 0 ? "bg-emerald-500" : "bg-red-500"
                                )} />
                                <span className="text-sm font-medium text-zinc-300">
                                    {format(week.date, 'MMM d')} - {format(endOfWeek(week.date), 'MMM d')}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "font-mono font-medium",
                                    week.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                                )}>
                                    {week.pnl >= 0 ? '+' : ''}${week.pnl.toFixed(2)}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {week.wins}/{week.trades} wins ({Math.round((week.wins / week.trades) * 100)}%)
                                </p>
                            </div>
                        </div>
                    ))}
                    {weeks.length === 0 && (
                        <p className="text-center text-sm text-zinc-500">No weekly data yet</p>
                    )}
                </div>
            </div>
        </div>
    )
}
