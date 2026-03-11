import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function FullscreenLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-[#050505] text-zinc-50">
            {children}
        </div>
    )
}
