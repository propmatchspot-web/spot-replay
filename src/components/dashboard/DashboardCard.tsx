'use client'

import { Activity, Calendar, Clock, BarChart3, ArrowUpDown } from 'lucide-react'
import { ScatterChart as ScatterIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

// Map icon names to components
const iconMap = {
    activity: Activity,
    calendar: Calendar,
    clock: Clock,
    'bar-chart': BarChart3,
    'arrow-up-down': ArrowUpDown,
    scatter: ScatterIcon,
}

type IconName = keyof typeof iconMap

interface DashboardCardProps {
    title: string
    iconName: IconName
    color?: 'emerald' | 'blue' | 'orange' | 'pink' | 'indigo' | 'violet' | 'cyan' | 'amber' | 'brand-gold' | 'amber' | 'brand-gold'
    children: ReactNode
    className?: string
    headerAction?: ReactNode
    minHeight?: string
}

const colorStyles = {
    emerald: {
        bar: 'from-amber-600 via-amber-500 to-amber-400',
        iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/15',
        icon: 'text-amber-400',
        glow: 'group-hover:shadow-[0_8px_40px_-12px_rgba(16,185,129,0.25)]',
        gradient: 'from-amber-500/10 via-transparent',
    },
    blue: {
        bar: 'from-blue-600 via-blue-500 to-blue-400',
        iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/15',
        icon: 'text-blue-400',
        glow: 'group-hover:shadow-[0_8px_40px_-12px_rgba(59,130,246,0.25)]',
        gradient: 'from-blue-500/10 via-transparent',
    },
    orange: {
        bar: 'from-orange-600 via-orange-500 to-orange-400',
        iconBg: 'bg-orange-500/10 group-hover:bg-orange-500/15',
        icon: 'text-orange-400',
        glow: 'group-hover:shadow-[0_8px_40px_-12px_rgba(249,115,22,0.25)]',
        gradient: 'from-orange-500/10 via-transparent',
    },
    pink: {
        bar: 'from-pink-600 via-pink-500 to-pink-400',
        iconBg: 'bg-pink-500/10 group-hover:bg-pink-500/15',
        icon: 'text-pink-400',
        glow: 'group-hover:shadow-[0_8px_40px_-12px_rgba(236,72,153,0.25)]',
        gradient: 'from-pink-500/10 via-transparent',
    },
    indigo: {
        bar: 'from-indigo-600 via-indigo-500 to-indigo-400',
        iconBg: 'bg-indigo-500/10 group-hover:bg-indigo-500/15',
        icon: 'text-indigo-400',
        glow: 'group-hover:shadow-[0_8px_40px_-12px_rgba(99,102,241,0.25)]',
        gradient: 'from-indigo-500/10 via-transparent',
    },
    violet: {
        bar: 'from-violet-600 via-violet-500 to-violet-400',
        iconBg: 'bg-violet-500/10 group-hover:bg-violet-500/15',
        icon: 'text-violet-400',
        glow: 'group-hover:shadow-[0_8px_40px_-12px_rgba(139,92,246,0.25)]',
        gradient: 'from-violet-500/10 via-transparent',
    },
    cyan: {
        bar: 'from-cyan-600 via-cyan-500 to-cyan-400',
        iconBg: 'bg-cyan-500/10 group-hover:bg-cyan-500/15',
        icon: 'text-cyan-400',
        glow: 'group-hover:shadow-[0_8px_40px_-12px_rgba(6,182,212,0.25)]',
        gradient: 'from-cyan-500/10 via-transparent',
    },
    amber: {
        bar: 'from-amber-600 via-amber-500 to-amber-400',
        iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/15',
        icon: 'text-amber-400',
        glow: 'group-hover:shadow-[0_8px_40px_-12px_rgba(245,158,11,0.25)]',
        gradient: 'from-amber-500/10 via-transparent',
    },
    'brand-gold': {
        bar: 'from-[#F7AE11] via-[#F7AE11] to-amber-300',
        iconBg: 'bg-[#F7AE11]/10 group-hover:bg-[#F7AE11]/15',
        icon: 'text-[#F7AE11]',
        glow: 'group-hover:shadow-[0_8px_40px_-12px_rgba(247,174,17,0.3)]',
        gradient: 'from-[#F7AE11]/10 via-transparent',
    }
}

export function DashboardCard({
    title,
    iconName,
    color = 'emerald',
    children,
    className,
    headerAction,
    minHeight = 'min-h-[350px]'
}: DashboardCardProps) {
    const Icon = iconMap[iconName]
    const styles = colorStyles[color]

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl group",
            "bg-zinc-900/40",
            "backdrop-blur-xl border border-white/5",
            "hover:border-white/10 transition-all duration-500 ease-out hover:bg-zinc-900/60",
            styles.glow,
            className
        )}>
            {/* Animated gradient overlay on hover */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700",
                styles.gradient,
                "to-transparent pointer-events-none"
            )} />

            {/* Subtle radial gradient for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02),transparent)] pointer-events-none" />

            {/* Header */}
            <div className="relative px-6 py-5 border-b border-white/5 flex items-center justify-between">
                {/* Left accent line */}
                <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full overflow-hidden">
                    <div className={cn(
                        "h-full w-full bg-gradient-to-b",
                        styles.bar
                    )} />
                </div>

                <div className="flex items-center gap-3 pl-3">
                    <div className={cn(
                        "p-2.5 rounded-xl transition-all duration-300",
                        "ring-1 ring-zinc-800/50",
                        styles.iconBg
                    )}>
                        <Icon className={cn("h-5 w-5", styles.icon)} strokeWidth={2} />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-wide">
                        {title}
                    </h3>
                </div>

                {headerAction && (
                    <div className="relative z-10">
                        {headerAction}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={cn("relative p-6", minHeight)}>
                {children}
            </div>

            {/* Bottom accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
                <div className={cn(
                    "h-full w-full bg-gradient-to-r opacity-40 group-hover:opacity-70 transition-opacity duration-500",
                    styles.bar
                )} />
            </div>
        </div>
    )
}
