import { createClient } from '@/utils/supabase/server'
import { UsersTable } from '@/components/admin/UsersTable'

export default async function UsersCRMPage() {
    const supabase = await createClient()

    // 1. Fetch Users logic (Simplified for now - Fetch All)
    // In production, we'd paginate 50 at a time.
    const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

    // @ts-ignore
    return <UsersTable initialUsers={users || []} />
}
