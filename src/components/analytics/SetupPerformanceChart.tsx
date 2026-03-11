'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface SetupPerformanceChartProps {
    trades: any[]
}

export function SetupPerformanceChart({ trades }: SetupPerformanceChartProps) {
    // Group by Setup Type
    const setupStats = trades.reduce((acc, trade) => {
        const setup = trade.setup_type || 'No Setup'

        if (!acc[setup]) {
            acc[setup] = {
                setup,
                pnl: 0,
                trades: 0,
                wins: 0
            }
        }

        acc[setup].pnl += (trade.pnl || 0)
        acc[setup].trades += 1
        if ((trade.pnl || 0) > 0) acc[setup].wins += 1

        return acc
    }, {} as Record<string, any>)

    const data = Object.values(setupStats)
        .sort((a: any, b: any) => b.pnl - a.pnl) // Sort by P&L descending

    if (data.length === 0) {
        return null
    }

    return (
        <div className="rounded-3xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">Performance by Setup</h3>
                <p className="text-sm text-zinc-400">Which strategies are working best?</p>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                        <XAxis type="number" stroke="#71717a" fontSize={12} tickFormatter={(val) => `$${val}`} />
                        <YAxis
                            dataKey="setup"
                            type="category"
                            stroke="#e4e4e7"
                            fontSize={12}
                            width={100}
                        />
                        <Tooltip
                            cursor={{ fill: '#27272a', opacity: 0.4 }}
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number, name: string, props: any) => {
                                const stat = props.payload
                                const winRate = Math.round((stat.wins / stat.trades) * 100)
                                return [
                                    <div key="tooltip" className="space-y-1">
                                        <div>P&L: <span className={value >= 0 ? 'text-emerald-400' : 'text-red-400'}>${value.toFixed(2)}</span></div>
                                        <div className="text-zinc-400 text-xs">Win Rate: {winRate}% ({stat.wins}/{stat.trades})</div>
                                    </div>,
                                    ''
                                ]
                            }}
                        />
                        <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
