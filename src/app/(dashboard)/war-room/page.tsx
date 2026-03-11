import { MarketSessions } from '@/components/war-room/MarketSessions'
import { NewsWidget } from '@/components/war-room/NewsWidget'
import { DailyBriefing } from '@/components/war-room/DailyBriefing'
import { MarketBias } from '@/components/war-room/MarketBias'
import { getDailyPlan } from './actions'

export default async function WarRoomPage() {
    const plan = await getDailyPlan()

    return (
        <div className="flex w-full flex-col gap-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">The War Room</h1>
                    <p className="text-zinc-400 font-medium">Live Execution Hub</p>
                </div>
            </div>

            {/* 1. Full Width Sessions Timeline */}
            <section className="w-full">
                <MarketSessions />
            </section>

            {/* 2. Full Width Market Bias & Data */}
            <section className="w-full">
                <MarketBias />
            </section>

            {/* 3. Bottom Grid: Briefing & News */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
                {/* News Feed (Larger share) */}
                <div className="lg:col-span-8 h-full">
                    <NewsWidget />
                </div>

                {/* Daily Briefing (Side Panel) */}
                <div className="lg:col-span-4 h-full">
                    <DailyBriefing initialData={plan} />
                </div>
            </section>
        </div>
    )
}
