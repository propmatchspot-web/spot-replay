'use server'

import { createClient } from '@/utils/supabase/server'

const LEMONSQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1/checkouts'

// ═══════════════════════════════════════════════════════════════
// SPOT REPLAY — Only 2 Plans: Spot Basic (Free) & Spot Exclusive
// ═══════════════════════════════════════════════════════════════

// Lemon Squeezy Variant IDs (from API scrape)
const PLAN_VARIANTS: Record<string, { monthly: string; yearly: string }> = {
    'SPOT_BASIC': {
        monthly: '1387795',   // Spot Free — $0/month
        yearly: '1387795'     // Same (free doesn't have yearly)
    },
    'SPOT_EXCLUSIVE': {
        monthly: '1387788',   // Spot Exclusive — $39/month
        yearly: '1387788'     // Same variant (single monthly billing)
    }
}

export async function getCheckoutUrl(plan: string, interval: 'monthly' | 'yearly' = 'monthly') {
    const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY
    const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User must be logged in to checkout')
    }

    const normalizedPlan = plan.toUpperCase()
    const variantId = PLAN_VARIANTS[normalizedPlan]?.[interval]

    if (!variantId) {
        throw new Error('Invalid plan or interval')
    }

    try {
        const payload = {
            data: {
                type: "checkouts",
                attributes: {
                    checkout_data: {
                        email: user.email,
                        custom: {
                            user_id: user.id,
                            plan_name: normalizedPlan,
                            interval: interval
                        }
                    },
                    product_options: {
                        redirect_url: 'https://replay.propmatchspot.com/dashboard',
                        receipt_button_text: "Go to Dashboard",
                        receipt_link_url: 'https://replay.propmatchspot.com/dashboard'
                    }
                },
                relationships: {
                    store: {
                        data: {
                            type: "stores",
                            id: LEMONSQUEEZY_STORE_ID
                        }
                    },
                    variant: {
                        data: {
                            type: "variants",
                            id: variantId
                        }
                    }
                }
            }
        }

        if (!LEMONSQUEEZY_STORE_ID) {
            console.error("Missing LEMONSQUEEZY_STORE_ID")
            throw new Error("Missing Store ID")
        }

        const response = await fetch(LEMONSQUEEZY_API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Lemon Squeezy API Error Status:', response.status, response.statusText)
            console.error('Lemon Squeezy API Error Body:', errorText)
            throw new Error(`Failed to create checkout: ${response.statusText} - ${errorText}`)
        }

        const data = await response.json()
        const checkoutUrl = data.data.attributes.url

        return { url: checkoutUrl }

    } catch (error) {
        console.error('Checkout Error Details:', error)
        return { error: 'Failed to initiate checkout' }
    }
}

/**
 * Set onboarding cookie to prevent redirect loops.
 */
export async function setOnboardingCookie() {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.set('spot_replay_onboarded', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
    })
    return { success: true }
}

/**
 * Mark onboarding as complete immediately when user picks a plan.
 */
export async function markOnboardingComplete() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const { error } = await supabase
        .from('users')
        .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            onboarding_completed: true,
        }, { onConflict: 'id' })

    if (error) {
        console.error('Failed to mark onboarding complete:', error)
        throw new Error('Failed to mark onboarding complete')
    }

    return { success: true }
}

/**
 * Activate the Spot Basic (Free) plan for a user.
 */
export async function activateFreePlan(): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Step 1: Minimal upsert — stop the onboarding loop
        const { error: minimalError } = await supabase
            .from('users')
            .upsert({
                id: user.id,
                email: user.email,
                onboarding_completed: true,
            }, { onConflict: 'id' })

        if (minimalError) {
            return { success: false, error: `DB Error: ${minimalError.message}` }
        }

        // Step 2: Set plan_tier to SPOT_BASIC
        const { error: enhanceError } = await supabase
            .from('users')
            .update({
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                plan_tier: 'SPOT_BASIC',
                subscription_status: 'active',
            })
            .eq('id', user.id)

        if (enhanceError) {
            console.warn('[activateFreePlan] Step 2 WARN:', JSON.stringify(enhanceError))
        }

        return { success: true }

    } catch (err: any) {
        console.error('[activateFreePlan] UNEXPECTED ERROR:', err?.message || err)
        return { success: false, error: err?.message || 'Unexpected error' }
    }
}
