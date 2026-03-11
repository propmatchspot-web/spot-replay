'use client'

import { useState, useEffect } from 'react'
import { Clock, Plus, X } from 'lucide-react'

interface TimeZone {
    id: string
    name: string
    zone: string
    default?: boolean
}

const DEFAULT_ZONES: TimeZone[] = [
    { id: 'local', name: 'Local', zone: 'local', default: true },
    { id: 'ny', name: 'New York', zone: 'America/New_York', default: true },
    { id: 'utc', name: 'UTC', zone: 'UTC', default: true },
]

const AVAILABLE_ZONES = [
    { name: 'London', zone: 'Europe/London' },
    { name: 'Tokyo', zone: 'Asia/Tokyo' },
    { name: 'Sydney', zone: 'Australia/Sydney' },
    { name: 'Dubai', zone: 'Asia/Dubai' },
    { name: 'Frankfurt', zone: 'Europe/Berlin' },
]

export function MarketClock() {
    const [time, setTime] = useState(new Date())
    const [activeZones, setActiveZones] = useState<TimeZone[]>(DEFAULT_ZONES)
    const [isAdding, setIsAdding] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (date: Date, timeZone: string) => {
        try {
            if (timeZone === 'local') {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone })
        } catch (e) {
            return '--:--:--'
        }
    }

    const addZone = (zone: { name: string, zone: string }) => {
        setActiveZones(prev => [...prev, { id: zone.zone, name: zone.name, zone: zone.zone }])
        setIsAdding(false)
    }

    const removeZone = (id: string) => {
        setActiveZones(prev => prev.filter(z => z.id !== id))
    }

    // Session Logic (Simplified for Visuals using UTC hours as approximate baseline for bars)
    // Accurate session status requires complex Luxon/date-fns-tz logic, defaulting to UTC overlap visualization
    const utcHours = time.getUTCHours()
    const utcMinutes = time.getUTCMinutes()

    // Session Definitions (UTC baseline - approximations for visualization)
    const sessions = [
        { name: 'London', start: 7, end: 16, color: 'emerald', zone: 'Europe/London' },
        { name: 'New York', start: 12, end: 21, color: 'blue', zone: 'America/New_York' },
        { name: 'Asian', start: 0, end: 9, color: 'orange', zone: 'Asia/Tokyo' },
    ]

    const getStatus = (start: number, end: number) => {
        const current = utcHours + utcMinutes / 60
        if (start < end) {
            if (current >= start && current < end) return 'OPEN'
            if (current >= start - 1 && current < start) return 'PRE'
            return 'CLOSED'
        } else {
            if (current >= start || current < end) return 'OPEN'
            return 'CLOSED'
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Clocks Grid */}
            <div className="grid grid-cols-1 gap-3">
                {activeZones.map(zone => (
                    <div key={zone.id} className="group flex items-center justify-between rounded-xl bg-zinc-950 p-4 border border-zinc-800 relative">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{zone.name}</p>
                                <p className="text-xl font-mono font-bold text-white">
                                    {formatTime(time, zone.zone)}
                                </p>
                            </div>
                        </div>
                        {!zone.default && (
                            <button
                                onClick={() => removeZone(zone.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all absolute top-2 right-2"
                            >
                                <X className="w-3 h-3 text-zinc-500" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Zone Button */}
            <div className="relative">
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="w-full py-2 rounded-lg border border-dashed border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                    <Plus className="w-3 h-3" /> Add Timezone
                </button>

                {isAdding && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 overflow-hidden">
                        {AVAILABLE_ZONES.filter(z => !activeZones.find(az => az.zone === z.zone)).map(zone => (
                            <button
                                key={zone.zone}
                                onClick={() => addZone(zone)}
                                className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all block"
                            >
                                {zone.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Session Bars */}
            <div className="space-y-2 mt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 pl-1">Global Sessions (UTC)</p>
                {sessions.map(session => {
                    const status = getStatus(session.start, session.end)
                    const isActive = status === 'OPEN'

                    return (
                        <div key={session.name} className={`relative overflow-hidden rounded-lg border ${isActive ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800/50 bg-zinc-950/50'} p-2.5 transition-all`}>
                            {isActive && (
                                <div className={`absolute left-0 top-0 h-full w-0.5 bg-${session.color}-500`} />
                            )}
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                                    {session.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? `bg-${session.color}-500 animate-pulse` : 'bg-zinc-800'}`} />
                                    <span className={`text-[10px] font-medium ${isActive ? `text-${session.color}-400` : 'text-zinc-600'}`}>
                                        {status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
