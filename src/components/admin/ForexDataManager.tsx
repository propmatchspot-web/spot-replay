'use client'

import { useState, useCallback, useEffect } from 'react'
import { Upload, Database, HardDrive, RefreshCw, CheckCircle2, AlertCircle, Loader2, TrendingUp, Clock, BarChart3 } from 'lucide-react'

interface DataStatus {
    symbol: string
    interval: string
    count: number
    firstDate: string
    lastDate: string
}

export default function ForexDataManager() {
    const [file, setFile] = useState<File | null>(null)
    const [symbol, setSymbol] = useState('EURUSD')
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const [dataStatus, setDataStatus] = useState<DataStatus[]>([])
    const [loadingStatus, setLoadingStatus] = useState(true)

    const SUPPORTED_PAIRS = [
        'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
        'EURGBP', 'EURJPY', 'GBPJPY', 'EURCHF', 'AUDJPY', 'EURAUD', 'GBPCHF', 'CADJPY'
    ]

    // Fetch current data status
    const fetchDataStatus = useCallback(async () => {
        setLoadingStatus(true)
        try {
            const res = await fetch('/api/admin/forex-data/status')
            if (res.ok) {
                const data = await res.json()
                setDataStatus(data.status || [])
            }
        } catch (err) {
            console.error('Failed to fetch data status:', err)
        } finally {
            setLoadingStatus(false)
        }
    }, [])

    useEffect(() => {
        fetchDataStatus()
    }, [fetchDataStatus])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setStatus('idle')
            setMessage('')

            // Try to detect pair from filename
            const filename = selectedFile.name.toUpperCase()
            for (const pair of SUPPORTED_PAIRS) {
                if (filename.includes(pair)) {
                    setSymbol(pair)
                    break
                }
            }
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        setStatus('uploading')
        setProgress(0)
        setMessage('Reading file...')

        try {
            // Read file as text
            const content = await file.text()
            setProgress(5)

            // Split into LINES first, then chunk by line count
            const lines = content.split(/\r?\n/).filter(l => l.trim())
            const totalLines = lines.length
            setMessage(`Found ${totalLines.toLocaleString()} rows. Preparing chunks...`)
            setProgress(10)

            // Chunk by lines (10,000 lines per chunk)
            const LINES_PER_CHUNK = 10000
            const chunks: string[] = []
            for (let i = 0; i < lines.length; i += LINES_PER_CHUNK) {
                chunks.push(lines.slice(i, i + LINES_PER_CHUNK).join('\n'))
            }

            setMessage(`Uploading ${chunks.length} chunks (${totalLines.toLocaleString()} rows)...`)

            // Send all chunks and track totals
            let total1m = 0
            let total5m = 0

            for (let i = 0; i < chunks.length; i++) {
                setProgress(10 + Math.floor((i / chunks.length) * 80))
                setMessage(`Processing chunk ${i + 1}/${chunks.length} | Imported: ${total1m.toLocaleString()} rows...`)

                const res = await fetch('/api/admin/forex-data/import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chunk: chunks[i],
                        chunkIndex: i,
                        totalChunks: chunks.length,
                        symbol,
                        filename: file.name
                    })
                })

                if (!res.ok) {
                    const error = await res.json()
                    throw new Error(error.error || `Chunk ${i + 1} failed`)
                }

                // Accumulate totals from each chunk
                const data = await res.json()
                total1m += data.imported1m || 0
                total5m += data.imported5m || 0
            }

            // All chunks done
            setProgress(100)
            setStatus('success')
            setMessage(`Successfully imported ${total1m.toLocaleString()} 1m candles and ${total5m.toLocaleString()} 5m candles!`)
            setFile(null)
            fetchDataStatus()
        } catch (err: any) {
            setStatus('error')
            setMessage(err.message || 'Failed to import data')
        } finally {
            setUploading(false)
        }
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Database className="h-7 w-7 text-emerald-500" />
                        Forex Data Manager
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">Upload and manage historical forex data for instant backtesting</p>
                </div>
                <button
                    onClick={fetchDataStatus}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${loadingStatus ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Upload Section */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-500" />
                    Upload New Data
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* File Input */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                            CSV File (from HistData)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv,.txt"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className={`flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed transition-colors ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-700 bg-zinc-950/50 hover:border-zinc-600'
                                }`}>
                                {file ? (
                                    <>
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        <span className="text-emerald-400 font-bold">{file.name}</span>
                                    </>
                                ) : (
                                    <>
                                        <HardDrive className="h-6 w-6 text-zinc-500" />
                                        <span className="text-zinc-500">Click or drag CSV file here</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pair Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                            Currency Pair
                        </label>
                        <select
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold focus:border-blue-500 focus:outline-none transition-colors"
                        >
                            {SUPPORTED_PAIRS.map(pair => (
                                <option key={pair} value={pair}>{pair}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Progress Bar */}
                {status !== 'idle' && (
                    <div className="mt-6 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className={`font-bold ${status === 'success' ? 'text-emerald-500' :
                                status === 'error' ? 'text-red-500' :
                                    'text-blue-500'
                                }`}>
                                {status === 'uploading' && <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />}
                                {status === 'processing' && <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />}
                                {status === 'success' && <CheckCircle2 className="inline h-4 w-4 mr-2" />}
                                {status === 'error' && <AlertCircle className="inline h-4 w-4 mr-2" />}
                                {message}
                            </span>
                            <span className="text-zinc-500">{progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${status === 'success' ? 'bg-emerald-500' :
                                    status === 'error' ? 'bg-red-500' :
                                        'bg-blue-500'
                                    }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-zinc-700 disabled:to-zinc-600 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Importing...
                        </>
                    ) : (
                        <>
                            <Upload className="h-5 w-5" />
                            Import Data
                        </>
                    )}
                </button>
            </div>

            {/* Data Status Grid */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    Current Data Status
                </h3>

                {loadingStatus ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                    </div>
                ) : dataStatus.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-bold">No data cached yet</p>
                        <p className="text-sm mt-1">Upload your first CSV file to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dataStatus.map((item, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg font-black text-white">{item.symbol}</span>
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.interval === '1m' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                                        }`}>
                                        {item.interval}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500 flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" /> Candles
                                        </span>
                                        <span className="font-bold text-emerald-400">{formatNumber(item.count)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Range
                                        </span>
                                        <span className="font-mono text-zinc-300 text-xs">
                                            {formatDate(item.firstDate)} → {formatDate(item.lastDate)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="p-6 rounded-2xl border border-amber-900/30 bg-amber-950/10">
                <h4 className="font-bold text-amber-500 mb-2">📝 How to Use</h4>
                <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
                    <li>Go to <a href="https://www.histdata.com/download-free-forex-data/" target="_blank" className="text-blue-400 hover:underline">histdata.com</a> and download "Generic ASCII" → "M1 (1 Minute Bar) Data"</li>
                    <li>Select the currency pair and download all years you need</li>
                    <li>Upload the CSV file here - 5m data is automatically generated from 1m</li>
                    <li>That's it! Your backtesting will now use INSTANT cached data</li>
                </ol>
            </div>
        </div>
    )
}
