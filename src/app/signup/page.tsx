'use client'

import { useState, Suspense } from 'react'
import { signup } from '@/app/login/actions'
import { TestimonialCarousel } from '@/components/auth/TestimonialCarousel'
import { validatePassword, validateEmail } from '@/utils/validation'
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, User, Phone, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

import { useSearchParams } from 'next/navigation'

function SignupPageContent() {
    const searchParams = useSearchParams()
    const plan = searchParams.get('plan')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        const supabase = createClient()
        const origin = window.location.origin
        if (plan) {
            document.cookie = `purchase_plan=${plan}; path=/; max-age=3600; SameSite=Lax`
        }

        const redirectTo = `${origin}/auth/callback`

        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
            },
        })
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        // Validate Email
        const emailValidation = validateEmail(email)
        if (!emailValidation.isValid) {
            setError(emailValidation.error || 'Invalid email')
            setLoading(false)
            return
        }

        // Validate Password
        const passwordValidation = validatePassword(password)
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error || 'Invalid password')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        const result = await signup(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#050505] text-zinc-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
            {/* Full-screen Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-amber-500/10 blur-[130px] animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-orange-500/10 blur-[100px] animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
            </div>

            {/* Centered Floating Glass Portal */}
            <div className="w-full max-w-6xl bg-zinc-900/30 backdrop-blur-2xl border border-white/10 rounded-[2rem] sm:rounded-[3rem] shadow-[0_0_80px_-20px_rgba(245,158,11,0.15)] overflow-hidden lg:grid lg:grid-cols-2 relative z-10">
                
                {/* Left Side - Brand Visual (Desktop Only) */}
                <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-black/20 border-r border-white/5 order-last lg:order-first">

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-center gap-2">
                        <img src="/Replaylogo.png" alt="Spot Replay" className="h-20 w-auto" />
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <div className="space-y-12">
                        <h1 className="text-4xl font-black tracking-tighter leading-[1.1]">
                            Start your journey to <br />
                            <span className="text-amber-400">Consistent Profit</span>
                        </h1>

                        <TestimonialCarousel />
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-zinc-500">
                    <span>© 2025 Spot Replay</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 sm:p-12 xl:p-16 relative">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8 relative z-10"
                >
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-6 lg:hidden">
                            <img src="/Replaylogo.png" alt="Spot Replay" className="h-12 w-auto" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-white">
                            Create Account
                        </h2>
                        <p className="text-zinc-400">
                            Join the community of data-driven traders.
                        </p>
                    </div>

                    <AnimatePresence>
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-6 text-center space-y-4"
                            >
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                                    <CheckCircle2 className="h-6 w-6 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Check your email</h3>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        We've sent a confirmation link to your email address. Please click it to verify your account.
                                    </p>
                                </div>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
                                >
                                    Back to Login <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </motion.div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleGoogleLogin}
                                        disabled={googleLoading}
                                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 text-sm font-bold text-white hover:bg-zinc-800 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-lg shadow-black/20 backdrop-blur-md"
                                    >
                                        {googleLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                                        ) : (
                                            <>
                                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                                    <path
                                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                        fill="#4285F4"
                                                    />
                                                    <path
                                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                        fill="#34A853"
                                                    />
                                                    <path
                                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                        fill="#FBBC05"
                                                    />
                                                    <path
                                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                        fill="#EA4335"
                                                    />
                                                </svg>
                                                Sign up with Google
                                            </>
                                        )}
                                    </button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-zinc-800" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-[#050505] px-2 text-zinc-500 font-medium">Or continue with email</span>
                                        </div>
                                    </div>
                                </div>

                                <form action={handleSubmit} className="space-y-5">
                                    {plan && <input type="hidden" name="plan" value={plan} />}
                                    {error && (
                                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="sr-only" htmlFor="fullName">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-amber-400 transition-colors" />
                                                <input
                                                    id="fullName"
                                                    name="fullName"
                                                    type="text"
                                                    required
                                                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-12 p-3.5 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                                                    placeholder="Full Name"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="sr-only" htmlFor="phone">Phone</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-amber-400 transition-colors" />
                                                <input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    required
                                                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-12 p-3.5 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                                                    placeholder="Phone Number"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="sr-only" htmlFor="email">Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-amber-400 transition-colors" />
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-12 p-3.5 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                                                    placeholder="Email address"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="sr-only" htmlFor="password">Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-amber-400 transition-colors" />
                                                    <input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        required
                                                        className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-12 p-3.5 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                                                        placeholder="Password"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="sr-only" htmlFor="confirmPassword">Confirm Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-amber-400 transition-colors" />
                                                    <input
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        type="password"
                                                        required
                                                        className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-12 p-3.5 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                                                        placeholder="Confirm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 hover:from-orange-500 hover:to-orange-600 hover:shadow-orange-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                            <>
                                                Create Account
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>

                                    <div className="text-center text-sm">
                                        <span className="text-zinc-500 font-medium">Already have an account? </span>
                                        <Link href="/login" className="font-bold text-amber-400 hover:text-amber-300 transition-colors">
                                            Sign in
                                        </Link>
                                    </div>
                                </form>
                            </>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
            </div>
        }>
            <SignupPageContent />
        </Suspense>
    )
}
