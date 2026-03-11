'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, Target, AlertTriangle, Shield, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DeleteAccountDialog } from '@/components/accounts/DeleteAccountDialog'

interface AccountOverviewProps {
    account: any
    currentBalance: number
    totalPnL: number
    dailyPnL: number
    dailyPeakBalance?: number
}

export function AccountOverview({ account, currentBalance, totalPnL, dailyPnL, dailyPeakBalance }: AccountOverviewProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const initialBalance = Number(account.initial_balance) || 0
    const currency = account.currency || 'USD'

    // Calculate percentages
    const gain = currentBalance - initialBalance
    const percentageGain = initialBalance > 0 ? (gain / initialBalance) * 100 : 0

    // Targets & Limits
    const profitTarget = Number(account.profit_target)
    const maxDrawdownLimit = Math.abs(Number(account.max_drawdown_limit))
    const dailyDrawdownLimit = Math.abs(Number(account.daily_drawdown_limit))

    // Drawdown Types
    const maxDrawdownType = account.max_drawdown_type || 'STATIC'
    const dailyDrawdownType = account.daily_drawdown_type || 'STATIC'

    // High Water Mark (Dynamic for UI + DB persistence check)
    const highWaterMark = Math.max(
        Number(account.high_water_mark) || 0,
        initialBalance,
        currentBalance
    )

    // Progress Calculations
    const targetProgress = profitTarget ? Math.min((gain / profitTarget) * 100, 100) : 0

    // Max Drawdown Calculation
    // Static: Loss limit is fixed relative to Initial Balance
    // Trailing: Loss limit trails the High Water Mark
    const maxAllowedLevel = maxDrawdownType === 'TRAILING'
        ? highWaterMark - maxDrawdownLimit
        : initialBalance - maxDrawdownLimit

    const maxDrawdownRemaining = currentBalance - maxAllowedLevel

    // Daily Drawdown Calculation
    // Static: Based on Start of Day Balance (derived from Current - DailyPnL)
    // Trailing: Trails the Daily Peak Balance
    const startOfDayBalance = currentBalance - dailyPnL
    // Use passed dailyPeakBalance or fallback to startOfDayBalance (if no trades today yet)
    const effectiveDailyPeak = dailyPeakBalance !== undefined ? dailyPeakBalance : startOfDayBalance

    const dailyAllowedLevel = dailyDrawdownType === 'TRAILING'
        ? effectiveDailyPeak - dailyDrawdownLimit
        : startOfDayBalance - dailyDrawdownLimit

    const dailyDrawdownRemaining = currentBalance - dailyAllowedLevel

    // Progress for bars (Inverse of remaining)
    const drawdownProgress = maxDrawdownLimit
        ? Math.min(100, Math.max(0, ((maxDrawdownLimit - maxDrawdownRemaining) / maxDrawdownLimit) * 100))
        : 0

    const dailyDrawdownProgress = dailyDrawdownLimit
        ? Math.min(100, Math.max(0, ((dailyDrawdownLimit - dailyDrawdownRemaining) / dailyDrawdownLimit) * 100))
        : 0

    // Buffer Calculations
    const targetLeft = profitTarget ? Math.max(0, profitTarget - gain) : 0

    // Account Status Logic
    let accountStatus: 'ACTIVE' | 'PASSED' | 'FAILED' = 'ACTIVE'
    let failureReason = ''

    if (maxDrawdownLimit > 0 && maxDrawdownRemaining < 0) {
        accountStatus = 'FAILED'
        failureReason = 'Max Drawdown Breached'
    } else if (dailyDrawdownLimit > 0 && dailyDrawdownRemaining < 0) {
        accountStatus = 'FAILED'
        failureReason = 'Daily Drawdown Breached'
    } else if (profitTarget > 0 && targetLeft <= 0) {
        accountStatus = 'PASSED'
    }

    return (
        <div className="space-y-8">
            {/* Hero Section: Balance & Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-[#1a1205] via-zinc-950 to-black p-8 md:p-12 shadow-[0_0_50px_-15px_rgba(245,158,11,0.15)]"
            >
                {/* Background Effects */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-[#f97316]/10 blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-md">
                                <Wallet className="h-5 w-5 text-brand-gold" />
                            </div>
                            <span className="text-zinc-400 font-medium tracking-wide uppercase text-sm">{account.type} Account • {currency}</span>

                            {/* Status Badge */}
                            {accountStatus === 'PASSED' && (
                                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-brand-gold text-xs font-bold border border-amber-500/30 shadow-[0_0_10px_rgba(247,174,17,0.2)]">
                                    PASSED
                                </span>
                            )}
                            {accountStatus === 'FAILED' && (
                                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                    FAILED
                                </span>
                            )}
                            {accountStatus === 'ACTIVE' && (
                                <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold border border-zinc-700">
                                    ACTIVE
                                </span>
                            )}
                        </div>

                        <div className="relative">
                            <h2 className="text-6xl md:text-7xl font-black bg-gradient-to-br from-white via-white to-zinc-500 bg-clip-text text-transparent tracking-tight mb-2 drop-shadow-2xl">
                                {currency} {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h2>
                            <div className="absolute -inset-4 bg-brand-gold/5 blur-2xl -z-10 rounded-full" />
                        </div>

                        {failureReason ? (
                            <p className="text-red-400 font-medium flex items-center gap-2 mt-2 text-lg">
                                <AlertTriangle className="h-5 w-5" /> {failureReason}
                            </p>
                        ) : (
                            <div className={cn(
                                "flex items-center gap-2 text-lg font-medium mt-2",
                                gain > 0 ? "text-amber-400" : gain < 0 ? "text-red-400" : "text-zinc-400"
                            )}>
                                {gain !== 0 && (gain > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />)}
                                <span>{gain > 0 ? '+' : ''}{currency} {Math.abs(gain).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                <span className="text-zinc-500 font-normal">({percentageGain.toFixed(2)}% all time)</span>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats / Actions */}
                    <div className="flex flex-col gap-4 min-w-[200px]">
                        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-md">
                            <p className="text-xs text-zinc-500 mb-1">Initial Balance</p>
                            <p className="text-xl font-bold text-zinc-300">{currency} {initialBalance.toLocaleString()}</p>
                        </div>
                        <button
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-sm font-medium"
                        >
                            <Trash2 className="h-4 w-4" /> Manage Account
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Targets & Limits - Grid Layout */}
            {account.type?.toUpperCase() === 'FUNDED' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profit Target Card */}
                    {profitTarget > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-xl relative overflow-hidden group hover:border-brand-gold/30 transition-colors"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Target className="h-24 w-24 text-brand-gold" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-brand-gold/10 ring-1 ring-brand-gold/20">
                                        <Target className="h-5 w-5 text-brand-gold" />
                                    </div>
                                    <h3 className="font-bold text-white">Profit Target</h3>
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-zinc-400">Progress</span>
                                        <span className="text-brand-gold font-bold">{targetProgress.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max(0, targetProgress)}%` }}
                                            className="h-full bg-gradient-to-r from-amber-500 to-brand-gold shadow-[0_0_15px_rgba(247,174,17,0.5)]"
                                        />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-white mb-1">${gain.toFixed(0)} <span className="text-zinc-500 text-lg font-normal">/ ${profitTarget.toLocaleString()}</span></p>
                                <p className="text-xs text-zinc-500">${targetLeft.toLocaleString()} remaining</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Max Drawdown Card */}
                    {maxDrawdownLimit > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-xl relative overflow-hidden group hover:border-red-500/30 transition-colors"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Shield className="h-24 w-24 text-red-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-red-500/10 ring-1 ring-red-500/20">
                                        <Shield className="h-5 w-5 text-red-500" />
                                    </div>
                                    <h3 className="font-bold text-white">Max Drawdown</h3>
                                    <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase">{maxDrawdownType}</span>
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-zinc-400">Breach Level</span>
                                        <span className={cn("font-bold", drawdownProgress > 80 ? "text-red-400" : "text-zinc-300")}>{drawdownProgress.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, drawdownProgress)}%` }}
                                            className={cn("h-full shadow-[0_0_10px_rgba(239,68,68,0.5)]", drawdownProgress > 80 ? "bg-red-500" : "bg-red-500/60")}
                                        />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-white mb-1">${maxDrawdownRemaining.toLocaleString()}</p>
                                <p className="text-xs text-zinc-500">Buffer remaining</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Daily Drawdown Card */}
                    {dailyDrawdownLimit > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-xl relative overflow-hidden group hover:border-orange-500/30 transition-colors"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <AlertTriangle className="h-24 w-24 text-orange-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20">
                                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <h3 className="font-bold text-white">Daily Drawdown</h3>
                                    <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase">{dailyDrawdownType}</span>
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-zinc-400">Breach Level</span>
                                        <span className={cn("font-bold", dailyDrawdownProgress > 80 ? "text-orange-400" : "text-zinc-300")}>{dailyDrawdownProgress.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, dailyDrawdownProgress)}%` }}
                                            className={cn("h-full shadow-[0_0_10px_rgba(249,115,22,0.5)]", dailyDrawdownProgress > 80 ? "bg-orange-500" : "bg-orange-500/60")}
                                        />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-white mb-1">${dailyDrawdownRemaining.toLocaleString()}</p>
                                <p className="text-xs text-zinc-500">Buffer remaining today</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            <DeleteAccountDialog
                account={account}
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            />
        </div>
    )
}
