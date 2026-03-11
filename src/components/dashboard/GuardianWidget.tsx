'use client'

import { Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function GuardianWidget({ user }: { user: any }) {
    const [stats, setStats] = useState({
        todayPnL: 0,
        limit: 500,
        status: 'SAFE' as 'SAFE' | 'WARNING' | 'BREACHED',
        enabled: false
    })

    useEffect(() => {
        if (user?.guardian_settings) {
            const settings = user.guardian_settings
            const limit = settings.daily_loss_limit || 500
            const enabled = settings.is_enabled

            setStats({
                todayPnL: 0,
                limit,
                status: 'SAFE',
                enabled
            })
        }
    }, [user])

    if (!stats.enabled) {
        return (
            <div className={cn(
                "relative overflow-hidden rounded-2xl p-6",
                "bg-gradient-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-900/80",
                "backdrop-blur-xl border border-zinc-800/50",
                "hover:border-zinc-700/70 transition-all duration-500 group"
            )}>
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-zinc-800/50 flex items-center justify-center ring-1 ring-zinc-700/50">
                            <Shield className="h-5 w-5 text-zinc-500" />
                        </div>
                        <div>
                            <div className="font-bold text-white">Guardian Inactive</div>
                            <div className="text-xs text-zinc-500 mt-0.5">Enable in Settings to protect profits</div>
                        </div>
                    </div>
                    <a
                        href="/settings"
                        className={cn(
                            "text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-300",
                            "bg-zinc-800/80 hover:bg-zinc-700 text-white",
                            "border border-zinc-700/50 hover:border-zinc-600",
                            "hover:scale-105"
                        )}
                    >
                        Configure
                    </a>
                </div>
            </div>
        )
    }

    const percentage = Math.min(100, Math.abs(stats.todayPnL) / stats.limit * 100)
    const colorClasses = {
        SAFE: {
            text: 'text-emerald-400',
            bg: 'bg-emerald-500',
            glow: 'shadow-emerald-500/20',
            gradient: 'from-emerald-500/10 via-transparent',
            ring: 'ring-emerald-500/20',
        },
        WARNING: {
            text: 'text-amber-400',
            bg: 'bg-amber-500',
            glow: 'shadow-amber-500/20',
            gradient: 'from-amber-500/10 via-transparent',
            ring: 'ring-amber-500/20',
        },
        BREACHED: {
            text: 'text-red-400',
            bg: 'bg-red-500',
            glow: 'shadow-red-500/20',
            gradient: 'from-red-500/10 via-transparent',
            ring: 'ring-red-500/20',
        }
    }

    const colors = colorClasses[stats.status]

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl p-6",
            "bg-gradient-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-900/80",
            "backdrop-blur-xl border border-zinc-800/50",
            "hover:border-zinc-700/70 transition-all duration-500 group",
            `hover:shadow-[0_8px_40px_-12px] ${colors.glow}`
        )}>
            {/* Animated gradient overlay */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700",
                colors.gradient,
                "to-transparent pointer-events-none"
            )} />

            {/* Status Indicator - Left bar */}
            <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full overflow-hidden">
                <div className={`h-full w-full ${colors.bg}`} />
            </div>

            <div className="relative space-y-5 pl-2">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2.5 rounded-xl ring-1 transition-all duration-300",
                            "bg-zinc-800/50 group-hover:scale-110",
                            colors.ring
                        )}>
                            <Shield className={cn("h-5 w-5", colors.text)} strokeWidth={2} />
                        </div>
                        <span className="font-bold text-white tracking-wide">Guardian Status</span>
                    </div>
                    <div className={cn(
                        "text-[11px] font-bold px-3 py-1.5 rounded-lg",
                        "bg-zinc-950/60 backdrop-blur-sm border border-zinc-800/50",
                        colors.text
                    )}>
                        {stats.status}
                    </div>
                </div>

                {/* Drawdown Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Daily Drawdown</span>
                        <span className="text-zinc-400 font-mono">
                            ${Math.abs(stats.todayPnL).toFixed(0)} / ${stats.limit}
                        </span>
                    </div>
                    <div className="h-2.5 w-full bg-zinc-900/80 rounded-full overflow-hidden ring-1 ring-zinc-800/50">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-700 ease-out",
                                colors.bg
                            )}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-950/40 backdrop-blur-sm p-3 rounded-xl border border-zinc-800/40">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Trades Left</div>
                        <div className="font-mono font-bold text-white">5</div>
                    </div>
                    <div className="bg-zinc-950/40 backdrop-blur-sm p-3 rounded-xl border border-zinc-800/40">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Window</div>
                        <div className="font-mono font-bold text-emerald-400">OPEN</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
