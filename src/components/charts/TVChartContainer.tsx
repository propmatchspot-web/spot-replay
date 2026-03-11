'use client'

import { useEffect, useRef } from 'react'
import { TVDatafeed } from '@/lib/tv-datafeed'

// We need to type this safely as the library isn't fully typed for TS import in Next.js structure often
// or we load types from the generic d.ts if available in public.
// Ideally, we treat window.TradingView as any for the widget constructor.

export default function TVChartContainer({
    symbol = 'EURUSD',
    interval = 'D',
    libraryPath = '/charting_library/',
    chartsStorageUrl = 'https://saveload.tradingview.com',
    chartsStorageApiVersion = '1.1',
    clientId = 'tradingview.com',
    userId = 'public_user_id',
    fullscreen = false,
    autosize = true,
    theme = 'Dark',
}) {
    const chartContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!chartContainerRef.current) return

        const script = document.createElement('script')
        script.src = '/charting_library/charting_library.js'
        script.async = true
        script.onload = () => {
            const widgetOptions = {
                symbol: symbol,
                datafeed: TVDatafeed,
                interval: interval,
                container: chartContainerRef.current!,
                library_path: libraryPath,
                locale: 'en',
                disabled_features: ['use_localstorage_for_settings'],
                enabled_features: ['study_templates'],
                charts_storage_url: chartsStorageUrl,
                charts_storage_api_version: chartsStorageApiVersion,
                client_id: clientId,
                user_id: userId,
                fullscreen: fullscreen,
                autosize: autosize,
                theme: theme,
                overrides: {
                    "paneProperties.background": "#09090b", // zinc-950
                    "paneProperties.vertGridProperties.color": "#27272a", // zinc-800
                    "paneProperties.horzGridProperties.color": "#27272a", // zinc-800
                    "scalesProperties.textColor": "#a1a1aa", // zinc-400
                    "mainSeriesProperties.candleStyle.upColor": "#10b981", // emerald-500
                    "mainSeriesProperties.candleStyle.downColor": "#ef4444", // red-500
                    "mainSeriesProperties.candleStyle.borderUpColor": "#10b981",
                    "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
                    "mainSeriesProperties.candleStyle.wickUpColor": "#10b981",
                    "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
                }
            }

            // @ts-ignore
            if (window.TradingView) {
                const widget = new window.TradingView.widget(widgetOptions as any)

                return () => {
                    if (widget) {
                        widget.remove()
                    }
                }
            }
        }
        document.head.appendChild(script)
    }, [symbol, interval, theme])

    return (
        <div ref={chartContainerRef} className="h-full w-full" />
    )
}
