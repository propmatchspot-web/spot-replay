'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { closeTrade } from '@/app/(dashboard)/trades/actions'
import { Calculator, Target, XCircle, ArrowRightLeft } from 'lucide-react'

interface CloseTradeDialogProps {
    trade: {
        id: string
        pair: string
        direction: string
        entry_price: number
        size: number
        stop_loss: number | null
        take_profit: number | null
    }
    trigger?: React.ReactNode
}

export function CloseTradeDialog({ trade, trigger }: CloseTradeDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [exitPrice, setExitPrice] = useState<string>('')
    const [pnl, setPnl] = useState<string>('')
    const [closingReason, setClosingReason] = useState<string>('MANUAL')
    const [error, setError] = useState<string | null>(null)

    // Auto-calculate P&L when exit price changes
    useEffect(() => {
        if (!exitPrice || isNaN(parseFloat(exitPrice))) return

        const exit = parseFloat(exitPrice)
        const entry = trade.entry_price
        const multiplier = trade.direction === 'LONG' ? 1 : -1

        // Rough estimation: (Exit - Entry) * Size * 100000 (Standard Lot)
        // This is just an estimation, user can edit it.
        const estimatedPnl = (exit - entry) * multiplier * trade.size * 100000
        setPnl(estimatedPnl.toFixed(2))
    }, [exitPrice, trade.entry_price, trade.direction, trade.size])

    const handleQuickAction = (type: 'TP' | 'SL' | 'BE') => {
        setClosingReason(type)
        if (type === 'TP' && trade.take_profit) {
            setExitPrice(trade.take_profit.toString())
        } else if (type === 'SL' && trade.stop_loss) {
            setExitPrice(trade.stop_loss.toString())
        } else if (type === 'BE') {
            setExitPrice(trade.entry_price.toString())
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsPending(true)
        setError(null)

        const formData = new FormData()
        formData.append('trade_id', trade.id)
        formData.append('exit_price', exitPrice)
        formData.append('pnl', pnl)
        formData.append('closing_reason', closingReason)

        const result = await closeTrade(formData)
        setIsPending(false)

        if (result?.error) {
            setError(result.error)
        } else {
            setOpen(false)
            window.location.reload()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <button className="text-sm text-emerald-400 hover:text-emerald-300">Result</button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Close Trade: {trade.pair} {trade.direction}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => handleQuickAction('TP')}
                        disabled={!trade.take_profit}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${closingReason === 'TP'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Target className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">TP Hit</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleQuickAction('SL')}
                        disabled={!trade.stop_loss}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${closingReason === 'SL'
                                ? 'bg-red-500/20 border-red-500 text-red-400'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <XCircle className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">SL Hit</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleQuickAction('BE')}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${closingReason === 'BE'
                                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                            }`}
                    >
                        <ArrowRightLeft className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">Break Even</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="exit_price" className="block text-sm font-medium text-zinc-400">
                                Exit Price
                            </label>
                            <input
                                type="number"
                                step="0.00001"
                                id="exit_price"
                                required
                                value={exitPrice}
                                onChange={(e) => {
                                    setExitPrice(e.target.value)
                                    setClosingReason('MANUAL')
                                }}
                                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="pnl" className="block text-sm font-medium text-zinc-400">
                                P&L (Realized)
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-zinc-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    id="pnl"
                                    required
                                    value={pnl}
                                    onChange={(e) => setPnl(e.target.value)}
                                    className="block w-full rounded-md border border-zinc-700 bg-zinc-900 pl-7 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50"
                        >
                            {isPending ? 'Closing Trade...' : 'Confirm Result'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
