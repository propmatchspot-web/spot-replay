import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, LineStyle, IPriceLine } from 'lightweight-charts'
import { Candle } from '@/lib/binance'
import { ChartDrawingOverlay } from './ChartDrawingOverlay'

export interface PriceLineConfig {
    price: number
    color: string
    title: string
    lineStyle?: LineStyle
}

interface CandlestickChartProps {
    data: Candle[]
    height?: number
    priceLines?: PriceLineConfig[]
    activeTool?: string | null
    onDrawingComplete?: () => void
}

export function CandlestickChart({ data, height, priceLines = [], activeTool, onDrawingComplete }: CandlestickChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
    const activePriceLinesRef = useRef<IPriceLine[]>([])

    // Force re-render when chart is created to pass refs to overlay
    const [isChartReady, setIsChartReady] = useState(false)

    useEffect(() => {
        if (!chartContainerRef.current) return

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#131722' }, // TV Background
                textColor: '#d1d4dc', // TV Text
            },
            width: chartContainerRef.current.clientWidth,
            height: height || chartContainerRef.current.clientHeight,
            grid: {
                vertLines: { color: '#2a2e39' }, // TV Grid
                horzLines: { color: '#2a2e39' },
            },
            timeScale: {
                borderColor: '#2a2e39',
                timeVisible: true,
            },
            rightPriceScale: {
                borderColor: '#2a2e39',
            },
        })

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#089981', // TV Green
            downColor: '#f23645', // TV Red
            borderVisible: false,
            wickUpColor: '#089981',
            wickDownColor: '#f23645',
        })

        chartRef.current = chart
        seriesRef.current = candlestickSeries
        setIsChartReady(true)

        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || entries[0].target !== chartContainerRef.current) return
            const newRect = entries[0].contentRect
            chart.applyOptions({ width: newRect.width, height: newRect.height })
        })

        resizeObserver.observe(chartContainerRef.current)

        return () => {
            resizeObserver.disconnect()
            chart.remove()
        }
    }, []) // Run once on mount

    // Update data
    useEffect(() => {
        if (seriesRef.current && data.length > 0) {
            seriesRef.current.setData(data as any)
        }
    }, [data])

    // Manage Price Lines
    useEffect(() => {
        if (!seriesRef.current) return

        // Remove existing lines
        activePriceLinesRef.current.forEach(line => {
            seriesRef.current?.removePriceLine(line)
        })
        activePriceLinesRef.current = []

        // Add new lines
        priceLines.forEach(config => {
            const line = seriesRef.current?.createPriceLine({
                price: config.price,
                color: config.color,
                title: config.title,
                lineStyle: config.lineStyle || LineStyle.Solid,
                axisLabelVisible: true,
            })
            if (line) {
                activePriceLinesRef.current.push(line)
            }
        })
    }, [priceLines])
    return (
        <div className="relative w-full h-full">
            <div ref={chartContainerRef} className="w-full h-full rounded-xl overflow-hidden border border-zinc-800" />
            {isChartReady && (
                <ChartDrawingOverlay
                    chart={chartRef.current}
                    series={seriesRef.current}
                    activeTool={activeTool || null}
                    onDrawingComplete={onDrawingComplete || (() => { })}
                />
            )}
        </div>
    )
}
