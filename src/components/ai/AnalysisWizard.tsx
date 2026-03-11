'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    X, ChevronLeft, ChevronRight, Check, Upload, Trash2,
    TrendingUp, Clock, DollarSign, FileText, Sparkles,
    AlertTriangle, Zap, Target, BarChart3
} from 'lucide-react'

// Types
interface AnalysisContext {
    // Step 1: Asset
    asset: string
    customAsset: string

    // Step 2: Timeframe & Session
    timeframe: string
    session: string
    tradeType: 'scalp' | 'intraday' | 'swing' | 'position'

    // Step 3: Screenshots
    screenshots: {
        htf?: string // Base64
        current?: string // Base64
        ltf?: string // Base64
    }

    // Step 4: Risk Settings
    accountBalance: number
    riskPercent: number

    // Step 5: Context
    newsImpact: 'none' | 'low' | 'medium' | 'high'
    notes: string
    existingDrawings: boolean
}

interface AnalysisWizardProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (context: AnalysisContext, images: string[]) => void
}

// Common forex/crypto pairs
const POPULAR_ASSETS = [
    { label: 'XAUUSD (Gold)', value: 'XAUUSD' },
    { label: 'EURUSD', value: 'EURUSD' },
    { label: 'GBPUSD', value: 'GBPUSD' },
    { label: 'USDJPY', value: 'USDJPY' },
    { label: 'BTCUSD', value: 'BTCUSD' },
    { label: 'ETHUSD', value: 'ETHUSD' },
    { label: 'US30 (Dow)', value: 'US30' },
    { label: 'NAS100', value: 'NAS100' },
    { label: 'GBPJPY', value: 'GBPJPY' },
    { label: 'AUDUSD', value: 'AUDUSD' },
]

const TIMEFRAMES = [
    { label: '1 Minute', value: '1M' },
    { label: '5 Minute', value: '5M' },
    { label: '15 Minute', value: '15M' },
    { label: '30 Minute', value: '30M' },
    { label: '1 Hour', value: '1H' },
    { label: '4 Hour', value: '4H' },
    { label: 'Daily', value: 'D' },
    { label: 'Weekly', value: 'W' },
]

const SESSIONS = [
    { label: 'Asian Session', value: 'asian', time: '00:00 - 09:00 UTC' },
    { label: 'London Session', value: 'london', time: '08:00 - 17:00 UTC' },
    { label: 'New York Session', value: 'newyork', time: '13:00 - 22:00 UTC' },
    { label: 'London/NY Overlap', value: 'overlap', time: '13:00 - 17:00 UTC' },
]

const STEPS = [
    { id: 1, title: 'Asset', icon: TrendingUp },
    { id: 2, title: 'Timeframe', icon: Clock },
    { id: 3, title: 'Charts', icon: BarChart3 },
    { id: 4, title: 'Risk', icon: DollarSign },
    { id: 5, title: 'Context', icon: FileText },
]

const getDefaultContext = (savedSettings?: { accountBalance?: number; riskPercent?: number }): AnalysisContext => ({
    asset: '',
    customAsset: '',
    timeframe: '5M',
    session: 'london',
    tradeType: 'intraday',
    screenshots: {}, // Always empty on open
    accountBalance: savedSettings?.accountBalance || 10000,
    riskPercent: savedSettings?.riskPercent || 1,
    newsImpact: 'none',
    notes: '',
    existingDrawings: false,
})

export function AnalysisWizard({ isOpen, onClose, onSubmit }: AnalysisWizardProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [context, setContext] = useState<AnalysisContext>(getDefaultContext())

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadingFor, setUploadingFor] = useState<'htf' | 'current' | 'ltf'>('current')

    // Reset wizard state when opening
    useEffect(() => {
        if (isOpen) {
            // Load saved settings but reset everything else
            let savedSettings = {}
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('analysis_settings')
                if (saved) {
                    savedSettings = JSON.parse(saved)
                }
            }
            setContext(getDefaultContext(savedSettings))
            setCurrentStep(1)
        }
    }, [isOpen])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setContext(prev => ({
                    ...prev,
                    screenshots: {
                        ...prev.screenshots,
                        [uploadingFor]: reader.result as string
                    }
                }))
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = (key: 'htf' | 'current' | 'ltf') => {
        setContext(prev => ({
            ...prev,
            screenshots: {
                ...prev.screenshots,
                [key]: undefined
            }
        }))
    }

    const triggerUpload = (type: 'htf' | 'current' | 'ltf') => {
        setUploadingFor(type)
        fileInputRef.current?.click()
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1: return context.asset || context.customAsset
            case 2: return context.timeframe && context.session
            case 3: return context.screenshots.current // At least current TF required
            case 4: return context.accountBalance > 0 && context.riskPercent > 0
            case 5: return true
            default: return true
        }
    }

    // Debounce flag to prevent double-clicks
    const [isNavigating, setIsNavigating] = useState(false)

    const handleNext = () => {
        if (isNavigating) return // Prevent double-click

        console.log('[Wizard] handleNext called. Current step:', currentStep)

        if (currentStep < 5) {
            setIsNavigating(true)
            setCurrentStep(prev => {
                console.log('[Wizard] Setting step from', prev, 'to', prev + 1)
                return prev + 1
            })
            // Reset debounce after animation
            setTimeout(() => setIsNavigating(false), 300)
        } else {
            handleSubmit()
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = () => {
        // Save settings to localStorage
        localStorage.setItem('analysis_settings', JSON.stringify({
            accountBalance: context.accountBalance,
            riskPercent: context.riskPercent,
        }))

        // Collect images
        const images: string[] = []
        if (context.screenshots.htf) images.push(context.screenshots.htf)
        if (context.screenshots.current) images.push(context.screenshots.current)
        if (context.screenshots.ltf) images.push(context.screenshots.ltf)

        onSubmit(context, images)
        onClose()
        setCurrentStep(1)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/20">
                                <Sparkles className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Chart Analysis</h2>
                                <p className="text-xs text-zinc-500">Complete the steps for accurate analysis</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex items-center justify-between mt-6">
                        {STEPS.map((step, i) => (
                            <div key={step.id} className="flex items-center">
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                                    currentStep === step.id && "bg-emerald-500/20",
                                    currentStep > step.id && "opacity-50"
                                )}>
                                    <div className={cn(
                                        "p-1.5 rounded-lg",
                                        currentStep === step.id ? "bg-emerald-500 text-black" :
                                            currentStep > step.id ? "bg-zinc-700 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                                    )}>
                                        {currentStep > step.id ? (
                                            <Check className="h-3 w-3" />
                                        ) : (
                                            <step.icon className="h-3 w-3" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-xs font-bold hidden sm:block",
                                        currentStep === step.id ? "text-emerald-400" : "text-zinc-500"
                                    )}>
                                        {step.title}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={cn(
                                        "w-8 h-0.5 mx-1",
                                        currentStep > step.id ? "bg-emerald-500" : "bg-zinc-800"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                />

                <div className="p-6 min-h-[350px]">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Asset Selection */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <h3 className="text-lg font-bold text-white mb-4">What asset are you analyzing?</h3>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {POPULAR_ASSETS.map((asset) => (
                                        <button
                                            key={asset.value}
                                            onClick={() => setContext(p => ({ ...p, asset: asset.value, customAsset: '' }))}
                                            className={cn(
                                                "p-3 rounded-xl border text-left transition-all text-sm font-bold",
                                                context.asset === asset.value
                                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                            )}
                                        >
                                            {asset.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <label className="text-sm text-zinc-500 mb-2 block">Or enter custom symbol:</label>
                                    <input
                                        type="text"
                                        value={context.customAsset}
                                        onChange={(e) => setContext(p => ({ ...p, customAsset: e.target.value.toUpperCase(), asset: '' }))}
                                        placeholder="e.g., SOLUSDT"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Timeframe & Session */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4">Select Timeframe</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {TIMEFRAMES.map((tf) => (
                                            <button
                                                key={tf.value}
                                                onClick={() => setContext(p => ({ ...p, timeframe: tf.value }))}
                                                className={cn(
                                                    "p-3 rounded-xl border text-center transition-all text-sm font-bold",
                                                    context.timeframe === tf.value
                                                        ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                                                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                                )}
                                            >
                                                {tf.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4">Current Session</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SESSIONS.map((session) => (
                                            <button
                                                key={session.value}
                                                onClick={() => setContext(p => ({ ...p, session: session.value }))}
                                                className={cn(
                                                    "p-3 rounded-xl border text-left transition-all",
                                                    context.session === session.value
                                                        ? "bg-violet-500/20 border-violet-500/50"
                                                        : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                                                )}
                                            >
                                                <div className={cn(
                                                    "text-sm font-bold",
                                                    context.session === session.value ? "text-violet-400" : "text-zinc-400"
                                                )}>
                                                    {session.label}
                                                </div>
                                                <div className="text-[10px] text-zinc-600">{session.time}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4">Trade Type</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(['scalp', 'intraday', 'swing', 'position'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setContext(p => ({ ...p, tradeType: type }))}
                                                className={cn(
                                                    "p-3 rounded-xl border text-center transition-all text-sm font-bold capitalize",
                                                    context.tradeType === type
                                                        ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Screenshot Upload */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <h3 className="text-lg font-bold text-white mb-2">Upload Chart Screenshots</h3>
                                <p className="text-sm text-zinc-500 mb-4">Upload 1-3 charts for multi-timeframe analysis. Current TF is required.</p>

                                <div className="grid grid-cols-3 gap-4">
                                    {/* HTF */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Higher TF (Optional)</label>
                                        {context.screenshots.htf ? (
                                            <div className="relative rounded-xl overflow-hidden border border-zinc-700">
                                                <img src={context.screenshots.htf} alt="HTF" className="w-full h-32 object-cover" />
                                                <button
                                                    onClick={() => removeImage('htf')}
                                                    className="absolute top-2 right-2 p-1 rounded-lg bg-red-500/80 text-white"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => triggerUpload('htf')}
                                                className="w-full h-32 rounded-xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-2 hover:border-zinc-600 transition-colors"
                                            >
                                                <Upload className="h-5 w-5 text-zinc-600" />
                                                <span className="text-[10px] text-zinc-600">Daily/4H</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Current TF */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-emerald-400 uppercase">Current TF *</label>
                                        {context.screenshots.current ? (
                                            <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/50">
                                                <img src={context.screenshots.current} alt="Current" className="w-full h-32 object-cover" />
                                                <button
                                                    onClick={() => removeImage('current')}
                                                    className="absolute top-2 right-2 p-1 rounded-lg bg-red-500/80 text-white"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => triggerUpload('current')}
                                                className="w-full h-32 rounded-xl border-2 border-dashed border-emerald-500/50 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 transition-colors bg-emerald-500/5"
                                            >
                                                <Upload className="h-5 w-5 text-emerald-500" />
                                                <span className="text-[10px] text-emerald-500">Required</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* LTF */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Lower TF (Optional)</label>
                                        {context.screenshots.ltf ? (
                                            <div className="relative rounded-xl overflow-hidden border border-zinc-700">
                                                <img src={context.screenshots.ltf} alt="LTF" className="w-full h-32 object-cover" />
                                                <button
                                                    onClick={() => removeImage('ltf')}
                                                    className="absolute top-2 right-2 p-1 rounded-lg bg-red-500/80 text-white"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => triggerUpload('ltf')}
                                                className="w-full h-32 rounded-xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-2 hover:border-zinc-600 transition-colors"
                                            >
                                                <Upload className="h-5 w-5 text-zinc-600" />
                                                <span className="text-[10px] text-zinc-600">1M/5M</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mt-4">
                                    <div className="flex items-center gap-2 text-blue-400 text-xs">
                                        <Target className="h-4 w-4" />
                                        <span className="font-bold">Pro Tip:</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        Uploading higher and lower timeframes helps AI identify confluence and improve accuracy.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Risk Settings */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-lg font-bold text-white mb-4">Risk Settings</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-zinc-500 mb-2 block">Account Balance ($)</label>
                                        <input
                                            type="number"
                                            value={context.accountBalance}
                                            onChange={(e) => setContext(p => ({ ...p, accountBalance: parseFloat(e.target.value) || 0 }))}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-zinc-500 mb-2 block">Risk per Trade (%)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0.1"
                                            max="10"
                                            value={context.riskPercent}
                                            onChange={(e) => setContext(p => ({ ...p, riskPercent: parseFloat(e.target.value) || 1 }))}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                    <div className="text-sm text-zinc-500 mb-2">Risk Amount</div>
                                    <div className="text-3xl font-black text-emerald-400 font-mono">
                                        ${(context.accountBalance * (context.riskPercent / 100)).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-zinc-600 mt-1">
                                        Maximum loss per trade based on your settings
                                    </div>
                                </div>

                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                    <div className="flex items-center gap-2 text-amber-400 text-xs">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span>Settings are saved locally for future analyses</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Context */}
                        {currentStep === 5 && (
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-lg font-bold text-white mb-4">Additional Context</h3>

                                <div>
                                    <label className="text-sm text-zinc-500 mb-2 block">News Impact Today</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(['none', 'low', 'medium', 'high'] as const).map((impact) => (
                                            <button
                                                key={impact}
                                                onClick={() => setContext(p => ({ ...p, newsImpact: impact }))}
                                                className={cn(
                                                    "p-3 rounded-xl border text-center transition-all text-sm font-bold capitalize",
                                                    context.newsImpact === impact
                                                        ? impact === 'high'
                                                            ? "bg-red-500/20 border-red-500/50 text-red-400"
                                                            : impact === 'medium'
                                                                ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                                                : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                                )}
                                            >
                                                {impact}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            id="drawings"
                                            checked={context.existingDrawings}
                                            onChange={(e) => setContext(p => ({ ...p, existingDrawings: e.target.checked }))}
                                            className="rounded"
                                        />
                                        <label htmlFor="drawings" className="text-sm text-zinc-400">
                                            I have drawings on the chart (zones, trendlines, fibs)
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-500 mb-2 block">Additional Notes (Optional)</label>
                                    <textarea
                                        value={context.notes}
                                        onChange={(e) => setContext(p => ({ ...p, notes: e.target.value }))}
                                        placeholder="e.g., FOMC at 2pm, looking for short entries only..."
                                        rows={3}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                                    />
                                </div>

                                {/* Summary */}
                                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Analysis Summary</div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="text-zinc-500">Asset:</span> <span className="text-white font-bold">{context.asset || context.customAsset}</span></div>
                                        <div><span className="text-zinc-500">Timeframe:</span> <span className="text-white font-bold">{context.timeframe}</span></div>
                                        <div><span className="text-zinc-500">Session:</span> <span className="text-white font-bold capitalize">{context.session}</span></div>
                                        <div><span className="text-zinc-500">Charts:</span> <span className="text-white font-bold">{Object.values(context.screenshots).filter(Boolean).length}</span></div>
                                        <div><span className="text-zinc-500">Risk:</span> <span className="text-emerald-400 font-bold">${(context.accountBalance * (context.riskPercent / 100)).toFixed(0)}</span></div>
                                        <div><span className="text-zinc-500">News:</span> <span className="text-white font-bold capitalize">{context.newsImpact}</span></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-between">
                    <button
                        type="button"
                        onClick={currentStep === 1 ? onClose : handleBack}
                        className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-400 font-bold hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {currentStep === 1 ? 'Cancel' : 'Back'}
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className={cn(
                            "px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
                            canProceed()
                                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                        )}
                    >
                        {currentStep === 5 ? (
                            <>
                                <Zap className="h-4 w-4" />
                                Analyze
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
