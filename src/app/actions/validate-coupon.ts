'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// We MUST use the service role key here to bypass RLS and confidently read coupon data securely on the server
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function validateCoupon(code: string) {
    try {
        if (!code) return { success: false, error: 'Please enter a coupon code.' }

        // Sanitize code
        const upperCode = code.trim().toUpperCase()

        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', upperCode)
            .single()

        if (error || !coupon) {
            return { success: false, error: 'Invalid coupon code.' }
        }

        if (!coupon.is_active) {
            return { success: false, error: 'This coupon is no longer active.' }
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return { success: false, error: 'This coupon has expired.' }
        }

        if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
            return { success: false, error: 'This coupon has reached its usage limit.' }
        }

        // Return the valid percentage
        return { 
            success: true, 
            discountPercentage: coupon.discount_value,
            couponId: coupon.id
        }

    } catch (err) {
        console.error('Validate coupon error:', err)
        return { success: false, error: 'An error occurred while validating the coupon.' }
    }
}
