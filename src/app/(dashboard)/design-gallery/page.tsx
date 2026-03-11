'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    BookOpen,
    BarChart2,
    History,
    Swords,
    Settings,
    Lock,
    MonitorPlay
} from 'lucide-react'

// DATA: The "Project Bible" of Design Prompts
const SCREENS = [
    {
        id: 'dashboard',
        title: 'Main Dashboard',
        icon: LayoutDashboard,
        prompt: `Create a comprehensive, high-density 'Command Center' dashboard using a dark, glassmorphic aesthetic.
The layout must be a 3-column grid optimized for wide screens.
- Left Column: Quick Profile Summary (Avatar, 'Pro Trader' badge) and Account Overview card showing Balance, Equity, and PnL with green/red dynamic text.
- Center Column (Wide): A large 'Performance Over Time' area chart (Equity Curve) floating on a glass card. Below it, a 'Recent Activity' list showing the last 5 trades with concise details.
- Right Column: 'Key Metrics' vertical stack. Win Rate (Circular Progress), Profit Factor (Stat Card), and 'Active Streak'.
Use a 'Zinc' color palette (Zinc-950 background, Zinc-900 cards) with 'amber-500' for profits and 'Rose-500' for losses. Font: Inter.`,
        details: [
            "Layout: CSS Grid (grid-cols-12). Left: col-span-3, Center: col-span-6, Right: col-span-3.",
            "Components: AccountOverview, EquityCurveChart, RecentTradesList, StatCard.",
            "Visuals: Backdrop-blur-md on all cards. Border-white/5 for subtle definition.",
            "Interactions: Hover effects on trade list items. 'Quick Add Trade' floating action button."
        ]
    },
    {
        id: 'journal',
        title: 'Trading Journal',
        icon: BookOpen,
        prompt: `Design a professional, institutional-grade Data Grid for the Trading Journal.
The focus is on data density and readability.
- Header: Custom 'Filter Bar' with dropdowns for Pair, Type (Long/Short), Status (Win/Loss), and Date Range.
- Table: Sleek, borderless table lines. Rows should have a hover effect (zinc-800/50).
- Columns: Date, Pair (with icon), Type (Badges: Long=Blue, Short=Orange), Entry, Exit, Size, PnL (Green/Red text), Setup (Tag), Review Status (Star icon).
- Pagination: Simple 'Previous / Next' at the bottom right.
- Empty State: A 'Ghost' illustration encouraging the user to log their first trade.`,
        details: [
            "Library: TanStack React Table (headless) with custom UI.",
            "Features: globalFilter, columnSorting, pagination.",
            "Styling: 'Table' component from shadcn/ui customized with 'No Border' aesthetic.",
            "UX: Clicking a row opens the 'Trade Details/Edit' drawer side-panel."
        ]
    },
    {
        id: 'analytics',
        title: 'Analytics Engine',
        icon: BarChart2,
        prompt: `Build a highly visual 'Analytics Report' page.
Top Section: 'Period Selector' (This Week, This Month, All Time) as a segmented control.
Grid 1: 'Period Breakdown'. A 4-card grid showing Net PnL, Win Rate, Profit Factor, Expectancy.
Grid 2: 'Detailed Charts'.
  - 'Win Rate by Day of Week' (Vertical Bar Chart).
  - 'PnL by Hour of Day' (Heatmap or Bar).
  - 'Calendar Heatmap': GitHub-style contribution graph showing trade frequency/profitability per day.
Aesthetic: Dark mode, neon accents (Blue/Purple gradients for neutral stats).`,
        details: [
            "Charting Library: Recharts (ResponsiveContainer).",
            "Logic: All stats calculated client-side from the 'trades' array using memos.",
            "Performance: Heavy calculations wrapped in useMemo to prevent lag on re-renders."
        ]
    },
    {
        id: 'backtest',
        title: 'Backtest Engine (FX Replay)',
        icon: History,
        prompt: `Create a fully functional 'Time Machine' Backtesting environment.
Core Component: TradingView Pro Widget (Canvas) taking up 90% of the screen.
- Controls: A 'Replay Toolbar' injected into the TV Header (Play, Pause, Step Forward, Speed).
- Order Panel: A 'Quick Order' dialog (Market/Limit, Risk %, SL/TP pips).
- Session Info: A discreet Bottom Bar showing 'Simulated Balance', 'Equity', and 'Unrealized PnL'.
- Experience: The chart must load INSTANTLY (pre-loaded buffer). Replay must be smooth (tick-by-tick simulation).`,
        details: [
            "Tech: TradingView Charting Library (Private Repo) manual integration.",
            "State Management: Ref-based Architecture to solve 'Infinite Loop' and 'Stale Closure' issues during high-speed replay.",
            "Datafeed: Custom UDF Adapter feeding data from local React State (SQL buffer) instead of API calls."
        ]
    },
    {
        id: 'war-room',
        title: 'The War Room',
        icon: Swords,
        prompt: `Design a 'Daily Execution Hub' for active trading.
Layout: Full-screen vertical stack.
1. 'Market Timeline': A horizontal scrollable bar showing current Active Sessions (London, NY, Tokyo) based on UTC time.
2. 'Daily Briefing': A collapsible Accordion for 'Daily Bias', 'News Events' (ForexFactory style), and 'Notes'.
3. 'A-Game Checklist': A gamified checklist (Mental State, Risk Plan, Setup Criteria) that unlocks the 'Trade' button when completed.
4. 'Market Overview': Embedding TradingView 'Mini Charts' widget for DXY, EURUSD, BTCUSD.`,
        details: [
            "Purpose: Pre-market preparation and bias confirmation.",
            "Components: MarketSessions (Timeline), DailyPlanForm, ChecklistWidget.",
            "Storage: Daily Plans saved to 'daily_plans' Supabase table."
        ]
    },
    {
        id: 'settings',
        title: 'Settings & Guardian',
        icon: Settings,
        prompt: `Create a clean, tabbed Settings page.
Tabs: Profile, Account, Guardian, Danger Zone.
- Guardian Tab: A dedicated 'Risk Manager' interface.
  - Inputs for 'Max Daily Loss', 'Max Drawdown', 'Max Position Size'.
  - A comprehensive 'Lock' toggle. If enabled, the user cannot place trades if limits are breached.
- Profile Tab: Avatar upload, Username change, 'Trading Style' selector (Scalper, Swing).`,
        details: [
            "Validation: Zod schema validation for all inputs.",
            "Guardian Logic: Middleware checks these rules before every 'placeOrder' action in the Backtest Engine and Live Journal."
        ]
    },
    {
        id: 'auth',
        title: 'Authentication',
        icon: Lock,
        prompt: `Design a high-conversion Login/Signup page.
Background: Subtle, animated abstract mesh gradient (dark purples/blues).
Card: A central glassmorphic card with a glowing border.
- Logo: Centered at top.
- Fields: Email, Password (with 'Show' toggle).
- CTA: 'Sign In' (Full width, gradient background).
- Socials: 'Continue with Google' (White button).
Animations: Fade-in on mount. Shake animation on error.`,
        details: [
            "Framework: Supabase Auth (SSR).",
            "Feedback: Sonner toasts for errors.",
            "Route: /login, /signup layout.tsx overrides standard dashboard layout."
        ]
    }
]

export default function DesignGalleryPage() {
    return (
        <div className="min-h-screen bg-[#09090b] text-white p-8">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-400">
                        Design Gallery & Specifications
                    </h1>
                    <p className="text-zinc-400 max-w-2xl text-lg">
                        The internal "Project Bible" documenting the exact prompt designs, specifications, and layout rules for every screen in the Spot Replay application.
                        <br />
                        <span className="text-xs uppercase tracking-widest text-zinc-600 font-bold mt-2 block">
                            Confidential • Internal Use Only
                        </span>
                    </p>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 gap-12">
                    {SCREENS.map((screen, index) => (
                        <motion.div
                            key={screen.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            {/* Connector Line */}
                            {index !== SCREENS.length - 1 && (
                                <div className="absolute left-[28px] top-[60px] bottom-[-48px] w-px bg-zinc-800/50 group-hover:bg-blue-500/30 transition-colors" />
                            )}

                            <div className="flex gap-6">
                                {/* Icon Column */}
                                <div className="shrink-0">
                                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#131722] border border-zinc-800 group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                                        <screen.icon className="w-6 h-6 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 space-y-6">
                                    <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-3">
                                        {screen.title}
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 font-medium">
                                            ID: {screen.id}
                                        </span>
                                    </h2>

                                    {/* The "Prompt" Card */}
                                    <div className="p-6 rounded-xl bg-gradient-to-br from-[#131722] to-[#0c0e14] border border-zinc-800/60 shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <MonitorPlay className="w-24 h-24" />
                                        </div>

                                        <div className="relative z-10 space-y-4">
                                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                                Exact Prompt Design
                                            </h3>
                                            <p className="text-zinc-300 leading-relaxed font-mono text-sm whitespace-pre-line border-l-2 border-blue-500/30 pl-4">
                                                "{screen.prompt}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* The "Details" List */}
                                    <div className="pl-2">
                                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
                                            Technical Details & UX Rules
                                        </h3>
                                        <ul className="space-y-2">
                                            {screen.details.map((detail, i) => (
                                                <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
