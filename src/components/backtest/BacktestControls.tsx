'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    FastForward,
    GripHorizontal,
    RotateCcw,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface BacktestControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onStepForward: () => void;
    onStepBack?: () => void;
    onRewind: () => void;
    onOrderClick: () => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
    currentDate?: number;
}

export function BacktestControls({
    isPlaying,
    onPlayPause,
    onStepForward,
    onStepBack,
    onRewind,
    onOrderClick,
    speed,
    onSpeedChange,
    currentDate
}: BacktestControlsProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Speed mapping: 1000ms (1x) -> 100ms (10x)
    // Slider value: 1 (Slow) -> 10 (Fast)
    const handleSliderChange = (vals: number[]) => {
        const val = vals[0];
        // Map 1-10 to ms (1000 -> 100)
        // 1 -> 1000
        // 10 -> 100
        // roughly: 1100 - (val * 100)
        const newSpeed = 1100 - (val * 100);
        onSpeedChange(newSpeed);
    };

    const sliderVal = (1100 - speed) / 100;

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ x: 0, y: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 rounded-xl bg-[#1e222d]/90 backdrop-blur-md border border-[#2a2e39] shadow-2xl shadow-black/50"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Drag Handle */}
            <div className="cursor-grab active:cursor-grabbing px-1 text-[#666] hover:text-[#888]">
                <GripHorizontal size={20} />
            </div>

            <div className="h-6 w-px bg-[#2a2e39] mx-1" />

            {/* Rewind */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onRewind}
                className="h-8 w-8 text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
                title="Reset Session"
            >
                <RotateCcw size={18} />
            </Button>

            {/* Play Controls */}
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPlayPause}
                    className={cn(
                        "h-10 w-10 rounded-full transition-all",
                        isPlaying
                            ? "bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20"
                            : "bg-[#089981]/10 text-[#089981] hover:bg-[#089981]/20"
                    )}
                >
                    {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} className="ml-0.5" />}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onStepForward}
                    className="h-8 w-8 text-[#d1d4dc] hover:text-white hover:bg-[#2a2e39]"
                    title="Step Forward"
                >
                    <SkipForward size={18} />
                </Button>
            </div>

            <div className="h-6 w-px bg-[#2a2e39] mx-1" />

            {/* Order Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onOrderClick}
                className="h-8 w-8 text-[#3b82f6] hover:text-[#3b82f6] hover:bg-[#3b82f6]/10"
                title="Place Order"
            >
                <Plus size={18} />
            </Button>

            <div className="h-6 w-px bg-[#2a2e39] mx-1" />

            {/* Speed Control */}
            <div className="flex items-center gap-3 px-2">
                <FastForward size={14} className="text-[#666]" />
                <div className="w-24">
                    <Slider
                        value={[sliderVal]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={handleSliderChange}
                        className="cursor-pointer"
                    />
                </div>
                <span className="text-[10px] font-mono text-[#666] w-6 text-right">
                    {Math.round(sliderVal)}x
                </span>
            </div>

            {/* Date Display */}
            {currentDate && (
                <>
                    <div className="h-6 w-px bg-[#2a2e39] mx-1" />
                    <div className="px-2 font-mono text-xs text-[#d1d4dc]">
                        {new Date(currentDate).toLocaleString()}
                    </div>
                </>
            )}

        </motion.div>
    );
}
