'use client'

import { useState } from 'react'
import { format, eachDayOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarHeatmapProps {
    trades: any[]
}

export function CalendarHeatmap({ trades }: CalendarHeatmapProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate
    })

    const getDayStatus = (date: Date) => {
        const dayTrades = trades.filter(t => isSameDay(new Date(t.open_time), date))
        if (dayTrades.length === 0) return 'empty'

        const dailyPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
        if (dailyPnL > 0) return 'win'
        if (dailyPnL < 0) return 'loss'
        return 'be'
    }

    const getStatusColor = (status: string, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return 'bg-zinc-900/20 opacity-20' // Dim non-current month days

        switch (status) {
            case 'win': return 'bg-[#F7AE11] shadow-[0_0_8px_rgba(247,174,17,0.4)]'
            case 'loss': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
            case 'be': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]'
            default: return 'bg-zinc-800/50 hover:bg-zinc-800'
        }
    }

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    return (
        <div className="w-full flex flex-col items-center">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between w-full max-w-xs mb-6">
                <button
                    onClick={prevMonth}
                    className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                    {format(currentDate, 'MMMM yyyy')}
                </h3>
                <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-4 sm:gap-6 md:gap-8 mb-6 w-full max-w-5xl px-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs font-bold text-zinc-600 mb-2">
                        {day}
                    </div>
                ))}
                {days.map((day) => {
                    const status = getDayStatus(day)
                    const dayTrades = trades.filter(t => isSameDay(new Date(t.open_time), day))
                    const dailyPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
                    const isCurrentMonth = isSameMonth(day, monthStart)

                    return (
                        <div
                            key={day.toISOString()}
                            className="group relative flex items-center justify-center aspect-square"
                        >
                            <div
                                className={cn(
                                    "h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full transition-all duration-300 flex items-center justify-center text-[10px] sm:text-xs font-medium",
                                    getStatusColor(status, isCurrentMonth),
                                    isCurrentMonth && status === 'empty' ? "text-zinc-700" : "text-transparent",
                                    isCurrentMonth && status !== 'empty' && "hover:scale-110 cursor-pointer"
                                )}
                            >
                                {/* Only show day number if empty, otherwise color bubble */}
                                {isCurrentMonth && status === 'empty' && format(day, 'd')}
                            </div>

                            {/* Tooltip - Only for days with trades */}
                            {status !== 'empty' && isCurrentMonth && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 pointer-events-none">
                                    <div className="bg-zinc-900/90 backdrop-blur-xl text-xs text-white px-3 py-2 rounded-xl border border-zinc-800/50 whitespace-nowrap shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)]">
                                        <p className="font-semibold mb-1 text-zinc-400 uppercase tracking-wider text-[10px]">{format(day, 'MMM d, yyyy')}</p>
                                        <p className={cn("text-sm font-bold", dailyPnL >= 0 ? 'text-[#F7AE11]' : 'text-red-400')}>
                                            {dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2)}
                                        </p>
                                        <p className="text-zinc-500 mt-0.5">{dayTrades.length} trades</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-xs font-medium text-zinc-500">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-zinc-800/50" />
                    <span>No Trade</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#F7AE11] shadow-[0_0_8px_rgba(247,174,17,0.4)]" />
                    <span>Profit</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                    <span>Loss</span>
                </div>
            </div>
        </div>
    )
}
