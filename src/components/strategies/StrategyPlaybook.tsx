'use client'

import { useState } from 'react'
import { Plus, X, Image as ImageIcon } from 'lucide-react'
import { addStrategyExample, deleteStrategyExample } from '@/app/(dashboard)/strategies/actions'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ui/ConfirmDialog'

interface StrategyPlaybookProps {
    strategyId: string
    examples: any[]
}

export function StrategyPlaybook({ strategyId, examples }: StrategyPlaybookProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { confirm } = useConfirm()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!imageUrl) return

        setIsSubmitting(true)
        const res = await addStrategyExample(strategyId, imageUrl, notes)
        setIsSubmitting(false)

        if (res.success) {
            toast.success('Example added to playbook')
            setIsAdding(false)
            setImageUrl('')
            setNotes('')
        } else {
            toast.error('Failed to add example')
        }
    }

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: 'Delete Example?',
            description: 'This will permanently remove this example from your playbook.',
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        })
        if (confirmed) {
            const res = await deleteStrategyExample(id, strategyId)
            if (res.success) {
                toast.success('Example deleted')
            } else {
                toast.error('Failed to delete example')
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Golden Setups & Examples</h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Example
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Image URL</label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Why was this a perfect setup?"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 h-24 resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Example'}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {examples.map((example) => (
                    <div key={example.id} className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="relative aspect-video bg-zinc-950">
                            <img
                                src={example.image_url}
                                alt="Strategy Example"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleDelete(example.id)}
                                    className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        {example.notes && (
                            <div className="p-4 border-t border-zinc-800">
                                <p className="text-sm text-zinc-300">{example.notes}</p>
                            </div>
                        )}
                    </div>
                ))}

                {examples.length === 0 && !isAdding && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-800 rounded-xl">
                        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ImageIcon className="h-6 w-6 text-zinc-600" />
                        </div>
                        <p className="text-zinc-500">No examples yet. Add your best setups here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
