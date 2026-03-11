'use client'

import { memo, useEffect, useRef } from 'react'
import { TrendingUp } from 'lucide-react'

export const MarketBias = memo(function MarketBias() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return
        containerRef.current.innerHTML = ''

        const script = document.createElement('script')
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'
        script.type = 'text/javascript'
        script.async = true
        script.innerHTML = JSON.stringify({
            "colorTheme": "dark",
            "dateRange": "12M",
            "showChart": false,
            "locale": "en",
            "largeChartUrl": "",
            "isTransparent": true,
            "showSymbolLogo": true,
            "showFloatingTooltip": false,
            "width": "100%",
            "height": "100%",
            "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
            "plotLineColorFalling": "rgba(41, 98, 255, 1)",
            "gridLineColor": "rgba(240, 243, 250, 0)",
            "scaleFontColor": "rgba(106, 109, 120, 1)",
            "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
            "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
            "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
            "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
            "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
            "tabs": [
                {
                    "title": "Forex",
                    "symbols": [
                        { "s": "FX:EURUSD", "d": "EUR/USD" },
                        { "s": "FX:GBPUSD", "d": "GBP/USD" },
                        { "s": "FX:USDJPY", "d": "USD/JPY" },
                        { "s": "FX:USDCHF", "d": "USD/CHF" },
                        { "s": "FX:AUDUSD", "d": "AUD/USD" },
                        { "s": "FX:USDCAD", "d": "USD/CAD" }
                    ]
                },
                {
                    "title": "Crypto",
                    "symbols": [
                        { "s": "BINANCE:BTCUSDT", "d": "Bitcoin" },
                        { "s": "BINANCE:ETHUSDT", "d": "Ethereum" },
                        { "s": "BINANCE:SOLUSDT", "d": "Solana" },
                        { "s": "BINANCE:XRPUSDT", "d": "XRP" },
                        { "s": "BINANCE:BNBUSDT", "d": "BNB" }
                    ]
                },
                {
                    "title": "Stocks",
                    "symbols": [
                        { "s": "NASDAQ:TSLA", "d": "Tesla" },
                        { "s": "NASDAQ:NVDA", "d": "Nvidia" },
                        { "s": "NASDAQ:AAPL", "d": "Apple" },
                        { "s": "NASDAQ:MSFT", "d": "Microsoft" },
                        { "s": "NASDAQ:AMZN", "d": "Amazon" },
                        { "s": "NASDAQ:META", "d": "Meta" }
                    ]
                }
            ]
        })

        const widgetContainer = document.createElement('div')
        widgetContainer.className = "tradingview-widget-container__widget h-full w-full"
        containerRef.current.appendChild(widgetContainer)
        containerRef.current.appendChild(script)

    }, [])

    return (
        <div className="w-full h-[500px] rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-wide">Market Bias & Data</h2>
                        <p className="text-xs text-zinc-500">Live Quotes & Change %</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 relative p-2 tradingview-widget-container" ref={containerRef} />
        </div>
    )
})
