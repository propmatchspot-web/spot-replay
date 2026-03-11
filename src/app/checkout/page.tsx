'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCheckoutUrl, markOnboardingComplete, setOnboardingCookie, activateFreePlan } from '../actions/billing'
import { createCryptoCheckout } from '../actions/crypto-billing'
import { Loader2, Check, ShieldCheck, Zap, CreditCard, Lock, User, ArrowLeft, ArrowRight, Bitcoin, Crown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { motion } from 'framer-motion'

type PlanKey = 'spot_basic' | 'spot_exclusive'

const PLANS: Record<PlanKey, {
    name: string
    tagline: string
    monthlyPrice: number
    features: string[]
    icon: any
    color: string
    gradient: string
}> = {
    spot_basic: {
        name: 'Spot Basic',
        tagline: 'Start backtesting for free',
        monthlyPrice: 0,
        features: [
            'Up to 1 year of backtest data',
            '1 live session at a time',
            'TradingView charts',
            'Order management (SL/TP)',
            'Speed controls (1x-10x)',
            'Basic analytics',
        ],
        icon: User,
        color: 'text-zinc-400',
        gradient: 'from-zinc-500 to-zinc-600',
    },
    spot_exclusive: {
        name: 'Spot Exclusive',
        tagline: 'Unlimited power for serious traders',
        monthlyPrice: 39,
        features: [
            'Unlimited historical data (all years)',
            'Unlimited live sessions',
            'TradingView charts',
            'Order management (SL/TP)',
            'Speed controls (1x-50x)',
            'Advanced analytics & P&L curves',
            'Prop Firm simulation mode',
            'Priority data loading',
            'Early access to new features',
        ],
        icon: Crown,
        color: 'text-amber-400',
        gradient: 'from-amber-500 to-yellow-500',
    },
}

function CheckoutPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planParam = (searchParams.get('plan')?.toLowerCase() || 'spot_basic') as PlanKey
    const safePlanParam = PLANS[planParam] ? planParam : 'spot_basic'
    const selectedPlan = PLANS[safePlanParam]

    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card')
    const [user, setUser] = useState<any>(null)
    const PlanIcon = selectedPlan.icon

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser(user)
                if (safePlanParam) {
                    setOnboardingCookie().catch(() => { })
                    markOnboardingComplete().catch(() => { })
                }
            }
        })
    }, [])

    const handleCheckout = async () => {
        if (!user) {
            router.push(`/login?next=/checkout?plan=${safePlanParam}`)
            return
        }

        if (safePlanParam === 'spot_basic') {
            setLoading(true)
            try {
                const result = await activateFreePlan()
                if (!result.success) {
                    await markOnboardingComplete()
                }
            } catch (err) {
                try { await markOnboardingComplete() } catch (_) { }
            }
            try { await setOnboardingCookie() } catch (_) { }
            router.push('/dashboard')
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            if (paymentMethod === 'crypto') {
                const result = await createCryptoCheckout(safePlanParam, 'monthly')
                if (result.url) window.location.href = result.url
                else alert(result.error || 'Crypto checkout failed.')
            } else {
                const result = await getCheckoutUrl(safePlanParam, 'monthly')
                if (result.url) window.location.href = result.url
                else alert('Checkout failed. Please try again.')
            }
        } catch (error) {
            console.error(error)
            alert('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans selection:bg-amber-500/30">

            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-amber-900/10 to-transparent" />
                <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/5 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <div className="w-full border-b border-white/[0.06] bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-bold">Back</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-black tracking-tight">Spot Replay</h2>
                    </div>
                    <div className="w-16 flex justify-end">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 flex items-start justify-center px-4 py-12 relative z-10">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16">

                    {/* LEFT COLUMN: Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3 space-y-8"
                    >
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                                Upgrade Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">Edge</span>
                            </h1>
                            <p className="text-zinc-400 font-medium text-lg max-w-lg">
                                Unlock the full power of Spot Replay with unlimited sessions and data.
                            </p>
                        </div>

                        {/* Plan Card */}
                        <div className="rounded-[2rem] border border-white/[0.08] bg-[#0A0A0A] p-1 relative overflow-hidden shadow-2xl shadow-amber-900/10">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                            <div className="relative bg-zinc-900/40 rounded-[1.8rem] p-8 md:p-10 overflow-hidden">
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${selectedPlan.gradient}`} />

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                    <div className="flex items-start gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center border border-white/5 shadow-inner">
                                            <PlanIcon className={`w-8 h-8 ${selectedPlan.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black uppercase tracking-wide text-white mb-1">{selectedPlan.name}</h3>
                                            <p className="text-zinc-500 font-medium">{selectedPlan.tagline}</p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="flex items-baseline justify-end gap-1.5">
                                            <span className="text-4xl font-black text-white tracking-tight">${selectedPlan.monthlyPrice}</span>
                                            <span className="text-zinc-500 font-bold uppercase text-sm">/mo</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
                                    {selectedPlan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-zinc-800/80">
                                                <Check className={`w-3 h-3 ${selectedPlan.color}`} />
                                            </div>
                                            <span className="text-sm text-zinc-300 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div className="flex items-center gap-6 text-zinc-600 text-xs font-bold uppercase tracking-wider overflow-hidden">
                            {[
                                { icon: Lock, label: 'SSL Encrypted' },
                                { icon: ShieldCheck, label: '30-Day Guarantee' },
                                { icon: Check, label: 'Cancel Anytime' },
                            ].map((b, i) => (
                                <div key={i} className="flex items-center gap-2 shrink-0">
                                    <b.icon className="w-3.5 h-3.5" />
                                    <span>{b.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Payment */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2"
                    >
                        <div className="sticky top-28">
                            <div className="rounded-[2rem] border border-white/[0.08] backdrop-blur-xl overflow-hidden bg-zinc-900/60 shadow-2xl shadow-black/50">
                                <div className="px-8 py-6 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Payment Details</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                        <Lock className="w-3 h-3" />
                                        SECURE
                                    </div>
                                </div>

                                <div className="p-8 space-y-8">
                                    {safePlanParam === 'spot_basic' ? (
                                        <div className="text-center py-4">
                                            <div className="w-20 h-20 rounded-full bg-zinc-800/50 mx-auto flex items-center justify-center mb-6 border border-white/5">
                                                <User className="w-10 h-10 text-zinc-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">Start Backtesting Free</h3>
                                            <p className="text-sm text-zinc-400 mb-8 px-4">
                                                No credit card required. Start practicing with real market data instantly.
                                            </p>
                                            <button
                                                onClick={handleCheckout}
                                                disabled={loading}
                                                className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-wider text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Get Started Free'}
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Payment Methods */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    onClick={() => setPaymentMethod('card')}
                                                    className={`py-4 px-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'card' ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]' : 'bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900'}`}
                                                >
                                                    <CreditCard className="w-6 h-6" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Card / PayPal</span>
                                                </button>
                                                <button
                                                    onClick={() => setPaymentMethod('crypto')}
                                                    className={`relative py-4 px-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'crypto' ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]' : 'bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900'}`}
                                                >
                                                    <Bitcoin className="w-6 h-6" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Crypto</span>
                                                </button>
                                            </div>

                                            {/* Summary */}
                                            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-zinc-400 font-medium">Subtotal</span>
                                                    <span className="text-white font-bold">${selectedPlan.monthlyPrice}.00</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-3 border-t border-white/[0.06]">
                                                    <span className="text-white font-black text-lg uppercase tracking-wider">Total Due</span>
                                                    <span className="text-3xl font-black text-white">${selectedPlan.monthlyPrice}.00</span>
                                                </div>
                                            </div>

                                            {/* Pay Button */}
                                            <button
                                                onClick={handleCheckout}
                                                disabled={loading || !user}
                                                className={`w-full py-5 rounded-xl font-black uppercase tracking-wider text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden ${paymentMethod === 'crypto'
                                                    ? 'bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)]'
                                                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]'
                                                    }`}
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                        <>
                                                            {paymentMethod === 'crypto' ? (
                                                                <><Bitcoin className="w-5 h-5" /> Pay with Crypto</>
                                                            ) : 'Secure Payment'}
                                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                        </>
                                                    )}
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                            </button>

                                            <div className="text-center">
                                                <p className="text-[10px] text-zinc-500 font-medium">
                                                    By continuing, you agree to our <Link href="/terms" className="underline hover:text-white">Terms</Link> and <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    )
}
