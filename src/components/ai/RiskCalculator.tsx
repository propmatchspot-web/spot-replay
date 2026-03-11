'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Calculator, DollarSign, Percent, Target, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

interface RiskCalculatorProps {
    entryPrice: number
    stopLoss: number
    takeProfit?: number
    accountBalance?: number
    riskPercent?: number
    direction: 'LONG' | 'SHORT'
    className?: string
}

interface RiskResult {
    lotSize: number
    riskAmount: number
    potentialProfit: number
    riskRewardRatio: number
    pipValue: number
    stopLossPips: number
    takeProfitPips?: number
}

export function RiskCalculator({
    entryPrice,
    stopLoss,
    takeProfit,
    accountBalance = 10000,
    riskPercent = 1,
    direction,
    className
}: RiskCalculatorProps) {
    const [result, setResult] = useState<RiskResult | null>(null)

    useEffect(() => {
        // Load saved settings
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('analysis_settings')
            if (saved) {
                const settings = JSON.parse(saved)
                // Could override defaults here
            }
        }
    }, [])

    useEffect(() => {
        if (!entryPrice || !stopLoss || entryPrice <= 0 || stopLoss <= 0) {
            setResult(null)
            return
        }

        const calculated = calculateRisk(
            entryPrice,
            stopLoss,
            takeProfit,
            accountBalance,
            riskPercent,
            direction
        )
        setResult(calculated)
    }, [entryPrice, stopLoss, takeProfit, accountBalance, riskPercent, direction])

    if (!result) return null

    return (
        <div className={cn(
            "bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4",
            className
        )}>
            <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-4 w-4 text-violet-400" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-violet-400">Risk Calculator</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Lot Size */}
                <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800">
                    <div className="flex items-center gap-1 text-[9px] text-zinc-500 uppercase mb-1">
                        <Target className="h-3 w-3" />
                        Lot Size
                    </div>
                    <div className="text-xl font-black font-mono text-white">
                        {result.lotSize.toFixed(2)}
                    </div>
                </div>

                {/* Risk Amount */}
                <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800">
                    <div className="flex items-center gap-1 text-[9px] text-zinc-500 uppercase mb-1">
                        <DollarSign className="h-3 w-3" />
                        Risk Amount
                    </div>
                    <div className="text-xl font-black font-mono text-red-400">
                        ${result.riskAmount.toFixed(2)}
                    </div>
                </div>

                {/* Potential Profit */}
                {takeProfit && (
                    <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800">
                        <div className="flex items-center gap-1 text-[9px] text-zinc-500 uppercase mb-1">
                            <TrendingUp className="h-3 w-3" />
                            Potential Profit
                        </div>
                        <div className="text-xl font-black font-mono text-emerald-400">
                            ${result.potentialProfit.toFixed(2)}
                        </div>
                    </div>
                )}

                {/* R:R */}
                {takeProfit && (
                    <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800">
                        <div className="flex items-center gap-1 text-[9px] text-zinc-500 uppercase mb-1">
                            <Percent className="h-3 w-3" />
                            Risk:Reward
                        </div>
                        <div className={cn(
                            "text-xl font-black font-mono",
                            result.riskRewardRatio >= 2 ? "text-emerald-400" :
                                result.riskRewardRatio >= 1 ? "text-amber-400" : "text-red-400"
                        )}>
                            1:{result.riskRewardRatio.toFixed(1)}
                        </div>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="mt-3 pt-3 border-t border-zinc-800 grid grid-cols-3 gap-2 text-xs">
                <div>
                    <span className="text-zinc-500">SL Distance:</span>
                    <span className="text-white ml-1">{result.stopLossPips.toFixed(1)} pips</span>
                </div>
                {result.takeProfitPips && (
                    <div>
                        <span className="text-zinc-500">TP Distance:</span>
                        <span className="text-white ml-1">{result.takeProfitPips.toFixed(1)} pips</span>
                    </div>
                )}
                <div>
                    <span className="text-zinc-500">Pip Value:</span>
                    <span className="text-white ml-1">${result.pipValue.toFixed(2)}</span>
                </div>
            </div>

            {result.riskRewardRatio < 1 && (
                <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-amber-400">R:R is below 1:1. Consider adjusting your targets.</span>
                </div>
            )}
        </div>
    )
}

// Calculation function (can be imported separately)
export function calculateRisk(
    entryPrice: number,
    stopLoss: number,
    takeProfit: number | undefined,
    accountBalance: number,
    riskPercent: number,
    direction: 'LONG' | 'SHORT'
): RiskResult {
    // Calculate risk amount
    const riskAmount = accountBalance * (riskPercent / 100)

    // Calculate pip distance (assuming forex with 4/5 decimal places, or crypto/gold)
    const isJPY = entryPrice < 200 && entryPrice > 50 // Rough JPY detection
    const isGold = entryPrice > 1000 && entryPrice < 5000

    let pipMultiplier = 0.0001 // Standard forex
    if (isJPY) pipMultiplier = 0.01
    if (isGold) pipMultiplier = 0.1

    const stopLossDiff = direction === 'LONG'
        ? entryPrice - stopLoss
        : stopLoss - entryPrice

    const stopLossPips = Math.abs(stopLossDiff / pipMultiplier)

    // Calculate pip value (assuming standard lot = 100,000 units)
    // For simplicity, estimate pip value
    const pipValue = isGold ? 10 : isJPY ? 1000 / entryPrice : 10

    // Calculate lot size
    const lotSize = riskAmount / (stopLossPips * pipValue)

    // Calculate take profit if provided
    let takeProfitPips: number | undefined
    let potentialProfit = 0
    let riskRewardRatio = 0

    if (takeProfit) {
        const tpDiff = direction === 'LONG'
            ? takeProfit - entryPrice
            : entryPrice - takeProfit

        takeProfitPips = Math.abs(tpDiff / pipMultiplier)
        potentialProfit = takeProfitPips * pipValue * lotSize
        riskRewardRatio = takeProfitPips / stopLossPips
    }

    return {
        lotSize: Math.max(0.01, lotSize),
        riskAmount,
        potentialProfit,
        riskRewardRatio,
        pipValue,
        stopLossPips,
        takeProfitPips,
    }
}

// Standalone calculator component for interactive use
export function StandaloneRiskCalculator() {
    const [entry, setEntry] = useState('')
    const [sl, setSl] = useState('')
    const [tp, setTp] = useState('')
    const [account, setAccount] = useState(10000)
    const [risk, setRisk] = useState(1)
    const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG')

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Entry Price</label>
                    <input
                        type="number"
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Stop Loss</label>
                    <input
                        type="number"
                        value={sl}
                        onChange={(e) => setSl(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Take Profit</label>
                    <input
                        type="number"
                        value={tp}
                        onChange={(e) => setTp(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Direction</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setDirection('LONG')}
                            className={cn(
                                "flex-1 py-2 rounded-lg font-bold text-sm",
                                direction === 'LONG'
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                            )}
                        >
                            LONG
                        </button>
                        <button
                            onClick={() => setDirection('SHORT')}
                            className={cn(
                                "flex-1 py-2 rounded-lg font-bold text-sm",
                                direction === 'SHORT'
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                            )}
                        >
                            SHORT
                        </button>
                    </div>
                </div>
            </div>

            {entry && sl && (
                <RiskCalculator
                    entryPrice={parseFloat(entry)}
                    stopLoss={parseFloat(sl)}
                    takeProfit={tp ? parseFloat(tp) : undefined}
                    accountBalance={account}
                    riskPercent={risk}
                    direction={direction}
                />
            )}
        </div>
    )
}
