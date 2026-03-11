'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TradingPreferences({ user, profile }: { user: any, profile: any }) {
    const [preferences, setPreferences] = useState(profile?.trading_preferences || {
        default_risk: 1,
        default_pair: 'EURUSD',
        theme: 'dark'
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleSave = async () => {
        setLoading(true)
        setMessage('')

        const supabase = createClient()
        const { error } = await supabase
            .from('profiles')
            .update({ trading_preferences: preferences })
            .eq('id', user.id)

        if (error) {
            setMessage('Error updating preferences')
        } else {
            setMessage('Preferences saved successfully')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Trading Preferences</h3>
                <p className="text-sm text-zinc-400 font-medium">Customize your default trading settings.</p>
            </div>

            <div className="grid gap-6 rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
                <div className="grid gap-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Default Risk (%)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={preferences.default_risk}
                        onChange={(e) => setPreferences({ ...preferences, default_risk: parseFloat(e.target.value) })}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Default Pair</label>
                    <input
                        type="text"
                        value={preferences.default_pair}
                        onChange={(e) => setPreferences({ ...preferences, default_pair: e.target.value })}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    {message && (
                        <p className={cn("text-sm font-bold", message.includes('Error') ? 'text-red-500' : 'text-emerald-500')}>
                            {message}
                        </p>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="ml-auto flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black text-white uppercase tracking-wider hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    )
}
