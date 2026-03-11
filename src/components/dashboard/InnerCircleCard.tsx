'use client'

import { Crown, MessageCircle } from 'lucide-react'

export function InnerCircleCard({ plan }: { plan: string }) {
    const isElite = plan === 'ELITE'

    if (!isElite) return null

    return (
        <div className="bg-gradient-to-br from-[#1DB954]/10 to-transparent border border-[#1DB954]/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <Crown className="h-6 w-6 text-[#1DB954]" />
                <h3 className="text-lg font-black text-white italic">INNER CIRCLE</h3>
            </div>

            <p className="text-zinc-400 text-sm mb-6">
                You have Elite access. Join the private discord for daily setups and mentorship.
            </p>

            <a
                href="https://discord.gg/your-invite-link"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold rounded-xl transition-colors shadow-lg shadow-[#5865F2]/20"
            >
                <MessageCircle className="h-5 w-5" />
                Join Discord Server
            </a>
        </div>
    )
}
