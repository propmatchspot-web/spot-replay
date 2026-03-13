'use server'

import { createClient } from '@/utils/supabase/server'

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1/invoice'

const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
    spot_exclusive: { monthly: 39, yearly: 390 },
}

/**
 * Create a NOWPayments invoice for direct crypto payment.
 * Returns the hosted invoice URL where users can pay with 300+ cryptocurrencies.
 */
export async function createNowPaymentsCheckout(
    planName: string,
    billingCycle: 'monthly' | 'yearly',
    couponId?: string
) {
    const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated. Please log in first.' }
    }

    const plan = PLAN_PRICES[planName.toLowerCase()]
    if (!plan) {
        return { error: 'Invalid plan selected.' }
    }

    let amount = billingCycle === 'monthly' ? plan.monthly : plan.yearly
    let appliedCouponDisplay = ''

    // Secure Server-side Coupon Verification & Discount Application
    if (couponId) {
        const { data: coupon } = await supabase
            .from('coupons')
            .select('*')
            .eq('id', couponId)
            .single()
            
        if (coupon && coupon.is_active && (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) && (coupon.max_uses === null || coupon.used_count < coupon.max_uses)) {
            const discountAmount = amount * (coupon.discount_value / 100)
            amount = Math.max(0, amount - discountAmount)
            appliedCouponDisplay = ` (Code: ${coupon.code})`
            
            // Increment the usage counter
            const serviceRoleClient = process.env.SUPABASE_SERVICE_ROLE_KEY 
                ? require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
                : supabase;
                
            const { error: updateError } = await serviceRoleClient.rpc('increment_coupon_usage', { coupon_id: couponId }).catch(() => null)
            
            // Fallback if RPC doesn't exist yet
            if (updateError || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
               await serviceRoleClient.from('coupons').update({ used_count: (coupon.used_count || 0) + 1 }).eq('id', couponId)
            }
        }
    }

    const planLabel = planName.charAt(0).toUpperCase() + planName.slice(1)

    if (!NOWPAYMENTS_API_KEY) {
        console.error('[NOWPayments] NOWPAYMENTS_API_KEY is not set.')
        return { error: 'Direct crypto payments are not configured. Please contact support.' }
    }

    try {
        const response = await fetch(NOWPAYMENTS_API_URL, {
            method: 'POST',
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price_amount: amount,
                price_currency: 'usd',
                order_id: `${planName}_${billingCycle}_${user.id}_${Date.now()}`,
                order_description: `Spot Replay ${planLabel} Plan — ${billingCycle} subscription`,
                success_url: 'https://replay.propmatchspot.com/dashboard?payment=success&method=nowpayments',
                cancel_url: `https://replay.propmatchspot.com/checkout?plan=${planName.toLowerCase()}`,
                is_fee_paid_by_user: true,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('[NOWPayments] API error:', errorData)
            return { error: 'Failed to create crypto checkout. Please try again.' }
        }

        const data = await response.json()
        const invoiceUrl = data?.invoice_url

        if (!invoiceUrl) {
            console.error('[NOWPayments] No invoice_url in response:', data)
            return { error: 'Failed to get checkout URL.' }
        }

        console.log(`[NOWPayments] ✅ Invoice created for ${user.email}: $${amount} ${billingCycle} ${planLabel}`)
        return { url: invoiceUrl }

    } catch (error: any) {
        console.error('[NOWPayments] Error:', error?.message || error)
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}
