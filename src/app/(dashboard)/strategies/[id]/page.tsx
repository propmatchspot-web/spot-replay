import { getStrategyById } from '../actions'
import { StrategyRules } from '@/components/strategies/StrategyRules'
import { StrategyPlaybook } from '@/components/strategies/StrategyPlaybook'
import { EquityCurveChart } from '@/components/analytics/EquityCurveChart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Target, Clock, Globe, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function StrategyDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const res = await getStrategyById(id)

    if (!res.success || !res.data) {
        notFound()
    }

    const strategy = res.data

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="space-y-4">
                <Link
                    href="/strategies"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Strategies
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">{strategy.name}</h1>
                        <p className="text-zinc-400 mt-2 max-w-2xl">{strategy.description || "No description provided."}</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center gap-2 text-xs font-bold text-zinc-400">
                            <Clock className="h-3 w-3" />
                            {strategy.timeframes?.length ? strategy.timeframes.join(', ') : 'All Timeframes'}
                        </div>
                        <div className="px-3 py-1 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center gap-2 text-xs font-bold text-zinc-400">
                            <Globe className="h-3 w-3" />
                            {strategy.sessions?.length ? strategy.sessions.join(', ') : 'All Sessions'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-auto rounded-xl w-full justify-start">
                    <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 px-6 py-2 rounded-lg font-bold"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="rules"
                        className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 px-6 py-2 rounded-lg font-bold"
                    >
                        Rules & Checklist
                    </TabsTrigger>
                    <TabsTrigger
                        value="playbook"
                        className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 px-6 py-2 rounded-lg font-bold"
                    >
                        Playbook
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 mt-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                <Target className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
                            </div>
                            <div className="text-2xl font-black text-white">{strategy.stats.winRate}%</div>
                            <div className="text-xs text-zinc-500 mt-1">{strategy.stats.totalTrades} Trades</div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Net P&L</span>
                            </div>
                            <div className={`text-2xl font-black ${strategy.stats.netPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ${strategy.stats.netPnl.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                <Activity className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Profit Factor</span>
                            </div>
                            <div className="text-2xl font-black text-white">{strategy.stats.profitFactor}</div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                <Target className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Avg R:R</span>
                            </div>
                            <div className="text-2xl font-black text-white">
                                1:{strategy.stats.avgLoss > 0 ? (strategy.stats.avgWin / strategy.stats.avgLoss).toFixed(2) : '0'}
                            </div>
                        </div>
                    </div>

                    {/* Equity Curve */}
                    <div className="h-[400px]">
                        <EquityCurveChart data={strategy.equityCurve} />
                    </div>
                </TabsContent>

                <TabsContent value="rules" className="mt-6">
                    <StrategyRules strategyId={strategy.id} initialRules={strategy.rules} />
                </TabsContent>

                <TabsContent value="playbook" className="mt-6">
                    <StrategyPlaybook strategyId={strategy.id} examples={strategy.examples} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
