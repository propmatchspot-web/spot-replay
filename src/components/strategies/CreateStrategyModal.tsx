'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Target, Shield, Zap, Clock, Globe, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createStrategy } from '@/app/(dashboard)/strategies/actions'

interface CreateStrategyModalProps {
    onClose: () => void
    onSuccess: () => void
}

export function CreateStrategyModal({ onClose, onSuccess }: CreateStrategyModalProps) {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        riskPerTrade: '1',
        riskRewardRatio: '2',
        winRateTarget: '50',
        entryTriggers: '',
        exitTriggers: '',
        marketConditions: [] as string[],
        rules: [''],
        timeframes: [] as string[],
        pairs: [] as string[],
        sessions: [] as string[]
    })

    const totalSteps = 4

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const data = new FormData()
            data.append('name', formData.name)
            data.append('description', formData.description)

            // Construct the complex rules object
            const rulesObject = {
                checklist: formData.rules.filter(r => r.trim()),
                entry: formData.entryTriggers,
                exit: formData.exitTriggers,
                conditions: formData.marketConditions,
                risk: {
                    percent: parseFloat(formData.riskPerTrade),
                    reward: parseFloat(formData.riskRewardRatio),
                    winRate: parseFloat(formData.winRateTarget)
                }
            }

            data.append('rules', JSON.stringify(rulesObject))
            data.append('timeframes', JSON.stringify(formData.timeframes))
            data.append('pairs', JSON.stringify(formData.pairs))
            data.append('sessions', JSON.stringify(formData.sessions))

            const res = await createStrategy(data)
            if (res.success) {
                onSuccess()
                onClose()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps))
    const prevStep = () => setStep(s => Math.max(s - 1, 1))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Design Your Strategy</h2>
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">Step {step} of {totalSteps}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-zinc-800 w-full">
                    <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                        <Target className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Identity</h3>
                                        <p className="text-sm text-zinc-400">Name and describe your edge.</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-zinc-300 mb-2">Strategy Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-zinc-700"
                                        placeholder="e.g. ICT Silver Bullet, Golden Cross Reversal"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-zinc-300 mb-2">Description & Philosophy</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none h-32 transition-all placeholder:text-zinc-700 resize-none"
                                        placeholder="Explain the logic behind this strategy. Why does it work?"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Risk Management</h3>
                                        <p className="text-sm text-zinc-400">Define your risk parameters.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Risk Per Trade (%)</label>
                                        <input
                                            type="number"
                                            value={formData.riskPerTrade}
                                            onChange={e => setFormData({ ...formData, riskPerTrade: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
                                            placeholder="1.0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Target R:R</label>
                                        <input
                                            type="number"
                                            value={formData.riskRewardRatio}
                                            onChange={e => setFormData({ ...formData, riskRewardRatio: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
                                            placeholder="2.0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Win Rate Goal (%)</label>
                                        <input
                                            type="number"
                                            value={formData.winRateTarget}
                                            onChange={e => setFormData({ ...formData, winRateTarget: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
                                            placeholder="50"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                    <p className="text-sm text-emerald-200/80 leading-relaxed">
                                        A strategy with a <strong>{formData.winRateTarget}%</strong> win rate and <strong>1:{formData.riskRewardRatio}</strong> R:R has a positive expectancy. Stick to these rules!
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
                                        <Zap className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">The Edge</h3>
                                        <p className="text-sm text-zinc-400">Define entry and exit protocols.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-300 mb-2">Entry Triggers</label>
                                        <textarea
                                            value={formData.entryTriggers}
                                            onChange={e => setFormData({ ...formData, entryTriggers: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none h-32 text-sm resize-none"
                                            placeholder="- Break of Structure&#10;- FVG Retest&#10;- RSI Divergence"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-300 mb-2">Exit Triggers</label>
                                        <textarea
                                            value={formData.exitTriggers}
                                            onChange={e => setFormData({ ...formData, exitTriggers: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none h-32 text-sm resize-none"
                                            placeholder="- Hit TP&#10;- Trailing Stop&#10;- Market Structure Shift"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-zinc-300 mb-2">Confirmation Checklist</label>
                                    <div className="space-y-2">
                                        {formData.rules.map((rule, i) => (
                                            <div key={i} className="flex gap-2">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800 text-zinc-500 flex items-center justify-center text-xs font-bold">
                                                    {i + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={rule}
                                                    onChange={e => {
                                                        const newRules = [...formData.rules]
                                                        newRules[i] = e.target.value
                                                        setFormData({ ...formData, rules: newRules })
                                                    }}
                                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2 px-4 text-white focus:border-emerald-500 focus:outline-none text-sm"
                                                    placeholder="Add a strict rule..."
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setFormData({ ...formData, rules: [...formData.rules, ''] })}
                                            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 ml-10 uppercase tracking-wider"
                                        >
                                            + Add Rule
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                                        <Globe className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Context</h3>
                                        <p className="text-sm text-zinc-400">Where and when do you trade this?</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-zinc-300 mb-3">Timeframes</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['1m', '5m', '15m', '1h', '4h', 'D', 'W'].map(tf => (
                                            <button
                                                key={tf}
                                                onClick={() => {
                                                    const newTfs = formData.timeframes.includes(tf)
                                                        ? formData.timeframes.filter(t => t !== tf)
                                                        : [...formData.timeframes, tf]
                                                    setFormData({ ...formData, timeframes: newTfs })
                                                }}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg text-sm font-bold border transition-all",
                                                    formData.timeframes.includes(tf)
                                                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                                        : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                                                )}
                                            >
                                                {tf}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-zinc-300 mb-3">Sessions</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['London', 'New York', 'Asian', 'Close'].map(session => (
                                            <button
                                                key={session}
                                                onClick={() => {
                                                    const newSessions = formData.sessions.includes(session)
                                                        ? formData.sessions.filter(s => s !== session)
                                                        : [...formData.sessions, session]
                                                    setFormData({ ...formData, sessions: newSessions })
                                                }}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg text-sm font-bold border transition-all",
                                                    formData.sessions.includes(session)
                                                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                                        : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                                                )}
                                            >
                                                {session}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                    <button
                        onClick={step > 1 ? prevStep : onClose}
                        className="px-6 py-3 text-zinc-400 font-bold hover:text-white transition-colors"
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </button>

                    <button
                        onClick={step < totalSteps ? nextStep : handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span>Creating...</span>
                        ) : step < totalSteps ? (
                            <>
                                Next <ChevronRight className="h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Create Strategy <CheckCircle2 className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
