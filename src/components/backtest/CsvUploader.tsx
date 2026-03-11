'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'
import { Candle } from '@/lib/binance'

interface CsvUploaderProps {
    onDataLoaded: (data: Candle[]) => void
}

export function CsvUploader({ onDataLoaded }: CsvUploaderProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsLoading(true)
        const reader = new FileReader()

        reader.onload = (e) => {
            const text = e.target?.result as string
            const lines = text.split('\n')
            const data: Candle[] = []

            // Assume format: Date,Open,High,Low,Close,Volume
            // Skip header if present
            const startIndex = isNaN(Date.parse(lines[0].split(',')[0])) ? 1 : 0

            for (let i = startIndex; i < lines.length; i++) {
                const line = lines[i].trim()
                if (!line) continue

                const parts = line.split(',')
                if (parts.length < 5) continue

                // Try to parse date
                const time = Date.parse(parts[0]) / 1000
                if (isNaN(time)) continue

                data.push({
                    time,
                    open: parseFloat(parts[1]),
                    high: parseFloat(parts[2]),
                    low: parseFloat(parts[3]),
                    close: parseFloat(parts[4]),
                    volume: parseFloat(parts[5] || '0'),
                })
            }

            // Sort by time just in case
            data.sort((a, b) => a.time - b.time)

            onDataLoaded(data)
            setIsLoading(false)
        }

        reader.readAsText(file)
    }

    return (
        <div className="flex items-center gap-2">
            <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
            />
            <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => document.getElementById('csv-upload')?.click()}
            >
                <Upload className="mr-2 h-4 w-4" />
                {isLoading ? 'Parsing...' : 'Upload CSV'}
            </Button>
        </div>
    )
}
