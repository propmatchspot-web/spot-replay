'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PlanEnforcementModalProps {
    plan: string
}

export const PlanEnforcementModal = ({ plan }: PlanEnforcementModalProps) => {
    const router = useRouter()
    const formattedPlan = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase()

    // Determine plan features for display
    const features = {
        'STARTER': ["Unlimited Trades", "Basic Analytics", "3 AI Analysis / Day"],
        'GROWTH': ["Unlimited Auto-Sync", "Full AI Coach Access", "Prop Firm Guardian", "7-Day Free Trial"],
        'ENTERPRISE': ["Multi-Account Aggregation", "Mentor Access", "API Access", "7-Day Free Trial"]
    }[plan.toUpperCase()] || ["Premium Features", "Unlocks Full Access"]

    const price = {
        'STARTER': "$19/mo",
        'GROWTH': "$29/mo",
        'ENTERPRISE': "$59/mo",
    }[plan.toUpperCase()]

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-zinc-900 border border-brand-500/20 rounded-2xl shadow-2xl overflow-hidden relative"
            >
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-brand-500/10 blur-[60px]" />

                <div className="p-8 relative z-10 text-center">
                    <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-500/20">
                        <Lock className="w-8 h-8 text-brand-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        Complete Your Setup
                    </h2>
                    <p className="text-zinc-400 mb-6 font-medium">
                        You selected the <span className="text-brand-400 font-bold">{formattedPlan}</span> plan. <br />
                        Please complete your subscription to access the dashboard.
                    </p>

                    <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5 mb-8 text-left">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                            <span className="text-white font-bold">{formattedPlan} Plan</span>
                            <span className="text-brand-400 font-mono font-bold">{price}</span>
                        </div>
                        <ul className="space-y-3">
                            {features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={() => router.push(`/checkout?plan=${plan}`)}
                        className="w-full py-3.5 bg-brand-500 hover:bg-brand-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-brand-500/20"
                    >
                        COMPLETE SUBSCRIPTION
                        <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => {
                            // Option to clear cookie and go to free? 
                            // Or just sign out?
                            // For now, let's just let them go back to pricing?
                            // User requirement says "WE WILL NOT LET HIM ENTER UNTIL HE CLICK ON THAT POPUP"
                            // But usually a "Switch to Free" option is good UX.
                            // I'll stick to strict blocking for now as requested.
                            window.location.href = '/' // Go back to landing
                        }}
                        className="mt-4 text-xs text-zinc-500 hover:text-zinc-400 font-medium"
                    >
                        Cancel and return home
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
