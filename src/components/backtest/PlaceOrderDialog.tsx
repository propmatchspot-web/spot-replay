'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface PlaceOrderDialogProps {
    currentPrice: number
    balance: number
    strategies?: any[]
    onPlaceOrder: (
        side: 'LONG' | 'SHORT',
        size: number,
        sl: number,
        tp: number,
        orderType: 'MARKET' | 'LIMIT' | 'STOP',
        limitPrice?: number,
        strategyId?: string
    ) => void
    onClose: () => void
}

export function PlaceOrderDialog({ currentPrice, balance, onPlaceOrder, onClose, strategies = [] }: PlaceOrderDialogProps) {
    // Order State
    const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG')
    const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET')
    const [limitPrice, setLimitPrice] = useState<string>(currentPrice.toString())
    const [selectedStrategyId, setSelectedStrategyId] = useState<string>('')

    // Risk Management
    const [riskType, setRiskType] = useState<'PERCENT' | 'AMOUNT'>('PERCENT')
    const [riskValue, setRiskValue] = useState<string>('1')
    const [positionSize, setPositionSize] = useState<string>('0')

    // SL/TP
    const [hasSL, setHasSL] = useState(false)
    const [stopLoss, setStopLoss] = useState<string>('')
    const [slPips, setSlPips] = useState<string>('')
    const [hasTP, setHasTP] = useState(false)
    const [takeProfit, setTakeProfit] = useState<string>('')
    const [tpPips, setTpPips] = useState<string>('')

    const getEntryPrice = () => orderType === 'MARKET' ? currentPrice : parseFloat(limitPrice) || currentPrice
    const PIP_SIZE = 0.0001

    const handleSlPipsChange = (pips: string) => {
        setSlPips(pips)
        const entry = getEntryPrice()
        const pipsVal = parseFloat(pips)
        if (!isNaN(pipsVal)) {
            const priceDiff = pipsVal * PIP_SIZE
            const newSl = side === 'LONG' ? entry - priceDiff : entry + priceDiff
            setStopLoss(newSl.toFixed(5))
        }
    }

    const handleTpPipsChange = (pips: string) => {
        setTpPips(pips)
        const entry = getEntryPrice()
        const pipsVal = parseFloat(pips)
        if (!isNaN(pipsVal)) {
            const priceDiff = pipsVal * PIP_SIZE
            const newTp = side === 'LONG' ? entry + priceDiff : entry - priceDiff
            setTakeProfit(newTp.toFixed(5))
        }
    }

    const handleSlPriceChange = (price: string) => {
        setStopLoss(price)
        const entry = getEntryPrice()
        const priceVal = parseFloat(price)
        if (!isNaN(priceVal)) {
            const diff = Math.abs(entry - priceVal)
            setSlPips((diff / PIP_SIZE).toFixed(1))
        }
    }

    const handleTpPriceChange = (price: string) => {
        setTakeProfit(price)
        const entry = getEntryPrice()
        const priceVal = parseFloat(price)
        if (!isNaN(priceVal)) {
            const diff = Math.abs(entry - priceVal)
            setTpPips((diff / PIP_SIZE).toFixed(1))
        }
    }

    // Calculate Position Size based on Risk
    useEffect(() => {
        const entry = getEntryPrice()
        const sl = parseFloat(stopLoss)
        if (!hasSL || isNaN(sl) || sl === entry) return

        let riskAmount = 0
        if (riskType === 'PERCENT') {
            const pct = parseFloat(riskValue)
            if (!isNaN(pct)) riskAmount = balance * (pct / 100)
        } else {
            const amt = parseFloat(riskValue)
            if (!isNaN(amt)) riskAmount = amt
        }

        const priceDiff = Math.abs(entry - sl)
        if (priceDiff > 0) {
            const size = riskAmount / priceDiff
            setPositionSize(size.toFixed(2))
        }
    }, [riskType, riskValue, stopLoss, limitPrice, orderType, side, balance, hasSL, currentPrice])

    // Estimated PnL
    const estimatedLoss = riskType === 'PERCENT'
        ? balance * (parseFloat(riskValue) / 100)
        : parseFloat(riskValue)

    const estimatedProfit = hasTP && takeProfit && positionSize
        ? Math.abs(parseFloat(takeProfit) - getEntryPrice()) * parseFloat(positionSize)
        : 0

    const handleSubmit = () => {
        onPlaceOrder(
            side,
            parseFloat(positionSize),
            hasSL ? parseFloat(stopLoss) : 0,
            hasTP ? parseFloat(takeProfit) : 0,
            orderType,
            orderType !== 'MARKET' ? parseFloat(limitPrice) : undefined,
            selectedStrategyId
        )
        onClose()
    }

    return (
        <div className="space-y-3">
            {/* Logo + Risk/Reward Stats */}
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 flex items-center justify-center border border-emerald-500/20">
                    <Image src="/Replaylogo.png" alt="Spot Replay" width={22} height={22} className="object-contain" />
                </div>
                <div className="flex-1 flex items-center gap-2 bg-[#0A0A0A] rounded-lg border border-white/5 overflow-hidden">
                    <div className="flex-1 py-2 px-3 text-center">
                        <div className="text-[9px] text-[#787b86] uppercase font-bold tracking-wider">Risk</div>
                        <div className="text-[#ef4444] font-mono font-bold text-xs mt-0.5">-${estimatedLoss.toFixed(2)}</div>
                    </div>
                    <div className="h-8 w-px bg-white/5" />
                    <div className="flex-1 py-2 px-3 text-center">
                        <div className="text-[9px] text-[#787b86] uppercase font-bold tracking-wider">Reward</div>
                        <div className="text-[#00E676] font-mono font-bold text-xs mt-0.5">${estimatedProfit.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Risk Percentage Chips */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label className="text-[#94A3B8] text-[11px] font-semibold uppercase tracking-wider">Risk %</Label>
                    <Select onValueChange={(v) => {
                        if (v === 'CONSERVATIVE') { setRiskType('PERCENT'); setRiskValue('0.5') }
                        if (v === 'MODERATE') { setRiskType('PERCENT'); setRiskValue('1') }
                        if (v === 'AGGRESSIVE') { setRiskType('PERCENT'); setRiskValue('2') }
                        if (v === 'SNIPER') { setRiskType('PERCENT'); setRiskValue('3') }
                    }}>
                        <SelectTrigger className="h-5 w-[100px] text-[9px] bg-transparent border-white/10 text-[#94A3B8] rounded-md">
                            <SelectValue placeholder="Template" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0A0A] border-white/10 text-[#d1d4dc]">
                            <SelectItem value="CONSERVATIVE">Conservative</SelectItem>
                            <SelectItem value="MODERATE">Moderate</SelectItem>
                            <SelectItem value="AGGRESSIVE">Aggressive</SelectItem>
                            <SelectItem value="SNIPER">Sniper</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-6 gap-1">
                    {[0.3, 0.5, 0.7, 1, 2, 3].map((pct) => (
                        <button
                            key={pct}
                            onClick={() => { setRiskType('PERCENT'); setRiskValue(pct.toString()) }}
                            className={cn(
                                "text-[11px] py-1 rounded-md transition-all font-semibold",
                                riskType === 'PERCENT' && parseFloat(riskValue) === pct
                                    ? "bg-[#00E676] text-black shadow-lg shadow-emerald-500/10"
                                    : "bg-white/5 text-[#787b86] hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {pct}%
                        </button>
                    ))}
                </div>
            </div>

            {/* Side + Type Row */}
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <Label className="text-[#94A3B8] text-[10px] uppercase tracking-wider font-semibold">Side</Label>
                    <Select value={side} onValueChange={(v: any) => setSide(v)}>
                        <SelectTrigger className={cn(
                            "bg-[#0A0A0A] border-white/5 h-8 text-xs font-bold rounded-lg",
                            side === 'LONG' ? 'text-[#00E676]' : 'text-[#ef4444]'
                        )}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0A0A] border-white/10 text-[#d1d4dc]">
                            <SelectItem value="LONG" className="text-[#00E676]">Buy / Long</SelectItem>
                            <SelectItem value="SHORT" className="text-[#ef4444]">Sell / Short</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-[#94A3B8] text-[10px] uppercase tracking-wider font-semibold">Type</Label>
                    <Select value={orderType} onValueChange={(v: any) => setOrderType(v)}>
                        <SelectTrigger className="bg-[#0A0A0A] border-white/5 text-[#d1d4dc] h-8 text-xs rounded-lg">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0A0A] border-white/10 text-[#d1d4dc]">
                            <SelectItem value="MARKET">Market</SelectItem>
                            <SelectItem value="LIMIT">Limit</SelectItem>
                            <SelectItem value="STOP">Stop</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Size + Entry Row */}
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <Label className="text-[#94A3B8] text-[10px] uppercase tracking-wider font-semibold">Size</Label>
                    <Input
                        type="number"
                        value={positionSize}
                        onChange={(e) => setPositionSize(e.target.value)}
                        className="bg-[#0A0A0A] border-white/5 text-[#d1d4dc] h-8 text-xs rounded-lg focus-visible:ring-[#00E676]/30"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-[#94A3B8] text-[10px] uppercase tracking-wider font-semibold">Entry</Label>
                    <Input
                        type="number"
                        value={orderType === 'MARKET' ? currentPrice : limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        readOnly={orderType === 'MARKET'}
                        className={cn(
                            "bg-[#0A0A0A] border-white/5 text-[#d1d4dc] h-8 text-xs rounded-lg focus-visible:ring-[#00E676]/30",
                            orderType === 'MARKET' && "opacity-50 cursor-not-allowed"
                        )}
                        step="0.00001"
                    />
                </div>
            </div>

            {/* SL/TP Compact Section */}
            <div className="grid grid-cols-2 gap-2">
                {/* Stop Loss */}
                <div className="bg-[#0A0A0A] rounded-lg border border-white/5 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Switch checked={hasSL} onCheckedChange={setHasSL} className="data-[state=checked]:bg-[#ef4444] scale-75 origin-left" />
                        <span className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">Stop Loss</span>
                    </div>
                    {hasSL && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                            <Input
                                value={stopLoss}
                                onChange={(e) => handleSlPriceChange(e.target.value)}
                                placeholder="Price"
                                className="bg-white/5 border-0 text-[#d1d4dc] h-7 text-[11px] rounded-md focus-visible:ring-[#ef4444]/30"
                                step="0.00001"
                            />
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={slPips}
                                    onChange={(e) => handleSlPipsChange(e.target.value)}
                                    placeholder="Pips"
                                    className="bg-white/5 border-0 text-[#d1d4dc] h-7 text-[11px] pr-8 rounded-md focus-visible:ring-[#ef4444]/30"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#787b86] text-[9px]">pips</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Take Profit */}
                <div className="bg-[#0A0A0A] rounded-lg border border-white/5 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Switch checked={hasTP} onCheckedChange={setHasTP} className="data-[state=checked]:bg-[#00E676] scale-75 origin-left" />
                        <span className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">Take Profit</span>
                    </div>
                    {hasTP && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                            <Input
                                value={takeProfit}
                                onChange={(e) => handleTpPriceChange(e.target.value)}
                                placeholder="Price"
                                className="bg-white/5 border-0 text-[#d1d4dc] h-7 text-[11px] rounded-md focus-visible:ring-[#00E676]/30"
                                step="0.00001"
                            />
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={tpPips}
                                    onChange={(e) => handleTpPipsChange(e.target.value)}
                                    placeholder="Pips"
                                    className="bg-white/5 border-0 text-[#d1d4dc] h-7 text-[11px] pr-8 rounded-md focus-visible:ring-[#00E676]/30"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#787b86] text-[9px]">pips</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Strategy */}
            <div className="space-y-1">
                <Label className="text-[#94A3B8] text-[10px] uppercase tracking-wider font-semibold">Strategy</Label>
                <Select value={selectedStrategyId} onValueChange={setSelectedStrategyId}>
                    <SelectTrigger className="bg-[#0A0A0A] border-white/5 h-8 text-xs text-[#d1d4dc] rounded-lg">
                        <SelectValue placeholder="Select Strategy" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0A] border-white/10 text-[#d1d4dc]">
                        <SelectItem value="none">No Strategy</SelectItem>
                        {strategies.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
                <Button
                    variant="ghost"
                    className="flex-1 text-[#94A3B8] hover:text-white hover:bg-white/5 h-9 text-xs rounded-lg"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    className={cn(
                        "flex-[2] font-bold text-sm h-9 rounded-lg shadow-lg transition-all",
                        side === 'LONG'
                            ? 'bg-[#00E676] hover:bg-[#00C853] text-black shadow-emerald-500/20'
                            : 'bg-[#ef4444] hover:bg-[#d32f2f] text-white shadow-red-500/20'
                    )}
                    onClick={handleSubmit}
                >
                    {side === 'LONG' ? 'Buy / Long' : 'Sell / Short'}
                </Button>
            </div>
        </div>
    )
}
