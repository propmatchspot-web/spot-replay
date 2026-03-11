'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/utils/format'

interface ProfitDistributionChartProps {
    trades: any[]
}

export function ProfitDistributionChart({ trades }: ProfitDistributionChartProps) {
    const longTrades = trades.filter(t => t.type === 'LONG')
    const shortTrades = trades.filter(t => t.type === 'SHORT')

    const longPnl = longTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const shortPnl = shortTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)

    const data = [
        { name: 'Longs', pnl: longPnl, count: longTrades.length },
        { name: 'Shorts', pnl: shortPnl, count: shortTrades.length },
    ]

    if (trades.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-zinc-500">
                No data available
            </div>
        )
    }

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorLong" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F7AE11" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#F7AE11" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="colorShort" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.5} />
                    <XAxis
                        dataKey="name"
                        stroke="#52525b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#52525b"
                        fontSize={12}
                        tickFormatter={(value) => `$${value}`}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip
                        cursor={{ fill: '#27272a', opacity: 0.4 }}
                        contentStyle={{
                            backgroundColor: 'rgba(24, 24, 27, 0.9)',
                            borderColor: 'rgba(39, 39, 42, 0.5)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#e4e4e7' }}
                        formatter={(value: number) => [formatCurrency(value), 'Net P&L']}
                    />
                    <Bar dataKey="pnl" radius={[4, 4, 4, 4]} barSize={60}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.pnl > 0 ? 'url(#colorLong)' : entry.pnl < 0 ? 'url(#colorShort)' : 'url(#colorNeutral)'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
