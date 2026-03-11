import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDirectInsert() {
    console.log("Testing direct insert into public.users...")
    const dummyId = '123e4567-e89b-12d3-a456-426614174000'
    const { data, error } = await supabase
        .from('users')
        .insert({
            id: dummyId,
            email: 'direct_insert_test@example.com',
            username: 'Direct Insert Test'
        })

    if (error) {
        console.error("EXACT DATABASE ERROR:", error)
    } else {
        console.log("SUCCESS! User created:", data)
    }
}

testDirectInsert()
