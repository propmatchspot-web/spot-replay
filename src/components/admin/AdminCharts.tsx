'use client'

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card' // Assuming we have these or will create simple wrappers

// ---- SIMULATED REAL-TIME DATA GENERATOR ----
// In a real app, this would come from the database aggregation. 
// We will accept basic props but also fill gaps to make it look "Real Time"

interface AdminChartsProps {
    userDistribution: { name: string; value: number; color: string }[]
    // We can add more real data props later
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b']

// 1. Revenue Velocity (Area Chart)
const REVENUE_DATA = [
    { name: 'Jan', revenue: 4000, costs: 2400 },
    { name: 'Feb', revenue: 3000, costs: 1398 },
    { name: 'Mar', revenue: 2000, costs: 9800 },
    { name: 'Apr', revenue: 2780, costs: 3908 },
    { name: 'May', revenue: 1890, costs: 4800 },
    { name: 'Jun', revenue: 2390, costs: 3800 },
    { name: 'Jul', revenue: 3490, costs: 4300 },
    { name: 'Aug', revenue: 5490, costs: 2100 },
    { name: 'Sep', revenue: 8490, costs: 1300 }, // Spiking up
    { name: 'Oct', revenue: 12450, costs: 1500 }, // Current Profitability
]

// 2. AI Utilization (Bar Chart)
const AI_USAGE_DATA = [
    { name: '00:00', tokens: 400 },
    { name: '04:00', tokens: 300 },
    { name: '08:00', tokens: 2000 },
    { name: '12:00', tokens: 2780 },
    { name: '16:00', tokens: 1890 },
    { name: '20:00', tokens: 2390 },
    { name: '23:59', tokens: 3490 },
]

export function RevenueChart() {
    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
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
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                    />
                    <Area
                        type="monotone"
                        dataKey="costs"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCosts)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export function PlanDistributionChart({ data }: { data: { name: string; value: number }[] }) {
    // Fill empty data if needed to avoid crash
    const chartData = data?.length > 0 ? data : [{ name: 'No Data', value: 1 }]

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-zinc-400 font-medium ml-1">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

export function AIUsageChart() {
    return (
        <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={AI_USAGE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#71717a"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#27272a' }}
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="tokens" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
