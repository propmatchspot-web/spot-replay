'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface WinrateChartProps {
    trades: any[]
}

export function WinrateChart({ trades }: WinrateChartProps) {
    const wins = trades.filter(t => (t.pnl || 0) > 0).length
    const losses = trades.filter(t => (t.pnl || 0) < 0).length
    const be = trades.filter(t => (t.pnl || 0) === 0).length

    const data = [
        { name: 'Wins', value: wins, color: '#10b981' },   // Emerald-500
        { name: 'Losses', value: losses, color: '#ef4444' }, // Red-500
        { name: 'Break Even', value: be, color: '#eab308' }, // Yellow-500
    ].filter(d => d.value > 0)

    if (data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-zinc-500">
                No trades yet
            </div>
        )
    }

    return (
        <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                style={{ filter: `drop-shadow(0 0 8px ${entry.color}40)` }}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(24, 24, 27, 0.8)',
                            borderColor: 'rgba(39, 39, 42, 0.5)',
                            borderRadius: '16px',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        itemStyle={{ color: '#e4e4e7' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <p className="text-3xl font-bold text-white tracking-tight">
                        {trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0}%
                    </p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mt-1">Winrate</p>
                </div>
            </div>
        </div>
    )
}
