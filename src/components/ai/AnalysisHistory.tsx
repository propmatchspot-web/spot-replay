'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    History, Trash2, CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown,
    ChevronDown, ChevronUp, BarChart3, Target, Calendar, Coins, Percent,
    Award, X, Eye
} from 'lucide-react'
import {
    getAnalysisHistory,
    deleteAnalysis,
    updateAnalysisOutcome,
    getAnalysisStats,
    StoredAnalysis
} from '@/lib/analysis-storage'

interface AnalysisHistoryProps {
    isOpen: boolean
    onClose: () => void
    onViewAnalysis?: (analysis: StoredAnalysis) => void
}

export function AnalysisHistory({ isOpen, onClose, onViewAnalysis }: AnalysisHistoryProps) {
    const [analyses, setAnalyses] = useState<StoredAnalysis[]>([])
    const [stats, setStats] = useState({ total: 0, wins: 0, losses: 0, pending: 0, accuracy: 0 })
    const [expandedId, setExpandedId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            loadData()
        }
    }, [isOpen])

    const loadData = () => {
        setAnalyses(getAnalysisHistory())
        setStats(getAnalysisStats())
    }

    const handleMarkOutcome = (id: string, outcome: 'WIN' | 'LOSS') => {
        updateAnalysisOutcome(id, outcome)
        loadData()
    }

    const handleDelete = (id: string) => {
        deleteAnalysis(id)
        loadData()
    }

    const formatTimeAgo = (timestamp: number) => {
        const diff = Date.now() - timestamp
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor(diff / (1000 * 60))

        if (hours > 0) return `${hours}h ago`
        if (minutes > 0) return `${minutes}m ago`
        return 'Just now'
    }

    const getTimeRemaining = (expiresAt: number) => {
        const remaining = expiresAt - Date.now()
        const hours = Math.floor(remaining / (1000 * 60 * 60))
        if (hours > 0) return `${hours}h remaining`
        return 'Expiring soon'
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-violet-500/20">
                                <History className="h-5 w-5 text-violet-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Analysis History</h2>
                                <p className="text-xs text-zinc-500">Your recent chart analyses (24hr storage)</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-3 mt-5">
                        <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800">
                            <div className="flex items-center gap-2 text-[9px] text-zinc-500 uppercase tracking-widest mb-1">
                                <BarChart3 className="h-3 w-3" />
                                Total
                            </div>
                            <div className="text-2xl font-black text-white">{stats.total}</div>
                        </div>
                        <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/20">
                            <div className="flex items-center gap-2 text-[9px] text-emerald-400 uppercase tracking-widest mb-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Wins
                            </div>
                            <div className="text-2xl font-black text-emerald-400">{stats.wins}</div>
                        </div>
                        <div className="bg-red-500/5 rounded-xl p-3 border border-red-500/20">
                            <div className="flex items-center gap-2 text-[9px] text-red-400 uppercase tracking-widest mb-1">
                                <XCircle className="h-3 w-3" />
                                Losses
                            </div>
                            <div className="text-2xl font-black text-red-400">{stats.losses}</div>
                        </div>
                        <div className="bg-violet-500/5 rounded-xl p-3 border border-violet-500/20">
                            <div className="flex items-center gap-2 text-[9px] text-violet-400 uppercase tracking-widest mb-1">
                                <Award className="h-3 w-3" />
                                Accuracy
                            </div>
                            <div className="text-2xl font-black text-violet-400">{stats.accuracy}%</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {analyses.length === 0 ? (
                        <div className="text-center py-16">
                            <History className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-zinc-500">No Analyses Yet</h3>
                            <p className="text-sm text-zinc-600 mt-1">Your saved analyses will appear here</p>
                        </div>
                    ) : (
                        analyses.map((analysis) => (
                            <motion.div
                                key={analysis.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden"
                            >
                                {/* Row Header */}
                                <div
                                    onClick={() => setExpandedId(expandedId === analysis.id ? null : analysis.id)}
                                    className="p-4 cursor-pointer flex items-center justify-between hover:bg-zinc-900/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-2.5 rounded-xl border",
                                            analysis.bias === 'BULLISH'
                                                ? "bg-emerald-500/10 border-emerald-500/30"
                                                : analysis.bias === 'BEARISH'
                                                    ? "bg-red-500/10 border-red-500/30"
                                                    : "bg-zinc-800 border-zinc-700"
                                        )}>
                                            {analysis.bias === 'BULLISH' ? (
                                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                                            ) : analysis.bias === 'BEARISH' ? (
                                                <TrendingDown className="h-5 w-5 text-red-400" />
                                            ) : (
                                                <BarChart3 className="h-5 w-5 text-zinc-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white">{analysis.asset}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                                                    {analysis.timeframe}
                                                </span>
                                                <span className={cn(
                                                    "text-xs px-2 py-0.5 rounded-full font-bold",
                                                    analysis.bias === 'BULLISH'
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : analysis.bias === 'BEARISH'
                                                            ? "bg-red-500/20 text-red-400"
                                                            : "bg-zinc-700 text-zinc-400"
                                                )}>
                                                    {analysis.bias}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatTimeAgo(analysis.timestamp)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {getTimeRemaining(analysis.expiresAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Outcome Badge */}
                                        {analysis.outcome === 'WIN' && (
                                            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                                                <CheckCircle2 className="h-3 w-3" /> WIN
                                            </span>
                                        )}
                                        {analysis.outcome === 'LOSS' && (
                                            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                                                <XCircle className="h-3 w-3" /> LOSS
                                            </span>
                                        )}
                                        {(!analysis.outcome || analysis.outcome === 'PENDING') && (
                                            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                                                <Clock className="h-3 w-3" /> PENDING
                                            </span>
                                        )}

                                        {expandedId === analysis.id ? (
                                            <ChevronUp className="h-4 w-4 text-zinc-500" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-zinc-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedId === analysis.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-zinc-800 overflow-hidden"
                                        >
                                            <div className="p-4 space-y-4">
                                                {/* Entry Details */}
                                                <div className="grid grid-cols-4 gap-3 text-sm">
                                                    <div className="bg-zinc-900 rounded-lg p-3">
                                                        <div className="text-[9px] text-zinc-500 uppercase mb-1">Entry</div>
                                                        <div className="font-mono font-bold text-blue-400">{analysis.entryPrice || 'N/A'}</div>
                                                    </div>
                                                    <div className="bg-zinc-900 rounded-lg p-3">
                                                        <div className="text-[9px] text-zinc-500 uppercase mb-1">Stop Loss</div>
                                                        <div className="font-mono font-bold text-red-400">{analysis.stopLoss || 'N/A'}</div>
                                                    </div>
                                                    <div className="bg-zinc-900 rounded-lg p-3">
                                                        <div className="text-[9px] text-zinc-500 uppercase mb-1">Take Profit</div>
                                                        <div className="font-mono font-bold text-emerald-400">{analysis.takeProfit1 || 'N/A'}</div>
                                                    </div>
                                                    <div className="bg-zinc-900 rounded-lg p-3">
                                                        <div className="text-[9px] text-zinc-500 uppercase mb-1">Probability</div>
                                                        <div className="font-mono font-bold text-violet-400">{analysis.probability || 'N/A'}</div>
                                                    </div>
                                                </div>

                                                {/* Context */}
                                                <div className="grid grid-cols-3 gap-3 text-xs">
                                                    <div className="flex items-center gap-2 text-zinc-500">
                                                        <Coins className="h-3 w-3" />
                                                        Risk: ${analysis.riskAmount?.toFixed(2) || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-zinc-500">
                                                        <Target className="h-3 w-3" />
                                                        Lot: {analysis.lotSize?.toFixed(2) || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-zinc-500">
                                                        <BarChart3 className="h-3 w-3" />
                                                        Score: {analysis.confluenceScore || 'N/A'}/10
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                                                    <div className="flex gap-2">
                                                        {(!analysis.outcome || analysis.outcome === 'PENDING') && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleMarkOutcome(analysis.id, 'WIN')}
                                                                    className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition-colors flex items-center gap-2"
                                                                >
                                                                    <CheckCircle2 className="h-3 w-3" /> Mark Win
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMarkOutcome(analysis.id, 'LOSS')}
                                                                    className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors flex items-center gap-2"
                                                                >
                                                                    <XCircle className="h-3 w-3" /> Mark Loss
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(analysis.id)}
                                                        className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    )
}
