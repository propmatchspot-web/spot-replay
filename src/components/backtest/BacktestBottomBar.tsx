'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Maximize2, Settings2 } from 'lucide-react'

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
            {/* Left: Collaboration Logos */}
            <div className="flex items-center gap-3 pr-4">
                {/* Spot Replay Logo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/Replaylogo.png"
                    alt="Spot Replay"
                    className="h-8 w-auto object-contain"
                />
                {/* Cross sign */}
                <span className="text-amber-400/70 font-bold text-sm select-none">×</span>
                {/* Trading Journal Logo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/TJlogo.png"
                    alt="Trading Journal"
                    className="h-8 w-auto object-contain"
                />
            </div>

            <div className="h-8 w-px bg-[#2a2e39]" />

            {/* Center: Buy/Sell & Quantity */}
            <div className="flex items-center gap-3 flex-1 justify-center">
                <Button
                    className="bg-[#089981] hover:bg-[#067a65] text-white font-bold w-24 h-9 shadow-lg shadow-amber-900/20 transition-all border border-amber-600/20"
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

            <div className="h-8 w-px bg-[#2a2e39]" />

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
