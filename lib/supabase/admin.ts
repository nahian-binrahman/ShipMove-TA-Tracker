import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Highly privileged client for server-side admin operations only.
 * NEVER expose this to the browser or in a Client Component.
 */
export const createAdminClient = () => {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase Admin environment variables.")
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
