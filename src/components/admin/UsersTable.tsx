'use client'

import { useState, useTransition } from 'react'
import { MoreHorizontal, Search, Shield, Ban, CheckCircle, Crown } from 'lucide-react'
import Image from 'next/image'
import { updateUserPlan, banUser } from '@/app/(admin)/actions'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface User {
    id: string
    email: string
    avatar_url: string | null
    plan_tier: string | null
    created_at: string
    ai_usage_today: number
    ai_daily_limit: number
}

interface UsersTableProps {
    initialUsers: User[]
}

export function UsersTable({ initialUsers }: UsersTableProps) {
    const [search, setSearch] = useState('')
    const [users, setUsers] = useState(initialUsers)
    const [isPending, startTransition] = useTransition()
    const { confirm } = useConfirm()

    // Filter
    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase())
    )

    const handlePlanUpdate = (userId: string, tier: 'SPOT_BASIC' | 'SPOT_EXCLUSIVE') => {
        startTransition(async () => {
            try {
                // Optimistic Update
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan_tier: tier } : u))

                const result = await updateUserPlan(userId, tier)
                if (result.success) {
                    toast.success(`User upgraded to ${tier}`)
                }
            } catch (error) {
                toast.error("Failed to update plan")
                // Revert or refresh (in a real app, router.refresh handles this via server action revalidate)
            }
        })
    }

    const handleBan = async (userId: string) => {
        const confirmed = await confirm({
            title: 'Revoke Access?',
            description: "This will immediately revoke this user's access to the platform. They will lose all premium features.",
            type: 'danger',
            confirmText: 'Revoke Access',
            cancelText: 'Cancel'
        })
        if (!confirmed) return

        startTransition(async () => {
            try {
                const result = await banUser(userId, true)
                if (result.success) {
                    toast.success("User access revoked")
                    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan_tier: 'SPOT_BASIC' } : u)) // Visual feedback
                }
            } catch (error) {
                toast.error("Failed to ban user")
            }
        })
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">User CRM</h1>
                    <p className="text-zinc-500">Manage {users.length} registered users.</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search email or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all w-80 shadow-lg shadow-black/50"
                    />
                </div>
            </header>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 uppercase tracking-wider text-xs font-bold">
                            <th className="p-5 font-bold text-white">User Identity</th>
                            <th className="p-5 font-bold text-white">Plan Status</th>
                            <th className="p-5">Joined</th>
                            <th className="p-5">AI Consumption</th>
                            <th className="p-5 text-right text-white">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3 text-zinc-500">
                                        <Search className="h-8 w-8 opacity-20" />
                                        <p>No users found matching "{search}"</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="group hover:bg-zinc-800/30 transition-colors">
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden shadow-lg">
                                            {user.avatar_url ? (
                                                <Image src={user.avatar_url} alt="" width={40} height={40} />
                                            ) : (
                                                <span className="text-sm font-black text-zinc-500">{user.email?.[0].toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{user.email}</div>
                                            <div className="text-[10px] font-mono text-zinc-600">{user.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border shadow-sm ${user.plan_tier === 'SPOT_EXCLUSIVE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-900/10' :
                                            'bg-zinc-800 text-zinc-400 border-zinc-700'
                                        }`}>
                                        {user.plan_tier === 'SPOT_EXCLUSIVE' && <Crown className="h-3 w-3" />}
                                        {user.plan_tier || 'SPOT_BASIC'}
                                    </span>
                                </td>
                                <td className="p-5 text-zinc-500 font-medium">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-5">
                                    <div className="flex flex-col gap-1.5 max-w-[140px]">
                                        <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                                            <span>Usage</span>
                                            <span>{Math.round((user.ai_usage_today / (user.ai_daily_limit || 1)) * 100)}%</span>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${(user.ai_usage_today / (user.ai_daily_limit || 1)) > 0.9 ? 'bg-red-500' : 'bg-emerald-500'
                                                    }`}
                                                style={{ width: `${Math.min(100, (user.ai_usage_today / (user.ai_daily_limit || 1)) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-zinc-600 font-mono">
                                            {user.ai_usage_today} / {user.ai_daily_limit} reqs
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-700">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-[#09090b] border-zinc-800 text-zinc-200">
                                            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-zinc-500">Manage User</DropdownMenuLabel>
                                            <DropdownMenuItem onSelect={() => handlePlanUpdate(user.id, 'SPOT_EXCLUSIVE')} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                                                <Crown className="mr-2 h-4 w-4 text-amber-500" />
                                                <span>Grant Spot Exclusive</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handlePlanUpdate(user.id, 'SPOT_BASIC')} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                                                <Shield className="mr-2 h-4 w-4 text-zinc-500" />
                                                <span>Downgrade to Basic</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-zinc-800" />
                                            <DropdownMenuItem onSelect={() => handleBan(user.id)} className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer">
                                                <Ban className="mr-2 h-4 w-4" />
                                                <span>Revoke Access</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
