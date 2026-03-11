'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, CheckCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ConfirmDialogType = 'danger' | 'warning' | 'success' | 'info'

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title: string
    description: string
    type?: ConfirmDialogType
    confirmText?: string
    cancelText?: string
    isLoading?: boolean
}

const typeConfig = {
    danger: {
        icon: Trash2,
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-500',
        confirmBg: 'bg-red-500 hover:bg-red-600',
        confirmText: 'text-white',
        glow: 'shadow-red-500/20'
    },
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-500',
        confirmBg: 'bg-amber-500 hover:bg-amber-600',
        confirmText: 'text-black',
        glow: 'shadow-amber-500/20'
    },
    success: {
        icon: CheckCircle,
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-500',
        confirmBg: 'bg-emerald-500 hover:bg-emerald-600',
        confirmText: 'text-black',
        glow: 'shadow-emerald-500/20'
    },
    info: {
        icon: Info,
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-500',
        confirmBg: 'bg-blue-500 hover:bg-blue-600',
        confirmText: 'text-white',
        glow: 'shadow-blue-500/20'
    }
}

export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    type = 'danger',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false
}: ConfirmDialogProps) {
    const config = typeConfig[type]
    const Icon = config.icon

    const handleConfirm = () => {
        onConfirm()
        if (!isLoading) {
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "sm:max-w-[400px] bg-[#0A0A0A] border-white/10 text-white p-0 gap-0 overflow-hidden",
                "shadow-2xl", config.glow
            )}>
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <DialogDescription className="sr-only">{description}</DialogDescription>

                {/* Header with Icon */}
                <div className="p-6 text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                            config.iconBg
                        )}
                    >
                        <Icon className={cn("w-8 h-8", config.iconColor)} />
                    </motion.div>

                    <motion.h3
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl font-bold text-white mb-2"
                    >
                        {title}
                    </motion.h3>

                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-sm text-zinc-400 leading-relaxed"
                    >
                        {description}
                    </motion.p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-4 pt-0">
                    <Button
                        variant="ghost"
                        className="flex-1 h-12 bg-zinc-800/50 hover:bg-zinc-800 text-white border-0 font-semibold"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        className={cn(
                            "flex-1 h-12 font-bold border-0",
                            config.confirmBg, config.confirmText
                        )}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                            />
                        ) : confirmText}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// --- ALERT DIALOG (Single Button) ---
interface AlertDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    type?: ConfirmDialogType
    buttonText?: string
}

export function AlertDialog({
    open,
    onOpenChange,
    title,
    description,
    type = 'info',
    buttonText = 'Got it'
}: AlertDialogProps) {
    const config = typeConfig[type]
    const Icon = config.icon

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "sm:max-w-[400px] bg-[#0A0A0A] border-white/10 text-white p-0 gap-0 overflow-hidden",
                "shadow-2xl", config.glow
            )}>
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <DialogDescription className="sr-only">{description}</DialogDescription>

                {/* Header with Icon */}
                <div className="p-6 text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                            config.iconBg
                        )}
                    >
                        <Icon className={cn("w-8 h-8", config.iconColor)} />
                    </motion.div>

                    <motion.h3
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl font-bold text-white mb-2"
                    >
                        {title}
                    </motion.h3>

                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-sm text-zinc-400 leading-relaxed"
                    >
                        {description}
                    </motion.p>
                </div>

                {/* Action */}
                <div className="p-4 pt-0">
                    <Button
                        className={cn(
                            "w-full h-12 font-bold border-0",
                            config.confirmBg, config.confirmText
                        )}
                        onClick={() => onOpenChange(false)}
                    >
                        {buttonText}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// --- HOOK FOR EASY USAGE ---
// This allows using confirm dialogs imperatively
import { createContext, useContext, useCallback, ReactNode } from 'react'

interface ConfirmOptions {
    title: string
    description: string
    type?: ConfirmDialogType
    confirmText?: string
    cancelText?: string
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>
    alert: (options: Omit<ConfirmOptions, 'confirmText' | 'cancelText'> & { buttonText?: string }) => Promise<void>
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [confirmState, setConfirmState] = useState<{
        open: boolean
        options: ConfirmOptions
        resolve: ((value: boolean) => void) | null
    }>({
        open: false,
        options: { title: '', description: '' },
        resolve: null
    })

    const [alertState, setAlertState] = useState<{
        open: boolean
        options: Omit<ConfirmOptions, 'confirmText' | 'cancelText'> & { buttonText?: string }
        resolve: (() => void) | null
    }>({
        open: false,
        options: { title: '', description: '' },
        resolve: null
    })

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmState({ open: true, options, resolve })
        })
    }, [])

    const handleConfirmClose = (confirmed: boolean) => {
        setConfirmState(prev => ({ ...prev, open: false }))
        confirmState.resolve?.(confirmed)
    }

    const alertFn = useCallback((options: Omit<ConfirmOptions, 'confirmText' | 'cancelText'> & { buttonText?: string }): Promise<void> => {
        return new Promise((resolve) => {
            setAlertState({ open: true, options, resolve })
        })
    }, [])

    const handleAlertClose = () => {
        setAlertState(prev => ({ ...prev, open: false }))
        alertState.resolve?.()
    }

    return (
        <ConfirmContext.Provider value={{ confirm, alert: alertFn }}>
            {children}
            <ConfirmDialog
                open={confirmState.open}
                onOpenChange={(open) => !open && handleConfirmClose(false)}
                onConfirm={() => handleConfirmClose(true)}
                title={confirmState.options.title}
                description={confirmState.options.description}
                type={confirmState.options.type}
                confirmText={confirmState.options.confirmText}
                cancelText={confirmState.options.cancelText}
            />
            <AlertDialog
                open={alertState.open}
                onOpenChange={(open) => !open && handleAlertClose()}
                title={alertState.options.title}
                description={alertState.options.description}
                type={alertState.options.type}
                buttonText={alertState.options.buttonText}
            />
        </ConfirmContext.Provider>
    )
}

export function useConfirm() {
    const context = useContext(ConfirmContext)
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider')
    }
    return context
}
