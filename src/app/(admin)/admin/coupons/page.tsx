
import { createClient } from '@/utils/supabase/server'
import { Tag, Plus, Clock, Copy } from 'lucide-react'

export default async function CouponsPage() {
    const supabase = await createClient()
    const { data: coupons } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })

    return (
        <div className="p-8 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Discount Codes</h1>
                    <p className="text-zinc-500">Create campaigns and track usage.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors">
                    <Plus className="h-4 w-4" />
                    Create Code
                </button>
            </header>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400">
                            <th className="p-4 font-medium">Code</th>
                            <th className="p-4 font-medium">Discount</th>
                            <th className="p-4 font-medium">Uses</th>
                            <th className="p-4 font-medium">Expires</th>
                            <th className="p-4 font-medium text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {coupons?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-zinc-500 italic">
                                    No active coupons. Create one to get started.
                                </td>
                            </tr>
                        )}
                        {coupons?.map((coupon) => (
                            <tr key={coupon.id} className="group hover:bg-zinc-800/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                                            <Tag className="h-4 w-4 text-zinc-500" />
                                        </div>
                                        <span className="font-mono font-bold text-white text-base tracking-wide">{coupon.code}</span>
                                        <button className="p-1 text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                            <Copy className="h-3 w-3" />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="font-bold text-emerald-500">
                                        {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}% OFF` : `$${coupon.discount_value} OFF`}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-zinc-300">{coupon.used_count || 0}</span>
                                    <span className="text-zinc-600"> / {coupon.max_uses || '∞'}</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <Clock className="h-3 w-3" />
                                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${coupon.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${coupon.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        {coupon.is_active ? 'Active' : 'Expired'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
