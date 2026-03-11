'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/utils/format'
import { getHours } from 'date-fns'

interface TimePerformanceChartProps {
    trades: any[]
}

export function TimePerformanceChart({ trades }: TimePerformanceChartProps) {
    const hourStats = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        pnl: 0,
        count: 0
    }))

    trades.forEach(trade => {
        try {
            if (!trade.open_time) return
            const date = new Date(trade.open_time)
            if (isNaN(date.getTime())) return

            const hour = getHours(date)
            hourStats[hour].pnl += trade.pnl || 0
            hourStats[hour].count += 1
        } catch (e) {
            console.error('Error processing trade for TimePerformance:', e)
        }
    })

    const data = hourStats.filter(h => h.count > 0)

    if (data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center rounded-2xl border border-white/5 bg-[#0A0A0A]/50 p-6 backdrop-blur-sm">
                <p className="text-zinc-500 font-mono text-sm">No data available</p>
            </div>
        )
    }

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <defs>
                        <linearGradient id="colorPnlWin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F7AE11" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#F7AE11" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="colorPnlLoss" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} opacity={0.5} />
                    <XAxis
                        dataKey="hour"
                        stroke="#52525b"
                        fontSize={10}
                        fontFamily="var(--font-mono)"
                        tickFormatter={(value) => `${value}:00`}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#52525b"
                        fontSize={10}
                        fontFamily="var(--font-mono)"
                        tickFormatter={(value) => `$${value}`}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip
                        cursor={{ fill: '#0A0A0A', opacity: 0.8 }}
                        contentStyle={{
                            backgroundColor: 'rgba(10, 10, 10, 0.9)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#e4e4e7', fontFamily: 'var(--font-mono)' }}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}
                        labelFormatter={(value) => `${value}:00 - ${value + 1}:00`}
                        formatter={(value: number) => [formatCurrency(value), 'P&L']}
                    />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'url(#colorPnlWin)' : 'url(#colorPnlLoss)'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
