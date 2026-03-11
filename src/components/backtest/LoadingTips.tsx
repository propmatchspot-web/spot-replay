'use client'

import { useEffect, useState } from 'react'

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
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const tipInterval = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % TIPS.length)
        }, 3500)

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return 95
                const increment = Math.max(0.3, (95 - prev) / 40)
                return Math.min(95, prev + increment)
            })
        }, 500)

        return () => {
            clearInterval(tipInterval)
            clearInterval(progressInterval)
        }
    }, [])

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#000000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '40px',
                zIndex: 9999,
            }}
        >
            {/* Collaboration Logos — big and simple, no boxes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/Replaylogo.png"
                    alt="Spot Replay"
                    style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
                />

                <span style={{
                    color: 'rgba(251, 191, 36, 0.8)',
                    fontSize: '28px',
                    fontWeight: 700,
                    userSelect: 'none',
                    lineHeight: 1,
                }}>
                    ×
                </span>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/TJlogo.png"
                    alt="Trading Journal"
                    style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
                />
            </div>

            {/* Loading text + progress */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                width: '100%',
                maxWidth: '400px',
                padding: '0 24px',
            }}>
                <h3 style={{
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: '-0.02em',
                }}>
                    Loading Historical Data...
                </h3>

                {/* Progress bar */}
                <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '4px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease-out',
                        boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)',
                    }} />
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#666',
                }}>
                    <span>Downloading candles...</span>
                    <span>{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Tip */}
            <p style={{
                color: '#999',
                fontSize: '14px',
                fontWeight: 500,
                margin: 0,
                maxWidth: '500px',
                textAlign: 'center',
                padding: '0 24px',
                transition: 'opacity 0.5s',
            }}>
                {TIPS[currentTip]}
            </p>
        </div>
    )
}
