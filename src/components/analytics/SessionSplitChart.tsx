'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface SessionSplitChartProps {
    data: {
        name: string
        winRate: number
        pnl: number
        trades: number
    }[]
}

export function SessionSplitChart({ data }: SessionSplitChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[400px] w-full bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center">
                <p className="text-zinc-500">No session data available.</p>
            </div>
        )
    }

    return (
        <div className="h-[400px] w-full bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
            <h3 className="text-lg font-bold text-white mb-6 px-2">Session Performance (P&L)</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: '#27272a', opacity: 0.5 }}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number, name: string) => {
                            if (name === 'pnl') return [`$${value.toLocaleString()}`, 'Net P&L']
                            return [value, name]
                        }}
                    />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
