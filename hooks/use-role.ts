"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AppRole } from "@/types/app"

export function useRole() {
    const [role, setRole] = useState<AppRole | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchRole() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setRole(null)
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single()

            if (!error && data) {
                setRole(data.role as AppRole)
            } else {
                setRole("viewer")
            }
            setLoading(false)
        }

        fetchRole()
    }, [supabase])

    const isAdmin = role === "admin"
    const isDataEntry = role === "data_entry" || role === "admin"
    const isViewer = role === "viewer"

    return { role, isAdmin, isDataEntry, isViewer, loading }
}
