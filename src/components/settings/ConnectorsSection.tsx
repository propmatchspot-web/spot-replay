'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { Loader2, Copy, Download, Radio, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GuideStep {
    title: string
    code?: string
    description: string
}

const GUIDE_MT5: GuideStep[] = [
    {
        title: "Download the Expert Advisor",
        description: "Download the `SpotReplay_Sync_MT5.mq5` file to your computer."
    },
    {
        title: "Install in MetaTrader 5",
        description: "Open MT5 -> File -> Open Data Folder -> MQL5 -> Experts. Paste the file here."
    },
    {
        title: "Configure Webhook URL",
        description: "In MT5, go to Tools -> Options -> Expert Advisors. Enable 'Allow WebRequest' and add this URL:",
        code: "https://replay.propmatchspot.com/api/webhooks/sync"
    },
    {
        title: "Set Your Sync Key",
        description: "Drag the EA onto any chart. In the inputs, paste your unique Sync Key (generated above)."
    }
]

const GUIDE_CTRADER: GuideStep[] = [
    {
        title: "Download the cBot",
        description: "Download the `SpotReplay_Sync_cTrader.algo` file."
    },
    {
        title: "Install in cTrader",
        description: "Double click the file to install it in cTrader Automate."
    },
    {
        title: "Configure Permissions",
        description: "In the cBot settings, ensure 'Full Access' requires is checked/allowed for network requests."
    },
    {
        title: "Paste Sync Key",
        description: "In the cBot parameters, paste your Sync Key and start the bot."
    }
]

export function ConnectorsSection({ user }: { user: any }) {
    const [syncKey, setSyncKey] = useState('')
    const [generatingKey, setGeneratingKey] = useState(false)
    const [openGuide, setOpenGuide] = useState<string | null>(null)
    const [message, setMessage] = useState('')

    // Function to generate/fetch key (Migrated from AccountSection)
    const generateKey = async () => {
        setGeneratingKey(true)
        const supabase = createClient()
        // Check current key
        const { data } = await supabase.from('users').select('webhook_key').eq('id', user.id).single()

        let key = data?.webhook_key

        if (key) {
            setSyncKey(key)
        } else {
            // Fallback
            const newKey = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
            await supabase.from('users').update({ webhook_key: newKey }).eq('id', user.id)
            setSyncKey(newKey)
        }
        setGeneratingKey(false)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setMessage('Copied!')
        setTimeout(() => setMessage(''), 2000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Broker Connectors</h3>
                <p className="text-sm text-zinc-400 font-medium">Connect your trading platforms (MT4, MT5, cTrader) for auto-sync.</p>
            </div>

            {/* SYNC KEY GENERATOR */}
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Radio className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white uppercase italic">Universal Sync Key</h4>
                        <p className="text-xs text-zinc-500 font-medium">One key to rule them all. Use this in all your EAs/Bots.</p>
                    </div>
                </div>

                <div className="bg-black/40 rounded-xl p-6 border border-zinc-800/50">
                    {!syncKey ? (
                        <div className="text-center py-4">
                            <button
                                onClick={generateKey}
                                disabled={generatingKey}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-black hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                {generatingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
                                Generate/Reveal My Key
                            </button>
                            <p className="mt-3 text-xs text-zinc-500">This key is private. Do not share it.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Your Secret Key</label>
                                <div
                                    onClick={() => copyToClipboard(syncKey)}
                                    className="cursor-pointer group relative rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-4 font-mono text-lg text-emerald-500 font-bold hover:bg-emerald-500/10 transition-all text-center tracking-widest"
                                >
                                    {syncKey}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Copy className="h-4 w-4" />
                                    </div>
                                </div>
                                {message && (
                                    <div className="absolute -top-8 right-0 bg-emerald-500 text-black text-xs font-bold px-2 py-1 rounded fade-in">
                                        {message}
                                    </div>
                                )}
                            </div>
                            <p className="text-center text-xs text-zinc-500">Click to copy. Paste this into your Trading Platform settings.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* PLATFORM GUIDES */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* MT5 CARD */}
                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 overflow-hidden group hover:border-zinc-700 transition-all">
                    <div className="p-6 bg-gradient-to-br from-zinc-900 to-black">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-xl font-black text-white">MetaTrader 5</h4>
                                <span className="inline-block mt-1 text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Most Popular</span>
                            </div>
                            <img src="/icons/mt5.png" alt="MT5" className="h-10 w-10 opacity-50 grayscale group-hover:grayscale-0 transition-all" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>

                        <a href="/downloads/SpotReplay_Sync_MT5.mq5" download className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-sm font-bold text-white hover:bg-white/10 transition-all border border-white/5">
                            <Download className="h-4 w-4" />
                            Download EA (.mq5)
                        </a>
                    </div>

                    <button
                        onClick={() => setOpenGuide(openGuide === 'mt5' ? null : 'mt5')}
                        className="w-full px-6 py-4 flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-white hover:bg-zinc-800/50 transition-all border-t border-zinc-800"
                    >
                        Setup Guide
                        {openGuide === 'mt5' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {openGuide === 'mt5' && (
                        <div className="px-6 pb-6 bg-black/20 border-t border-zinc-800/50">
                            <div className="space-y-6 pt-4">
                                {GUIDE_MT5.map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="h-6 w-6 shrink-0 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold border border-zinc-700">
                                            {i + 1}
                                        </div>
                                        <div className="space-y-1">
                                            <h5 className="text-sm font-bold text-zinc-300">{step.title}</h5>
                                            <p className="text-xs text-zinc-500 leading-relaxed">{step.description}</p>
                                            {step.code && (
                                                <div
                                                    onClick={() => copyToClipboard(step.code!)}
                                                    className="mt-2 block w-full rounded bg-black px-3 py-2 font-mono text-[10px] text-zinc-400 border border-zinc-800 cursor-pointer hover:border-emerald-500/30 hover:text-emerald-500 transition-colors"
                                                >
                                                    {step.code}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* cTRADER CARD */}
                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 overflow-hidden group hover:border-blue-900/30 transition-all">
                    <div className="p-6 bg-gradient-to-br from-zinc-900 to-black">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-xl font-black text-white">cTrader</h4>
                                <span className="inline-block mt-1 text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Easiest Setup</span>
                            </div>
                            <img src="/icons/ctrader.png" alt="cTrader" className="h-10 w-10 opacity-50 grayscale group-hover:grayscale-0 transition-all" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>

                        <a href="/downloads/SpotReplay_Sync_cTrader.algo" download className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                            <Download className="h-4 w-4" />
                            Download cBot (.algo)
                        </a>
                    </div>

                    <button
                        onClick={() => setOpenGuide(openGuide === 'ctrader' ? null : 'ctrader')}
                        className="w-full px-6 py-4 flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-blue-400 hover:bg-blue-900/10 transition-all border-t border-zinc-800"
                    >
                        Setup Guide
                        {openGuide === 'ctrader' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {openGuide === 'ctrader' && (
                        <div className="px-6 pb-6 bg-black/20 border-t border-zinc-800/50">
                            <div className="space-y-6 pt-4">
                                {GUIDE_CTRADER.map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="h-6 w-6 shrink-0 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold border border-zinc-700">
                                            {i + 1}
                                        </div>
                                        <div className="space-y-1">
                                            <h5 className="text-sm font-bold text-zinc-300">{step.title}</h5>
                                            <p className="text-xs text-zinc-500 leading-relaxed">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
