'use server'

import { createClient } from '@/utils/supabase/server'

const COINBASE_API_URL = 'https://api.commerce.coinbase.com/charges'

const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
    spot_exclusive: { monthly: 39, yearly: 390 },
}

/**
 * Create a Coinbase Commerce charge for crypto payment.
 * Returns the hosted checkout URL where users can pay with BTC, ETH, USDC, etc.
 */
export async function createCryptoCheckout(
    planName: string,
    billingCycle: 'monthly' | 'yearly',
    couponId?: string
) {
    // Read env var inside function body — NOT at module level.
    // Module-level reads can get cached/inlined at build time by Next.js,
    // causing the var to be undefined even when set in Vercel.
    const COINBASE_API_KEY = process.env.COINBASE_COMMERCE_API_KEY

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
            
        if (coupon && coupon.is_active && (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) && (coupon.max_uses === null || coupon.times_used < coupon.max_uses)) {
            const discountAmount = amount * (coupon.discount_percentage / 100)
            amount = Math.max(0, amount - discountAmount)
            appliedCouponDisplay = ` (Code: ${coupon.code})`
            
            // Increment the usage counter
            const serviceRoleClient = process.env.SUPABASE_SERVICE_ROLE_KEY 
                ? require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
                : supabase;
                
            const { error: updateError } = await serviceRoleClient.rpc('increment_coupon_usage', { coupon_id: couponId }).catch(() => null)
            
            // Fallback if RPC doesn't exist yet
            if (updateError || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
               await serviceRoleClient.from('coupons').update({ times_used: (coupon.times_used || 0) + 1 }).eq('id', couponId)
            }
        }
    }

    const planLabel = planName.charAt(0).toUpperCase() + planName.slice(1)

    if (!COINBASE_API_KEY) {
        console.error('[CryptoBilling] COINBASE_COMMERCE_API_KEY is not set. Value:', process.env.COINBASE_COMMERCE_API_KEY)
        return { error: 'Crypto payments are not configured. Please contact support.' }
    }

    try {
        const response = await fetch(COINBASE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CC-Api-Key': COINBASE_API_KEY,
                'X-CC-Version': '2018-03-22',
            },
            body: JSON.stringify({
                name: `Spot Replay ${planLabel} Plan`,
                description: `${planLabel} Plan — ${billingCycle} subscription`,
                pricing_type: 'fixed_price',
                local_price: {
                    amount: amount.toFixed(2),
                    currency: 'USD',
                },
                metadata: {
                    user_id: user.id,
                    user_email: user.email,
                    plan: planName.toLowerCase(),
                    billing_cycle: billingCycle,
                },
                redirect_url: 'https://replay.propmatchspot.com/dashboard?payment=success&method=crypto',
                cancel_url: `https://replay.propmatchspot.com/checkout?plan=${planName.toLowerCase()}`,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('[CryptoBilling] Coinbase API error:', errorData)
            return { error: 'Failed to create crypto checkout. Please try again.' }
        }

        const data = await response.json()
        const checkoutUrl = data?.data?.hosted_url

        if (!checkoutUrl) {
            console.error('[CryptoBilling] No hosted_url in response:', data)
            return { error: 'Failed to get checkout URL.' }
        }

        console.log(`[CryptoBilling] ✅ Charge created for ${user.email}: $${amount} ${billingCycle} ${planLabel}`)
        return { url: checkoutUrl }

    } catch (error: any) {
        console.error('[CryptoBilling] Error:', error?.message || error)
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}
