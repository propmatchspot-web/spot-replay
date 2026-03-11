import { addDays, subDays } from 'date-fns'

export interface DemoTrade {
    id: string
    pair: string
    type: 'LONG' | 'SHORT'
    entry_price: number
    exit_price: number
    pnl: number
    status: 'CLOSED'
    open_time: string
    close_time: string
    rr: number
}

export function generateDemoTrades(count: number = 50): DemoTrade[] {
    const trades: DemoTrade[] = []
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD', 'ETHUSD', 'NAS100', 'US30']
    const now = new Date()

    let balance = 100000 // Starting reference for realistic PnL sizing

    for (let i = 0; i < count; i++) {
        const isWin = Math.random() > 0.45 // 55% winrate
        const pair = pairs[Math.floor(Math.random() * pairs.length)]
        const type = Math.random() > 0.5 ? 'LONG' : 'SHORT'

        // Random date within last 30 days
        const openTime = subDays(now, Math.floor(Math.random() * 30))
        const durationMinutes = Math.floor(Math.random() * 240) + 15 // 15m to 4h
        const closeTime = new Date(openTime.getTime() + durationMinutes * 60000)

        // PnL Logic
        const risk = 1000 // 1% risk
        const reward = risk * (Math.random() * 2 + 1) // 1:1 to 1:3 RR
        const pnl = isWin ? reward : -risk

        trades.push({
            id: `demo-${i}`,
            pair,
            type,
            entry_price: 0, // Placeholder
            exit_price: 0, // Placeholder
            pnl,
            status: 'CLOSED',
            open_time: openTime.toISOString(),
            close_time: closeTime.toISOString(),
            rr: isWin ? (pnl / risk) : 0
        })
    }

    return trades.sort((a, b) => new Date(b.open_time).getTime() - new Date(a.open_time).getTime())
}
