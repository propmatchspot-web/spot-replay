'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import {
    LayoutDashboard,
    BookOpen,
    LineChart,
    BarChart3,
    Bot,
    Settings,
    LogOut,
    Calendar,
    Trophy,
    Target,
    History,
    Zap,
    ArrowUp // Added ArrowUp import
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: LineChart },
    { name: 'The War Room', href: '/war-room', icon: Zap },
    { name: 'Journal', href: '/journal', icon: BookOpen },
    { name: 'Notes', href: '/notes', icon: BookOpen },
    { name: 'Trades', href: '/trades', icon: LineChart },
    { name: 'Strategies', href: '/strategies', icon: Target },
    { name: 'Backtest', href: '/backtest', icon: History },
    { name: 'Achievements', href: '/achievements', icon: Trophy },
    { name: 'AI Coach', href: '/ai-coach', icon: Bot },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const accountId = searchParams.get('accountId')

    return (
        <div className="hidden h-full w-60 flex-col border-r border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl lg:flex">
            <div className="flex h-24 items-center gap-x-3 px-6 border-b border-white/5">
                <div className="relative h-16 w-48 overflow-hidden">
                    <Image
                        src="/Replaylogo.png"
                        alt="Spot Replay"
                        fill
                        sizes="160px"
                        className="object-contain object-left"
                        priority
                    />
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-y-4 overflow-y-auto px-4 py-6">
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-2">
                        <li>
                            <ul role="list" className="space-y-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href
                                    const href = accountId ? `${item.href}?accountId=${accountId}` : item.href
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={href}
                                                className={cn(
                                                    'group flex gap-x-3 rounded-xl p-3 text-sm font-medium transition-all duration-200',
                                                    isActive
                                                        ? 'bg-[#F7AE11]/10 text-[#F7AE11] shadow-[0_0_20px_-5px_rgba(247,174,17,0.3)]'
                                                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        'h-5 w-5 shrink-0 transition-colors',
                                                        isActive
                                                            ? 'text-[#F7AE11]'
                                                            : 'text-zinc-500 group-hover:text-zinc-300'
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                {item.name}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </li>
                        <li className="mt-auto flex items-center justify-between gap-2">
                            <Link
                                href="/login"
                                className="group flex flex-1 gap-x-3 rounded-xl p-3 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                            >
                                <LogOut
                                    className="h-5 w-5 shrink-0 text-zinc-500 group-hover:text-red-400 transition-colors"
                                    aria-hidden="true"
                                />
                                Sign out
                            </Link>
                            <ThemeToggle />
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
