'use client'

import { motion } from 'framer-motion'
import { GripHorizontal } from 'lucide-react'
import { ReactNode } from 'react'

interface DraggableWidgetProps {
    children: ReactNode
    className?: string
    initialX?: number
    initialY?: number
}

export function DraggableWidget({ children, className, initialX = 0, initialY = 0 }: DraggableWidgetProps) {
    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ x: initialX, y: initialY }}
            className={`absolute z-50 shadow-2xl rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/10 ${className}`}
        >
            <div className="h-6 w-full bg-[#111] flex items-center justify-center cursor-move active:cursor-grabbing border-b border-white/5 group">
                <GripHorizontal className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </div>
            <div className="p-2">
                {children}
            </div>
        </motion.div>
    )
}
