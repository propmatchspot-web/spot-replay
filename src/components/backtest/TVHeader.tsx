'use client'

import { Button } from '@/components/ui/button'
import {
    Search, Clock, BarChart2,
    Settings, Camera, Maximize,
    ChevronDown, PlayCircle, Plus
} from 'lucide-react'

import { ChartControls } from './ChartControls'

interface TVHeaderProps {
    symbol: string
    interval: string
    onIntervalChange: (interval: string) => void
    isReplayActive: boolean
    onReplayToggle: () => void
    // Chart Controls
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

export function TVHeader({
    symbol,
    interval,
    onIntervalChange,
    isReplayActive,
    onReplayToggle,
    chartType,
    onChartTypeChange,
    onAddIndicator,
    isMagnet,
    onMagnetToggle,
    isLocked,
    onLockToggle,
    areDrawingsHidden,
    onHideDrawingsToggle
}: TVHeaderProps) {
    return (
        <div className="h-12 bg-[#131722] border-b border-[#2a2e39] flex items-center px-2 justify-between shrink-0 select-none">
            {/* Left Group: Symbol & Timeframe */}
            <div className="flex items-center gap-0">
                {/* User Menu / Hamburger (Placeholder) */}
                <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-400 hover:bg-[#2a2e39] hover:text-zinc-100">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold">A</div>
                </Button>

                <div className="w-px h-6 bg-[#2a2e39] mx-1" />

                {/* Symbol */}
                <Button variant="ghost" className="h-10 px-2 text-zinc-100 font-bold hover:bg-[#2a2e39] gap-2">
                    {symbol}
                    <span className="text-xs text-zinc-500 font-normal">BINANCE</span>
                </Button>

                <div className="w-px h-6 bg-[#2a2e39] mx-1" />

                {/* Timeframes */}
                {['15m', '1h', '4h', 'D'].map((tf) => (
                    <Button
                        key={tf}
                        variant="ghost"
                        className={`h-10 w-10 px-0 font-medium hover:bg-[#2a2e39] ${interval === tf ? 'text-[#2962ff] bg-[#2a2e39]/50' : 'text-zinc-300'}`}
                        onClick={() => onIntervalChange(tf)}
                    >
                        {tf}
                    </Button>
                ))}
                <Button variant="ghost" size="icon" className="w-6 h-10 text-zinc-400 hover:bg-[#2a2e39]">
                    <ChevronDown className="w-3 h-3" />
                </Button>

                {/* Chart Controls */}
                <ChartControls
                    chartType={chartType}
                    onChartTypeChange={onChartTypeChange}
                    onAddIndicator={onAddIndicator}
                    isMagnet={isMagnet}
                    onMagnetToggle={onMagnetToggle}
                    isLocked={isLocked}
                    onLockToggle={onLockToggle}
                    areDrawingsHidden={areDrawingsHidden}
                    onHideDrawingsToggle={onHideDrawingsToggle}
                />
            </div>

            {/* Center Group: Layout Name (Optional, usually centered) */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
                <span className="text-sm text-zinc-300 font-medium">Unnamed Layout</span>
                <div className="w-2 h-2 rounded-full bg-zinc-600" />
                <span className="text-xs text-zinc-500">Autosaved</span>
            </div>

            {/* Right Group: Replay & Settings */}
            <div className="flex items-center gap-0">
                {/* Replay Button */}
                <Button
                    variant="ghost"
                    className={`h-10 px-3 hover:bg-[#2a2e39] gap-2 ${isReplayActive ? 'text-[#2962ff] bg-[#2a2e39]' : 'text-zinc-300'}`}
                    onClick={onReplayToggle}
                >
                    <PlayCircle className="w-5 h-5" />
                    <span className="hidden sm:inline">Replay</span>
                </Button>

                <div className="w-px h-6 bg-[#2a2e39] mx-2" />

                {/* Settings */}
                <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-400 hover:bg-[#2a2e39]">
                    <Settings className="w-5 h-5" />
                </Button>

                {/* Fullscreen */}
                <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-400 hover:bg-[#2a2e39]">
                    <Maximize className="w-5 h-5" />
                </Button>

                {/* Camera */}
                <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-400 hover:bg-[#2a2e39]">
                    <Camera className="w-5 h-5" />
                </Button>

                {/* Publish Button (Blue) */}
                <Button className="h-8 ml-2 bg-[#2962ff] hover:bg-[#1e53e5] text-white font-medium px-4 rounded-md">
                    Publish
                </Button>
            </div>
        </div>
    )
}
