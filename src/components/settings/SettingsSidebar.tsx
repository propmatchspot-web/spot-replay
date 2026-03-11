'use client'

import { User, Shield, BarChart2, Palette, Link, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsSidebarProps {
    activeSection: string
    onSectionChange: (section: string) => void
}

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
    const items = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'account', label: 'Account', icon: Shield },
        { id: 'guardian', label: 'Prop Guardian', icon: Shield }, // Reusing Shield or maybe Lock
        { id: 'connectors', label: 'Connectors', icon: Link },
        { id: 'trading', label: 'Trading', icon: BarChart2 },
        { id: 'appearance', label: 'Appearance', icon: Palette },
    ]

    return (
        <nav className="space-y-1">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all",
                        activeSection === item.id
                            ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </button>
            ))}
        </nav>
    )
}
