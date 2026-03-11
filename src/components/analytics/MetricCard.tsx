import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
    title: string
    value: string | number
    subValue?: string
    icon: LucideIcon
    trend?: 'up' | 'down' | 'neutral'
    className?: string
}

export function MetricCard({ title, value, subValue, icon: Icon, trend, className }: MetricCardProps) {
    return (
        <Card className={cn("bg-zinc-900/50 border-zinc-800", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                {subValue && (
                    <p className={cn(
                        "text-xs mt-1",
                        trend === 'up' ? "text-emerald-400" :
                            trend === 'down' ? "text-red-400" : "text-zinc-500"
                    )}>
                        {subValue}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
