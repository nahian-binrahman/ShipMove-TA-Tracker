"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUser, getProfileRole } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { AppRole } from "@/types/app"

export interface ManagedUser {
    id: string
    email: string | undefined
    role: AppRole
    full_name: string | null
    created_at: string
    status: "active" | "invited"
}

/**
 * Fetch all users for administration.
 * Only accessible by Admins.
 */
export async function fetchManagedUsers(): Promise<ManagedUser[]> {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const role = await getProfileRole(user.id)
    if (role !== "admin") throw new Error("Forbidden: Admin access only")

    const adminClient = createAdminClient()

    // 1. Fetch all profiles
    const { data: profiles, error: pError } = await adminClient
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

    if (pError) throw new Error(`Failed to fetch profiles: ${pError.message}`)

    // 2. Fetch all auth users to get emails and status
    const { data: { users: authUsers }, error: aError } = await adminClient.auth.admin.listUsers()

    if (aError) throw new Error(`Failed to fetch auth users: ${aError.message}`)

    // 3. Merge data
    return profiles.map((p) => {
        const authUser = authUsers.find((u) => u.id === p.id)
        return {
            id: p.id,
            email: authUser?.email,
            role: p.role as AppRole,
            full_name: p.full_name,
            created_at: p.created_at || authUser?.created_at || new Date().toISOString(),
            status: authUser?.last_sign_in_at ? "active" : "invited"
        }
    })
}

/**
 * Create a new user with specific role.
 */
export async function createManagedUser(data: {
    email: string
    role: AppRole
    fullName: string
    password?: string
}) {
    const admin = await getCurrentUser()
    if (!admin) throw new Error("Unauthorized")

    const adminRole = await getProfileRole(admin.id)
    if (adminRole !== "admin") throw new Error("Forbidden: Admin access only")

    const adminClient = createAdminClient()

    // 1. Generate password if not provided
    const password = data.password || Math.random().toString(36).slice(-10) + "!" + Math.random().toString(36).slice(-2).toUpperCase()

    // 2. Create Auth User
    const { data: { user: newUser }, error: createError } = await adminClient.auth.admin.createUser({
        email: data.email,
        password: password,
        email_confirm: true,
        user_metadata: {
            full_name: data.fullName
        }
    })

    if (createError) {
        throw new Error(createError.message)
    }

    if (!newUser) throw new Error("Failed to create user object")

    // The trigger 'on_auth_user_created' in Supabase will automatically create a profile.
    // However, we want to set the explicit role and 'created_by' immediately.
    // We update the profile created by the trigger.
    const { error: updateError } = await adminClient
        .from("profiles")
        .update({
            role: data.role,
            full_name: data.fullName,
            created_by: admin.id
        })
        .eq("id", newUser.id)

    if (updateError) {
        // Cleanup if profile update fails? Optional, but good for data integrity.
        await adminClient.auth.admin.deleteUser(newUser.id)
        throw new Error(`Profile setup failed: ${updateError.message}`)
    }

    // 3. Log the action
    await adminClient.from("user_audit").insert({
        admin_id: admin.id,
        target_user_id: newUser.id,
        action: "user_created",
        email: data.email,
        role: data.role,
        metadata: {
            created_by_name: admin.email
        }
    })

    revalidatePath("/admin/users")

    return {
        success: true,
        credentials: {
            email: data.email,
            password: password
        }
    }
}
