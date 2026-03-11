import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { AutoUpgradeTrigger } from '@/components/upgrade/AutoUpgradeTrigger'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AccountProvider } from '@/context/AccountContext'
import { Providers } from '@/components/Providers'
import { PlanEnforcementWrapper } from '@/components/auth/PlanEnforcementWrapper'
import { cookies } from 'next/headers'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    // Security: Auth Check
    if (!authUser) {
        redirect('/login')
    }

    const user = authUser

    // Fetch user accounts (will return empty for guest)
    const { data: accounts } = user ? await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }) : { data: [] }

    // Check actual subscription status
    const { data: userProfile } = user ? await supabase
        .from('users')
        .select('subscription_status, plan_tier, onboarding_completed')
        .eq('id', user.id)
        .single() : { data: null }

    // =============================================================
    // BULLETPROOF ONBOARDING GATE
    // =============================================================
    const cookieStore = await cookies()
    const onboardedCookie = cookieStore.get('spotreplay_onboarded')?.value
    
    if (onboardedCookie === 'true') {
        // Fast path: trust the cookie primarily, but sync DB if needed
        if (!userProfile || userProfile.onboarding_completed !== true) {
            try {
                // Fire and forget sync (don't block render)
                await supabase.from('users').upsert({
                    id: user.id,
                    email: user.email,
                    onboarding_completed: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' }).then(({ error }) => {
                    if (error) console.error("Silent sync failed", error)
                })
            } catch { /* ignore */ }
        }
    } else if (userProfile?.onboarding_completed === true) {
        // Fallback: DB says yes, but cookie is missing (e.g. cleared cookies)
        // Next.js middleware should ideally set this, but we're safe here.
    } else {
        // Both say no -> Redirect immediately
        redirect('/onboarding')
    }

    // Check if we need to enforce plan (User selected paid plan but has no active subscription)
    const isActive = userProfile?.subscription_status === 'active' ||
        userProfile?.subscription_status === 'trialing' ||
        userProfile?.subscription_status === 'free' ||
        !userProfile?.subscription_status // No profile = free tier

    return (
        <AccountProvider initialAccounts={accounts || []}>
            <Providers>
                <div className="flex h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#0a0a0a] to-[#050505] text-zinc-50">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                    <div className="relative z-10 flex h-full w-full">
                        <Sidebar />
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <Topbar />
                            <main className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-thin scrollbar-thumb-amber-900/40 scrollbar-track-transparent">
                                <div className="mx-auto max-w-7xl">
                                    {children}
                                </div>
                            </main>
                        </div>
                    </div>
                    <AutoUpgradeTrigger />
                </div>
                <PlanEnforcementWrapper isActive={isActive} userPlanTier={userProfile?.plan_tier} />
            </Providers>
        </AccountProvider>
    )
}
