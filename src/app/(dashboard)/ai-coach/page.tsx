'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { AICoachInterface } from '@/components/ai/AICoachInterface'

export default function AICoachPage() {
    const [trades, setTrades] = useState<any[]>([])
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const { data: tradesData } = await supabase
                .from('trades')
                .select('*')
                .eq('user_id', user.id)
                .order('open_time', { ascending: false })

            const { data: reportsData } = await supabase
                .from('ai_reports')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            setTrades(tradesData || [])
            setReports(reportsData || [])
            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="h-full">
            <AICoachInterface initialTrades={trades} initialReports={reports} />
        </div>
    )
}
