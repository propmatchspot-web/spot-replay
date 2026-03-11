'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, CheckCircle2 } from 'lucide-react'
import { updateStrategyRules } from '@/app/(dashboard)/strategies/actions'
import { toast } from 'sonner'

interface StrategyRulesProps {
    strategyId: string
    initialRules: any[]
}

export function StrategyRules({ strategyId, initialRules }: StrategyRulesProps) {
    // Handle legacy array of strings or new object structure
    const parseRules = (rules: any) => {
        if (Array.isArray(rules)) {
            return rules.map(r => typeof r === 'string' ? { text: r, type: 'entry' } : r)
        }
        return []
    }

    const [rules, setRules] = useState<any[]>(parseRules(initialRules))
    const [isSaving, setIsSaving] = useState(false)

    const handleAddRule = () => {
        setRules([...rules, { text: '', type: 'entry' }])
    }

    const handleRemoveRule = (index: number) => {
        const newRules = [...rules]
        newRules.splice(index, 1)
        setRules(newRules)
    }

    const handleUpdateRule = (index: number, field: 'text' | 'type', value: string) => {
        const newRules = [...rules]
        newRules[index] = { ...newRules[index], [field]: value }
        setRules(newRules)
    }

    const handleSave = async () => {
        setIsSaving(true)
        const res = await updateStrategyRules(strategyId, rules)
        setIsSaving(false)

        if (res.success) {
            toast.success('Rules updated successfully')
        } else {
            toast.error('Failed to update rules')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Strategy Rules & Checklist</h3>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="space-y-3">
                {rules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50 group">
                        <div className="mt-2">
                            <CheckCircle2 className="h-5 w-5 text-zinc-600" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <input
                                type="text"
                                value={rule.text}
                                onChange={(e) => handleUpdateRule(index, 'text', e.target.value)}
                                placeholder="Enter rule description..."
                                className="w-full bg-transparent border-none text-zinc-200 placeholder-zinc-600 focus:ring-0 font-medium"
                            />
                            <div className="flex gap-2">
                                {['entry', 'exit', 'management'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => handleUpdateRule(index, 'type', type)}
                                        className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${rule.type === type
                                                ? 'bg-zinc-800 border-zinc-700 text-white'
                                                : 'border-transparent text-zinc-600 hover:text-zinc-400'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => handleRemoveRule(index)}
                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={handleAddRule}
                className="w-full py-3 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/50 transition-all flex items-center justify-center gap-2 font-bold"
            >
                <Plus className="h-4 w-4" />
                Add New Rule
            </button>
        </div>
    )
}
