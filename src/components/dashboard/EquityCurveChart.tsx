'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format } from 'date-fns'

interface EquityCurveProps {
    trades: any[]
    initialBalance?: number
    createdAt?: string
}

export function EquityCurveChart({ trades, initialBalance = 0, createdAt }: EquityCurveProps) {
    // 1. Sort trades chronologically by close_time (or open_time as fallback)
    // We want the earliest trade first to build the curve forward
    const sortedTrades = [...trades].sort((a, b) => {
        const dateA = new Date(a.close_time || a.open_time).getTime()
        const dateB = new Date(b.close_time || b.open_time).getTime()
        return dateA - dateB
    })

    // 2. Build the equity curve data points
    // Start with the initial balance at the account creation time (or first trade time)
    const data = []
    let currentBalance = initialBalance

    // Add starting point
    const startTime = createdAt || (sortedTrades.length > 0 ? sortedTrades[0].open_time : new Date().toISOString())
    data.push({
        date: startTime,
        balance: currentBalance,
        pnl: 0
    })

    // Process each trade
    sortedTrades.forEach(trade => {
        currentBalance += (trade.pnl || 0)
        data.push({
            date: trade.close_time || trade.open_time,
            balance: currentBalance,
            pnl: trade.pnl
        })
    })

    // 3. Ensure we have a "current" point if the last trade wasn't today
    if (data.length > 0) {
        const lastPoint = data[data.length - 1]
        const now = new Date()
        // Only add if last point is older than 1 minute to avoid dupes
        if (new Date(lastPoint.date).getTime() < now.getTime() - 60000) {
            data.push({
                date: now.toISOString(),
                balance: currentBalance,
                pnl: 0
            })
        }
    }

    // Fallback for empty data (should show flat line at initial balance)
    if (data.length === 0) {
        data.push({
            date: new Date().toISOString(),
            balance: initialBalance,
            pnl: 0
        })
    }

    // DEBUG: Log to console to verify data generation
    console.log('Equity Curve Generated:', { initialBalance, points: data.length, finalBalance: currentBalance })

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        stroke="#52525b"
                        fontSize={12}
                        tickFormatter={(str) => {
                            try {
                                return format(new Date(str), 'MMM d')
                            } catch (e) {
                                return ''
                            }
                        }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={40}
                        dy={10}
                    />
                    <YAxis
                        stroke="#52525b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        domain={['auto', 'auto']}
                        dx={-10}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(24, 24, 27, 0.9)',
                            borderColor: 'rgba(39, 39, 42, 0.5)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#e4e4e7' }}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '8px', fontSize: '12px' }}
                        labelFormatter={(label) => {
                            try {
                                return format(new Date(label), 'MMM d, yyyy HH:mm')
                            } catch (e) {
                                return label
                            }
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Balance']}
                        cursor={{ stroke: '#27272a', strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#F7AE11"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(247, 174, 17, 0.3))' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
