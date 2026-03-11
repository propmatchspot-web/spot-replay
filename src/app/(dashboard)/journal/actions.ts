'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveJournalEntry(date: Date, content: string, mood?: string, rating?: number, emotions?: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Format date as YYYY-MM-DD to match database date type
    const dateStr = date.toISOString().split('T')[0]

    const { error } = await supabase
        .from('journal_entries')
        .upsert({
            user_id: user.id,
            date: dateStr,
            content,
            mood,
            rating,
            emotions,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, date'
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/journal')
    revalidatePath(`/journal/day/${dateStr}`)
    return { success: true }
}

export async function getJournalEntry(date: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: entry, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned", which is fine
        console.error('Error fetching journal entry:', error)
        return { success: false, error: error.message }
    }

    // Fetch trades for this day as well
    const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .gte('open_time', `${date}T00:00:00`)
        .lte('open_time', `${date}T23:59:59`)
        .order('open_time', { ascending: false })

    return { success: true, data: { entry, trades: trades || [] } }
}
