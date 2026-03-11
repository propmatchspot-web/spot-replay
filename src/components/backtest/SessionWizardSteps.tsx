import { motion } from 'framer-motion'
import { useState } from 'react'

import { Zap, BarChart2, Calendar as CalendarIcon, Clock, Settings, CheckCircle, ChevronRight, Search, Coins, Briefcase, LineChart, BadgeDollarSign, Globe, Check, Hammer } from 'lucide-react'
import { ASSET_CATEGORIES } from '@/lib/assets'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { PropFirmSettings, ChallengeRules } from './PropFirmSettings'
import { timezones } from '@/lib/timezones'

// --- Step 1: Session Type ---
interface Step1Props {
    selectedType: 'BACKTEST' | 'PROP_FIRM'
    onSelect: (type: 'BACKTEST' | 'PROP_FIRM') => void
}

export function Step1SessionType({ selectedType, onSelect }: Step1Props) {
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-1 sm:space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">Choose Session Mode</h3>
                <p className="text-[#94A3B8] text-xs sm:text-sm">Select how you want to practice today</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('BACKTEST')}
                    className={cn(
                        "cursor-pointer rounded-xl p-4 sm:p-6 border transition-all duration-200 relative overflow-hidden group",
                        selectedType === 'BACKTEST'
                            ? "bg-[#0A0A0A] border-[#00E676] ring-1 ring-[#00E676]/50"
                            : "bg-[#050505] border-white/5 hover:border-white/10"
                    )}
                >
                    <div className="relative z-10 space-y-3 sm:space-y-4">
                        <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-colors",
                            selectedType === 'BACKTEST' ? "bg-[#00E676]/20 text-[#00E676]" : "bg-white/5 text-[#94A3B8]"
                        )}>
                            <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h4 className="text-base sm:text-lg font-bold text-white mb-0.5 sm:mb-1">Standard Backtest</h4>
                            <p className="text-xs sm:text-sm text-[#94A3B8]">Practice with historical data at your own pace. No rules, just trading.</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('PROP_FIRM')}
                    className={cn(
                        "cursor-pointer rounded-xl p-4 sm:p-6 border transition-all duration-200 relative overflow-hidden group",
                        selectedType === 'PROP_FIRM'
                            ? "bg-[#0A0A0A] border-[#00E676] ring-1 ring-[#00E676]/50"
                            : "bg-[#050505] border-white/5 hover:border-white/10"
                    )}
                >
                    <div className="relative z-10 space-y-3 sm:space-y-4">
                        <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-colors",
                            selectedType === 'PROP_FIRM' ? "bg-[#00E676]/20 text-[#00E676]" : "bg-white/5 text-[#94A3B8]"
                        )}>
                            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h4 className="text-base sm:text-lg font-bold text-white mb-0.5 sm:mb-1">Prop Firm Simulator</h4>
                            <p className="text-xs sm:text-sm text-[#94A3B8]">Simulate a challenge with strict drawdown and profit targets.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

// --- Step 2: Asset & Time ---
interface Step2Props {
    asset: string
    setAsset: (v: string) => void
    startDate: string
    setStartDate: (v: string) => void
    endDate: string
    setEndDate: (v: string) => void
    timezone: string
    setTimezone: (v: string) => void
}

export function Step2AssetTime({ asset, setAsset, startDate, setStartDate, endDate, setEndDate, timezone, setTimezone }: Step2Props) {

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-1 sm:space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">Select Market Data</h3>
                <p className="text-[#94A3B8] text-xs sm:text-sm">Choose your pair and time range</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
                {/* ASSET SELECTOR (TABS + GRID) */}
                <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-[#94A3B8] text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1 block">Asset Type</Label>
                    <Tabs defaultValue="FOREX" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 bg-[#050505] p-1 h-12 sm:h-14 border border-white/5 rounded-xl">
                            <TabsTrigger value="FOREX" className="flex flex-col gap-1 h-full text-[10px] sm:text-xs data-[state=active]:bg-[#00E676]/10 data-[state=active]:text-[#00E676] data-[state=active]:border border-[#00E676]/50 transition-all">
                                <BadgeDollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="font-bold">FOREX</span>
                            </TabsTrigger>
                            <TabsTrigger value="CRYPTO" className="flex flex-col gap-1 h-full text-[10px] sm:text-xs data-[state=active]:bg-[#00E676]/10 data-[state=active]:text-[#00E676] data-[state=active]:border border-[#00E676]/50 transition-all">
                                <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="font-bold">CRYPTO</span>
                            </TabsTrigger>
                            <TabsTrigger value="INDICES" className="flex flex-col gap-1 h-full text-[10px] sm:text-xs data-[state=active]:bg-[#00E676]/10 data-[state=active]:text-[#00E676] data-[state=active]:border border-[#00E676]/50 transition-all">
                                <LineChart className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="font-bold">INDICES</span>
                            </TabsTrigger>
                            <TabsTrigger value="METALS" className="flex flex-col gap-1 h-full text-[10px] sm:text-xs data-[state=active]:bg-[#00E676]/10 data-[state=active]:text-[#00E676] data-[state=active]:border border-[#00E676]/50 transition-all">
                                <Hammer className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="font-bold">METALS</span>
                            </TabsTrigger>
                            <TabsTrigger value="STOCKS" className="flex flex-col gap-1 h-full text-[10px] sm:text-xs data-[state=active]:bg-[#00E676]/10 data-[state=active]:text-[#00E676] data-[state=active]:border border-[#00E676]/50 transition-all">
                                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="font-bold">STOCKS</span>
                            </TabsTrigger>
                        </TabsList>

                        {Object.entries(ASSET_CATEGORIES).map(([category, items]) => (
                            <TabsContent key={category} value={category} className="mt-4 outline-none">
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                    {items.map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => setAsset(item)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-all duration-200 hover:scale-[1.02]",
                                                asset === item
                                                    ? "bg-[#00E676] border-[#00E676] text-black font-bold shadow-[0_0_15px_rgba(0,230,118,0.3)]"
                                                    : "bg-[#0A0A0A] border-white/5 text-[#94A3B8] hover:border-white/20 hover:text-white"
                                            )}
                                        >
                                            <span className="font-semibold">{item}</span>
                                        </button>
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-[#94A3B8] text-xs sm:text-sm">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-[#050505] border-white/5 text-white h-10 sm:h-12 text-xs sm:text-sm hover:bg-white/5 hover:text-white",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-[#00E676]" />
                                    {startDate ? format(new Date(startDate), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-white/10 text-white" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate ? new Date(startDate) : undefined}
                                    onSelect={(date) => date && setStartDate(format(date, "yyyy-MM-dd"))}
                                    initialFocus
                                    disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-[#94A3B8] text-xs sm:text-sm">End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-[#050505] border-white/5 text-white h-10 sm:h-12 text-xs sm:text-sm hover:bg-white/5 hover:text-white",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-[#00E676]" />
                                    {endDate ? format(new Date(endDate), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-white/10 text-white" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate ? new Date(endDate) : undefined}
                                    onSelect={(date) => date && setEndDate(format(date, "yyyy-MM-dd"))}
                                    initialFocus
                                    disabled={(date) => date > new Date() || (startDate ? date < new Date(startDate) : false)}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-[#94A3B8] text-xs sm:text-sm">Timezone</Label>
                    <TimezoneSelector value={timezone} onChange={setTimezone} />
                </div>
            </div>
        </div>
    )
}

function TimezoneSelector({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")

    const filtered = timezones.filter(tz =>
        tz.label.toLowerCase().includes(search.toLowerCase()) ||
        tz.value.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-[#050505] border-white/5 text-white h-10 sm:h-12 text-xs sm:text-sm hover:bg-white/5 hover:text-white"
                >
                    <span className="flex items-center gap-2 overflow-hidden">
                        <Globe className="h-4 w-4 text-[#00E676] shrink-0" />
                        <span className="truncate">{value ? timezones.find(t => t.value === value)?.label : "Select timezone..."}</span>
                    </span>
                    <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-[#0A0A0A] border-white/10 text-white" align="start">
                <div className="flex items-center border-b border-white/10 px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-white" />
                    <input
                        className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-white"
                        placeholder="Search timezone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                    {filtered.length === 0 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">No timezone found.</div>
                    )}
                    {filtered.map(tz => (
                        <div
                            key={tz.value}
                            className={cn(
                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs sm:text-sm outline-none transition-colors hover:bg-white/10 hover:text-white",
                                value === tz.value ? "bg-[#00E676]/10 text-[#00E676]" : "text-white"
                            )}
                            onClick={() => {
                                onChange(tz.value)
                                setOpen(false)
                            }}
                        >
                            <Check className={cn("mr-2 h-3 w-3 sm:h-4 sm:w-4", value === tz.value ? "opacity-100" : "opacity-0")} />
                            {tz.label}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}

// --- Step 3: Configuration ---
interface Step3Props {
    sessionType: 'BACKTEST' | 'PROP_FIRM'
    name: string
    setName: (v: string) => void
    balance: string
    setBalance: (v: string) => void
    strategyId: string
    setStrategyId: (v: string) => void
    strategies: any[]
    challengeRules: ChallengeRules
    setChallengeRules: (v: ChallengeRules) => void
}

export function Step3Config({ sessionType, name, setName, balance, setBalance, strategyId, setStrategyId, strategies, challengeRules, setChallengeRules }: Step3Props) {
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-1 sm:space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">Configuration</h3>
                <p className="text-[#94A3B8] text-xs sm:text-sm">Fine-tune your session settings</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-[#94A3B8] text-xs sm:text-sm">Session Name</Label>
                    <Input
                        placeholder="e.g. My Morning Strategy Test"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="bg-[#050505] border-white/5 text-white h-10 sm:h-12 text-xs sm:text-sm"
                    />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-[#94A3B8] text-xs sm:text-sm">Initial Balance</Label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-xs sm:text-sm">$</span>
                        <Input
                            type="number"
                            value={balance}
                            onChange={e => setBalance(e.target.value)}
                            className="bg-[#050505] border-white/5 text-white h-10 sm:h-12 pl-8 text-xs sm:text-sm"
                        />
                    </div>
                </div>

                {sessionType === 'BACKTEST' && (
                    <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-[#94A3B8] text-xs sm:text-sm">Strategy (Optional)</Label>
                        <Select value={strategyId} onValueChange={setStrategyId}>
                            <SelectTrigger className="bg-[#050505] border-white/5 text-white h-10 sm:h-12 text-xs sm:text-sm">
                                <SelectValue placeholder="Link a strategy..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0A] border-white/5 text-white">
                                <SelectItem value="none" className="text-xs sm:text-sm">None</SelectItem>
                                {strategies.map(s => (
                                    <SelectItem key={s.id} value={s.id} className="text-xs sm:text-sm">{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {sessionType === 'PROP_FIRM' && (
                    <div className="pt-2">
                        <PropFirmSettings rules={challengeRules} onChange={setChallengeRules} />
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Step 4: Review ---
interface Step4Props {
    sessionType: 'BACKTEST' | 'PROP_FIRM'
    name: string
    asset: string
    balance: string
    startDate: string
    endDate: string
}

export function Step4Review({ sessionType, name, asset, balance, startDate, endDate }: Step4Props) {
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-1 sm:space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">Ready to Launch?</h3>
                <p className="text-[#94A3B8] text-xs sm:text-sm">Review your session details</p>
            </div>

            <div className="bg-[#050505] border border-white/5 rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/5">
                    <span className="text-[#94A3B8] text-xs sm:text-sm">Mode</span>
                    <span className="text-white font-medium flex items-center gap-2 text-xs sm:text-sm">
                        {sessionType === 'PROP_FIRM' ? <Zap className="w-4 h-4 text-[#00E676]" /> : <BarChart2 className="w-4 h-4 text-[#00E676]" />}
                        {sessionType === 'PROP_FIRM' ? 'Prop Firm Simulator' : 'Standard Backtest'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-xs sm:text-sm">Name</span>
                    <span className="text-white font-medium text-xs sm:text-sm">{name}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-xs sm:text-sm">Asset</span>
                    <span className="text-white font-medium text-xs sm:text-sm">{asset}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-xs sm:text-sm">Balance</span>
                    <span className="text-white font-medium text-xs sm:text-sm">${parseInt(balance).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-xs sm:text-sm">Duration</span>
                    <span className="text-white font-medium text-right text-xs sm:text-sm">
                        {startDate || 'Start'} <br /> to {endDate || 'End'}
                    </span>
                </div>
            </div>
        </div>
    )
}
