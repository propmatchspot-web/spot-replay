'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const TIPS = [
    "💡 Professional traders spend 80% analyzing, 20% executing",
    "📊 Always set stop-loss before entering trades",
    "🎯 Best traders win 50-60% but excel at risk management",
    "⚡ Backtesting validates strategies before risking capital",
    "💰 Never risk more than 1-2% per trade",
    "📈 The most profitable trades are hardest psychologically",
    "🧠 Trading is 20% strategy, 80% psychology",
    "⏰ First/last trading hour = highest volatility"
]

export default function LoadingTips() {
    const [currentTip, setCurrentTip] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % TIPS.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8 p-8">
            {/* BIGGER Logo */}
            <div className="relative w-40 h-40 animate-pulse">
                <Image
                    src="/Replaylogo.png"
                    alt="Loading"
                    fill
                    priority
                    className="object-contain"
                />
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-3">
                <h3 className="text-2xl font-semibold text-white">Loading Historical Data...</h3>
                <p className="text-sm text-gray-400">This may take 30-60 seconds</p>
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>

            {/* Shorter Tips */}
            <div className="max-w-lg text-center">
                <p className="text-sm text-gray-300 font-medium transition-opacity duration-500">
                    {TIPS[currentTip]}
                </p>
            </div>
        </div>
    )
}
