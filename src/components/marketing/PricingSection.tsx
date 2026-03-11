'use client'

import { Check, Crown, User, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PricingSectionProps {
    user?: any
}

export function PricingSection({ user }: PricingSectionProps) {
    const router = useRouter()

    const handleFree = () => {
        router.push('/signup?plan=free')
    }

    const handleExclusive = () => {
        router.push('/signup?plan=spot_exclusive')
    }

    return (
        <section className="py-24 bg-black relative overflow-hidden" id="pricing">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/[0.04] rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 space-y-4"
                >
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4">
                        $ Pricing
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
                        Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">Transparent</span> Pricing
                    </h2>
                    <p className="text-zinc-400 font-medium max-w-2xl mx-auto">
                        Start free. Upgrade when you&apos;re ready to go unlimited.
                    </p>
                </motion.div>

                {/* 2 Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

                    {/* ── Spot Basic (Free Forever) ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0 }}
                        className="relative p-8 rounded-3xl border bg-[#080808] border-white/5 hover:border-white/10 flex flex-col transition-all duration-300"
                    >
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-6 w-fit">
                            Free Forever
                        </div>

                        <h3 className="text-2xl font-black text-white mb-1">Spot Basic</h3>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-5xl font-black text-white tracking-tighter">$0</span>
                            <span className="text-zinc-500 font-bold text-sm">/month</span>
                        </div>
                        <p className="text-zinc-400 text-xs font-medium mb-8">Start practicing with real market data.</p>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleFree}
                            className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all mb-8 border border-white/10 hover:bg-white/5 text-white"
                        >
                            Get Started Free
                        </motion.button>

                        <ul className="space-y-4 flex-1">
                            {[
                                { text: 'Up to 1 year of backtest data', included: true },
                                { text: '1 live session at a time', included: true },
                                { text: 'TradingView charts', included: true },
                                { text: 'Order management (SL/TP)', included: true },
                                { text: 'Speed controls (1x-10x)', included: true },
                                { text: 'Basic analytics', included: true },
                                { text: 'Unlimited sessions', included: false },
                                { text: 'Full historical data', included: false },
                                { text: 'Speed up to 50x', included: false },
                            ].map((feat, idx) => (
                                <li key={idx} className={cn(
                                    "flex items-start gap-3 text-xs font-medium",
                                    feat.included ? "text-zinc-400" : "text-zinc-600 line-through"
                                )}>
                                    {feat.included
                                        ? <Check className="h-4 w-4 shrink-0 text-zinc-600" />
                                        : <X className="h-4 w-4 shrink-0 text-zinc-700" />
                                    }
                                    <span className="leading-tight">{feat.text}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* ── Spot Exclusive ($39/mo) ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="relative p-8 rounded-3xl border bg-[#0A0A0A] border-amber-500/50 shadow-[0_0_40px_-10px_rgba(245,158,11,0.15)] md:scale-105 z-10 flex flex-col transition-all duration-300"
                    >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                            Most Popular
                        </div>

                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-6 w-fit">
                            🏆 Unlimited Power
                        </div>

                        <h3 className="text-2xl font-black text-amber-400 mb-1">Spot Exclusive</h3>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-5xl font-black text-white tracking-tighter">$39</span>
                            <span className="text-zinc-500 font-bold text-sm">/month</span>
                        </div>
                        <p className="text-zinc-400 text-xs font-medium mb-8">For serious traders seeking the ultimate edge.</p>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleExclusive}
                            className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all mb-8 bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20"
                        >
                            Start Spot Exclusive →
                        </motion.button>

                        <ul className="space-y-4 flex-1">
                            {[
                                'Unlimited historical data (all years)',
                                'Unlimited live sessions',
                                'TradingView charts',
                                'Order management (SL/TP)',
                                'Speed controls (1x-50x)',
                                'Advanced analytics & P&L curves',
                                'Prop Firm simulation mode',
                                'Priority data loading',
                                'Early access to new features',
                            ].map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-xs font-medium text-zinc-400">
                                    <Check className="h-4 w-4 shrink-0 text-amber-500" />
                                    <span className="leading-tight">{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
