import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect Dashboard Routes - DISABLED FOR GUEST MODE
    // if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    //     const url = request.nextUrl.clone()
    //     url.pathname = '/login'
    //     return NextResponse.redirect(url)
    // }

    // MANDATORY ONBOARDING CHECK
    // If user is logged in, hasn't completed onboarding, and isn't on onboarding/checkout/api pages
    if (user) {
        const path = request.nextUrl.pathname

        // Skip check for these paths to avoid infinite loops
        const isAllowedPath =
            path.startsWith('/onboarding') ||
            path.startsWith('/checkout') ||
            path.startsWith('/auth') ||
            path.startsWith('/api') ||
            path === '/' ||
            path.startsWith('/_next') ||
            path.includes('.') // Assets

        if (!isAllowedPath) {
            // MOVED TO DASHBOARD LAYOUT to prevent Edge Middleware Timeouts (504)
            // The check for onboarding_completed now happens in the server component
        }
    }


    // REFERRAL TRACKING
    const ref = request.nextUrl.searchParams.get('ref')
    if (ref) {
        // Set cookie for 30 days
        supabaseResponse.cookies.set('affiliate_ref', ref, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: false, // Allow client access if needed, or secure? better httpOnly usually but client might need to know? 
            // Actually, for signups, server handles it.
            // But if we want to show "You are being referred by X", client needs it.
            // Let's keep httpOnly: false for now or default.
        })
    }

    return supabaseResponse
}
