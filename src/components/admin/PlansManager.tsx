'use client'

import { useState, useTransition } from 'react'
import { Plus, Edit2, CheckCircle2, Save, X, Trash2 } from 'lucide-react'
import { createPlan, togglePlanStatus } from '@/app/(admin)/actions'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Plan {
    id: string
    name: string
    price_monthly: number
    price_yearly: number
    features: string[] | any // Supabase JSON type can be loose
    limits: {
        ai_daily_limit?: number
        vision_limit?: number
    }
    is_active: boolean
}

export function PlansManager({ initialPlans }: { initialPlans: Plan[] }) {
    const [plans, setPlans] = useState(initialPlans)
    const [isPending, startTransition] = useTransition()
    const [isEditing, setIsEditing] = useState<string | null>(null) // Plan ID or null

    // Quick Toggle Status
    const handleToggleStatus = (planId: string, currentStatus: boolean) => {
        startTransition(async () => {
            try {
                // Optimistic
                setPlans(prev => prev.map(p => p.id === planId ? { ...p, is_active: !currentStatus } : p))
                await togglePlanStatus(planId, !currentStatus)
                toast.success(`Plan ${!currentStatus ? 'Activated' : 'Disabled'}`)
            } catch (error) {
                toast.error("Failed to toggle plan")
            }
        })
    }

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Plans & Pricing</h1>
                    <p className="text-zinc-500">Edit features, limits, and pricing dynamically.</p>
                </div>
                <button
                    onClick={() => toast.info("Create Plan modal would open here (Phase 2)")}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Plan
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className={`group relative rounded-2xl border ${plan.is_active ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-800 bg-zinc-950 opacity-60'} p-6 hover:border-zinc-700 transition-all`}>
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleToggleStatus(plan.id, plan.is_active)}
                                className={`p-2 rounded-lg hover:bg-zinc-800 ${plan.is_active ? 'text-zinc-400 hover:text-red-500' : 'text-zinc-600 hover:text-emerald-500'}`}
                                title={plan.is_active ? "Disable Plan" : "Enable Plan"}
                            >
                                {plan.is_active ? <Trash2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                            </button>
                            <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white">
                                <Edit2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 uppercase tracking-widest mb-3">
                                {plan.name}
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white">${plan.price_monthly}</span>
                                <span className="text-zinc-500 font-medium">/mo</span>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-zinc-800 pt-6">
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Limits</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center">
                                    <span className="font-mono font-bold text-white text-lg">{plan.limits?.ai_daily_limit}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase">Chat Limit</span>
                                </div>
                                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center">
                                    <span className="font-mono font-bold text-white text-lg">{plan.limits?.vision_limit}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase">Vision Limit</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mt-6">
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Features</div>
                            {/* @ts-ignore */}
                            {Array.isArray(plan.features) && plan.features.map((feature: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
