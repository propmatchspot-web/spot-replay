'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { init, dispose, Chart, registerOverlay } from 'klinecharts'
import { Candle } from '@/lib/binance'

export interface PriceLineConfig {
    price: number
    color: string
    title: string
    lineStyle: number // 1: Solid, 2: Dashed, 3: Dotted
}

interface KLineChartProps {
    data: Candle[]
    priceLines?: PriceLineConfig[]
    activeTool?: string | null
    onDrawingComplete?: () => void
    chartType?: string
    isMagnet?: boolean
    isLocked?: boolean
    areDrawingsHidden?: boolean
}

const KLineChart = forwardRef<any, KLineChartProps>((props, ref) => {
    const {
        data,
        priceLines = [],
        activeTool,
        onDrawingComplete,
        chartType = 'candle_solid',
        isMagnet = false,
        isLocked = false,
        areDrawingsHidden = false
    } = props

    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<any>(null)
    const [theme, setTheme] = useState('dark')

    useImperativeHandle(ref, () => ({
        createIndicator: (name: string) => {
            chartRef.current?.createIndicator(name, false, { id: 'candle_pane' })
        },
        resize: () => {
            chartRef.current?.resize()
        }
    }))

    // Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return

        const chart = init(chartContainerRef.current)
        chartRef.current = chart as any

        // Set Styles to match TradingView Dark Theme
        chartRef.current?.setStyles({
            grid: {
                show: true,
                horizontal: {
                    show: true,
                    size: 1,
                    color: '#2B2B43',
                    style: 'solid',
                },
                vertical: {
                    show: true,
                    size: 1,
                    color: '#2B2B43',
                    style: 'solid',
                }
            },
            candle: {
                bar: {
                    upColor: '#089981',
                    downColor: '#F23645',
                    noChangeColor: '#888888',
                    upBorderColor: '#089981',
                    downBorderColor: '#F23645',
                    upWickColor: '#089981',
                    downWickColor: '#F23645'
                },
                priceMark: {
                    high: { color: '#B2B5BE' },
                    low: { color: '#B2B5BE' },
                    last: {
                        upColor: '#089981',
                        downColor: '#F23645',
                        noChangeColor: '#888888',
                        line: {
                            style: 'dashed',
                            dashedValue: [4, 4]
                        },
                        text: {
                            color: '#FFFFFF',
                            size: 12,
                            family: 'Roboto, sans-serif',
                            weight: 'bold',
                            paddingLeft: 4,
                            paddingTop: 4,
                            paddingRight: 4,
                            paddingBottom: 4,
                            borderRadius: 2
                        }
                    }
                },
                tooltip: {
                    showRule: 'always',
                    showType: 'standard',
                    custom: null,
                    defaultValue: 'n/a',
                    rect: {
                        paddingLeft: 0,
                        paddingRight: 0,
                        paddingTop: 0,
                        paddingBottom: 6,
                        offsetLeft: 8,
                        offsetTop: 8,
                        offsetRight: 8,
                        borderRadius: 4,
                        borderSize: 0,
                        borderColor: 'transparent',
                        color: 'transparent'
                    },
                    text: {
                        size: 12,
                        family: 'Roboto, sans-serif',
                        weight: 'normal',
                        color: '#B2B5BE',
                        marginLeft: 8,
                        marginTop: 6,
                        marginRight: 8,
                        marginBottom: 0
                    },
                    labels: ['Time: ', 'Open: ', 'High: ', 'Low: ', 'Close: ', 'Volume: '],
                    values: null
                }
            },
            xAxis: {
                axisLine: { color: '#2B2B43' },
                tickText: { color: '#B2B5BE', family: 'Roboto, sans-serif', size: 11 },
                tickLine: { color: '#2B2B43' }
            },
            yAxis: {
                axisLine: { color: '#2B2B43' },
                tickText: { color: '#B2B5BE', family: 'Roboto, sans-serif', size: 11 },
                tickLine: { color: '#2B2B43' }
            },
            crosshair: {
                show: true,
                horizontal: {
                    line: { style: 'dashed', color: '#787B86', dashedValue: [4, 4] },
                    text: { backgroundColor: '#131722', color: '#FFFFFF', paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 }
                },
                vertical: {
                    line: { style: 'dashed', color: '#787B86', dashedValue: [4, 4] },
                    text: { backgroundColor: '#131722', color: '#FFFFFF', paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 }
                }
            }
        })

        // Add Main Indicator (MA)
        chartRef.current?.createIndicator('MA', false, { id: 'candle_pane' })
        chartRef.current?.createIndicator('VOL', false, { height: 80 })

        return () => {
            dispose(chartContainerRef.current!)
        }
    }, [])

    // Update Chart Type
    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.setStyles({
                candle: {
                    type: chartType
                }
            })
        }
    }, [chartType])

    // Update Data
    useEffect(() => {
        if (chartRef.current && data.length > 0) {
            const kLineData = data.map(d => ({
                timestamp: d.time * 1000,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
                volume: d.volume
            }))
            chartRef.current.applyNewData(kLineData)
            chartRef.current.resize()
        }
    }, [data])

    // Handle Drawings Visibility
    useEffect(() => {
        if (chartRef.current) {
            // Placeholder for visibility logic
        }
    }, [areDrawingsHidden])

    // Update Price Lines (Orders/Trades)
    useEffect(() => {
        if (chartRef.current && data.length > 0) {
            chartRef.current.removeOverlay({ groupId: 'orders' })

            priceLines.forEach(line => {
                chartRef.current?.createOverlay({
                    name: 'simpleAnnotation',
                    groupId: 'orders',
                    lock: true,
                    points: [{ timestamp: data[data.length - 1]?.time * 1000, value: line.price }],
                    styles: {
                        line: {
                            style: line.lineStyle === 1 ? 'solid' : 'dashed',
                            color: line.color,
                            size: 1
                        },
                        text: {
                            content: line.title,
                            color: '#fff',
                            backgroundColor: line.color,
                            borderRadius: 2,
                            paddingLeft: 4,
                            paddingRight: 4,
                            paddingTop: 2,
                            paddingBottom: 2
                        }
                    }
                })
            })
        }
    }, [priceLines, data])

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            chartRef.current?.resize()
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Handle Drawing Tools
    useEffect(() => {
        if (chartRef.current && activeTool) {
            let toolName: string | null = null
            switch (activeTool) {
                case 'trendline': toolName = 'segment'; break
                case 'ray': toolName = 'rayLine'; break
                case 'horizontal': toolName = 'horizontalRayLine'; break
                case 'vertical': toolName = 'verticalRayLine'; break
                case 'rect': toolName = 'rect'; break
                case 'circle': toolName = 'circle'; break
                case 'fib': toolName = 'fibonacciLine'; break
                case 'brush': toolName = 'rect'; break // Placeholder
                case 'text': toolName = 'simpleTag'; break
                case 'measure': toolName = 'priceLine'; break
                case 'cursor': toolName = null; break
                default: toolName = 'priceLine'
            }

            if (toolName) {
                chartRef.current.createOverlay({
                    name: toolName,
                    lock: isLocked,
                    // Magnet mode is handled by library settings if available, or we need custom logic.
                    // For now, we just set the tool.
                })
            }
        }
    }, [activeTool, isLocked])

    return (
        <div className="w-full h-full relative">
            {data.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-10 text-zinc-500">
                    No Data Available
                </div>
            )}
            <div ref={chartContainerRef} className="w-full h-full bg-[#050505]" />
        </div>
    )
})

KLineChart.displayName = 'KLineChart'

export { KLineChart }
