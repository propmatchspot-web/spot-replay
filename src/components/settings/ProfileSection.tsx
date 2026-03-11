'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProfileSection({ user, profile }: { user: any, profile: any }) {
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        date_of_birth: profile?.date_of_birth || '',
        bio: profile?.bio || '',
        website: profile?.website || '',
        location: profile?.location || ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleSave = async () => {
        setLoading(true)
        setMessage('')

        const supabase = createClient()
        const { error } = await supabase
            .from('profiles')
            .update(formData)
            .eq('id', user.id)

        if (error) {
            setMessage('Error updating profile')
        } else {
            setMessage('Profile updated successfully')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Profile Information</h3>
                <p className="text-sm text-zinc-400 font-medium">Update your personal details.</p>
            </div>

            <div className="grid gap-6 rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
                <div className="grid gap-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Date of Birth</label>
                    <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Location</label>
                        <input
                            type="text"
                            placeholder="e.g. New York, USA"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Website</label>
                        <input
                            type="url"
                            placeholder="https://"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Bio</label>
                    <textarea
                        rows={4}
                        placeholder="Tell us a bit about yourself..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
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
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
