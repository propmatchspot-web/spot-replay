'use client'

import { Crown, Check, Zap, Shield, CreditCard, User } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BillingSection({ user }: { user: any }) {
    const router = useRouter()
    const currentPlan = user?.plan_tier || 'SPOT_BASIC'

    const planDetails: Record<string, any> = {
        'SPOT_BASIC': {
            name: 'Spot Basic',
            color: 'text-zinc-400',
            bg: 'bg-zinc-800',
            icon: User,
            features: ['Up to 1 year of backtest data', '1 live session', 'Speed controls (1x-10x)', 'Basic analytics']
        },
        'SPOT_EXCLUSIVE': {
            name: 'Spot Exclusive',
            color: 'text-amber-500',
            bg: 'from-amber-500 to-yellow-600',
            icon: Crown,
            features: ['Unlimited historical data', 'Unlimited sessions', 'Speed controls (1x-50x)', 'Advanced analytics & P&L curves', 'Prop Firm simulation mode', 'Priority data loading']
        }
    }

    const currentDetails = planDetails[currentPlan] || planDetails['SPOT_BASIC']

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Billing & Plans</h3>
                <p className="text-sm text-zinc-400 font-medium">Manage your subscription and billing details.</p>
            </div>

            {/* Current Plan Card */}
            <div className="relative rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-widest ${currentPlan === 'SPOT_EXCLUSIVE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                        {currentPlan === 'SPOT_EXCLUSIVE' ? 'EXCLUSIVE' : 'BASIC'} PLAN
                    </span>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br shadow-lg ${currentPlan === 'SPOT_BASIC' ? 'bg-zinc-800' : currentDetails.bg
                            }`}>
                            <currentDetails.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tight">{currentDetails.name}</h4>
                            {currentPlan === 'SPOT_EXCLUSIVE' && <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">Active</p>}
                            {currentPlan === 'SPOT_BASIC' && <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Free Tier</p>}
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        {currentDetails.features.map((feat: string, i: number) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                <Check className={`h-4 w-4 ${currentPlan === 'SPOT_EXCLUSIVE' ? 'text-amber-500' : 'text-zinc-600'
                                    }`} />
                                <span>{feat}</span>
                            </div>
                        ))}
                    </div>

                    {currentPlan !== 'SPOT_EXCLUSIVE' && (
                        <button
                            onClick={() => router.push('/checkout?plan=spot_exclusive')}
                            className="w-full py-4 rounded-xl bg-amber-500 text-black font-black uppercase tracking-wider hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                        >
                            <Zap className="h-4 w-4 fill-black" />
                            Upgrade to Spot Exclusive
                        </button>
                    )}
                    {currentPlan === 'SPOT_EXCLUSIVE' && (
                        <div className="w-full py-4 rounded-xl bg-zinc-800 text-zinc-500 font-black uppercase tracking-wider text-center cursor-not-allowed">
                            You're on the top plan
                        </div>
                    )}
                </div>
            </div>

            {/* Payment History */}
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 opacity-50">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-5 w-5 text-zinc-500" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Payment History</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500 gap-2">
                    <CreditCard className="h-8 w-8 opacity-20" />
                    <span className="text-sm font-medium">No payment history found.</span>
                </div>
            </div>
        </div>
    )
}
