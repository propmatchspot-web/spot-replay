'use client'

import { Button } from '@/components/ui/button'
import {
    Play, Pause, SkipForward,
    StepForward, X, FastForward, ChevronDown, Check
} from 'lucide-react'
import { DraggableWidget } from '@/components/ui/DraggableWidget'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TVReplayPanelProps {
    isPlaying: boolean
    speed: number
    onPlayPause: () => void
    onStepForward: () => void
    onSpeedChange: (speed: number) => void
    onClose: () => void
}

export function TVReplayPanel({
    isPlaying,
    speed,
    onPlayPause,
    onStepForward,
    onSpeedChange,
    onClose
}: TVReplayPanelProps) {
    return (
        <DraggableWidget className="flex flex-col items-center gap-0" initialX={0} initialY={0}>
            {/* Main Control Bar */}
            <div className="flex items-center gap-1 p-1">
                {/* Jump To (Placeholder) */}
                <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-zinc-100 px-2 text-xs font-medium hover:bg-white/5">
                    Jump to...
                </Button>

                <div className="w-px h-4 bg-white/10 mx-1" />

                {/* Play/Pause */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#00E676] hover:bg-white/5 hover:text-[#00E676]"
                    onClick={onPlayPause}
                >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </Button>

                {/* Step Forward */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-300 hover:bg-white/5 hover:text-white"
                    onClick={onStepForward}
                >
                    <StepForward className="w-5 h-5" />
                </Button>

                <div className="w-px h-4 bg-white/10 mx-1" />

                {/* Speed Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-zinc-300 hover:text-white hover:bg-white/5 px-2 font-mono text-xs">
                            {speed === 2000 ? '0.5x' :
                                speed === 1000 ? '1x' :
                                    speed === 500 ? '2x' :
                                        speed === 200 ? '5x' :
                                            speed === 100 ? '10x' : 'Custom'}
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-white/10 text-white min-w-[80px]">
                        <DropdownMenuItem onClick={() => onSpeedChange(2000)} className="text-xs font-mono focus:bg-white/10 focus:text-white cursor-pointer justify-between">
                            0.5x {speed === 2000 && <Check className="w-3 h-3" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSpeedChange(1000)} className="text-xs font-mono focus:bg-white/10 focus:text-white cursor-pointer justify-between">
                            1.0x {speed === 1000 && <Check className="w-3 h-3" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSpeedChange(500)} className="text-xs font-mono focus:bg-white/10 focus:text-white cursor-pointer justify-between">
                            2.0x {speed === 500 && <Check className="w-3 h-3" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSpeedChange(200)} className="text-xs font-mono focus:bg-white/10 focus:text-white cursor-pointer justify-between">
                            5.0x {speed === 200 && <Check className="w-3 h-3" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSpeedChange(100)} className="text-xs font-mono focus:bg-white/10 focus:text-white cursor-pointer justify-between">
                            10x {speed === 100 && <Check className="w-3 h-3" />}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-px h-4 bg-white/10 mx-1" />

                {/* Close */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:bg-white/5 hover:text-red-400"
                    onClick={onClose}
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>
        </DraggableWidget>
    )
}
