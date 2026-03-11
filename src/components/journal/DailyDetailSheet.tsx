'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Save, Loader2, Smile, Meh, Frown, TrendingUp, TrendingDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { saveJournalEntry } from '@/app/(dashboard)/journal/actions'
import { cn } from '@/lib/utils'

interface DailyDetailSheetProps {
    date: Date | null
    onClose: () => void
    trades: any[]
    entry: any | null
}

export function DailyDetailSheet({ date, onClose, trades, entry }: DailyDetailSheetProps) {
    const [content, setContent] = useState('')
    const [mood, setMood] = useState<string | undefined>(undefined)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (entry) {
            setContent(entry.content || '')
            setMood(entry.mood)
        } else {
            setContent('')
            setMood(undefined)
        }
    }, [entry, date])

    if (!date) return null

    const handleSave = async () => {
        setIsSaving(true)
        await saveJournalEntry(date, content, mood)
        setIsSaving(false)
        onClose()
    }

    const dailyPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)

    return (
        <AnimatePresence>
            {date && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l border-zinc-800 bg-zinc-950 shadow-2xl"
                    >
                        <div className="flex h-full flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-zinc-800 p-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {format(date, 'EEEE, MMMM d, yyyy')}
                                    </h2>
                                    <div className={cn(
                                        "mt-1 flex items-center text-sm font-medium",
                                        dailyPnL > 0 ? "text-emerald-500" : dailyPnL < 0 ? "text-red-500" : "text-zinc-400"
                                    )}>
                                        {dailyPnL > 0 ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                                        Daily P&L: {dailyPnL > 0 ? '+' : ''}{dailyPnL}
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Trades Section */}
                                <div className="mb-8">
                                    <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider">Trades</h3>
                                    {trades.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
                                            No trades recorded for this day
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {trades.map((trade) => (
                                                <div key={trade.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className={cn(
                                                            "rounded px-2 py-1 text-xs font-bold",
                                                            trade.direction === 'LONG' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                        )}>
                                                            {trade.direction}
                                                        </span>
                                                        <span className="font-medium text-white">{trade.pair}</span>
                                                    </div>
                                                    <span className={cn(
                                                        "font-mono font-medium",
                                                        (trade.pnl || 0) > 0 ? "text-emerald-500" : (trade.pnl || 0) < 0 ? "text-red-500" : "text-zinc-400"
                                                    )}>
                                                        {(trade.pnl || 0) > 0 ? '+' : ''}{trade.pnl}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Journal Entry Section */}
                                <div>
                                    <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider">Daily Notes</h3>

                                    {/* Mood Selector */}
                                    <div className="mb-4 flex gap-2">
                                        {['happy', 'neutral', 'sad'].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setMood(m)}
                                                className={cn(
                                                    "flex-1 rounded-lg border p-3 transition-all hover:bg-zinc-900",
                                                    mood === m ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-zinc-800 text-zinc-400"
                                                )}
                                            >
                                                <div className="flex justify-center">
                                                    {m === 'happy' && <Smile className="h-6 w-6" />}
                                                    {m === 'neutral' && <Meh className="h-6 w-6" />}
                                                    {m === 'sad' && <Frown className="h-6 w-6" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Write your reflections, lessons, and thoughts for the day..."
                                        className="h-64 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-zinc-800 p-6">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Save Entry</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
