import { IChartApi, ISeriesApi, Time, LogicalRange } from 'lightweight-charts'

export interface Point {
    time: number // Unix timestamp
    price: number
}

export interface Drawing {
    id: string
    type: 'ray' | 'line' | 'rect' | 'circle' | 'horizontal' | 'vertical' | 'fib'
    points: Point[]
    color: string
    locked: boolean
    visible: boolean
}

export class DrawingManager {
    private chart: IChartApi
    private series: any
    private canvas: HTMLCanvasElement

    constructor(chart: IChartApi, series: any, canvas: HTMLCanvasElement) {
        this.chart = chart
        this.series = series
        this.canvas = canvas
    }

    // Convert Time/Price to X/Y
    public pointToCoordinate(point: Point): { x: number | null, y: number | null } {
        const timeScale = this.chart.timeScale()
        const x = timeScale.timeToCoordinate(point.time as Time)
        const y = this.series.priceToCoordinate(point.price)
        return { x, y }
    }

    // Convert X/Y to Time/Price
    public coordinateToPoint(x: number, y: number): Point | null {
        const timeScale = this.chart.timeScale()
        const time = timeScale.coordinateToTime(x)
        const price = this.series.coordinateToPrice(y)

        if (time === null || price === null) return null

        return {
            time: time as number,
            price: price
        }
    }

    public renderDrawings(drawings: Drawing[], activeDrawing: Drawing | null, selectedDrawingId: string | null) {
        const ctx = this.canvas.getContext('2d')
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        const allDrawings = activeDrawing ? [...drawings, activeDrawing] : drawings

        allDrawings.forEach(drawing => {
            if (!drawing.visible) return
            this.drawShape(ctx, drawing)

            if (drawing.id === selectedDrawingId) {
                this.drawSelectionHighlight(ctx, drawing)
            }
        })
    }

    private drawSelectionHighlight(ctx: CanvasRenderingContext2D, drawing: Drawing) {
        const coords = drawing.points.map(p => this.pointToCoordinate(p))
        if (coords.some(c => c.x === null || c.y === null)) return

        const validCoords = coords as { x: number, y: number }[]
        let handlePoints = [...validCoords]

        // Add extra handles for Rectangle (corners + midpoints)
        if (drawing.type === 'rect') {
            const [start, end] = validCoords
            const minX = Math.min(start.x, end.x)
            const maxX = Math.max(start.x, end.x)
            const minY = Math.min(start.y, end.y)
            const maxY = Math.max(start.y, end.y)
            const midX = (minX + maxX) / 2
            const midY = (minY + maxY) / 2

            handlePoints = [
                { x: minX, y: minY }, { x: midX, y: minY }, { x: maxX, y: minY },
                { x: maxX, y: midY }, { x: maxX, y: maxY }, { x: midX, y: maxY },
                { x: minX, y: maxY }, { x: minX, y: midY }
            ]
        }

        // Draw Handles (TradingView Style: White Fill, Blue Border)
        ctx.lineWidth = 1
        ctx.strokeStyle = '#2962FF'
        ctx.fillStyle = '#FFFFFF'

        handlePoints.forEach(point => {
            ctx.beginPath()
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
            ctx.fill()
            ctx.stroke()
        })
    }

    public hitTest(x: number, y: number, drawings: Drawing[]): string | null {
        for (const drawing of drawings) {
            if (!drawing.visible) continue

            const coords = drawing.points.map(p => this.pointToCoordinate(p))
            if (coords.some(c => c.x === null || c.y === null)) continue

            const [start, end] = coords as { x: number, y: number }[]
            const threshold = 5 // px

            if (drawing.type === 'line' || drawing.type === 'ray' || drawing.type === 'fib') {
                // Point to line segment distance
                const A = x - start.x
                const B = y - start.y
                const C = end.x - start.x
                const D = end.y - start.y

                const dot = A * C + B * D
                const lenSq = C * C + D * D
                let param = -1
                if (lenSq !== 0) param = dot / lenSq

                let xx, yy

                if (param < 0) {
                    xx = start.x
                    yy = start.y
                } else if (param > 1 && drawing.type !== 'ray') { // Ray extends indefinitely
                    xx = end.x
                    yy = end.y
                } else {
                    xx = start.x + param * C
                    yy = start.y + param * D
                }

                const dx = x - xx
                const dy = y - yy
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < threshold) return drawing.id

            } else if (drawing.type === 'rect') {
                // Check if point is near borders
                const minX = Math.min(start.x, end.x)
                const maxX = Math.max(start.x, end.x)
                const minY = Math.min(start.y, end.y)
                const maxY = Math.max(start.y, end.y)

                // Check if inside (optional, maybe just borders?)
                // For now, let's check borders with threshold
                const nearVertical = (Math.abs(x - minX) < threshold || Math.abs(x - maxX) < threshold) && y >= minY && y <= maxY
                const nearHorizontal = (Math.abs(y - minY) < threshold || Math.abs(y - maxY) < threshold) && x >= minX && x <= maxX

                if (nearVertical || nearHorizontal) return drawing.id

            } else if (drawing.type === 'circle') {
                const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
                const distToCenter = Math.sqrt(Math.pow(x - start.x, 2) + Math.pow(y - start.y, 2))
                if (Math.abs(distToCenter - radius) < threshold) return drawing.id
            } else if (drawing.type === 'horizontal') {
                if (Math.abs(y - start.y) < threshold) return drawing.id
            } else if (drawing.type === 'vertical') {
                if (Math.abs(x - start.x) < threshold) return drawing.id
            }
        }
        return null
    }

    private drawShape(ctx: CanvasRenderingContext2D, drawing: Drawing) {
        const coords = drawing.points.map(p => this.pointToCoordinate(p))

        // Skip if any point is off-screen (optimization, but simple check for now)
        if (coords.some(c => c.x === null || c.y === null)) return

        const validCoords = coords as { x: number, y: number }[]
        const [start, end] = validCoords

        ctx.strokeStyle = drawing.color
        ctx.lineWidth = 2
        ctx.beginPath()

        switch (drawing.type) {
            case 'line':
                ctx.moveTo(start.x, start.y)
                ctx.lineTo(end.x, end.y)
                ctx.stroke()
                break
            case 'ray':
                ctx.moveTo(start.x, start.y)
                // Calculate extension to canvas edge
                const dx = end.x - start.x
                const dy = end.y - start.y
                if (dx === 0) {
                    // Vertical ray
                    ctx.lineTo(start.x, dy > 0 ? this.canvas.height : 0)
                } else {
                    const slope = dy / dx
                    const targetX = dx > 0 ? this.canvas.width : 0
                    const targetY = start.y + slope * (targetX - start.x)
                    ctx.lineTo(targetX, targetY)
                }
                ctx.stroke()
                break
            case 'rect':
                const width = end.x - start.x
                const height = end.y - start.y
                ctx.strokeRect(start.x, start.y, width, height)
                ctx.fillStyle = drawing.color + '20' // 20% opacity
                ctx.fillRect(start.x, start.y, width, height)
                break
            case 'circle':
                const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
                ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI)
                ctx.stroke()
                break
            case 'horizontal':
                ctx.moveTo(0, start.y)
                ctx.lineTo(this.canvas.width, start.y)
                ctx.stroke()
                break
            case 'vertical':
                ctx.moveTo(start.x, 0)
                ctx.lineTo(start.x, this.canvas.height)
                ctx.stroke()
                break
            case 'fib':
                // Draw Trend Line
                ctx.setLineDash([5, 5])
                ctx.moveTo(start.x, start.y)
                ctx.lineTo(end.x, end.y)
                ctx.stroke()
                ctx.setLineDash([])

                // Draw Levels
                const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
                const yDiff = end.y - start.y

                levels.forEach(level => {
                    const y = start.y + (yDiff * level)
                    ctx.beginPath()
                    ctx.moveTo(Math.min(start.x, end.x), y)
                    ctx.lineTo(Math.max(start.x, end.x), y)
                    ctx.strokeStyle = drawing.color
                    ctx.stroke()

                    // Label
                    ctx.fillStyle = drawing.color
                    ctx.font = '10px sans-serif'
                    ctx.fillText(`${level}`, Math.max(start.x, end.x) + 5, y + 3)
                })
                break
        }
    }
}
