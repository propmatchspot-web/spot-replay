'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { AchievementCard } from '@/components/achievements/AchievementCard'
import { Trophy, Award, Star, Medal } from 'lucide-react'
import { unlockAchievement } from './actions'

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchAchievements = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .eq('user_id', user.id)
            .order('unlocked_at', { ascending: false })

        if (error) {
            console.error('Error fetching achievements:', error)
        }

        if (data) {
            setAchievements(data)
        }
        setLoading(false)
    }

    const handleSeedTestData = async () => {
        await unlockAchievement('FIRST_TRADE')
        fetchAchievements()
    }

    const checkAndUnlockAchievements = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Check for trades
        const { count } = await supabase
            .from('trades')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if (count && count > 0) {
            await unlockAchievement('FIRST_TRADE')
            // Re-fetch to show the new unlock
            fetchAchievements()
        }
    }

    useEffect(() => {
        fetchAchievements()
        checkAndUnlockAchievements()
    }, [])

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tight">Achievements</h1>
                    <p className="text-zinc-400 mt-1">Track your milestones and download certificates</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSeedTestData}
                        className="text-sm font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-wider"
                    >
                        Seed Test Data
                    </button>
                    <button
                        onClick={fetchAchievements}
                        className="text-sm font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider"
                    >
                        Refresh List
                    </button>
                    <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-[2rem] bg-zinc-900 animate-pulse border border-zinc-800" />
                    ))}
                </div>
            ) : achievements.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 rounded-[2rem] border border-dashed border-zinc-800 bg-zinc-900/50">
                    <div className="p-6 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
                        <Award className="h-12 w-12 text-zinc-600" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">No Achievements Yet</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto font-medium">
                        Start trading and hitting your targets to unlock exclusive achievements and certificates.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement) => (
                        <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                </div>
            )}
        </div>
    )
}
