'use client'

import { Button } from '@/components/ui/button'
import {
    Crosshair, TrendingUp, Hash,
    Magnet, Lock, EyeOff, Trash2,
    ArrowUpRight, Minus, MoveVertical, Square, Circle
} from 'lucide-react'

interface BacktestToolbarProps {
    activeTool: string | null
    onToolSelect: (tool: string | null) => void
    isMagnet: boolean
    onToggleMagnet: () => void
    isLocked: boolean
    onToggleLock: () => void
    areDrawingsHidden: boolean
    onToggleHide: () => void
    onRemoveAll: () => void
}

export function BacktestToolbar({
    activeTool,
    onToolSelect,
    isMagnet,
    onToggleMagnet,
    isLocked,
    onToggleLock,
    areDrawingsHidden,
    onToggleHide,
    onRemoveAll
}: BacktestToolbarProps) {

    const tools = [
        { id: 'cursor', icon: Crosshair, label: 'Crosshair' },
        { id: 'line', icon: TrendingUp, label: 'Trend Line' },
        { id: 'ray', icon: ArrowUpRight, label: 'Ray' },
        { id: 'horizontal', icon: Minus, label: 'Horizontal Line' },
        { id: 'vertical', icon: MoveVertical, label: 'Vertical Line' },
        { id: 'fib', icon: Hash, label: 'Fib Retracement' },
        { id: 'rect', icon: Square, label: 'Rectangle' },
        { id: 'circle', icon: Circle, label: 'Circle' },
    ]

    return (
        <div className="flex flex-col items-center gap-4 shrink-0 py-4">
            <div className="flex flex-col gap-1 bg-[#1E222D] p-1.5 rounded-lg border border-[#2a2e39] shadow-lg shadow-black/20">
                {tools.map((tool) => (
                    <Button
                        key={tool.id}
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 rounded-md transition-all ${activeTool === tool.id ? 'text-[#2962ff] bg-[#2a2e39]' : 'text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39]'}`}
                        onClick={() => onToolSelect(activeTool === tool.id ? null : tool.id)}
                        title={tool.label}
                    >
                        <tool.icon className="h-5 w-5" />
                    </Button>
                ))}
            </div>

            <div className="flex flex-col gap-1 bg-[#1E222D] p-1.5 rounded-lg border border-[#2a2e39] shadow-lg shadow-black/20">
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-md transition-all ${isMagnet ? 'text-[#2962ff] bg-[#2a2e39]' : 'text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39]'}`}
                    onClick={onToggleMagnet}
                    title="Magnet Mode"
                >
                    <Magnet className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-md transition-all ${isLocked ? 'text-[#2962ff] bg-[#2a2e39]' : 'text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39]'}`}
                    onClick={onToggleLock}
                    title="Lock All Drawings"
                >
                    <Lock className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-md transition-all ${areDrawingsHidden ? 'text-[#2962ff] bg-[#2a2e39]' : 'text-[#B2B5BE] hover:text-white hover:bg-[#2a2e39]'}`}
                    onClick={onToggleHide}
                    title="Hide All Drawings"
                >
                    <EyeOff className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-md text-[#B2B5BE] hover:text-[#ff5252] hover:bg-[#2a2e39] transition-all"
                    onClick={onRemoveAll}
                    title="Remove All Drawings"
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
