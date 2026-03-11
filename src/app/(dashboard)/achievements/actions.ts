'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function unlockAchievement(badgeCode: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Achievement Definitions
    const ACHIEVEMENTS = {
        'FIRST_TRADE': { title: 'First Steps', description: 'Completed your first trade' },
        'PROFITABLE_WEEK': { title: 'Consistent Earner', description: 'Ended the week in profit' },
        'DISCIPLINED_TRADER': { title: 'Disciplined Trader', description: 'Followed all trading rules for 10 trades' },
        'HIGH_WINRATE': { title: 'Sharpshooter', description: 'Achieved a win rate above 60% over 20 trades' },
        'FUNDED_TRADER': { title: 'Funded Trader', description: 'Successfully passed a prop firm challenge' },
        'RISK_MANAGER': { title: 'Risk Manager', description: 'Kept risk below 2% for 50 consecutive trades' }
    } as const

    const achievement = ACHIEVEMENTS[badgeCode as keyof typeof ACHIEVEMENTS]
    if (!achievement) return { error: 'Invalid achievement code' }

    // Check if already unlocked
    const { data: existing } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_code', badgeCode)
        .single()

    if (existing) return { success: true, alreadyUnlocked: true }

    const { error } = await supabase
        .from('achievements')
        .insert({
            user_id: user.id,
            badge_code: badgeCode,
            title: achievement.title,
            description: achievement.description,
            unlocked_at: new Date().toISOString()
        })

    if (error) {
        console.error('Unlock achievement error:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true, newUnlock: true }
}
