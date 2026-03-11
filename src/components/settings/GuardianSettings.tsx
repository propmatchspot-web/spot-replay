'use client'

import { Shield, Save, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
// Assuming we have a Switch component, if not will use native check
// Actually I don't see Switch in imports usually, I'll use standard input type checkbox styled.

export function GuardianSettings({ user }: { user: any }) {
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        is_enabled: false,
        daily_loss_limit: 500,
        max_daily_trades: 5,
        trading_hours_start: '09:00',
        trading_hours_end: '17:00'
    })

    useEffect(() => {
        if (user?.guardian_settings) {
            setSettings({ ...settings, ...user.guardian_settings })
        }
    }, [user])

    const handleSave = async () => {
        setLoading(true)
        const supabase = createClient()

        const { error } = await supabase
            .from('users')
            .update({ guardian_settings: settings })
            .eq('id', user.id)

        if (error) {
            toast.error("Failed to save Guardian settings")
        } else {
            toast.success("Guardian Activated & Updated")
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                    <Shield className="h-6 w-6 text-emerald-500" />
                    Prop Firm Guardian
                </h3>
                <p className="text-sm text-zinc-400 font-medium">
                    Strict risk rules to protect your funded accounts.
                </p>
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/50 p-8 space-y-8">

                {/* Master Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="space-y-1">
                        <div className="font-bold text-white">Guardian Active</div>
                        <div className="text-xs text-zinc-500">Enforce rules on all new trades</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.is_enabled}
                            onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>

                <div className={`grid gap-6 md:grid-cols-2 transition-opacity ${settings.is_enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 ml-1">Daily Loss Limit ($)</label>
                        <input
                            type="number"
                            value={settings.daily_loss_limit}
                            onChange={(e) => setSettings({ ...settings, daily_loss_limit: Number(e.target.value) })}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition-colors font-mono"
                        />
                        <p className="text-[10px] text-zinc-600">
                            Alerts triggers at 80%. Locks trading at 100%.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 ml-1">Max Daily Trades</label>
                        <input
                            type="number"
                            value={settings.max_daily_trades}
                            onChange={(e) => setSettings({ ...settings, max_daily_trades: Number(e.target.value) })}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition-colors font-mono"
                        />
                        <p className="text-[10px] text-zinc-600">
                            Prevents overtrading.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 ml-1">Trading Start (Local)</label>
                        <input
                            type="time"
                            value={settings.trading_hours_start}
                            onChange={(e) => setSettings({ ...settings, trading_hours_start: e.target.value })}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition-colors font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 ml-1">Trading End (Local)</label>
                        <input
                            type="time"
                            value={settings.trading_hours_end}
                            onChange={(e) => setSettings({ ...settings, trading_hours_end: e.target.value })}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition-colors font-mono"
                        />
                    </div>

                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 text-amber-500 text-xs">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p>
                        The Guardian cannot physically stop you from placing trades on your broker.
                        It acts as a journal lock and alert system. Discipline is still required.
                    </p>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        Save Rules
                    </button>
                </div>

            </div>
        </div>
    )
}
