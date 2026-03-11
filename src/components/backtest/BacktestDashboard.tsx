'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart2, Clock, Info, Award, Play, Plus, Trash2, History } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CreateSessionDialog } from './CreateSessionDialog'
import { getRecentBacktestSessions, deleteBacktestSession, getBacktestStats } from '@/app/(dashboard)/backtest/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export default function BacktestDashboard() {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [recentSessions, setRecentSessions] = useState<any[]>([])
    const [stats, setStats] = useState<any>({
        totalSessions: 0,
        totalTrades: 0,
        winRate: 0,
        totalTimeInvested: 0,
        winRateTrend: [],
        tradesBySymbol: []
    })
    const router = useRouter()
    const { confirm } = useConfirm()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const [sessions, statistics] = await Promise.all([
            getRecentBacktestSessions(),
            getBacktestStats()
        ])
        setRecentSessions(sessions)
        if (statistics) {
            setStats(statistics)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const confirmed = await confirm({
            title: 'Delete Session?',
            description: 'This will permanently delete this backtest session and all associated trades. This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        })
        if (confirmed) {
            await deleteBacktestSession(id)
            toast.success('Session deleted successfully')
            loadData()
        }
    }

    const { totalSessions, totalTrades, winRate, totalTimeInvested, winRateTrend, tradesBySymbol } = stats

    return (
        <div className="p-8 h-full overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 text-white font-sans">
            <CreateSessionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white">Backtest Lab</h1>
                        <p className="text-zinc-400 mt-1">Replay history. Refine your edge. Master the markets.</p>
                    </div>
                    {recentSessions.length > 0 && (
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#00E676] hover:bg-[#00C853] text-black font-bold shadow-lg shadow-[#00E676]/20 transition-all hover:scale-105"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Session
                        </Button>
                    )}
                </div>

                {recentSessions.length === 0 ? (
                    /* Hero Section for Empty State */
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-zinc-900/30 backdrop-blur-xl border border-white/5 rounded-3xl">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#00E676] blur-[100px] opacity-20 rounded-full" />
                            <div className="relative bg-zinc-900 p-6 rounded-full border border-zinc-800 shadow-2xl">
                                <History className="w-16 h-16 text-[#00E676]" />
                            </div>
                        </div>
                        <div className="max-w-lg space-y-4">
                            <h2 className="text-4xl font-black text-white tracking-tight">Start Your Journey</h2>
                            <p className="text-zinc-400 text-lg">
                                You haven't created any backtest sessions yet. Create your first session to replay market data and test your strategies in a risk-free environment.
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            size="lg"
                            className="h-14 px-8 text-lg bg-[#00E676] hover:bg-[#00C853] text-black font-bold shadow-xl shadow-[#00E676]/20 transition-all hover:scale-105"
                        >
                            <Play className="w-5 h-5 mr-2 fill-current" />
                            Start Backtesting Now
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="bg-zinc-900/50 backdrop-blur-xl border-white/5 hover:border-white/10 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Total Sessions</CardTitle>
                                    <History className="w-4 h-4 text-zinc-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-white">{totalSessions}</div>
                                    <p className="text-xs text-zinc-500 mt-1">Active simulations</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/50 backdrop-blur-xl border-white/5 hover:border-white/10 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Total Trades</CardTitle>
                                    <Info className="w-4 h-4 text-zinc-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-white">{totalTrades}</div>
                                    <p className="text-xs text-zinc-500 mt-1">Across all sessions</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/50 backdrop-blur-xl border-white/5 hover:border-white/10 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Win Rate</CardTitle>
                                    <Award className="w-4 h-4 text-[#00E676]" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-[#00E676]">{winRate}%</div>
                                    <p className="text-xs text-zinc-500 mt-1">Average performance</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/50 backdrop-blur-xl border-white/5 hover:border-white/10 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Time Invested</CardTitle>
                                    <Clock className="w-4 h-4 text-zinc-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-white">{totalTimeInvested}h</div>
                                    <p className="text-xs text-zinc-500 mt-1">Practice time</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-xl border-white/5">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold text-white">Performance Trend</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={winRateTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                                                itemStyle={{ color: '#FFFFFF' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            />
                                            <Bar dataKey="rate" fill="#00E676" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/50 backdrop-blur-xl border-white/5">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold text-white">Asset Distribution</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <div className="space-y-4">
                                        {tradesBySymbol.map((item: any) => (
                                            <div key={item.symbol} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-500">
                                                        {item.symbol.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{item.symbol}</div>
                                                        <div className="text-xs text-zinc-500">{item.count} trades</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-[#00E676] text-sm">{item.winRate}%</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Sessions - Full Width */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white">Recent Sessions</h2>
                            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
                                {recentSessions.map((session, index) => (
                                    <div
                                        key={session.id}
                                        className={`group flex items-center justify-between p-6 hover:bg-white/5 transition-colors cursor-pointer ${index !== recentSessions.length - 1 ? 'border-b border-white/5' : ''}`}
                                        onClick={() => router.push(`/backtest/session/${session.id}`)}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:border-[#00E676]/50 transition-colors">
                                                <Play className="w-5 h-5 text-zinc-500 group-hover:text-[#00E676] fill-current transition-colors" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-[#00E676] transition-colors">{session.name}</h3>
                                                <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
                                                    <span className="flex items-center gap-1"><BarChart2 className="w-3 h-3" /> {session.pair}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(session.created_at).toLocaleDateString()}</span>
                                                    <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-400 text-xs font-bold">{session.session_type}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right hidden md:block">
                                                <div className="text-sm text-zinc-500 uppercase font-bold tracking-wider">Balance</div>
                                                <div className="text-lg font-bold text-white">${session.current_balance?.toLocaleString()}</div>
                                            </div>
                                            <div className="text-right hidden md:block">
                                                <div className="text-sm text-zinc-500 uppercase font-bold tracking-wider">P&L</div>
                                                <div className={`text-lg font-bold ${(session.current_balance - session.initial_balance) >= 0 ? 'text-[#00E676]' : 'text-red-500'}`}>
                                                    {((session.current_balance - session.initial_balance) / session.initial_balance * 100).toFixed(2)}%
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={(e) => handleDelete(session.id, e)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
