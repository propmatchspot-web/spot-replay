'use client'

import { useState } from 'react'
import { Bot, Loader2 } from 'lucide-react'
import { analyzeTrade } from '@/app/(dashboard)/ai-coach/actions'
import { LimitReachedDialog } from '@/components/upgrade/LimitReachedDialog'
import { toast } from 'sonner'

export function AnalyzeButton({ tradeId }: { tradeId: string }) {
    const [loading, setLoading] = useState(false)
    const [showLimitDialog, setShowLimitDialog] = useState(false)

    const handleAnalyze = async () => {
        setLoading(true)
        try {
            await analyzeTrade(tradeId)
            toast.success("Analysis Complete!")
        } catch (error: any) {
            console.error("Analysis failed:", error)
            if (error.message.includes("Daily Limit Reached")) {
                setShowLimitDialog(true)
            } else {
                toast.error("Analysis Failed: " + error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Bot className="h-4 w-4" />
                )}
                {loading ? 'Analyzing...' : 'Analyze'}
            </button>

            <LimitReachedDialog
                open={showLimitDialog}
                onOpenChange={setShowLimitDialog}
                feature="vision"
            />
        </>
    )
}

