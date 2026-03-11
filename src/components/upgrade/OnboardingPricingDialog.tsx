'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Check, Crown, User, Zap } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { activateFreePlan } from '@/app/actions/billing'

interface OnboardingPricingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function OnboardingPricingDialog({ open, onOpenChange }: OnboardingPricingDialogProps) {
    const [isActivating, setIsActivating] = useState(false)
    const router = useRouter()

    const handleFreePlan = async () => {
        setIsActivating(true)
        try {
            await activateFreePlan()
            onOpenChange(false)
            router.push('/dashboard')
        } catch (error) {
            console.error('Failed to activate free plan:', error)
            onOpenChange(false)
            router.push('/dashboard')
        }
    }

    const handleExclusivePlan = () => {
        router.push('/checkout?plan=spot_exclusive')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl border-0 bg-transparent p-0 overflow-hidden shadow-2xl focus:outline-none">
                <div className="bg-[#050505] rounded-3xl overflow-hidden w-full border border-white/10 shadow-2xl relative">

                    <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-zinc-800">

                        {/* Header */}
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                                Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">Plan</span>
                            </h2>
                            <p className="text-zinc-400 font-medium">Start free. Upgrade when you're ready to go unlimited.</p>
                        </div>

                        {/* 2 Plan Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                            {/* Spot Basic (Free) */}
                            <div className="relative p-8 rounded-3xl border bg-[#080808] border-white/5 hover:border-white/10 flex flex-col transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-white/5">
                                        <User className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Spot Basic</h3>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Free Forever</span>
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-5xl font-black text-white tracking-tighter">$0</span>
                                    <span className="text-zinc-500 font-bold text-sm">/mo</span>
                                </div>
                                <p className="text-zinc-400 text-xs font-medium mb-8">Start practicing with real market data.</p>

                                <button
                                    onClick={handleFreePlan}
                                    disabled={isActivating}
                                    className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all mb-8 border border-white/10 hover:bg-white/5 text-white disabled:opacity-50"
                                >
                                    {isActivating ? 'Activating...' : 'Get Started Free'}
                                </button>

                                <ul className="space-y-4 flex-1">
                                    {[
                                        'Up to 1 year of backtest data',
                                        '1 live session at a time',
                                        'TradingView charts',
                                        'Order management (SL/TP)',
                                        'Speed controls (1x-10x)',
                                        'Basic analytics',
                                    ].map((feat, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-xs font-medium text-zinc-400">
                                            <Check className="h-4 w-4 shrink-0 text-zinc-600" />
                                            <span className="leading-tight">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Spot Exclusive ($99/mo) */}
                            <div className="relative p-8 rounded-3xl border bg-[#0A0A0A] border-amber-500/50 shadow-[0_0_40px_-10px_rgba(245,158,11,0.15)] md:scale-105 z-10 flex flex-col transition-all duration-300">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                    Most Popular
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                        <Crown className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">Spot Exclusive</h3>
                                        <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest">Unlimited Power</span>
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-5xl font-black text-white tracking-tighter">$39</span>
                                    <span className="text-zinc-500 font-bold text-sm">/mo</span>
                                </div>
                                <p className="text-zinc-400 text-xs font-medium mb-8">For serious traders seeking the ultimate edge.</p>

                                <button
                                    onClick={handleExclusivePlan}
                                    className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all mb-8 bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20"
                                >
                                    Start Spot Exclusive
                                </button>

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
                            </div>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}