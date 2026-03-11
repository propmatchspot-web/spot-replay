'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDailyPlan() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get today's plan
    const { data } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single()

    return data
}

export async function upsertDailyPlan(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const bias = formData.get('bias') as string
    const notes = formData.get('notes') as string
    const checklist = JSON.parse(formData.get('checklist') as string)

    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
        .from('daily_plans')
        .upsert({
            user_id: user.id,
            date: today,
            bias,
            notes,
            checklist
        }, { onConflict: 'user_id, date' })

    if (error) {
        console.error('Error saving daily plan:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/war-room')
    return { success: true }
}
