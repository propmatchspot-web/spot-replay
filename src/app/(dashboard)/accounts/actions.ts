'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAccount(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('accounts').insert({
        user_id: user.id,
        name: data.name,
        type: data.type,
        initial_balance: parseFloat(data.balance),
        current_balance: parseFloat(data.balance),
        currency: data.currency,
        prop_firm: data.type === 'FUNDED' ? data.propFirm : null,
        challenge_type: data.type === 'FUNDED' ? data.challengeType : null,
        program_type: data.type === 'FUNDED' ? data.programType : null,
        daily_drawdown_limit: data.dailyDrawdown ? parseFloat(data.dailyDrawdown) : null,
        max_drawdown_limit: data.maxDrawdown ? parseFloat(data.maxDrawdown) : null,
        daily_drawdown_type: data.dailyDrawdownType || 'STATIC',
        max_drawdown_type: data.maxDrawdownType || 'STATIC',
        high_water_mark: parseFloat(data.balance),
        profit_target: data.profitTarget ? parseFloat(data.profitTarget) : null,
        consistency_rule: data.consistencyRule,
        consistency_score: data.consistencyScore ? parseFloat(data.consistencyScore) : null,
    })

    if (error) {
        console.error('Create account error:', error)
        return { error: `DB Error: ${error.message} (Code: ${error.code})` }
    }

    revalidatePath('/')
    return { success: true }
}

export async function checkHasAccounts() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { count } = await supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    return (count || 0) > 0
}

export async function deleteAccount(accountId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Verify ownership before deleting
    const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .single()

    if (!account) {
        return { error: 'Account not found or access denied' }
    }

    const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)

    if (error) {
        console.error('Delete account error:', error)
        return { error: `DB Error: ${error.message}` }
    }

    revalidatePath('/')
    return { success: true }
}
