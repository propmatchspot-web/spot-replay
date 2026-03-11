import { CandlestickChart, PriceLineConfig } from './CandlestickChart'
import { Candle } from '@/lib/binance'
import { cn } from '@/lib/utils'

interface ChartConfig {
    id: string
    timeframe: string
    data: Candle[]
    label: string
}

interface MultiChartGridProps {
    charts: ChartConfig[]
    priceLines?: PriceLineConfig[]
}

export function MultiChartGrid({ charts, priceLines = [] }: MultiChartGridProps) {
    // Determine grid columns based on number of charts
    const gridCols = charts.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'

    return (
        <div className={cn("grid gap-4 h-full min-h-0", gridCols)}>
            {charts.map((chart) => (
                <div key={chart.id} className="relative bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden flex flex-col min-h-0">
                    {/* Chart Header Overlay */}
                    <div className="absolute top-4 left-4 z-10 bg-zinc-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-3">
                        <span className="text-sm font-bold text-white">{chart.label}</span>
                        <span className="text-xs font-mono text-zinc-400 border-l border-zinc-700 pl-3">
                            {chart.data.length > 0
                                ? new Date(chart.data[chart.data.length - 1].time * 1000).toLocaleString()
                                : '-'}
                        </span>
                    </div>

                    {/* Chart Component */}
                    <div className="flex-1 min-h-0">
                        <CandlestickChart data={chart.data} priceLines={priceLines} />
                    </div>
                </div>
            ))}
        </div>
    )
}
