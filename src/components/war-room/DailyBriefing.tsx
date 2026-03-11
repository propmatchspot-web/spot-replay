'use client'

import { useState, useEffect } from 'react'
import { upsertDailyPlan } from '@/app/(dashboard)/war-room/actions'
import { CheckSquare, Save, StickyNote, ArrowUp, ArrowDown, MoveHorizontal } from 'lucide-react'
import { toast } from 'sonner' // Assuming existing toaster

interface DailyBriefingProps {
    initialData?: any
}

export function DailyBriefing({ initialData }: DailyBriefingProps) {
    const [bias, setBias] = useState<'LONG' | 'SHORT' | 'NEUTRAL'>(initialData?.bias || 'NEUTRAL')
    const [notes, setNotes] = useState(initialData?.notes || '')
    const [checklist, setChecklist] = useState<string[]>(initialData?.checklist?.checked || [])
    const [isSaving, setIsSaving] = useState(false)

    // Standard institutional checklist
    const items = [
        "Global Macro Checked (DXY/Yields)",
        "High Impact News Identified",
        "Higher Timeframe Structure Mapped",
        "Key Levels (S/R) Marked",
        "Risk Calculator Ready",
        "Mental State: Calm & Focused"
    ]

    const handleCheck = (item: string) => {
        setChecklist(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        )
    }

    const handleSave = async () => {
        setIsSaving(true)
        const formData = new FormData()
        formData.append('bias', bias)
        formData.append('notes', notes)
        formData.append('checklist', JSON.stringify({ checked: checklist }))

        const res = await upsertDailyPlan(formData)
        if (res.success) {
            toast.success('Battle plan engaged.')
        } else {
            toast.error('Failed to save plan.')
        }
        setIsSaving(false)
    }

    return (
        <div className="h-full flex flex-col gap-6 w-full rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm p-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide border-b border-white/5 pb-4 mb-2">Daily Directive</h2>

            {/* Bias Selector */}
            <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Daily Directive (Bias)</h3>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => setBias('LONG')}
                        className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-all ${bias === 'LONG' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-zinc-900 text-zinc-500 border border-transparent hover:bg-zinc-800'
                            }`}
                    >
                        <ArrowUp className="w-4 h-4" /> LONG
                    </button>
                    <button
                        onClick={() => setBias('NEUTRAL')}
                        className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-all ${bias === 'NEUTRAL' ? 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/50' : 'bg-zinc-900 text-zinc-500 border border-transparent hover:bg-zinc-800'
                            }`}
                    >
                        <MoveHorizontal className="w-4 h-4" /> NEUTRAL
                    </button>
                    <button
                        onClick={() => setBias('SHORT')}
                        className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-all ${bias === 'SHORT' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-zinc-900 text-zinc-500 border border-transparent hover:bg-zinc-800'
                            }`}
                    >
                        <ArrowDown className="w-4 h-4" /> SHORT
                    </button>
                </div>
            </div>

            {/* Checklist */}
            <div className="flex-1 p-4 rounded-xl border border-white/5 bg-zinc-900/50 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" /> Pre-Flight Checklist
                    </h3>
                    <span className="text-xs font-mono text-zinc-600">{checklist.length}/{items.length}</span>
                </div>
                <div className="space-y-2">
                    {items.map(item => (
                        <div
                            key={item}
                            onClick={() => handleCheck(item)}
                            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border ${checklist.includes(item) ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-transparent border-transparent hover:bg-white/5'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${checklist.includes(item) ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'border-zinc-700 bg-zinc-900'
                                }`}>
                                {checklist.includes(item) && <CheckSquare className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-sm ${checklist.includes(item) ? 'text-zinc-200 font-medium' : 'text-zinc-500'}`}>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notes */}
            <div className="flex-1 p-4 rounded-xl border border-white/5 bg-zinc-900/50">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                    <StickyNote className="w-4 h-4" /> Tactical Notes
                </h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Key levels, macro themes, or warnings..."
                    className="w-full h-32 bg-zinc-950/50 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
                />
            </div>

            <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSaving ? (
                    <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <>
                        <Save className="w-4 h-4" /> SAVE BRIEFING
                    </>
                )}
            </button>
        </div>
    )
}
