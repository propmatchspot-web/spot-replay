'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Star } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

interface TimeframeSelectorProps {
    value: string
    onValueChange: (value: string) => void
}

const ALL_TIMEFRAMES = [
    { label: 'MINUTES', items: ['1m', '3m', '5m', '15m', '30m', '45m'] },
    { label: 'HOURS', items: ['1h', '2h', '4h'] },
    { label: 'DAYS', items: ['D', 'W', 'M'] },
]

const DEFAULT_FAVORITES = ['15m', '1h', '4h', 'D']

export function TimeframeSelector({ value, onValueChange }: TimeframeSelectorProps) {
    const [favorites, setFavorites] = useState<string[]>([])

    // Load favorites from local storage
    useEffect(() => {
        const saved = localStorage.getItem('timeframe_favorites')
        if (saved) {
            setFavorites(JSON.parse(saved))
        } else {
            setFavorites(DEFAULT_FAVORITES)
        }
    }, [])

    const toggleFavorite = (tf: string, e: React.MouseEvent) => {
        e.stopPropagation()
        let newFavorites
        if (favorites.includes(tf)) {
            newFavorites = favorites.filter(f => f !== tf)
        } else {
            newFavorites = [...favorites, tf]
        }
        setFavorites(newFavorites)
        localStorage.setItem('timeframe_favorites', JSON.stringify(newFavorites))
    }

    return (
        <div className="flex items-center">
            {/* Favorite Timeframes */}
            {favorites.map(tf => (
                <Button
                    key={tf}
                    variant="ghost"
                    className={`h-8 min-w-[32px] px-2 text-sm font-medium hover:bg-[#2a2e39] ${value === tf ? 'text-[#2962ff]' : 'text-[#d1d4dc]'}`}
                    onClick={() => onValueChange(tf)}
                >
                    {tf}
                </Button>
            ))}

            {/* Dropdown for All Timeframes */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-6 text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]">
                        <ChevronDown className="w-3 h-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc] min-w-[150px] max-h-[400px] overflow-y-auto">
                    {ALL_TIMEFRAMES.map((group, i) => (
                        <div key={group.label}>
                            {i > 0 && <DropdownMenuSeparator className="bg-[#2a2e39]" />}
                            <DropdownMenuLabel className="text-[10px] text-[#787b86] px-2 py-1">{group.label}</DropdownMenuLabel>
                            {group.items.map(tf => (
                                <DropdownMenuItem
                                    key={tf}
                                    className={`flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer focus:bg-[#2a2e39] focus:text-white ${value === tf ? 'bg-[#2a2e39] text-[#2962ff]' : ''}`}
                                    onClick={() => onValueChange(tf)}
                                >
                                    <span>{tf === 'D' ? '1 day' : tf === 'W' ? '1 week' : tf === 'M' ? '1 month' : tf.replace('m', ' minutes').replace('h', ' hours')}</span>
                                    <div
                                        role="button"
                                        className={`p-1 hover:text-[#f2a900] ${favorites.includes(tf) ? 'text-[#f2a900]' : 'text-[#787b86]'}`}
                                        onClick={(e) => toggleFavorite(tf, e)}
                                    >
                                        <Star className="w-3 h-3 fill-current" />
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
