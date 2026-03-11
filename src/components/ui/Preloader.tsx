'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export function Preloader() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 2000) // Show preloader for 2 seconds

        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#050505]"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="relative flex flex-col items-center gap-4"
                    >
                        <div className="relative h-24 w-64 sm:h-32 sm:w-80 max-w-[90vw] overflow-hidden drop-shadow-[0_0_25px_rgba(0,230,118,0.3)]">
                            <Image
                                src="/Replaylogo.png"
                                alt="Spot Replay"
                                fill
                                sizes="192px"
                                className="object-contain"
                                priority
                            />
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
