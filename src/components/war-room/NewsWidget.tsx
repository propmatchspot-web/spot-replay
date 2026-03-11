'use client'

import { useEffect, useRef, memo } from 'react'

export const NewsWidget = memo(function NewsWidget() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        // Clear previous content strictly
        containerRef.current.innerHTML = ''

        const script = document.createElement('script')
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js'
        script.type = 'text/javascript'
        script.async = true
        script.innerHTML = JSON.stringify({
            "colorTheme": "dark",
            "isTransparent": true,
            "width": "100%",
            "height": "100%",
            "locale": "en",
            "importanceFilter": "-1,0,1",
            "currencyFilter": "USD,EUR,GBP,JPY,AUD,CAD,CHF,NZD"
        })

        const widgetContainer = document.createElement('div')
        widgetContainer.className = "tradingview-widget-container__widget h-full w-full"
        containerRef.current.appendChild(widgetContainer)
        containerRef.current.appendChild(script)

    }, []) // Empty dependency array ensures run once on mount

    return (
        <div className="h-full w-full rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-blue-500/10">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
                            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">Top Tier Events</h3>
                </div>
                <div className="flex gap-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-500 border border-red-500/20">HIGH</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-500 border border-orange-500/20">MED</span>
                </div>
            </div>
            <div className="flex-1 relative tradingview-widget-container" ref={containerRef} />
        </div>
    )
})
