'use client'

import { useEffect, useRef } from 'react'
import {
    RefreshCcw, Copy, Bell, TrendingUp, TrendingDown,
    PlusCircle, Trash2, Settings, Table, ListTree
} from 'lucide-react'

interface ChartContextMenuProps {
    x: number
    y: number
    price: number
    pair: string
    onClose: () => void
    onAction: (action: string, payload?: any) => void
}

export function ChartContextMenu({ x, y, price, pair, onClose, onAction }: ChartContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    // Prevent default context menu
    useEffect(() => {
        const handleContextMenu = (e: Event) => e.preventDefault()
        menuRef.current?.addEventListener('contextmenu', handleContextMenu)
        return () => menuRef.current?.removeEventListener('contextmenu', handleContextMenu)
    }, [])

    const handleAction = (action: string, payload?: any) => {
        onAction(action, payload)
        onClose()
    }

    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-64 bg-[#1e222d] border border-[#2a2e39] rounded-md shadow-xl py-1 text-[#d1d4dc] text-sm select-none"
            style={{ left: x, top: y }}
        >
            <div
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2e39] cursor-pointer"
                onClick={() => handleAction('reset')}
            >
                <RefreshCcw className="w-4 h-4" />
                <span>Reset chart view</span>
                <span className="ml-auto text-xs text-[#787b86]">Alt + R</span>
            </div>

            <div className="h-px bg-[#2a2e39] my-1" />

            <div
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2e39] cursor-pointer"
                onClick={() => {
                    navigator.clipboard.writeText(price.toFixed(2))
                    handleAction('copy_price')
                }}
            >
                <Copy className="w-4 h-4" />
                <span>Copy price {price.toFixed(2)}</span>
            </div>

            <div className="h-px bg-[#2a2e39] my-1" />

            <div
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2e39] cursor-pointer"
                onClick={() => handleAction('alert', { price })}
            >
                <Bell className="w-4 h-4" />
                <span>Add alert on {pair} at {price.toFixed(2)}...</span>
                <span className="ml-auto text-xs text-[#787b86]">Alt + A</span>
            </div>

            <div
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2e39] cursor-pointer"
                onClick={() => handleAction('trade', { type: 'LIMIT', side: 'SHORT', price })}
            >
                <TrendingDown className="w-4 h-4" />
                <span>Sell 1 {pair} @ {price.toFixed(2)} limit</span>
            </div>

            <div
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2e39] cursor-pointer"
                onClick={() => handleAction('trade', { type: 'STOP', side: 'LONG', price })}
            >
                <TrendingUp className="w-4 h-4" />
                <span>Buy 1 {pair} @ {price.toFixed(2)} stop</span>
            </div>

            <div
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2e39] cursor-pointer"
                onClick={() => handleAction('trade', { type: 'LIMIT', price })}
            >
                <PlusCircle className="w-4 h-4" />
                <span>Add order on {pair} at {price.toFixed(2)}...</span>
            </div>

            <div className="h-px bg-[#2a2e39] my-1" />

            <div className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2e39] cursor-pointer text-zinc-500 cursor-not-allowed">
                <span>Lock vertical cursor line by time</span>
            </div>

            <div className="h-px bg-[#2a2e39] my-1" />

            <div className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2e39] cursor-pointer text-zinc-500 cursor-not-allowed">
                <Table className="w-4 h-4" />
                <span>Table view</span>
            </div>

            <div className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2e39] cursor-pointer text-zinc-500 cursor-not-allowed">
                <ListTree className="w-4 h-4" />
                <span>Object Tree...</span>
            </div>

            <div className="h-px bg-[#2a2e39] my-1" />

            <div
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2e39] cursor-pointer"
                onClick={() => handleAction('remove_drawings')}
            >
                <Trash2 className="w-4 h-4" />
                <span>Remove drawings</span>
            </div>

            <div
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2e39] cursor-pointer"
                onClick={() => handleAction('settings')}
            >
                <Settings className="w-4 h-4" />
                <span>Settings...</span>
            </div>
        </div>
    )
}
