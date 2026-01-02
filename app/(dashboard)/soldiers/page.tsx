"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Soldier } from "@/types/app"
import { SoldierTable } from "@/components/features/soldiers/soldier-table"
import { AddSoldierDialog } from "@/components/features/soldiers/add-soldier-dialog"
import { useRole } from "@/hooks/use-role"
import { toast } from "sonner"

export default function SoldiersPage() {
    const [soldiers, setSoldiers] = useState<Soldier[]>([])
    const [loading, setLoading] = useState(true)
    const { isAdmin } = useRole()
    const supabase = createClient()

    const fetchSoldiers = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("soldiers")
                .select("*")
                .order("full_name", { ascending: true })

            if (error) {
                toast.error("Failed to load personnel registry")
                return
            }

            setSoldiers(data || [])
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSoldiers()
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Personnel Registry</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage and monitor active tactical personnel across all units.
                    </p>
                </div>
                {isAdmin && <AddSoldierDialog onRefresh={fetchSoldiers} />}
            </div>

            <SoldierTable data={soldiers} loading={loading} onRefresh={fetchSoldiers} />
        </div>
    )
}
