import React from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChallengeStatusWidgetProps {
    rules: any
    status: any
    currentBalance: number
    initialBalance: number
    equity: number
}

export function ChallengeStatusWidget({ rules, status, currentBalance, initialBalance, equity }: ChallengeStatusWidgetProps) {
    if (!rules || !status) return null

    // Calculate Metrics
    const profit = equity - initialBalance
    const profitPercent = (profit / initialBalance) * 100

    // Daily Drawdown (Simplified for now, assumes status.current_daily_drawdown is updated by engine)
    const dailyDDPercent = status.current_daily_drawdown || 0

    // Max Drawdown
    const maxDDPercent = ((initialBalance - equity) / initialBalance) * 100

    // Status Colors
    const isFailed = status.state === 'FAILED'
    const isPassed = status.state === 'PASSED'

    return (
        <Card className="bg-[#0A0A0A] border-white/10 p-4 space-y-4 w-full max-w-xs">
            {/* Header / Status Badge */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Challenge Status</h3>
                {isFailed && <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><XCircle className="w-3 h-3" /> FAILED</span>}
                {isPassed && <span className="bg-green-500/20 text-green-500 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><CheckCircle className="w-3 h-3" /> PASSED</span>}
                {!isFailed && !isPassed && <span className="bg-blue-500/20 text-blue-500 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><Clock className="w-3 h-3" /> ACTIVE</span>}
            </div>

            {/* Profit Target */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Profit Target ({rules.profitTarget}%)</span>
                    <span className={cn("font-mono", profitPercent >= rules.profitTarget ? "text-green-500" : "text-white")}>
                        {profitPercent.toFixed(2)}%
                    </span>
                </div>
                <Progress value={(profitPercent / rules.profitTarget) * 100} className="h-1.5 bg-white/5" indicatorClassName="bg-green-500" />
            </div>

            {/* Daily Drawdown */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Daily Drawdown (Max {rules.dailyDrawdown}%)</span>
                    <span className={cn("font-mono", dailyDDPercent >= rules.dailyDrawdown ? "text-red-500" : "text-white")}>
                        {dailyDDPercent.toFixed(2)}%
                    </span>
                </div>
                <Progress value={(dailyDDPercent / rules.dailyDrawdown) * 100} className="h-1.5 bg-white/5" indicatorClassName="bg-red-500" />
            </div>

            {/* Max Drawdown */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Max Drawdown (Max {rules.maxDrawdown}%)</span>
                    <span className={cn("font-mono", maxDDPercent >= rules.maxDrawdown ? "text-red-500" : "text-white")}>
                        {maxDDPercent.toFixed(2)}%
                    </span>
                </div>
                <Progress value={(maxDDPercent / rules.maxDrawdown) * 100} className="h-1.5 bg-white/5" indicatorClassName="bg-red-500" />
            </div>

            {/* Info Footer */}
            <div className="pt-2 border-t border-white/5 flex justify-between text-[10px] text-muted-foreground">
                <span>Days: {status.days_traded} / {rules.minTradingDays}</span>
                {rules.timeLimit > 0 && <span>Limit: {rules.timeLimit} Days</span>}
            </div>
        </Card>
    )
}
