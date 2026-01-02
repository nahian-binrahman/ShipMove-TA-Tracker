import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const createClient = async () => {
    const cookieStore = await cookies()

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.")
    }

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

export const getCurrentUser = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export const getProfileRole = async (userId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single()

    if (error || !data) return "viewer"
    return data.role as any
}

export const getCurrentProfile = async () => {
    const user = await getCurrentUser()
    if (!user) return null

    const supabase = await createClient()
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    if (error || !data) return null
    return data as any
}
