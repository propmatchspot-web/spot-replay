'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUp, TrendingDown, BarChart3, Target, Zap,
    Brain, Layers, Activity, ScanLine, Sparkles, CheckCircle2
} from 'lucide-react'

const LOADING_STEPS = [
    { icon: ScanLine, label: 'Scanning chart patterns...', color: 'text-blue-400', duration: 4 },
    { icon: Layers, label: 'Analyzing market structure...', color: 'text-violet-400', duration: 5 },
    { icon: TrendingUp, label: 'Identifying key levels...', color: 'text-emerald-400', duration: 4 },
    { icon: Activity, label: 'Detecting order blocks...', color: 'text-amber-400', duration: 3 },
    { icon: Brain, label: 'Calculating probabilities...', color: 'text-pink-400', duration: 4 },
    { icon: Target, label: 'Generating trade setups...', color: 'text-cyan-400', duration: 3 },
]

export function AnalyzingLoader() {
    const [currentStep, setCurrentStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState<number[]>([])

    useEffect(() => {
        // Sequential step progression
        const stepDelays = [0, 3000, 6000, 10000, 14000, 18000] // When each step starts

        const timers: NodeJS.Timeout[] = []

        stepDelays.forEach((delay, index) => {
            const timer = setTimeout(() => {
                setCurrentStep(index)
                // Mark previous step as complete
                if (index > 0) {
                    setCompletedSteps(prev => [...prev, index - 1])
                }
            }, delay)
            timers.push(timer)
        })

        // Mark last step complete after a bit
        const finalTimer = setTimeout(() => {
            setCompletedSteps(prev => [...prev, LOADING_STEPS.length - 1])
        }, 22000)
        timers.push(finalTimer)

        return () => timers.forEach(t => clearTimeout(t))
    }, [])

    return (
        <div className="flex flex-col items-center justify-center py-12 px-8">
            {/* Animated Chart Icon */}
            <div className="relative mb-8">
                {/* Outer Glow Ring */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Main Icon Container */}
                <motion.div
                    className="relative p-6 rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-2xl"
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                    <BarChart3 className="h-12 w-12 text-emerald-400" />
                </motion.div>

                {/* Orbiting Dots */}
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded-full bg-emerald-500"
                        style={{ top: '50%', left: '50%' }}
                        animate={{
                            x: [0, 40, 0, -40, 0],
                            y: [-40, 0, 40, 0, -40],
                            opacity: [1, 0.5, 1, 0.5, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                        }}
                    />
                ))}
            </div>

            {/* Title */}
            <motion.h3
                className="text-xl font-black text-white mb-2 tracking-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                Analyzing Your Chart
            </motion.h3>
            <motion.p
                className="text-sm text-zinc-500 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                AI is scanning for high-probability setups...
            </motion.p>

            {/* Sequential Steps */}
            <div className="w-full max-w-md space-y-3">
                {LOADING_STEPS.map((step, index) => {
                    const isVisible = index <= currentStep
                    const isComplete = completedSteps.includes(index)
                    const isActive = index === currentStep && !isComplete

                    return (
                        <AnimatePresence key={index}>
                            {isVisible && (
                                <motion.div
                                    initial={{ opacity: 0, x: -30, height: 0 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        height: 'auto',
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        ease: "easeOut"
                                    }}
                                    className="overflow-hidden"
                                >
                                    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${isComplete
                                            ? 'bg-emerald-500/5 border-emerald-500/30'
                                            : isActive
                                                ? 'bg-zinc-800/80 border-zinc-700'
                                                : 'bg-zinc-900/50 border-zinc-800/50'
                                        }`}>
                                        <motion.div
                                            className={`p-2 rounded-lg ${isComplete
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : `bg-zinc-800 ${step.color}`
                                                }`}
                                            animate={isActive ? {
                                                scale: [1, 1.1, 1],
                                            } : {}}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        >
                                            {isComplete ? (
                                                <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                                <step.icon className="h-4 w-4" />
                                            )}
                                        </motion.div>
                                        <span className={`text-sm flex-1 ${isComplete ? 'text-emerald-400' : 'text-zinc-400'
                                            }`}>
                                            {isComplete ? step.label.replace('...', '') : step.label}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                className="flex gap-1"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <motion.span
                                                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                                                />
                                                <motion.span
                                                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                                                />
                                                <motion.span
                                                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                                                />
                                            </motion.div>
                                        )}
                                        {isComplete && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            >
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )
                })}
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mt-8">
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 25, ease: 'easeInOut' }}
                    />
                </div>
                <p className="text-[10px] text-zinc-600 text-center mt-2 uppercase tracking-widest">
                    Preparing comprehensive analysis...
                </p>
            </div>
        </div>
    )
}
