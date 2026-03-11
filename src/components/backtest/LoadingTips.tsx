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
                const increment = Math.max(0.25, (95 - prev) / 35)
                return Math.min(95, prev + increment)
            })
        }, 500)

        return () => {
            clearInterval(tipInterval)
            clearInterval(progressInterval)
        }
    }, [])

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
        }}>
            {/* Center content container — 60% width */}
            <div style={{
                width: '60%',
                maxWidth: '800px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '48px',
            }}>
                {/* Logos — large, simple, no boxes */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '32px',
                    width: '100%',
                }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/Replaylogo.png"
                        alt="Spot Replay"
                        style={{
                            height: '110px',
                            width: 'auto',
                            objectFit: 'contain',
                        }}
                    />

                    <span style={{
                        color: 'rgba(251, 191, 36, 0.85)',
                        fontSize: '36px',
                        fontWeight: 800,
                        userSelect: 'none',
                        lineHeight: 1,
                    }}>
                        ×
                    </span>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/TJlogo.png"
                        alt="Trading Journal"
                        style={{
                            height: '110px',
                            width: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                </div>

                {/* Subtitle */}
                <p style={{
                    color: 'rgba(251, 191, 36, 0.6)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    margin: 0,
                }}>
                    Powered by Collaboration
                </p>

                {/* Loading section — full width of container */}
                <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                }}>
                    <h3 style={{
                        color: '#ffffff',
                        fontSize: '24px',
                        fontWeight: 700,
                        margin: 0,
                        letterSpacing: '-0.02em',
                    }}>
                        Loading Historical Data
                    </h3>

                    {/* Progress bar — full width */}
                    <div style={{
                        width: '100%',
                        height: '5px',
                        backgroundColor: '#111111',
                        borderRadius: '6px',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #f59e0b, #ea580c)',
                            borderRadius: '6px',
                            transition: 'width 0.5s ease-out',
                            boxShadow: '0 0 16px rgba(245, 158, 11, 0.5)',
                        }} />
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: '#555',
                    }}>
                        <span>Downloading candles...</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                </div>

                {/* Tip — full width */}
                <div style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '16px 0',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                    <p style={{
                        color: '#777',
                        fontSize: '15px',
                        fontWeight: 500,
                        margin: 0,
                        lineHeight: 1.6,
                    }}>
                        {TIPS[currentTip]}
                    </p>
                </div>
            </div>
        </div>
    )
}
