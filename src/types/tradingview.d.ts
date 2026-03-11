declare module '@mathieuc/tradingview' {
    export class Client {
        Session: {
            Chart: new () => ChartSession
        }
        end(): void
    }

    export interface ChartSession {
        setMarket(symbol: string, options: { timeframe: string, range: number }): void
        onUpdate(callback: () => void): void
        onError(callback: (err: any) => void): void
        periods: {
            time: number
            open: number
            max: number
            min: number
            close: number
            volume: number
        }[]
    }
}
