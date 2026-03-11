'use client'

import { useEffect, useRef, useState } from 'react'
import { IChartApi, ISeriesApi, MouseEventParams } from 'lightweight-charts'

interface Point {
    time: number // unix timestamp
    price: number
}

interface Drawing {
    id: string
    type: 'trendline' | 'fib' | 'rectangle'
    points: Point[]
    color: string
}

interface ChartDrawingOverlayProps {
    chart: IChartApi | null
    series: ISeriesApi<"Candlestick"> | null
    activeTool: string | null
    onDrawingComplete: () => void
}

export function ChartDrawingOverlay({ chart, series, activeTool, onDrawingComplete }: ChartDrawingOverlayProps) {
    const [drawings, setDrawings] = useState<Drawing[]>([])
    const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null)
    const overlayRef = useRef<SVGSVGElement>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    // Handle Resize
    useEffect(() => {
        if (!chart) return
        const handleResize = () => {
            const container = chart.chartElement().parentElement
            if (container) {
                setDimensions({ width: container.clientWidth, height: container.clientHeight })
            }
        }
        window.addEventListener('resize', handleResize)
        // Initial size
        handleResize()
        return () => window.removeEventListener('resize', handleResize)
    }, [chart])

    // Sync with Chart Scroll/Zoom
    const [version, setVersion] = useState(0)
    useEffect(() => {
        if (!chart) return
        const handleTimeChange = () => setVersion(v => v + 1)
        chart.timeScale().subscribeVisibleTimeRangeChange(handleTimeChange)
        return () => chart.timeScale().unsubscribeVisibleTimeRangeChange(handleTimeChange)
    }, [chart])

    // Helper to convert Point to XY
    const getCoords = (p: Point) => {
        if (!chart || !series) return null
        const x = chart.timeScale().timeToCoordinate(p.time as any)
        const y = series.priceToCoordinate(p.price)
        if (x === null || y === null) return null
        return { x, y }
    }

    // Handle SVG Click
    const onSvgClick = (e: React.MouseEvent) => {
        if (!chart || !series || !activeTool) return

        // Get mouse position relative to SVG
        const rect = overlayRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Convert to Time/Price
        const price = series.coordinateToPrice(y)
        const time = chart.timeScale().coordinateToTime(x) as number

        if (!price || !time) return

        if (!currentDrawing) {
            setCurrentDrawing({
                id: Math.random().toString(36).substr(2, 9),
                type: activeTool as any,
                points: [{ time, price }],
                color: '#10b981'
            })
        } else {
            const newDrawing = {
                ...currentDrawing,
                points: [...currentDrawing.points, { time, price }]
            }
            setDrawings(prev => [...prev, newDrawing])
            setCurrentDrawing(null)
            onDrawingComplete()
        }
    }

    const onSvgMouseMove = (e: React.MouseEvent) => {
        if (!currentDrawing || !chart || !series) return

        // Update temporary second point for preview if we want live dragging
        // For MVP, we skip this to avoid complex state updates on mouse move
    }

    // Render Drawings
    const renderDrawing = (d: Drawing) => {
        const p1 = getCoords(d.points[0])
        const p2 = d.points[1] ? getCoords(d.points[1]) : null

        if (!p1) return null

        if (d.type === 'trendline' && p2) {
            return (
                <line
                    key={d.id}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={d.color}
                    strokeWidth={2}
                />
            )
        }

        if (d.type === 'fib' && p2) {
            return (
                <g key={d.id}>
                    <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={d.color} strokeDasharray="4 4" />
                </g>
            )
        }

        return null
    }

    return (
        <svg
            ref={overlayRef}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
                width: '100%',
                height: '100%',
                pointerEvents: activeTool ? 'auto' : 'none',
                cursor: activeTool ? 'crosshair' : 'default'
            }}
            onClick={onSvgClick}
            onMouseMove={onSvgMouseMove}
        >
            {drawings.map(renderDrawing)}
            {currentDrawing && (
                <circle
                    cx={getCoords(currentDrawing.points[0])?.x}
                    cy={getCoords(currentDrawing.points[0])?.y}
                    r={4}
                    fill="white"
                    stroke={currentDrawing.color}
                />
            )}
        </svg>
    )
}
