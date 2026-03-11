'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DirectionalPerformanceChartProps {
    data: {
        name: string
        winRate: number
        pnl: number
        trades: number
    }[]
}

export function DirectionalPerformanceChart({ data }: DirectionalPerformanceChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center">
                <p className="text-zinc-500">No directional data available.</p>
            </div>
        )
    }

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

    return (
        <div className="h-[300px] w-full bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
            <h3 className="text-lg font-bold text-white mb-6 px-2">Long vs Short (Volume)</h3>
            <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="trades"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'Long' ? '#10b981' : '#ef4444'} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
