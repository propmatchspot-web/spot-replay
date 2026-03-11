
import { createClient } from '@/utils/supabase/server'
import { FileText, User, Shield, AlertCircle } from 'lucide-react'

export default async function LogsPage() {
    const supabase = await createClient()
    const { data: logs } = await supabase
        .from('admin_logs')
        .select(`
            *,
            admins:users!admin_id (email)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

    return (
        <div className="p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Audit Logs</h1>
                <p className="text-zinc-500">Track every administrative action for security and compliance.</p>
            </header>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <Shield className="h-4 w-4" />
                    System Record
                </div>
                <div className="divide-y divide-zinc-800">
                    {logs?.length === 0 && (
                        <div className="p-12 text-center text-zinc-500 italic flex flex-col items-center gap-4">
                            <AlertCircle className="h-8 w-8 opacity-50" />
                            No logs found. The system is clean.
                        </div>
                    )}
                    {/* @ts-ignore */}
                    {logs?.map((log) => (
                        <div key={log.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg border flex items-center justify-center ${log.action.includes('BAN') ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                        log.action.includes('GRANT') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                            'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                    }`}>
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-white text-sm">{log.action}</span>
                                        <span className="text-xs text-zinc-500 font-mono bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                                            {log.target_id?.slice(0, 8)}...
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        <User className="h-3 w-3" />
                                        {/* @ts-ignore */}
                                        <span className="text-zinc-300">{log.admins?.email || 'Unknown Admin'}</span>
                                        <span className="text-zinc-600">•</span>
                                        <span>{log.ip_address || 'IP Hidden'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-mono text-zinc-500">
                                    {new Date(log.created_at).toLocaleString()}
                                </div>
                                {log.details && (
                                    <div className="mt-1 text-[10px] text-zinc-600 font-mono max-w-xs truncate">
                                        {JSON.stringify(log.details)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
