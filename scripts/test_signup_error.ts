import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as crypto from 'crypto'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// WE DO NOT HAVE THE SERVICE ROLE KEY IN ENV.LOCAL
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testTrigger() {
    console.log("Testing auth signup with a unique email to trigger the db error...")
    const uniqueEmail = `test_${crypto.randomUUID()}@example.com`
    const { data, error } = await supabase.auth.signUp({
        email: uniqueEmail,
        password: 'password123',
        options: {
            data: { full_name: 'Test Trigger' }
        }
    })

    if (error) {
        console.error("AUTH ERROR CAUGHT:", JSON.stringify(error, null, 2))
    } else {
        console.log("SUCCESS! User created:", data)
    }
}

testTrigger()
