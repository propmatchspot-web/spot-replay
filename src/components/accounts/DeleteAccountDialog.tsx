'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { deleteAccount } from '@/app/(dashboard)/accounts/actions'
import { useRouter } from 'next/navigation'

interface DeleteAccountDialogProps {
    account: { id: string, name: string }
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteAccountDialog({ account, open, onOpenChange }: DeleteAccountDialogProps) {
    const [confirmName, setConfirmName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleDelete = async () => {
        if (confirmName !== account.name) return

        setIsLoading(true)
        setError('')

        try {
            const result = await deleteAccount(account.id)
            if (result.error) {
                setError(result.error)
            } else {
                onOpenChange(false)
                router.push('/') // Redirect to home/dashboard after deletion
                router.refresh()
            }
        } catch (e) {
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <DialogTitle className="text-center text-xl">Delete Account?</DialogTitle>
                    <DialogDescription className="text-center text-zinc-400">
                        This action cannot be undone. This will permanently delete the account <span className="font-bold text-white">"{account.name}"</span> and all associated trade data.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">
                            Type <span className="select-all font-mono font-bold text-red-400">{account.name}</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder={account.name}
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-center gap-2">
                    <button
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={confirmName !== account.name || isLoading}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Delete Account
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
