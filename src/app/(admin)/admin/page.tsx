
import { createClient } from '@/utils/supabase/server'
import { DollarSign, Users, Activity, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react'
import { RevenueChart, PlanDistributionChart, AIUsageChart } from '@/components/admin/AdminCharts'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // 1. Fetch User Data with "head: false" to get data (using count: exact)
    // Note: head: true only returns count. We need basic queries.

    // Total Users
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })

    // Plan Distribution (Efficient aggregation)
    const { data: users } = await supabase.from('users').select('plan_tier')

    let starterCount = 0
    let proCount = 0
    let eliteCount = 0

    users?.forEach(u => {
        if (u.plan_tier === 'PROFESSIONAL') proCount++
        else if (u.plan_tier === 'ELITE') eliteCount++
        else starterCount++
    })

    // Estimated MRR (Monthly Recurring Revenue)
    const mrr = (proCount * 49) + (eliteCount * 99)

    // Chart User Data
    const planDistributionData = [
        { name: 'Starter', value: starterCount, color: '#10b981' },
        { name: 'Professional', value: proCount, color: '#3b82f6' },
        { name: 'Elite', value: eliteCount, color: '#f59e0b' },
    ]

    // 2. Fetch Audit Logs (Recent Activity)
    const { data: recentLogs } = await supabase
        .from('admin_logs')
        .select('*, admins:users!admin_id(email)')
        .order('created_at', { ascending: false })
        .limit(5)

    // Stats Array
    const STATS = [
        {
            label: "Estimated MRR",
            value: `$${mrr.toLocaleString()}`,
            change: "+12%", // Calculating real growth requires stored history, we'll keep this simulated for now or calculate from `created_at` if needed
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            label: "Total Users",
            value: userCount?.toLocaleString() || "0",
            change: "+8%",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            label: "Pro/Elite Users",
            value: (proCount + eliteCount).toLocaleString(),
            change: "+24%",
            icon: ShieldCheck,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        {
            label: "AI Utilization",
            value: "84%", // Mock for now until we aggregate ai_usage_today sums
            change: "-2%",
            icon: Activity,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
    ]

    return (
        <div className="p-8 space-y-8 min-h-screen bg-black">
            <header className="flex items-center justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/20 border border-red-900/30 text-red-500 text-xs font-black uppercase tracking-widest mb-2 animate-in fade-in slide-in-from-left-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Live System Status
                    </div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Mission Control</h1>
                    <p className="text-zinc-500 font-medium">Global system overview and performance metrics.</p>
                </div>
                {/* Could add a date picker here */}
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((stat, i) => (
                    <div key={i} className="group relative overflow-hidden p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} border ${stat.border}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            {/* Trend Badge */}
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-emerald-500">
                                {stat.change}
                            </span>
                        </div>
                        <div className="relative z-10">
                            <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1">{stat.label}</div>
                        </div>
                        {/* Glow Effect */}
                        <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity ${stat.bg}`} />
                    </div>
                ))}
            </div>

            {/* Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 p-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                                Revenue Velocity
                            </h3>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Gross MRR vs Costs (Last 10 Months)</p>
                        </div>
                        <select className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-400 px-3 py-1.5 focus:outline-none">
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    {/* Recharts Component */}
                    <div className="relative z-10">
                        <RevenueChart />
                    </div>
                </div>

                {/* Plan Split */}
                <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl relative overflow-hidden flex flex-col">
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-2">User Distribution</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-6">Active Plans Breakdown</p>

                    <div className="flex-1 min-h-[300px]">
                        <PlanDistributionChart data={planDistributionData} />
                    </div>
                </div>
            </div>

            {/* Recent Logs & AI Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-2">System Event Log</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-6">Recent Admin Actions</p>

                    <div className="space-y-4">
                        {recentLogs?.length === 0 && (
                            <div className="text-sm text-zinc-500 italic text-center py-8">No recent logs found.</div>
                        )}
                        {/* @ts-ignore */}
                        {recentLogs?.map((log) => (
                            <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                                <div className={`p-2 rounded-lg ${log.action.includes('BAN') ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    <Activity className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-zinc-200 truncate">
                                        {log.action} <span className="text-zinc-500 text-xs font-normal">on {log.target_id?.slice(0, 6)}...</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 font-mono">
                                        {new Date(log.created_at).toLocaleString()} • {log.admins?.email}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Usage Activity */}
                <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight">AI Load</h3>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-purple-500 uppercase">High Load</span>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-6">Hourly Token Consumption</p>
                    <AIUsageChart />
                </div>
            </div>
        </div>
    )
}
