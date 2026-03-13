'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCheckoutUrl, markOnboardingComplete, setOnboardingCookie, activateFreePlan } from '../actions/billing'
import { createCryptoCheckout } from '../actions/crypto-billing'
import { createNowPaymentsCheckout } from '../actions/nowpayments-billing'
import { Loader2, Check, ShieldCheck, Zap, CreditCard, Lock, User, ArrowLeft, ArrowRight, Bitcoin, Crown, Sparkles, Wallet } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

type PlanKey = 'spot_basic' | 'spot_exclusive'

const PLANS: Record<PlanKey, {
    name: string
    tagline: string
    monthlyPrice: number
    features: string[]
    icon: any
    color: string
    gradient: string
    glowColor: string
}> = {
    spot_basic: {
        name: 'Spot Basic',
        tagline: 'Start practicing with real market data instantly.',
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
        color: 'text-zinc-300',
        gradient: 'from-zinc-500 to-zinc-700',
        glowColor: 'shadow-zinc-500/10',
    },
    spot_exclusive: {
        name: 'Spot Exclusive',
        tagline: 'Unlimited power and advanced data for serious traders.',
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
        gradient: 'from-amber-400 to-yellow-600',
        glowColor: 'shadow-amber-500/20',
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
    const [cryptoMethod, setCryptoMethod] = useState<'wallet' | 'direct'>('wallet')
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
                let result;
                if (cryptoMethod === 'wallet') {
                    // Coinbase Commerce (Wallet)
                    result = await createCryptoCheckout(safePlanParam, 'monthly')
                } else {
                    // NOWPayments (Direct Crypto)
                    result = await createNowPaymentsCheckout(safePlanParam, 'monthly')
                }
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
        <div className="min-h-screen bg-[#020202] text-white flex flex-col relative overflow-hidden font-sans selection:bg-amber-500/30">

            {/* Ambient Backgrounds */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-amber-600/10 via-transparent to-transparent opacity-60" />
                <div className="absolute -top-[200px] left-[10%] w-[1000px] h-[1000px] bg-amber-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black to-transparent" />
            </div>

            {/* Nav Header */}
            <div className="w-full border-b border-white/[0.04] bg-[#020202]/60 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 h-24 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <Image 
                            src="/Replaylogo.png" 
                            alt="Spot Replay Logo" 
                            width={40} 
                            height={40}
                            sizes="40px"
                            className="drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-500 rounded-xl"
                            priority
                        />
                        <h2 className="text-xl font-black tracking-tighter text-white">SPOT REPLAY</h2>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-300">
                        <Lock className="w-3 h-3 text-amber-500" />
                        SECURE
                    </div>
                </div>
            </div>

            <main className="flex-1 flex items-start justify-center px-4 py-16 lg:py-24 relative z-10">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* ── LEFT COLUMN: Summary ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-7 flex flex-col justify-center"
                    >
                        <div className="space-y-4 mb-10">
                            <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-[10px] font-black text-amber-400 uppercase tracking-widest shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]">
                                Checkout
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white leading-[1.1]">
                                Upgrade Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                                    Trading Edge
                                </span>
                            </h1>
                            <p className="text-zinc-400 font-medium text-lg lg:text-xl max-w-lg leading-relaxed">
                                You are choosing the {selectedPlan.name} plan. Get ready to master the markets like never before.
                            </p>
                        </div>

                        {/* Feature List Card */}
                        <div className="rounded-[2rem] border border-white/[0.08] bg-[#0A0A0A]/80 backdrop-blur-md relative overflow-hidden shadow-2xl">
                            {/* Inner top highlight */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            
                            <div className="p-8 lg:p-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${selectedPlan.gradient} shadow-lg ${selectedPlan.glowColor}`}>
                                        <PlanIcon className="w-7 h-7 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-wide text-white">{selectedPlan.name}</h3>
                                        <p className="text-zinc-400 text-sm font-medium">{selectedPlan.tagline}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                    {selectedPlan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white/5 border border-white/10 shrink-0 mt-0.5">
                                                <Check className={`w-3 h-3 ${selectedPlan.color}`} />
                                            </div>
                                            <span className="text-sm text-zinc-300 font-medium leading-snug">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center gap-6 mt-10 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4" /> <span>SSL Encrypted</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-zinc-700" />
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> <span>Secure Payment</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-zinc-700" />
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4" /> <span>Cancel Anytime</span>
                            </div>
                        </div>
                    </motion.div>


                    {/* ── RIGHT COLUMN: Payment Block ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-5"
                    >
                        <div className="sticky top-32">
                            <div className={`rounded-[2rem] border overflow-hidden backdrop-blur-2xl shadow-2xl transition-all duration-500 ${selectedPlan.name === 'Spot Exclusive' ? 'bg-[#0F0F0F]/90 border-amber-500/30 shadow-[0_0_50px_-15px_rgba(245,158,11,0.2)]' : 'bg-[#0A0A0A]/90 border-white/10'}`}>
                                
                                <div className="px-8 py-6 border-b border-white/[0.04] flex items-center justify-between bg-black/20">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Order Summary</h3>
                                    <div className="text-white font-black">{selectedPlan.name}</div>
                                </div>

                                <div className="p-8 space-y-8">
                                    
                                    {/* Price Display */}
                                    <div className="flex items-end justify-between">
                                        <div className="space-y-1">
                                            <div className="text-sm text-zinc-400 font-bold uppercase tracking-wide">Total Due Today</div>
                                            <div className="text-5xl font-black text-white tracking-tighter">
                                                ${selectedPlan.monthlyPrice}<span className="text-xl text-zinc-500 uppercase tracking-wide font-bold ml-1">/mo</span>
                                            </div>
                                        </div>
                                    </div>

                                    {safePlanParam !== 'spot_basic' && (
                                        <>
                                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                            
                                            {/* Payment Selection */}
                                            <div className="space-y-4">
                                                <div className="text-xs font-black uppercase tracking-widest text-zinc-400">Select Payment Method</div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => setPaymentMethod('card')}
                                                        className={`relative py-4 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all overflow-hidden ${paymentMethod === 'card' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10 hover:bg-white/10 hover:text-zinc-300'}`}
                                                    >
                                                        {paymentMethod === 'card' && <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />}
                                                        <CreditCard className="w-6 h-6 z-10" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest z-10">Card / PayPal</span>
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => setPaymentMethod('crypto')}
                                                        className={`relative py-4 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all overflow-hidden ${paymentMethod === 'crypto' ? 'bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_20px_-5px_rgba(249,115,22,0.2)]' : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10 hover:bg-white/10 hover:text-zinc-300'}`}
                                                    >
                                                        {paymentMethod === 'crypto' && <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />}
                                                        <Bitcoin className="w-6 h-6 z-10" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest z-10">Crypto</span>
                                                    </button>
                                                </div>

                                                {/* ── Crypto Sub-Options ── */}
                                                <AnimatePresence>
                                                    {paymentMethod === 'crypto' && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                            className="overflow-hidden col-span-2"
                                                        >
                                                            <div className="pt-3 space-y-2">
                                                                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Choose Crypto Method</div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {/* Wallet — Coinbase Commerce */}
                                                                    <button
                                                                        onClick={() => setCryptoMethod('wallet')}
                                                                        className={`relative py-3.5 px-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all overflow-hidden ${cryptoMethod === 'wallet' ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]' : 'bg-white/[0.03] border-white/[0.06] text-zinc-500 hover:border-white/10 hover:text-zinc-300'}`}
                                                                    >
                                                                        {cryptoMethod === 'wallet' && <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />}
                                                                        <Wallet className="w-5 h-5 z-10" />
                                                                        <span className="text-[9px] font-black uppercase tracking-widest z-10">Wallet</span>
                                                                        <span className="text-[8px] font-medium text-zinc-500 z-10">Coinbase</span>
                                                                    </button>

                                                                    {/* Direct Crypto — NOWPayments */}
                                                                    <button
                                                                        onClick={() => setCryptoMethod('direct')}
                                                                        className={`relative py-3.5 px-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all overflow-hidden ${cryptoMethod === 'direct' ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_15px_-5px_rgba(34,197,94,0.3)]' : 'bg-white/[0.03] border-white/[0.06] text-zinc-500 hover:border-white/10 hover:text-zinc-300'}`}
                                                                    >
                                                                        {cryptoMethod === 'direct' && <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />}
                                                                        <Bitcoin className="w-5 h-5 z-10" />
                                                                        <span className="text-[9px] font-black uppercase tracking-widest z-10">Direct Crypto</span>
                                                                        <span className="text-[8px] font-medium text-zinc-500 z-10">300+ coins</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </>
                                    )}

                                    <div className="pt-2">
                                        <button
                                            onClick={handleCheckout}
                                            disabled={loading || !user && safePlanParam !== 'spot_basic'}
                                            className={`w-full py-5 rounded-xl font-black uppercase tracking-widest text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden ${
                                                safePlanParam === 'spot_basic' 
                                                    ? 'bg-white hover:bg-zinc-200 text-black shadow-xl shadow-white/10' 
                                                    : paymentMethod === 'crypto'
                                                        ? cryptoMethod === 'wallet'
                                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40'
                                                            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-xl shadow-green-500/30 hover:shadow-green-500/40'
                                                        : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-xl shadow-amber-500/30 hover:shadow-amber-500/40'
                                            }`}
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                    <>
                                                        {safePlanParam === 'spot_basic' 
                                                            ? 'Start Practicing Free' 
                                                            : paymentMethod === 'crypto' 
                                                                ? cryptoMethod === 'wallet'
                                                                    ? <><Wallet className="w-5 h-5" /> Pay via Wallet</>
                                                                    : <><Bitcoin className="w-5 h-5" /> Pay Direct Crypto</>
                                                                : 'Complete Checkout'}
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </span>
                                            {/* Shine effect */}
                                            <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                        </button>
                                    </div>

                                    <div className="text-center pt-2">
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                                            By proceeding, you agree to the <Link href="/terms" className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors">Terms of Service</Link>.
                                        </p>
                                    </div>
                                </div>

                            </div>
                            
                            {!user && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 text-center"
                                >
                                    <p className="text-sm font-medium text-zinc-400 bg-white/5 border border-white/10 inline-flex items-center px-4 py-2 rounded-lg">
                                        You are not logged in. You will be asked to create an account first.
                                    </p>
                                </motion.div>
                            )}
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
            <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    )
}
