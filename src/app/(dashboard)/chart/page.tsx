'use client'

import dynamic from 'next/dynamic'

// Dynamically import the chart container as it relies on window/browser APIs
const TVChartContainer = dynamic(
    () => import('@/components/charts/TVChartContainer'),
    { ssr: false }
)

export default function ChartPage() {
    return (
        <div className="h-[calc(100vh-6rem)] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            <TVChartContainer />
        </div>
    )
}
