'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useConfirm } from '@/components/ui/ConfirmDialog'

interface OrderEntryPanelProps {
    currentPrice: number
    onPlaceOrder: (type: 'LONG' | 'SHORT', size: number, sl: number, tp: number, orderType: 'MARKET' | 'LIMIT' | 'STOP', limitPrice?: number) => void
    balance: number
}

export function OrderEntryPanel({ currentPrice, onPlaceOrder, balance }: OrderEntryPanelProps) {
    const [useManualSize, setUseManualSize] = useState(false)
    const [quantity, setQuantity] = useState<number>(1)
    const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET')
    const [limitPrice, setLimitPrice] = useState<number>(0)
    const [riskPercent, setRiskPercent] = useState(1)
    const [stopLoss, setStopLoss] = useState<number>(0)
    const [takeProfit, setTakeProfit] = useState<number>(0)
    const { alert } = useConfirm()

    const calculateSize = () => {
        if (useManualSize) return quantity

        const entry = orderType === 'MARKET' ? currentPrice : limitPrice
        if (!stopLoss || stopLoss === entry) return 0
        const riskAmount = balance * (riskPercent / 100)
        const priceDiff = Math.abs(entry - stopLoss)
        return riskAmount / priceDiff
    }

    const handleOrder = async (type: 'LONG' | 'SHORT') => {
        const size = calculateSize()

        if (size <= 0) {
            // Show themed alert if size is invalid
            const entry = orderType === 'MARKET' ? currentPrice : limitPrice
            if (!useManualSize && (!stopLoss || stopLoss === entry)) {
                await alert({
                    title: 'Invalid Stop Loss',
                    description: 'Please set a valid Stop Loss to calculate position size based on risk.',
                    type: 'warning'
                })
            } else {
                await alert({
                    title: 'Invalid Position',
                    description: 'The calculated position size is invalid. Please check your inputs.',
                    type: 'warning'
                })
            }
            return
        }

        onPlaceOrder(type, size, stopLoss, takeProfit, orderType, limitPrice)
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4 w-80">
            <h3 className="font-bold text-zinc-100">Place Order</h3>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Balance</span>
                    <span className="text-zinc-100">${balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Current Price</span>
                    <span className="text-emerald-400 font-mono">${currentPrice.toFixed(2)}</span>
                </div>
            </div>

            {/* Order Type Selector */}
            <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {['MARKET', 'LIMIT', 'STOP'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setOrderType(type as any)}
                        className={`text-xs font-bold py-1.5 rounded ${orderType === type ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {orderType !== 'MARKET' && (
                <div className="space-y-2">
                    <Label>{orderType === 'LIMIT' ? 'Limit Price' : 'Stop Price'}</Label>
                    <Input
                        type="number"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(parseFloat(e.target.value))}
                        className="bg-zinc-950 border-zinc-800"
                        placeholder="Price"
                    />
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Position Size</Label>
                    <button
                        onClick={() => setUseManualSize(!useManualSize)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                    >
                        {useManualSize ? 'Switch to Risk %' : 'Switch to Manual Qty'}
                    </button>
                </div>

                {useManualSize ? (
                    <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value))}
                        className="bg-zinc-950 border-zinc-800"
                        placeholder="Quantity"
                    />
                ) : (
                    <div className="relative">
                        <Input
                            type="number"
                            value={riskPercent}
                            onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
                            step={0.1}
                            className="bg-zinc-950 border-zinc-800 pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">%</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label>Stop Loss</Label>
                    <Input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(parseFloat(e.target.value))}
                        className="bg-zinc-950 border-zinc-800"
                        placeholder="Price"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Take Profit</Label>
                    <Input
                        type="number"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
                        className="bg-zinc-950 border-zinc-800"
                        placeholder="Price"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                    onClick={() => handleOrder('LONG')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white w-full"
                >
                    <ArrowUpCircle className="mr-2 h-4 w-4" />
                    Buy
                </Button>
                <Button
                    onClick={() => handleOrder('SHORT')}
                    className="bg-red-500 hover:bg-red-600 text-white w-full"
                >
                    <ArrowDownCircle className="mr-2 h-4 w-4" />
                    Sell
                </Button>
            </div>
        </div>
    )
}
