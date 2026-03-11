'use client'

import { useState } from 'react'
import { Star, Save, Smile, Frown, Meh, AlertCircle } from 'lucide-react'
import { saveJournalEntry } from '@/app/(dashboard)/journal/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DayJournalFormProps {
    date: string
    initialEntry: any
}

const EMOTIONS = [
    'Disciplined', 'Focused', 'Patient', 'Confident', // Positive
    'Fearful', 'Greedy', 'Impulsive', 'Revenge', // Negative
    'Tired', 'Distracted', 'Anxious', 'Bored' // Neutral/State
]

export function DayJournalForm({ date, initialEntry }: DayJournalFormProps) {
    const [content, setContent] = useState(initialEntry?.content || '')
    const [rating, setRating] = useState(initialEntry?.rating || 0)
    const [emotions, setEmotions] = useState<string[]>(initialEntry?.emotions || [])
    const [isSaving, setIsSaving] = useState(false)

    const toggleEmotion = (emotion: string) => {
        if (emotions.includes(emotion)) {
            setEmotions(emotions.filter(e => e !== emotion))
        } else {
            setEmotions([...emotions, emotion])
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        // Determine mood based on rating for backward compatibility/summary
        const mood = rating >= 4 ? 'Great' : rating === 3 ? 'Neutral' : 'Bad'

        const res = await saveJournalEntry(new Date(date), content, mood, rating, emotions)
        setIsSaving(false)

        if (res.success) {
            toast.success('Journal entry saved')
        } else {
            toast.error('Failed to save entry')
        }
    }

    return (
        <div className="space-y-8">
            {/* Rating Section */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4">Daily Rating</h3>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                rating >= star ? "text-yellow-400 bg-yellow-400/10" : "text-zinc-600 hover:text-zinc-400"
                            )}
                        >
                            <Star className={cn("h-8 w-8", rating >= star && "fill-yellow-400")} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Emotions Section */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4">Emotions & State</h3>
                <div className="flex flex-wrap gap-2">
                    {EMOTIONS.map((emotion) => (
                        <button
                            key={emotion}
                            onClick={() => toggleEmotion(emotion)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-bold border transition-all",
                                emotions.includes(emotion)
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                            )}
                        >
                            {emotion}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4">Daily Reflection</h3>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What went well? What mistakes did you make? How can you improve tomorrow?"
                    className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                    <Save className="h-5 w-5" />
                    {isSaving ? 'Saving...' : 'Save Journal Entry'}
                </button>
            </div>
        </div>
    )
}
