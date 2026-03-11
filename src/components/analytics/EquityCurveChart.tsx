'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EquityCurveChartProps {
    data: {
        date: string
        pnl: number
        tradePnl: number
    }[]
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[400px] w-full bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center">
                <p className="text-zinc-500">No trade data available for equity curve.</p>
            </div>
        )
    }

    const isPositive = (data[data.length - 1]?.pnl || 0) >= 0

    return (
        <div className="h-[400px] w-full bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
            <h3 className="text-lg font-bold text-white mb-6 px-2">Equity Curve</h3>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Equity']}
                    />
                    <Area
                        type="monotone"
                        dataKey="pnl"
                        stroke={isPositive ? "#10b981" : "#ef4444"}
                        fillOpacity={1}
                        fill="url(#colorPnl)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
