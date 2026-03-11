'use client'

import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode, CandlestickSeries } from 'lightweight-charts'
import { Candle } from '@/lib/binance'
import { DrawingManager, Drawing, Point } from './DrawingManager'

export interface PriceLineConfig {
    price: number
    color: string
    title: string
    lineStyle: number // 1: Solid, 2: Dashed, 3: Dotted
}

interface SmartChartProps {
    data: Candle[]
    priceLines?: PriceLineConfig[]
    activeTool?: string | null
    onDrawingComplete?: () => void
    chartType?: string
    isMagnet?: boolean
    isLocked?: boolean
    areDrawingsHidden?: boolean
    timezone?: string
    onContextMenu?: (params: { x: number, y: number, price: number }) => void
}

export const SmartChart = forwardRef(({
    data,
    priceLines = [],
    activeTool,
    onDrawingComplete,
    chartType = 'candle_solid',
    isMagnet = false,
    isLocked = false,
    areDrawingsHidden = false,
    timezone = 'Etc/UTC',
    onContextMenu
}: SmartChartProps, ref) => {
    // ... (refs)
    const priceLinesRef = useRef<any[]>([])

    // ... (init chart)

    // Update Price Lines
    useEffect(() => {
        if (!seriesRef.current) return

        // Clear existing lines
        priceLinesRef.current.forEach(line => {
            seriesRef.current?.removePriceLine(line)
        })
        priceLinesRef.current = []

        // Add new lines
        priceLines.forEach(line => {
            const priceLine = seriesRef.current?.createPriceLine({
                price: line.price,
                color: line.color,
                lineWidth: 1,
                lineStyle: line.lineStyle === 1 ? 0 : 2, // LWC: 0=Solid, 2=Dashed
                axisLabelVisible: true,
                title: line.title,
            })
            if (priceLine) priceLinesRef.current.push(priceLine)
        })
    }, [priceLines])

    // ... (rest of component)
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<any>(null)
    const drawingManagerRef = useRef<DrawingManager | null>(null)

    const [drawings, setDrawings] = useState<Drawing[]>([])
    const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null)
    const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null)

    // Expose methods
    useImperativeHandle(ref, () => ({
        createIndicator: (name: string) => {
            console.log('Indicator creation not yet implemented for LWC', name)
        },
        resize: () => {
            if (chartContainerRef.current && chartRef.current) {
                const { clientWidth, clientHeight } = chartContainerRef.current
                chartRef.current.resize(clientWidth, clientHeight)
                if (canvasRef.current) {
                    canvasRef.current.width = clientWidth
                    canvasRef.current.height = clientHeight
                    // Re-render drawings after resize
                    drawingManagerRef.current?.renderDrawings(drawings, currentDrawing, selectedDrawingId)
                }
            }
        },
        clearDrawings: () => {
            setDrawings([])
            setCurrentDrawing(null)
            setSelectedDrawingId(null)
        }
    }))

    // Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#000000' },
                textColor: '#B2B5BE',
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
            grid: {
                vertLines: { color: '#2B2B43' },
                horzLines: { color: '#2B2B43' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            timeScale: {
                borderColor: '#2B2B43',
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 50, // Position current candle at ~2/3 of screen
            },
            rightPriceScale: {
                borderColor: '#2B2B43',
            },
            localization: {
                timeZone: timezone,
            } as any
        })

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#089981',
            downColor: '#F23645',
            borderVisible: false,
            wickUpColor: '#089981',
            wickDownColor: '#F23645',
            priceFormat: {
                type: 'price',
                precision: 5,
                minMove: 0.00001,
            },
        })

        chartRef.current = chart
        seriesRef.current = candlestickSeries

        // Initialize Drawing Manager
        if (canvasRef.current) {
            // Match canvas size to container
            canvasRef.current.width = chartContainerRef.current.clientWidth
            canvasRef.current.height = chartContainerRef.current.clientHeight

            drawingManagerRef.current = new DrawingManager(chart, candlestickSeries, canvasRef.current)
        }

        // Handle Resize
        const handleResize = () => {
            if (chartContainerRef.current) {
                const { clientWidth, clientHeight } = chartContainerRef.current
                chart.resize(clientWidth, clientHeight)
                if (canvasRef.current) {
                    canvasRef.current.width = clientWidth
                    canvasRef.current.height = clientHeight
                    drawingManagerRef.current?.renderDrawings(drawings, currentDrawing, selectedDrawingId)
                }
            }
        }
        window.addEventListener('resize', handleResize)

        // Subscribe to visible range changes to redraw overlay
        chart.timeScale().subscribeVisibleTimeRangeChange(() => {
            drawingManagerRef.current?.renderDrawings(drawings, currentDrawing, selectedDrawingId)
        })

        return () => {
            window.removeEventListener('resize', handleResize)
            chart.remove()
        }
    }, [])

    // Update Data
    useEffect(() => {
        if (seriesRef.current && data.length > 0) {
            const chartData = data.map(d => ({
                time: d.time as any, // LWC accepts unix timestamp
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            }))
            seriesRef.current.setData(chartData)
        }
    }, [data])

    // Re-render drawings when they change
    useEffect(() => {
        drawingManagerRef.current?.renderDrawings(drawings, currentDrawing, selectedDrawingId)
    }, [drawings, currentDrawing, selectedDrawingId])

    // Magnet Logic
    const snapToCandle = (point: Point): Point => {
        if (!isMagnet || data.length === 0) return point

        // Binary search for closest candle by time
        let low = 0
        let high = data.length - 1
        let closestCandle = data[0]
        let minDiff = Infinity

        while (low <= high) {
            const mid = Math.floor((low + high) / 2)
            const candle = data[mid]
            const diff = Math.abs((candle.time as number) - point.time)

            if (diff < minDiff) {
                minDiff = diff
                closestCandle = candle
            }

            if ((candle.time as number) < point.time) {
                low = mid + 1
            } else {
                high = mid - 1
            }
        }

        // Find closest price level (OHLC)
        const prices = [closestCandle.open, closestCandle.high, closestCandle.low, closestCandle.close]
        let closestPrice = prices[0]
        let minPriceDiff = Math.abs(prices[0] - point.price)

        for (const p of prices) {
            const diff = Math.abs(p - point.price)
            if (diff < minPriceDiff) {
                minPriceDiff = diff
                closestPrice = p
            }
        }

        return {
            time: closestCandle.time as number,
            price: closestPrice
        }
    }



    // Refs for performance (avoid re-renders during drag/draw)
    const tempDrawingRef = useRef<Drawing | null>(null)
    const tempDrawingsRef = useRef<Drawing[]>([])
    const isDraggingRef = useRef(false)
    const dragStartPointRef = useRef<Point | null>(null)
    const selectedDrawingIdRef = useRef<string | null>(null)

    // Sync refs with state
    useEffect(() => {
        tempDrawingsRef.current = drawings
    }, [drawings])

    useEffect(() => {
        selectedDrawingIdRef.current = selectedDrawingId
    }, [selectedDrawingId])

    const renderLoop = useCallback(() => {
        if (drawingManagerRef.current) {
            // Use temp drawing if active, otherwise state
            const current = tempDrawingRef.current || currentDrawing
            // Use temp drawings if dragging, otherwise state
            const allDrawings = isDraggingRef.current ? tempDrawingsRef.current : drawings

            drawingManagerRef.current.renderDrawings(allDrawings, current, selectedDrawingIdRef.current)
        }
    }, [drawings, currentDrawing])

    // Toolbar Position State
    const [toolbarPosition, setToolbarPosition] = useState<{ x: number, y: number } | null>(null)

    // Mouse Event Handlers for Drawing
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!drawingManagerRef.current || !canvasRef.current) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // 1. Drawing Mode (Click-Click Interaction)
        if (activeTool) {
            let point = drawingManagerRef.current.coordinateToPoint(x, y)
            if (!point) return
            point = snapToCandle(point)

            if (!tempDrawingRef.current) {
                // First Click: Start Drawing
                const newDrawing: Drawing = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: activeTool as any,
                    points: [point, point], // Start with both points at same location
                    color: '#2962FF',
                    locked: false,
                    visible: true
                }
                tempDrawingRef.current = newDrawing
                requestAnimationFrame(renderLoop)
            } else {
                // Second Click: Finish Drawing
                // Update final point one last time
                tempDrawingRef.current = {
                    ...tempDrawingRef.current,
                    points: [tempDrawingRef.current.points[0], point]
                }
                setDrawings(prev => [...prev, tempDrawingRef.current!])
                tempDrawingRef.current = null
                if (onDrawingComplete) onDrawingComplete()
            }
            return
        }

        // 2. Selection / Drag Mode
        const hitId = drawingManagerRef.current.hitTest(x, y, drawings)
        if (hitId) {
            const drawing = drawings.find(d => d.id === hitId)
            if (drawing) {
                setSelectedDrawingId(hitId)
                selectedDrawingIdRef.current = hitId

                // Set toolbar position near the click
                setToolbarPosition({ x: x, y: y - 50 }) // 50px above click

                if (!drawing.locked && !isLocked) {
                    isDraggingRef.current = true
                    const point = drawingManagerRef.current.coordinateToPoint(x, y)
                    if (point) dragStartPointRef.current = point
                }
                return
            }
        }

        // Deselect if clicked empty space
        setSelectedDrawingId(null)
        selectedDrawingIdRef.current = null
        setToolbarPosition(null)
        requestAnimationFrame(renderLoop)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!drawingManagerRef.current || !canvasRef.current) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        let point = drawingManagerRef.current.coordinateToPoint(x, y)
        if (!point) return
        point = snapToCandle(point)

        // 1. Drawing Mode
        if (tempDrawingRef.current && activeTool) {
            tempDrawingRef.current = {
                ...tempDrawingRef.current,
                points: [tempDrawingRef.current.points[0], point!]
            }
            requestAnimationFrame(renderLoop)
            return
        }

        // 2. Drag Mode
        if (isDraggingRef.current && selectedDrawingIdRef.current && dragStartPointRef.current) {
            const timeDiff = point.time - dragStartPointRef.current.time
            const priceDiff = point.price - dragStartPointRef.current.price

            // Update temp drawings ref without triggering state update
            tempDrawingsRef.current = drawings.map(d => {
                if (d.id !== selectedDrawingIdRef.current) return d
                return {
                    ...d,
                    points: d.points.map(p => ({
                        time: p.time + timeDiff,
                        price: p.price + priceDiff
                    }))
                }
            })

            dragStartPointRef.current = point // Update start point for continuous delta
            requestAnimationFrame(renderLoop)
            return
        }

        // 3. Hover Effect (Cursor)
        const hitId = drawingManagerRef.current.hitTest(x, y, drawings)
        if (hitId) {
            canvasRef.current.style.cursor = 'move'
        } else {
            canvasRef.current.style.cursor = activeTool ? 'crosshair' : 'default'
        }
    }

    const handleMouseUp = () => {
        // Commit Drag
        if (isDraggingRef.current) {
            setDrawings(tempDrawingsRef.current)
            isDraggingRef.current = false
            dragStartPointRef.current = null
        }
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!chartRef.current || !chartContainerRef.current || !onContextMenu) return

        const rect = chartContainerRef.current.getBoundingClientRect()
        const y = e.clientY - rect.top

        // Get price at Y coordinate
        const price = seriesRef.current?.coordinateToPrice(y)

        if (price) {
            onContextMenu({
                x: e.clientX,
                y: e.clientY,
                price: price
            })
        }
    }

    const [isHovering, setIsHovering] = useState(false)

    // Handler for the container to detect hover when canvas is pointer-events-none
    const handleContainerMouseMove = (e: React.MouseEvent) => {
        if (!drawingManagerRef.current || !canvasRef.current || activeTool) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const hitId = drawingManagerRef.current.hitTest(x, y, drawings)
        setIsHovering(!!hitId)
    }

    const handleDeleteDrawing = () => {
        if (selectedDrawingId) {
            setDrawings(prev => prev.filter(d => d.id !== selectedDrawingId))
            setSelectedDrawingId(null)
            setToolbarPosition(null)
        }
    }

    const handleLockDrawing = () => {
        if (selectedDrawingId) {
            setDrawings(prev => prev.map(d => d.id === selectedDrawingId ? { ...d, locked: !d.locked } : d))
        }
    }

    return (
        <div
            className="w-full h-full relative"
            onMouseMove={handleContainerMouseMove}
            onContextMenu={handleContextMenu}
        >
            <div ref={chartContainerRef} className="w-full h-full absolute inset-0" />
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10"
                style={{
                    cursor: activeTool ? 'crosshair' : (isHovering ? 'move' : 'default'),
                    pointerEvents: activeTool || isHovering ? 'auto' : 'none'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />

            {/* Drawing Toolbar */}
            {selectedDrawingId && toolbarPosition && (
                <div
                    className="absolute z-50 flex items-center bg-[#1e222d] rounded-lg border border-[#2a2e39] p-1 gap-1 shadow-lg"
                    style={{ left: toolbarPosition.x, top: toolbarPosition.y }}
                >
                    {/* Drag Handle */}
                    <div className="px-1 cursor-move grid grid-cols-2 gap-0.5 opacity-50">
                        <div className="w-0.5 h-0.5 bg-white rounded-full" />
                        <div className="w-0.5 h-0.5 bg-white rounded-full" />
                        <div className="w-0.5 h-0.5 bg-white rounded-full" />
                        <div className="w-0.5 h-0.5 bg-white rounded-full" />
                        <div className="w-0.5 h-0.5 bg-white rounded-full" />
                        <div className="w-0.5 h-0.5 bg-white rounded-full" />
                    </div>

                    <div className="h-4 w-px bg-[#2a2e39] mx-1" />

                    {/* Actions */}
                    <button className="p-1.5 hover:bg-[#2a2e39] rounded text-[#d1d4dc] hover:text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button className="p-1.5 hover:bg-[#2a2e39] rounded text-[#d1d4dc] hover:text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    </button>

                    <div className="h-4 w-px bg-[#2a2e39] mx-1" />

                    <button onClick={handleLockDrawing} className={`p-1.5 hover:bg-[#2a2e39] rounded ${drawings.find(d => d.id === selectedDrawingId)?.locked ? 'text-[#2962ff]' : 'text-[#d1d4dc]'} hover:text-white`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </button>
                    <button onClick={handleDeleteDrawing} className="p-1.5 hover:bg-[#2a2e39] rounded text-[#d1d4dc] hover:text-[#ff5252]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            )}
        </div>
    )
})

SmartChart.displayName = 'SmartChart'
