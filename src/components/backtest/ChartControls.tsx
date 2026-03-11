'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import {
    ChevronDown, Activity, BarChart2, LineChart,
    Magnet, Lock, EyeOff, Settings, Check
} from 'lucide-react'

interface ChartControlsProps {
    chartType: string
    onChartTypeChange: (type: string) => void
    onAddIndicator: (name: string) => void
    isMagnet: boolean
    onMagnetToggle: () => void
    isLocked: boolean
    onLockToggle: () => void
    areDrawingsHidden: boolean
    onHideDrawingsToggle: () => void
}

export function ChartControls({
    chartType,
    onChartTypeChange,
    onAddIndicator,
    isMagnet,
    onMagnetToggle,
    isLocked,
    onLockToggle,
    areDrawingsHidden,
    onHideDrawingsToggle
}: ChartControlsProps) {
    return (
        <div className="flex items-center gap-2 h-full">
            <div className="w-px h-4 bg-white/10 mx-2" />

            {/* Chart Type Selector */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-zinc-400 hover:text-white px-2">
                        {chartType === 'candle_solid' ? <BarChart2 className="w-4 h-4" /> :
                            chartType === 'area' ? <Activity className="w-4 h-4" /> :
                                <LineChart className="w-4 h-4" />}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#0A0A0A] border-white/10 text-white min-w-[140px]">
                    <DropdownMenuLabel>Chart Style</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onChartTypeChange('candle_solid')} className="gap-2 cursor-pointer">
                        <BarChart2 className="w-4 h-4" /> Candles
                        {chartType === 'candle_solid' && <Check className="w-3 h-3 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChartTypeChange('area')} className="gap-2 cursor-pointer">
                        <Activity className="w-4 h-4" /> Area
                        {chartType === 'area' && <Check className="w-3 h-3 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChartTypeChange('line')} className="gap-2 cursor-pointer">
                        <LineChart className="w-4 h-4" /> Line
                        {chartType === 'line' && <Check className="w-3 h-3 ml-auto" />}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Indicators Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-zinc-400 hover:text-white px-2">
                        <Activity className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs">Indicators</span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#0A0A0A] border-white/10 text-white min-w-[200px]">
                    <DropdownMenuLabel>Popular</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onAddIndicator('MA')} className="cursor-pointer">
                        Moving Average
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddIndicator('EMA')} className="cursor-pointer">
                        Exponential MA
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddIndicator('BOLL')} className="cursor-pointer">
                        Bollinger Bands
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuLabel>Oscillators</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onAddIndicator('RSI')} className="cursor-pointer">
                        RSI
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddIndicator('MACD')} className="cursor-pointer">
                        MACD
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddIndicator('KDJ')} className="cursor-pointer">
                        KDJ
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddIndicator('VOL')} className="cursor-pointer">
                        Volume
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-4 bg-white/10 mx-2" />

            {/* Quick Tools */}
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${isMagnet ? 'text-[#2962ff] bg-white/5' : 'text-zinc-400 hover:text-white'}`}
                    onClick={onMagnetToggle}
                    title="Magnet Mode"
                >
                    <Magnet className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${isLocked ? 'text-[#2962ff] bg-white/5' : 'text-zinc-400 hover:text-white'}`}
                    onClick={onLockToggle}
                    title="Lock All Drawings"
                >
                    <Lock className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${areDrawingsHidden ? 'text-[#2962ff] bg-white/5' : 'text-zinc-400 hover:text-white'}`}
                    onClick={onHideDrawingsToggle}
                    title="Hide All Drawings"
                >
                    <EyeOff className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
