'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
    Play, Pause, SkipBack, SkipForward,
    ChevronLeft, ChevronRight, Settings,
    Newspaper, BookOpen, PlusCircle
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BacktestTopBarProps {
    sessionName: string
    currentIndex: number
    totalCandles: number
    isPlaying: boolean
    speed: number
    onPlayPause: () => void
    onStepBack: () => void
    onStepForward: () => void
    onSeek: (value: number) => void
    onSpeedChange: (speed: number) => void
    onPlaceOrder: () => void
}

export function BacktestTopBar({
    sessionName,
    currentIndex,
    totalCandles,
    isPlaying,
    speed,
    onPlayPause,
    onStepBack,
    onStepForward,
    onSeek,
    onSpeedChange,
    onPlaceOrder
}: BacktestTopBarProps) {
    return (
        <div className="h-16 bg-[#131722] border-b border-[#2a2e39] flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
                </div>

                <div className="h-6 w-px bg-[#2a2e39]" />

                {/* Navigation */}
                <div className="flex items-center gap-1 text-[#B2B5BE]">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#2a2e39] hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2 px-2">
                        <span className="font-bold text-white text-sm tracking-wide">{sessionName || 'Untitled Session'}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-[#50535E] hover:text-white hover:bg-transparent">
                            <Settings className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Center: Replay Controls */}
            <div className="flex items-center gap-6 flex-1 justify-center max-w-3xl">
                {/* Playback Controls */}
                <div className="flex items-center gap-1 bg-[#1E222D] rounded-lg p-1 border border-[#2a2e39] shadow-sm">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39]" onClick={onStepBack}>
                        <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${isPlaying ? 'text-emerald-500 bg-emerald-500/10' : 'text-white hover:bg-[#2a2e39]'}`}
                        onClick={onPlayPause}
                    >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39]" onClick={onStepForward}>
                        <SkipForward className="h-4 w-4" />
                    </Button>
                </div>

                {/* Progress Slider */}
                <div className="flex-1 mx-2 group">
                    <Slider
                        value={[currentIndex]}
                        max={totalCandles - 1}
                        step={1}
                        onValueChange={(vals) => onSeek(vals[0])}
                        className="cursor-pointer"
                    />
                </div>

                {/* Speed Selector */}
                <Select value={speed.toString()} onValueChange={(v) => onSpeedChange(parseInt(v))}>
                    <SelectTrigger className="w-[80px] h-9 bg-[#1E222D] border-[#2a2e39] text-xs text-white focus:ring-0 focus:ring-offset-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E222D] border-[#2a2e39] text-white">
                        <SelectItem value="1000">1x Speed</SelectItem>
                        <SelectItem value="500">2x Speed</SelectItem>
                        <SelectItem value="100">10x Speed</SelectItem>
                        <SelectItem value="10">Max Speed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <Button
                    className="h-9 bg-[#2962FF] hover:bg-[#1e54eb] text-white border-none shadow-md shadow-blue-900/20 font-medium px-4"
                    onClick={onPlaceOrder}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Place Order
                </Button>

                <div className="h-6 w-px bg-[#2a2e39]" />

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-9 text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39]">
                        <Newspaper className="mr-2 h-4 w-4" />
                        News
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39]">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Journal
                    </Button>
                </div>
            </div>
        </div>
    )
}
