'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format } from 'date-fns'

interface DrawdownChartProps {
    trades: any[]
    initialBalance?: number
}

export function DrawdownChart({ trades, initialBalance = 0 }: DrawdownChartProps) {
    // Calculate Drawdown
    let currentBalance = initialBalance
    let peakBalance = initialBalance

    const data = trades
        .slice() // Copy array
        .sort((a, b) => new Date(a.open_time).getTime() - new Date(b.open_time).getTime()) // Sort by time ascending
        .map(trade => {
            currentBalance += (trade.pnl || 0)
            if (currentBalance > peakBalance) {
                peakBalance = currentBalance
            }

            const drawdown = peakBalance > 0
                ? ((peakBalance - currentBalance) / peakBalance) * 100
                : 0

            return {
                date: trade.open_time,
                drawdown: -drawdown // Negative for chart visualization
            }
        })

    if (data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center rounded-3xl border border-zinc-800/50 bg-zinc-900/50 text-zinc-500 backdrop-blur-xl">
                No data available
            </div>
        )
    }

    return (
        <div className="rounded-3xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">Drawdown</h3>
                <p className="text-sm text-zinc-400">Percentage decline from equity peak</p>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#71717a"
                            fontSize={12}
                            tickFormatter={(str) => format(new Date(str), 'MMM d')}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#71717a"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                            itemStyle={{ color: '#ef4444' }}
                            labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                            labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy HH:mm')}
                            formatter={(value: number) => [`${Math.abs(value).toFixed(2)}%`, 'Drawdown']}
                        />
                        <Area
                            type="monotone"
                            dataKey="drawdown"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorDrawdown)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
