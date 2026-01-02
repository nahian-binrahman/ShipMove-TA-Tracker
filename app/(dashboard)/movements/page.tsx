import { fetchMovements } from "@/lib/actions/movements"
import { MovementLogTable } from "@/components/features/movements/movement-log-table"
import { Plus, ListFilter } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function MovementsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const movements = await fetchMovements()

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Movement Logistics Log</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Operational record of all tactical personnel movements and TA authorizations.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/movements/new">
                        <Button className="gap-2 shadow-sm font-semibold">
                            <Plus className="h-4 w-4" /> New Tactical Entry
                        </Button>
                    </Link>
                </div>
            </div>

            <MovementLogTable data={movements} />
        </div>
    )
}
