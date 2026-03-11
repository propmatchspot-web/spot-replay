'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { SettingsSidebar } from '@/components/settings/SettingsSidebar'
import { ProfileSection } from '@/components/settings/ProfileSection'
import { AccountSection } from '@/components/settings/AccountSection'
import { ConnectorsSection } from '@/components/settings/ConnectorsSection'
import { BillingSection } from '@/components/settings/BillingSection'
import { GuardianSettings } from '@/components/settings/GuardianSettings'
import { TradingPreferences } from '@/components/settings/TradingPreferences'

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('profile')
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUser(user)
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (data) setProfile(data)
            }
            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tight">Settings</h1>
                <p className="text-zinc-400 mt-1">Manage your account and preferences</p>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row">
                <aside className="w-full lg:w-64">
                    <SettingsSidebar
                        activeSection={activeSection}
                        onSectionChange={setActiveSection}
                    />
                </aside>

                <main className="flex-1">
                    {activeSection === 'profile' && <ProfileSection user={user} profile={profile} />}
                    {activeSection === 'billing' && <BillingSection user={user} />}
                    {activeSection === 'account' && <AccountSection user={user} />}
                    {activeSection === 'guardian' && <GuardianSettings user={user} />}
                    {activeSection === 'connectors' && <ConnectorsSection user={user} />}
                    {activeSection === 'trading' && <TradingPreferences user={user} profile={profile} />}
                    {activeSection === 'appearance' && (
                        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm">
                            <p className="text-zinc-400">Theme settings coming soon. Default is Dark Mode.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
