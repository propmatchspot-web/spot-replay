'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { GripVertical, Play, Pause, SkipBack, SkipForward, ChevronDown } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface BacktestFloatingControlsProps {
    currentIndex: number
    totalCandles: number
    isPlaying: boolean
    speed: number
    interval: string
    onPlayPause: () => void
    onStepBack: () => void
    onStepForward: () => void
    onSeek: (value: number) => void
    onSpeedChange: (speed: number) => void
    onIntervalChange: (interval: string) => void
    onDragStart: (e: React.MouseEvent) => void
}

export function BacktestFloatingControls({
    currentIndex,
    totalCandles,
    isPlaying,
    speed,
    interval,
    onPlayPause,
    onStepBack,
    onStepForward,
    onSeek,
    onSpeedChange,
    onIntervalChange,
    onDragStart
}: BacktestFloatingControlsProps) {
    return (
        <div
            className="flex items-center gap-4 bg-[#1e222d] rounded-full px-4 py-2 border border-[#2a2e39] shadow-2xl backdrop-blur-md select-none z-50 cursor-default"
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Drag Handle */}
            <div
                className="cursor-move text-[#50535E] hover:text-white transition-colors"
                onMouseDown={onDragStart}
            >
                <GripVertical className="h-5 w-5" />
            </div>

            {/* Progress Slider */}
            <div className="w-64">
                <Slider
                    value={[currentIndex]}
                    max={totalCandles - 1}
                    step={1}
                    onValueChange={(vals) => onSeek(vals[0])}
                    className="cursor-pointer"
                />
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1 border-l border-[#2a2e39] pl-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39] rounded-full"
                    onClick={onPlayPause}
                >
                    {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39] rounded-full"
                    onClick={onStepForward}
                >
                    <SkipForward className="h-4 w-4" />
                </Button>
            </div>

            {/* Speed Toggle (Simple for now, mimicking toggle or use select) */}
            <div className="border-l border-[#2a2e39] pl-4 flex items-center gap-2">
                <Select value={speed.toString()} onValueChange={(v) => onSpeedChange(parseInt(v))}>
                    <SelectTrigger className="w-[70px] h-8 bg-transparent border-none text-[#B2B5BE] hover:text-white focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E222D] border-[#2a2e39] text-white">
                        <SelectItem value="1000">1x</SelectItem>
                        <SelectItem value="500">2x</SelectItem>
                        <SelectItem value="250">4x</SelectItem>
                        <SelectItem value="100">10x</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Interval */}
            <div className="border-l border-[#2a2e39] pl-4">
                <Select value={interval} onValueChange={onIntervalChange}>
                    <SelectTrigger className="w-[70px] h-8 bg-[#2a2e39] border-none text-white rounded-full focus:ring-0 text-xs font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E222D] border-[#2a2e39] text-white">
                        <SelectItem value="1m">1m</SelectItem>
                        <SelectItem value="5m">5m</SelectItem>
                        <SelectItem value="15m">15m</SelectItem>
                        <SelectItem value="1h">1h</SelectItem>
                        <SelectItem value="4h">4h</SelectItem>
                        <SelectItem value="D">Daily</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
