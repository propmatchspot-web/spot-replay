import { createClient } from '@/utils/supabase/server'
import { PlansManager } from '@/components/admin/PlansManager'

export default async function PlansPage() {
    const supabase = await createClient()
    const { data: plans } = await supabase.from('plans').select('*').order('price_monthly', { ascending: true })

    // @ts-ignore
    return (
        <div className="p-8">
            <PlansManager initialPlans={plans || []} />
        </div>
    )
}
