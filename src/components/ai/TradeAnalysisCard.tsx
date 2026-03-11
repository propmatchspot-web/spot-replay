'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
    TrendingUp, TrendingDown, Target, AlertTriangle,
    ArrowUpRight, ArrowDownRight, CheckCircle2, Zap, Activity,
    Layers, Droplets, Shield, Clock, BarChart3, ChevronDown, ChevronUp,
    Coins, PiggyBank, Percent, Copy, Check, Eye, EyeOff, Crosshair,
    ArrowUp, ArrowDown, Minus, Scale, CircleDot, GitBranch, Flame,
    Download, Image, FileText, Clipboard, Loader2
} from 'lucide-react'
import { downloadAsPDF, downloadAsImage, copyToClipboard } from '@/lib/export-utils'

interface TradeSetup {
    type: 'BULLISH' | 'BEARISH'
    tradeType: string
    entry: string
    stopLoss: string
    takeProfit1: string
    takeProfit2: string
    takeProfit3: string
    riskReward: string
    confluenceScore: string
    reasoning: string
}

interface AnalysisData {
    pair: string
    timeframe: string
    currentPrice: string
    session: string
    htfTrend: 'BULLISH' | 'BEARISH' | 'RANGING'
    ltfTrend: 'BULLISH' | 'BEARISH' | 'RANGING'
    alignment: 'ALIGNED' | 'CONFLICTING'
    structure: {
        lastHH?: string
        lastHL?: string
        lastLH?: string
        lastLL?: string
        choch?: string
        bos?: string
    }
    snr: {
        majorResistance?: string
        minorResistance?: string
        minorSupport?: string
        majorSupport?: string
    }
    bsl?: string
    ssl?: string
    bullishSetup?: TradeSetup
    bearishSetup?: TradeSetup
    verdict: {
        bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
        probability: string
        bestSetup: string
        waitFor: string
        invalidation: string
    }
    riskNotes: string[]
    provider?: string
}

// Parsing functions
function extractPrice(text: string, regex: RegExp): string | undefined {
    const match = text.match(regex)
    if (!match?.[1]) return undefined
    const value = match[1].trim()
    if (/^\d[\d,.]*$/.test(value) && value.length > 1) return value
    return undefined
}

function extractFlexValue(text: string, regex: RegExp): string | undefined {
    const match = text.match(regex)
    return match?.[1]?.trim()
}

function extractTrend(text: string, regex: RegExp): 'BULLISH' | 'BEARISH' | 'RANGING' {
    const match = text.match(regex)
    if (!match) return 'RANGING'
    const trend = match[1].toUpperCase()
    if (trend.includes('BULL')) return 'BULLISH'
    if (trend.includes('BEAR')) return 'BEARISH'
    return 'RANGING'
}

function extractBias(text: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const biasMatch = text.match(/Primary Bias[^|]*\|?\s*(BULLISH|BEARISH|NEUTRAL)/i)
    if (biasMatch) return biasMatch[1].toUpperCase() as 'BULLISH' | 'BEARISH' | 'NEUTRAL'
    if (text.includes('🔴') && text.toUpperCase().includes('BEARISH')) return 'BEARISH'
    if (text.includes('🟢') && text.toUpperCase().includes('BULLISH')) return 'BULLISH'
    const bearCount = (text.match(/bearish/gi) || []).length
    const bullCount = (text.match(/bullish/gi) || []).length
    if (bearCount > bullCount) return 'BEARISH'
    if (bullCount > bearCount) return 'BULLISH'
    return 'NEUTRAL'
}

function parseSetupSection(section: string, type: 'BULLISH' | 'BEARISH'): TradeSetup | undefined {
    const entry = extractPrice(section, /Entry\s*(?:Price)?[^|]*\|?\s*([\d,.]+)/i)
    const stopLoss = extractPrice(section, /Stop\s*Loss[^|]*\|?\s*([\d,.]+)/i)
    const tp1 = extractPrice(section, /Take\s*Profit\s*1[^|]*\|?\s*([\d,.]+)/i)
    const tp2 = extractPrice(section, /Take\s*Profit\s*2[^|]*\|?\s*([\d,.]+)/i)
    const tp3 = extractPrice(section, /Take\s*Profit\s*3[^|]*\|?\s*([\d,.]+)/i)

    if (!entry) return undefined

    return {
        type,
        tradeType: extractFlexValue(section, /Trade\s*Type[^|]*\|?\s*(LIMIT|MARKET)[^|]*(BUY|SELL)?/i)?.toUpperCase() ||
            (type === 'BULLISH' ? 'LIMIT BUY' : 'LIMIT SELL'),
        entry: entry,
        stopLoss: stopLoss || 'N/A',
        takeProfit1: tp1 || 'N/A',
        takeProfit2: tp2 || 'N/A',
        takeProfit3: tp3 || 'N/A',
        riskReward: extractFlexValue(section, /Risk[:\s]*Reward[^|]*\|?\s*([^\n|]+)/i) || '1:2',
        confluenceScore: extractFlexValue(section, /Confluence[^|]*\|?\s*(\d+)/i) || '7',
        reasoning: extractFlexValue(section, /(?:Entry\s*)?Reasoning[:\s]*([^\n]+)/i) || 'Based on technical confluence',
    }
}

function extractFlexSetup(text: string, type: 'BULLISH' | 'BEARISH'): TradeSetup | undefined {
    const sectionPattern = type === 'BULLISH'
        ? /(?:🟢|BULLISH)\s*(?:SCENARIO|SETUP)[^]*?(?=(?:🔴|BEARISH|VERDICT|---|\n##|$))/i
        : /(?:🔴|BEARISH)\s*(?:SCENARIO|SETUP)[^]*?(?=(?:VERDICT|---|\n##|$))/i

    const sectionMatch = text.match(sectionPattern)
    let section = sectionMatch?.[0] || ''

    if (!section || !section.includes('Entry')) {
        const altSection = text.split(type === 'BULLISH' ? /BULLISH/i : /BEARISH/i)[1]?.split(/VERDICT|---/i)[0]
        if (!altSection) return undefined
        section = altSection
    }

    return parseSetupSection(section, type)
}

function parseAIResponse(response: string): AnalysisData | null {
    try {
        const data: AnalysisData = {
            pair: extractFlexValue(response, /Pair\/Asset[^|]*\|?\s*([A-Z]{3,6}(?:USD|EUR|GBP|JPY)?(?:\s*\([^)]+\))?)/i) ||
                extractFlexValue(response, /([A-Z]{3,6}(?:USD|EUR|GBP|JPY))/i) || 'N/A',
            timeframe: extractFlexValue(response, /Timeframe[^|]*\|?\s*(\d+\s*(?:Minute|Hour|Day|Min|H|M|D))/i) || 'N/A',
            currentPrice: extractPrice(response, /Current Price[^|]*\|?\s*([\d,.]+)/i) || 'N/A',
            session: extractFlexValue(response, /Session[^|]*\|?\s*([A-Za-z\s]+?)(?:\||$|\n)/i) || 'N/A',
            htfTrend: extractTrend(response, /HTF[^|]*\|?[^|]*?(Bullish|Bearish|Ranging)/i),
            ltfTrend: extractTrend(response, /LTF[^|]*\|?[^|]*?(Bullish|Bearish|Ranging)/i),
            alignment: response.toLowerCase().includes('conflicting') ? 'CONFLICTING' : 'ALIGNED',
            structure: {
                lastHH: extractPrice(response, /(?:Last\s+)?Higher High[^|]*\|?\s*([\d,.]+)/i),
                lastHL: extractPrice(response, /(?:Last\s+)?Higher Low[^|]*\|?\s*([\d,.]+)/i),
                lastLH: extractPrice(response, /(?:Last\s+)?Lower High[^|]*\|?\s*([\d,.]+)/i),
                lastLL: extractPrice(response, /(?:Last\s+)?Lower Low[^|]*\|?\s*([\d,.]+)/i),
                choch: extractPrice(response, /CHoCH[^|]*\|?\s*([\d,.]+)/i),
                bos: extractPrice(response, /BOS[^|]*\|?\s*([\d,.]+)/i),
            },
            snr: {
                majorResistance: extractPrice(response, /Major Resistance[^|]*\|?\s*([\d,.]+)/i),
                minorResistance: extractPrice(response, /Minor Resistance[^|]*\|?\s*([\d,.]+)/i),
                minorSupport: extractPrice(response, /Minor Support[^|]*\|?\s*([\d,.]+)/i),
                majorSupport: extractPrice(response, /Major Support[^|]*\|?\s*([\d,.]+)/i),
            },
            bsl: extractPrice(response, /BSL[^|]*\|?\s*([\d,.]+)/i),
            ssl: extractPrice(response, /SSL[^|]*\|?\s*([\d,.]+)/i),
            bullishSetup: extractFlexSetup(response, 'BULLISH'),
            bearishSetup: extractFlexSetup(response, 'BEARISH'),
            verdict: {
                bias: extractBias(response),
                probability: extractFlexValue(response, /Probability[^|]*\|?\s*(\d+%?)/i) || '0%',
                bestSetup: extractFlexValue(response, /Best Setup[^|]*\|?\s*([^\n|]+)/i) || 'N/A',
                waitFor: extractFlexValue(response, /Wait For[^|]*\|?\s*([^\n|]+)/i) || 'N/A',
                invalidation: extractFlexValue(response, /Invalidation[^|]*\|?\s*([^\n|]+)/i) || 'N/A',
            },
            riskNotes: [],
            provider: extractFlexValue(response, /Powered by:\s*([^\n*]+)/i),
        }

        const riskSection = response.split(/RISK NOTES|⚠️\s*RISK/i)[1]
        if (riskSection) {
            const lines = riskSection.split('\n')
                .filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'))
                .slice(0, 3)
            lines.forEach(l => data.riskNotes.push(l.replace(/^[-•]\s*/, '').trim()))
        }
        if (data.riskNotes.length === 0) data.riskNotes = ['Standard market risk applies']

        return data
    } catch (e) {
        console.error('Failed to parse AI response:', e)
        return null
    }
}

// Trend Icon Component
function TrendIcon({ trend, size = 'sm' }: { trend: 'BULLISH' | 'BEARISH' | 'RANGING', size?: 'sm' | 'md' }) {
    const sizeClass = size === 'md' ? 'h-5 w-5' : 'h-4 w-4'
    if (trend === 'BULLISH') return <ArrowUp className={cn(sizeClass, 'text-amber-400')} />
    if (trend === 'BEARISH') return <ArrowDown className={cn(sizeClass, 'text-red-400')} />
    return <Minus className={cn(sizeClass, 'text-zinc-400')} />
}

// Badge Component
function Badge({ children, variant = 'default', size = 'sm', icon }: {
    children: React.ReactNode
    variant?: 'bullish' | 'bearish' | 'neutral' | 'default' | 'warning' | 'violet'
    size?: 'sm' | 'md' | 'lg'
    icon?: React.ReactNode
}) {
    const variants = {
        bullish: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        bearish: 'bg-red-500/20 text-red-400 border-red-500/30',
        neutral: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
        default: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    }
    const sizes = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
    }
    return (
        <span className={cn(
            "font-bold rounded-full border uppercase tracking-wide inline-flex items-center gap-1.5",
            variants[variant],
            sizes[size]
        )}>
            {icon}
            {children}
        </span>
    )
}

// Price Display Component
function PriceDisplay({ label, value, type, icon }: {
    label: string
    value: string
    type: 'entry' | 'sl' | 'tp' | 'neutral'
    icon?: React.ReactNode
}) {
    const colors = {
        entry: 'border-l-blue-500 text-blue-400',
        sl: 'border-l-red-500 text-red-400',
        tp: 'border-l-amber-500 text-amber-400',
        neutral: 'border-l-zinc-500 text-white'
    }
    return (
        <div className={cn(
            "bg-zinc-900/80 rounded-xl p-3 border border-zinc-800/50 border-l-4",
            colors[type].split(' ')[0]
        )}>
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 uppercase tracking-widest mb-1">
                {icon}
                {label}
            </div>
            <div className={cn("text-lg font-mono font-black", colors[type].split(' ')[1])}>
                {value}
            </div>
        </div>
    )
}

// Section Header
function SectionHeader({ icon, title, color }: { icon: React.ReactNode, title: string, color: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className={cn("p-1.5 rounded-lg", color)}>
                {icon}
            </div>
            <h4 className={cn("text-xs font-black uppercase tracking-widest", color.replace('bg-', 'text-').replace('/20', ''))}>{title}</h4>
        </div>
    )
}

// Trade Setup Card
function SetupCard({ setup, isActive }: { setup: TradeSetup; isActive?: boolean }) {
    const isBullish = setup.type === 'BULLISH'
    const [expanded, setExpanded] = useState(true)
    const [copied, setCopied] = useState(false)

    const accentColor = isBullish ? 'emerald' : 'red'
    const gradientFrom = isBullish ? 'from-amber-500/10' : 'from-red-500/10'
    const borderColor = isBullish ? 'border-amber-500/30' : 'border-red-500/30'

    const copySetup = () => {
        const text = `${setup.type} ${setup.tradeType}\nEntry: ${setup.entry}\nSL: ${setup.stopLoss}\nTP1: ${setup.takeProfit1}\nTP2: ${setup.takeProfit2}\nTP3: ${setup.takeProfit3}`
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={cn(
            "rounded-2xl border overflow-hidden transition-all duration-300",
            isActive && "ring-2 ring-offset-2 ring-offset-zinc-950",
            isBullish ? "ring-amber-500/50" : "ring-red-500/50",
            borderColor
        )}>
            {/* Header */}
            <div
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "p-4 cursor-pointer flex items-center justify-between bg-gradient-to-r to-transparent",
                    gradientFrom
                )}
            >
                <div className="flex items-center gap-3">
                    {isBullish ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30">
                            <ArrowUpRight className="h-5 w-5 text-amber-400" />
                        </div>
                    ) : (
                        <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30">
                            <ArrowDownRight className="h-5 w-5 text-red-400" />
                        </div>
                    )}
                    <div>
                        <div className={cn(
                            "text-sm font-black uppercase tracking-wide flex items-center gap-2",
                            isBullish ? "text-amber-400" : "text-red-400"
                        )}>
                            {isBullish ? '🟢 LONG' : '🔴 SHORT'} SETUP
                            {isActive && <Flame className="h-4 w-4 animate-pulse" />}
                        </div>
                        <div className="text-[10px] text-zinc-500">{setup.tradeType}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={isBullish ? 'bullish' : 'bearish'} size="md" icon={<Zap className="h-3 w-3" />}>
                        {setup.confluenceScore}/10
                    </Badge>
                    <button onClick={(e) => { e.stopPropagation(); copySetup() }} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                        {copied ? <Check className="h-4 w-4 text-amber-400" /> : <Copy className="h-4 w-4 text-zinc-500" />}
                    </button>
                    {expanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                </div>
            </div>

            {/* Content */}
            {expanded && (
                <div className="p-4 space-y-4 bg-zinc-950/50">
                    {/* Entry & SL */}
                    <div className="grid grid-cols-2 gap-3">
                        <PriceDisplay label="Entry Price" value={setup.entry} type="entry" icon={<Crosshair className="h-3 w-3" />} />
                        <PriceDisplay label="Stop Loss" value={setup.stopLoss} type="sl" icon={<Shield className="h-3 w-3" />} />
                    </div>

                    {/* Take Profits */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] text-zinc-500 uppercase tracking-widest">
                            <Target className="h-3 w-3" />
                            Take Profit Targets
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'TP1', rr: '1:1', value: setup.takeProfit1 },
                                { label: 'TP2', rr: '1:2', value: setup.takeProfit2 },
                                { label: 'TP3', rr: '1:3', value: setup.takeProfit3 },
                            ].map((tp, i) => (
                                <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500/50 to-amber-500/0" />
                                    <div className="text-[8px] text-zinc-500 uppercase mb-1">{tp.label} ({tp.rr})</div>
                                    <div className="font-mono text-sm font-bold text-amber-400">{tp.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* R:R */}
                    <div className="flex justify-between items-center pt-3 border-t border-zinc-800/50">
                        <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-violet-400" />
                            <span className="text-xs text-zinc-400">Risk:Reward Ratio</span>
                        </div>
                        <span className="font-bold text-lg text-white">{setup.riskReward}</span>
                    </div>

                    {/* Reasoning */}
                    {setup.reasoning && setup.reasoning !== 'Based on technical confluence' && (
                        <div className="text-xs text-zinc-400 italic bg-zinc-900/50 rounded-xl p-4 border-l-2 border-violet-500/50 flex items-start gap-2">
                            <GitBranch className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                            <span>{setup.reasoning}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Main Component
export function TradeAnalysisCard({ aiResponse, onParsed }: {
    aiResponse: string
    onParsed?: (success: boolean) => void
}) {
    const data = parseAIResponse(aiResponse)
    const cardRef = useRef<HTMLDivElement>(null)
    const [isExporting, setIsExporting] = useState<'pdf' | 'image' | 'copy' | null>(null)

    useEffect(() => {
        if (onParsed) {
            onParsed(data !== null && data.pair !== 'N/A')
        }
    }, [data, onParsed])

    // Export handlers
    const handleDownloadPDF = async () => {
        if (!cardRef.current || isExporting) return
        setIsExporting('pdf')
        try {
            await downloadAsPDF(cardRef.current, { filename: `spotreplay_${data?.pair || 'analysis'}` })
        } finally {
            setIsExporting(null)
        }
    }

    const handleDownloadImage = async () => {
        if (!cardRef.current || isExporting) return
        setIsExporting('image')
        try {
            await downloadAsImage(cardRef.current, { filename: `spotreplay_${data?.pair || 'analysis'}` })
        } finally {
            setIsExporting(null)
        }
    }

    const handleCopyToClipboard = async () => {
        if (!cardRef.current || isExporting) return
        setIsExporting('copy')
        try {
            await copyToClipboard(cardRef.current)
        } finally {
            setTimeout(() => setIsExporting(null), 1500) // Show success briefly
        }
    }

    if (!data || data.pair === 'N/A') {
        return null
    }

    const biasColors = {
        BULLISH: { text: 'text-amber-400', bg: 'bg-amber-500', glow: 'shadow-amber-500/20' },
        BEARISH: { text: 'text-red-400', bg: 'bg-red-500', glow: 'shadow-red-500/20' },
        NEUTRAL: { text: 'text-zinc-400', bg: 'bg-zinc-500', glow: 'shadow-zinc-500/20' },
    }

    const biasStyle = biasColors[data.verdict.bias]

    return (
        <div ref={cardRef} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-zinc-950 p-4 rounded-2xl">
            {/* HEADER CARD */}
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-6 relative overflow-hidden">
                {/* Glow effect */}
                <div className={cn("absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30", biasStyle.bg)} />

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight">{data.pair}</span>
                            <Badge variant="default" size="md" icon={<Clock className="h-3 w-3" />}>{data.timeframe}</Badge>
                            {data.session !== 'N/A' && <Badge variant="neutral" size="sm">{data.session}</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-zinc-500">Current Price:</span>
                            <span className="text-white font-mono font-bold text-lg">{data.currentPrice}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            {data.verdict.bias === 'BULLISH' && <ArrowUpRight className="h-8 w-8 text-amber-400" />}
                            {data.verdict.bias === 'BEARISH' && <ArrowDownRight className="h-8 w-8 text-red-400" />}
                            <div className={cn("text-4xl font-black tracking-tight", biasStyle.text)}>
                                {data.verdict.bias}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={cn("w-2 h-2 rounded-full animate-pulse", biasStyle.bg)} />
                            <span className={cn("text-sm font-bold", biasStyle.text)}>
                                {data.verdict.probability} Confidence
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TREND ANALYSIS & SNR ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Trend Analysis */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <SectionHeader icon={<TrendingUp className="h-4 w-4 text-amber-400" />} title="Multi-Timeframe Trend" color="bg-amber-500/20" />
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                            <span className="text-sm text-zinc-400 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                HTF Trend
                            </span>
                            <div className="flex items-center gap-2">
                                <TrendIcon trend={data.htfTrend} size="md" />
                                <Badge variant={data.htfTrend === 'BULLISH' ? 'bullish' : data.htfTrend === 'BEARISH' ? 'bearish' : 'neutral'} size="md">
                                    {data.htfTrend}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                            <span className="text-sm text-zinc-400 flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                LTF Trend
                            </span>
                            <div className="flex items-center gap-2">
                                <TrendIcon trend={data.ltfTrend} size="md" />
                                <Badge variant={data.ltfTrend === 'BULLISH' ? 'bullish' : data.ltfTrend === 'BEARISH' ? 'bearish' : 'neutral'} size="md">
                                    {data.ltfTrend}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                            <span className="text-sm text-zinc-400">Trend Alignment</span>
                            {data.alignment === 'ALIGNED' ? (
                                <Badge variant="bullish" size="md" icon={<CheckCircle2 className="h-3 w-3" />}>Aligned</Badge>
                            ) : (
                                <Badge variant="warning" size="md" icon={<AlertTriangle className="h-3 w-3" />}>Conflicting</Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Key Levels */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <SectionHeader icon={<Layers className="h-4 w-4 text-blue-400" />} title="Key Support & Resistance" color="bg-blue-500/20" />
                    <div className="space-y-2 text-sm">
                        {data.snr.majorResistance && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                                <span className="flex items-center gap-2 text-zinc-400">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    Major Resistance
                                </span>
                                <span className="font-mono font-bold text-red-400">{data.snr.majorResistance}</span>
                            </div>
                        )}
                        {data.snr.minorResistance && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-orange-500/5 border border-orange-500/20">
                                <span className="flex items-center gap-2 text-zinc-400">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    Minor Resistance
                                </span>
                                <span className="font-mono font-bold text-orange-400">{data.snr.minorResistance}</span>
                            </div>
                        )}
                        {data.snr.minorSupport && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                                <span className="flex items-center gap-2 text-zinc-400">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    Minor Support
                                </span>
                                <span className="font-mono font-bold text-yellow-400">{data.snr.minorSupport}</span>
                            </div>
                        )}
                        {data.snr.majorSupport && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                                <span className="flex items-center gap-2 text-zinc-400">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    Major Support
                                </span>
                                <span className="font-mono font-bold text-amber-400">{data.snr.majorSupport}</span>
                            </div>
                        )}
                        {!data.snr.majorResistance && !data.snr.minorResistance && !data.snr.minorSupport && !data.snr.majorSupport && (
                            <div className="text-zinc-500 italic text-center py-4">No key levels identified in analysis</div>
                        )}
                    </div>
                </div>
            </div>

            {/* LIQUIDITY POOLS */}
            {(data.bsl || data.ssl) && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <SectionHeader icon={<Droplets className="h-4 w-4 text-cyan-400" />} title="Liquidity Pools" color="bg-cyan-500/20" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 uppercase mb-2">
                                <ArrowUp className="h-3 w-3 text-amber-400" />
                                BSL (Buyside)
                            </div>
                            <div className="text-xl font-mono font-black text-amber-400">{data.bsl || 'N/A'}</div>
                        </div>
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 uppercase mb-2">
                                <ArrowDown className="h-3 w-3 text-red-400" />
                                SSL (Sellside)
                            </div>
                            <div className="text-xl font-mono font-black text-red-400">{data.ssl || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* TRADE SETUPS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.bullishSetup && <SetupCard setup={data.bullishSetup} isActive={data.verdict.bias === 'BULLISH'} />}
                {data.bearishSetup && <SetupCard setup={data.bearishSetup} isActive={data.verdict.bias === 'BEARISH'} />}
            </div>

            {/* VERDICT */}
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
                <SectionHeader icon={<Target className="h-5 w-5 text-violet-400" />} title="Trade Verdict" color="bg-violet-500/20" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase mb-2">
                            <Zap className="h-3 w-3 text-violet-400" />
                            Best Setup
                        </div>
                        <div className="text-sm font-bold text-violet-400">{data.verdict.bestSetup}</div>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase mb-2">
                            <Eye className="h-3 w-3 text-blue-400" />
                            Wait For
                        </div>
                        <div className="text-sm font-bold text-blue-400">{data.verdict.waitFor}</div>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase mb-2">
                            <AlertTriangle className="h-3 w-3 text-red-400" />
                            Invalidation
                        </div>
                        <div className="text-sm font-bold text-red-400">{data.verdict.invalidation}</div>
                    </div>
                </div>

                {data.riskNotes.length > 0 && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-3">
                            <AlertTriangle className="h-4 w-4" />
                            RISK NOTES
                        </div>
                        <ul className="text-sm text-zinc-400 space-y-2">
                            {data.riskNotes.map((note, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <CircleDot className="h-3 w-3 text-amber-500 flex-shrink-0 mt-1" />
                                    {note}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* FOOTER WITH EXPORT BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800/50">
                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isExporting !== null}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white text-xs font-medium transition-all disabled:opacity-50"
                    >
                        {isExporting === 'pdf' ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <FileText className="h-3.5 w-3.5" />
                        )}
                        PDF
                    </button>
                    <button
                        onClick={handleDownloadImage}
                        disabled={isExporting !== null}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white text-xs font-medium transition-all disabled:opacity-50"
                    >
                        {isExporting === 'image' ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Image className="h-3.5 w-3.5" />
                        )}
                        Image
                    </button>
                    <button
                        onClick={handleCopyToClipboard}
                        disabled={isExporting !== null}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-50",
                            isExporting === 'copy'
                                ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                                : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-400 hover:text-white"
                        )}
                    >
                        {isExporting === 'copy' ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Clipboard className="h-3.5 w-3.5" />
                                Copy
                            </>
                        )}
                    </button>
                </div>

                {/* Branding */}
                <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                    <img src="/replay-favicon.png" alt="Spot Replay" className="h-4 w-4" />
                    <span>Powered by <span className="text-amber-500 font-bold">Spot Replay AI</span></span>
                </div>
            </div>
        </div>
    )
}

export { parseAIResponse }
export type { AnalysisData }
