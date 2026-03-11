'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface WinRateByDayChartProps {
    data: {
        name: string
        winRate: number
        pnl: number
        trades: number
    }[]
}

export function WinRateByDayChart({ data }: WinRateByDayChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center">
                <p className="text-zinc-500">No daily data available.</p>
            </div>
        )
    }

    return (
        <div className="h-[300px] w-full bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
            <h3 className="text-lg font-bold text-white mb-6 px-2">Win Rate by Day</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => val.slice(0, 3)}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                        cursor={{ fill: '#27272a', opacity: 0.5 }}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number, name: string) => {
                            if (name === 'winRate') return [`${value}%`, 'Win Rate']
                            return [value, name]
                        }}
                    />
                    <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.winRate >= 50 ? '#10b981' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
