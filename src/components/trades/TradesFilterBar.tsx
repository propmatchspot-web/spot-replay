'use client'

import { Search, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TradesFilterBarProps {
    filters: {
        search: string
        pair: string
        direction: string
        status: string
    }
    onFilterChange: (key: string, value: string) => void
    pairs: string[]
}

export function TradesFilterBar({ filters, onFilterChange, pairs }: TradesFilterBarProps) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search pair, notes..."
                    value={filters.search}
                    onChange={(e) => onFilterChange('search', e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                <select
                    value={filters.pair}
                    onChange={(e) => onFilterChange('pair', e.target.value)}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                    <option value="">All Pairs</option>
                    {pairs.map(pair => (
                        <option key={pair} value={pair}>{pair}</option>
                    ))}
                </select>

                <select
                    value={filters.direction}
                    onChange={(e) => onFilterChange('direction', e.target.value)}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                    <option value="">All Directions</option>
                    <option value="LONG">Long</option>
                    <option value="SHORT">Short</option>
                </select>

                <select
                    value={filters.status}
                    onChange={(e) => onFilterChange('status', e.target.value)}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                    <option value="">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                    <option value="BE">Break Even</option>
                </select>

                {(filters.search || filters.pair || filters.direction || filters.status) && (
                    <button
                        onClick={() => {
                            onFilterChange('search', '')
                            onFilterChange('pair', '')
                            onFilterChange('direction', '')
                            onFilterChange('status', '')
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </button>
                )}
            </div>
        </div>
    )
}
