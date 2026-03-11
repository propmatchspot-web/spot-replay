'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BarChart2, Maximize2, Settings2 } from 'lucide-react'

interface BacktestBottomBarProps {
    balance: number
    equity: number
    realizedPnl: number
    unrealizedPnl: number
    quantity: number
    onQuantityChange: (val: number) => void
    onBuy: () => void
    onSell: () => void
    onAnalytics: () => void
}

export function BacktestBottomBar({
    balance,
    equity,
    realizedPnl,
    unrealizedPnl,
    quantity,
    onQuantityChange,
    onBuy,
    onSell,
    onAnalytics
}: BacktestBottomBarProps) {
    return (
        <div className="h-16 bg-[#131722] border-t border-[#2a2e39] flex items-center justify-between px-4 shrink-0 shadow-[0_-1px_2px_rgba(0,0,0,0.1)] z-20">
            {/* Left: Logo & Trading Controls */}
            <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="flex items-center pr-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                    />
                </div>

                <div className="h-8 w-px bg-[#2a2e39]" />

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <Button
                        className="bg-[#089981] hover:bg-[#067a65] text-white font-bold w-24 h-9 shadow-lg shadow-emerald-900/20 transition-all border border-emerald-600/20"
                        onClick={onBuy}
                    >
                        Buy
                    </Button>
                    <Button
                        className="bg-[#F23645] hover:bg-[#c92533] text-white font-bold w-24 h-9 shadow-lg shadow-red-900/20 transition-all border border-red-600/20"
                        onClick={onSell}
                    >
                        Sell
                    </Button>

                    <div className="flex items-center gap-2 bg-[#1E222D] rounded-md border border-[#2a2e39] px-3 h-9 shadow-inner">
                        <span className="text-[10px] text-[#B2B5BE] font-bold uppercase tracking-wider">Qty</span>
                        <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => onQuantityChange(parseFloat(e.target.value))}
                            className="h-6 w-16 bg-transparent border-none text-right text-white focus-visible:ring-0 p-0 font-mono font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Center: Analytics */}
            <Button
                variant="outline"
                size="sm"
                onClick={onAnalytics}
                className="h-9 border-[#2a2e39] bg-[#1E222D] text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39] hover:border-[#2962ff] transition-all"
            >
                <BarChart2 className="mr-2 h-4 w-4" />
                Analytics
            </Button>

            {/* Right: Account Stats */}
            <div className="flex items-center gap-6 text-sm">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-[#50535E] uppercase font-bold tracking-wider">Balance</span>
                    <span className="font-mono text-white font-medium">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-[#50535E] uppercase font-bold tracking-wider">Realized PnL</span>
                    <span className={`font-mono font-medium ${realizedPnl >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                        ${realizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-[#50535E] uppercase font-bold tracking-wider">Unrealized PnL</span>
                    <span className={`font-mono font-medium ${unrealizedPnl >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                        ${unrealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                <div className="h-8 w-px bg-[#2a2e39] mx-2" />

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39]">
                        <Settings2 className="h-4.5 w-4.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39]">
                        <Maximize2 className="h-4.5 w-4.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
