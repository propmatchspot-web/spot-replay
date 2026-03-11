// Analysis Storage Utilities - LocalStorage with auto-expiry

export interface StoredAnalysis {
    id: string
    timestamp: number
    expiresAt: number
    asset: string
    timeframe: string
    session: string
    bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
    entryPrice?: string
    stopLoss?: string
    takeProfit1?: string
    probability?: string
    confluenceScore?: string
    riskAmount?: number
    lotSize?: number
    outcome?: 'WIN' | 'LOSS' | 'PENDING'
    rawResponse: string
    context: {
        accountBalance: number
        riskPercent: number
        newsImpact: string
        notes: string
        tradeType: string
    }
}

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    image?: string
    timestamp: number
}

const ANALYSIS_KEY = 'trading_analysis_history'
const CHAT_KEY = 'trading_chat_history'
const SETTINGS_KEY = 'analysis_settings'
const MAX_ANALYSES = 20
const ANALYSIS_TTL = 24 * 60 * 60 * 1000 // 24 hours in ms

// Generate unique ID
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============ ANALYSIS STORAGE ============

export function saveAnalysis(analysis: Omit<StoredAnalysis, 'id' | 'timestamp' | 'expiresAt'>): StoredAnalysis {
    const stored: StoredAnalysis = {
        ...analysis,
        id: generateId(),
        timestamp: Date.now(),
        expiresAt: Date.now() + ANALYSIS_TTL,
    }

    const existing = getAnalysisHistory()
    const updated = [stored, ...existing].slice(0, MAX_ANALYSES)

    if (typeof window !== 'undefined') {
        localStorage.setItem(ANALYSIS_KEY, JSON.stringify(updated))
    }

    return stored
}

export function getAnalysisHistory(): StoredAnalysis[] {
    if (typeof window === 'undefined') return []

    try {
        const data = localStorage.getItem(ANALYSIS_KEY)
        if (!data) return []

        const analyses: StoredAnalysis[] = JSON.parse(data)
        const now = Date.now()

        // Filter out expired
        const valid = analyses.filter(a => a.expiresAt > now)

        // If we removed any, update storage
        if (valid.length !== analyses.length) {
            localStorage.setItem(ANALYSIS_KEY, JSON.stringify(valid))
        }

        return valid
    } catch {
        return []
    }
}

export function getAnalysisById(id: string): StoredAnalysis | null {
    const analyses = getAnalysisHistory()
    return analyses.find(a => a.id === id) || null
}

export function updateAnalysisOutcome(id: string, outcome: 'WIN' | 'LOSS'): boolean {
    const analyses = getAnalysisHistory()
    const index = analyses.findIndex(a => a.id === id)

    if (index === -1) return false

    analyses[index].outcome = outcome

    if (typeof window !== 'undefined') {
        localStorage.setItem(ANALYSIS_KEY, JSON.stringify(analyses))
    }

    return true
}

export function deleteAnalysis(id: string): boolean {
    const analyses = getAnalysisHistory()
    const filtered = analyses.filter(a => a.id !== id)

    if (filtered.length === analyses.length) return false

    if (typeof window !== 'undefined') {
        localStorage.setItem(ANALYSIS_KEY, JSON.stringify(filtered))
    }

    return true
}

export function clearAllAnalyses(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(ANALYSIS_KEY)
    }
}

// ============ CHAT STORAGE ============

export function saveChatHistory(messages: ChatMessage[]): void {
    if (typeof window !== 'undefined') {
        // Don't store images in localStorage (too large)
        const toStore = messages.map(m => ({
            ...m,
            image: undefined // Remove images to save space
        }))
        localStorage.setItem(CHAT_KEY, JSON.stringify(toStore))
    }
}

export function getChatHistory(): ChatMessage[] {
    if (typeof window === 'undefined') return []

    try {
        const data = localStorage.getItem(CHAT_KEY)
        if (!data) return []
        return JSON.parse(data)
    } catch {
        return []
    }
}

export function clearChatHistory(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(CHAT_KEY)
    }
}

// ============ SETTINGS ============

export interface AnalysisSettings {
    accountBalance: number
    riskPercent: number
    defaultAsset?: string
    defaultTimeframe?: string
}

export function saveSettings(settings: AnalysisSettings): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    }
}

export function getSettings(): AnalysisSettings {
    if (typeof window === 'undefined') {
        return { accountBalance: 10000, riskPercent: 1 }
    }

    try {
        const data = localStorage.getItem(SETTINGS_KEY)
        if (!data) return { accountBalance: 10000, riskPercent: 1 }
        return JSON.parse(data)
    } catch {
        return { accountBalance: 10000, riskPercent: 1 }
    }
}

// ============ STATS ============

export function getAnalysisStats(): {
    total: number
    wins: number
    losses: number
    pending: number
    accuracy: number
} {
    const analyses = getAnalysisHistory()

    const wins = analyses.filter(a => a.outcome === 'WIN').length
    const losses = analyses.filter(a => a.outcome === 'LOSS').length
    const pending = analyses.filter(a => a.outcome === 'PENDING' || !a.outcome).length
    const completed = wins + losses

    return {
        total: analyses.length,
        wins,
        losses,
        pending,
        accuracy: completed > 0 ? Math.round((wins / completed) * 100) : 0,
    }
}

// ============ CLEANUP ============

export function cleanupExpired(): number {
    const before = getAnalysisHistory()
    const beforeCount = before.length
    // getAnalysisHistory already filters expired, so just call it
    const afterCount = before.length
    return beforeCount - afterCount
}
