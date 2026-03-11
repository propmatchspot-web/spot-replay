'use client'

import {
    Wallet, Trophy, BarChart3, TrendingUp, Activity,
    Calendar, Clock, ArrowUpDown, Scale, Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Map icon names to components
const iconMap = {
    wallet: Wallet,
    trophy: Trophy,
    'bar-chart': BarChart3,
    'trending-up': TrendingUp,
    activity: Activity,
    calendar: Calendar,
    clock: Clock,
    'arrow-up-down': ArrowUpDown,
    scale: Scale,
    target: Target,
}

type IconName = keyof typeof iconMap

interface StatsWidgetProps {
    title: string
    value: string | number
    iconName: IconName
    trend?: string
    trendUp?: boolean
    color?: 'emerald' | 'cyan' | 'blue' | 'violet'
}

export function StatsWidget({ title, value, iconName, trend, trendUp, color = 'emerald' }: StatsWidgetProps) {
    const Icon = iconMap[iconName]

    // Fallback if icon not found
    if (!Icon) {
        console.warn(`StatsWidget: Icon "${iconName}" not found in iconMap`)
        return null
    }

    const colorStyles = {
        emerald: {
            gradient: 'from-emerald-500/20 via-transparent to-transparent',
            glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]',
            icon: 'text-emerald-400',
            iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
            iconRing: 'ring-emerald-500/20',
            bar: 'from-emerald-600 via-emerald-500 to-emerald-400',
            dot: 'bg-emerald-500',
        },
        cyan: {
            gradient: 'from-cyan-500/20 via-transparent to-transparent',
            glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.4)]',
            icon: 'text-cyan-400',
            iconBg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
            iconRing: 'ring-cyan-500/20',
            bar: 'from-cyan-600 via-cyan-500 to-cyan-400',
            dot: 'bg-cyan-500',
        },
        blue: {
            gradient: 'from-blue-500/20 via-transparent to-transparent',
            glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]',
            icon: 'text-blue-400',
            iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
            iconRing: 'ring-blue-500/20',
            bar: 'from-blue-600 via-blue-500 to-blue-400',
            dot: 'bg-blue-500',
        },
        violet: {
            gradient: 'from-violet-500/20 via-transparent to-transparent',
            glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.4)]',
            icon: 'text-violet-400',
            iconBg: 'bg-violet-500/10 group-hover:bg-violet-500/20',
            iconRing: 'ring-violet-500/20',
            bar: 'from-violet-600 via-violet-500 to-violet-400',
            dot: 'bg-violet-500',
        },
    }

    const styles = colorStyles[color]

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl group",
            "bg-gradient-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-900/80",
            "backdrop-blur-xl border border-zinc-800/50",
            "hover:border-zinc-700/80 transition-all duration-500 ease-out",
            "hover:-translate-y-1 hover:scale-[1.02]",
            styles.glow
        )}>
            {/* Animated gradient overlay */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                styles.gradient
            )} />

            {/* Subtle noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]" />

            {/* Glowing accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
                <div className={cn(
                    "h-full w-full bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity duration-500",
                    styles.bar
                )} />
                {/* Animated shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>

            <div className="relative z-10 p-6 md:p-7">
                {/* Top row: Icon + Trend */}
                <div className="flex justify-between items-start mb-5">
                    <div className={cn(
                        "p-3 rounded-xl ring-1 transition-all duration-300",
                        "group-hover:scale-110 group-hover:rotate-2",
                        styles.iconBg,
                        styles.iconRing
                    )}>
                        <Icon className={cn("h-5 w-5 transition-colors", styles.icon)} strokeWidth={2.5} />
                    </div>

                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                            "bg-zinc-950/60 backdrop-blur-sm border border-zinc-800/50",
                            "text-[11px] font-semibold tracking-wide",
                            trendUp ? "text-emerald-400" : "text-red-400"
                        )}>
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                trendUp ? "bg-emerald-400" : "bg-red-400"
                            )} />
                            {trendUp ? '↑' : '↓'} {trend}
                        </div>
                    )}
                </div>

                {/* Stats content */}
                <div className="space-y-1.5">
                    <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">
                        {title}
                    </h3>
                    <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none truncate group-hover:text-zinc-100 transition-colors"
                        title={value.toString()}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    )
}
