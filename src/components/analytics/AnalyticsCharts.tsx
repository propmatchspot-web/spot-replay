'use client'

import { PairPerformanceChart } from './PairPerformanceChart'
import { TimePerformanceChart } from './TimePerformanceChart'
import { DurationScatterChart } from './DurationScatterChart'

interface AnalyticsChartsProps {
    trades: any[]
}

export function AnalyticsCharts({ trades }: AnalyticsChartsProps) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PairPerformanceChart trades={trades} />
            <TimePerformanceChart trades={trades} />
            <div className="lg:col-span-2">
                <DurationScatterChart trades={trades} />
            </div>
        </div>
    )
}
