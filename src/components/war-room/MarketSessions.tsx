'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export function MarketSessions() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const utcHours = time.getUTCHours()
    const utcMinutes = time.getUTCMinutes()

    // Current UTC decimal time for indicator
    const currentUtc = utcHours + utcMinutes / 60

    // Session Logic (UTC)
    const sessions = [
        { name: 'London', start: 7, end: 16, color: 'emerald', label: '07:00 - 16:00 UTC' },
        { name: 'New York', start: 12, end: 21, color: 'blue', label: '12:00 - 21:00 UTC' },
        { name: 'Tokyo', start: 0, end: 9, color: 'orange', label: '00:00 - 09:00 UTC' },
        { name: 'Sydney', start: 22, end: 7, color: 'yellow', label: '22:00 - 07:00 UTC' },
        // Note: Sydney wraps around midnight. Handling visualization for 0-24h axis requires splitting.
    ]

    const timeMarkers = Array.from({ length: 25 }, (_, i) => i) // 0 to 24

    return (
        <div className="w-full rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-wide">Global Market Sessions</h2>
                        <p className="text-xs text-zinc-500 font-mono">UTC TIMEZONE BASELINE</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Local</p>
                        <p className="text-xl font-mono font-bold text-zinc-300">
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">UTC</p>
                        <p className="text-xl font-mono font-bold text-white">
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Timeline Visualization */}
            <div className="relative w-full h-48 select-none">
                {/* Time Axis (Top) */}
                <div className="absolute top-0 left-0 w-full flex justify-between px-2 text-[10px] font-mono text-zinc-600">
                    {timeMarkers.filter(h => h % 2 === 0).map(h => (
                        <span key={h} style={{ left: `${(h / 24) * 100}%` }} className="absolute transform -translate-x-1/2">
                            {h.toString().padStart(2, '0')}:00
                        </span>
                    ))}
                </div>

                {/* Grid Lines */}
                <div className="absolute top-6 bottom-0 left-0 w-full flex justify-between px-2">
                    {timeMarkers.map(h => (
                        <div key={h} className={`h-full w-px ${h % 4 === 0 ? 'bg-zinc-800' : 'bg-white/5'} absolute`} style={{ left: `${(h / 24) * 100}%` }} />
                    ))}
                </div>

                {/* Current Time Indicator Line */}
                <div
                    className="absolute top-4 bottom-0 w-0.5 bg-red-500 z-20 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    style={{ left: `${(currentUtc / 24) * 100}%` }}
                >
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                </div>

                {/* Session Bars Container */}
                <div className="absolute top-8 left-0 w-full flex flex-col gap-3 px-2">
                    {sessions.map(session => {
                        // Calculate width and position
                        // Needs special handling for wrap-around sessions like Sydney (22 -> 7)
                        const isWrap = session.start > session.end;

                        return (
                            <div key={session.name} className="relative h-8 w-full">
                                {isWrap ? (
                                    <>
                                        {/* Part 1: Start to Midnight */}
                                        <div
                                            className={`absolute h-full rounded-l-md bg-${session.color}-500/20 border-l border-t border-b border-${session.color}-500/50 flex items-center pl-2 overflow-hidden`}
                                            style={{ left: `${(session.start / 24) * 100}%`, right: 0 }}
                                        >
                                            <span className={`text-[10px] font-bold text-${session.color}-500 uppercase tracking-wider`}>{session.name}</span>
                                        </div>
                                        {/* Part 2: Midnight to End */}
                                        <div
                                            className={`absolute h-full rounded-r-md bg-${session.color}-500/20 border-r border-t border-b border-${session.color}-500/50`}
                                            style={{ left: 0, width: `${(session.end / 24) * 100}%` }}
                                        />
                                    </>
                                ) : (
                                    <div
                                        className={`absolute h-full rounded-md bg-${session.color}-500/20 border border-${session.color}-500/50 flex items-center pl-2 overflow-hidden hover:bg-${session.color}-500/30 transition-all`}
                                        style={{
                                            left: `${(session.start / 24) * 100}%`,
                                            width: `${((session.end - session.start) / 24) * 100}%`
                                        }}
                                    >
                                        <span className={`text-[10px] font-bold text-${session.color}-500 uppercase tracking-wider`}>{session.name}</span>
                                        <span className={`text-[9px] text-${session.color}-400 ml-2 hidden lg:inline-block`}>{session.label}</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
