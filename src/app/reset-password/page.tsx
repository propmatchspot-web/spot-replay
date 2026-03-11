'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/login/actions'
import { Loader2, AlertCircle, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await updatePassword(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 p-4 text-zinc-50">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md space-y-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Set New Password
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Create a secure password for your account
                    </p>
                </div>

                <form action={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                            <input
                                name="password"
                                type="password"
                                required
                                className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 p-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                placeholder="New Password"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 p-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                placeholder="Confirm New Password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-3 text-sm font-bold text-white hover:from-emerald-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 transition-all"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
