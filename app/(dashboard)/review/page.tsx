import { fetchMovements } from "@/lib/actions/movements"
import { ReviewQueue } from "@/components/features/movements/review-queue"
import { ShieldAlert, Info } from "lucide-react"
import { getCurrentUser, getProfileRole } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ReviewPage() {
    const user = await getCurrentUser()
    if (!user) redirect("/login")

    const role = await getProfileRole(user.id)
    if (role !== 'admin' && role !== 'data_entry') {
        redirect("/")
    }

    // Fetch only pending movements
    const pendingMovements = await fetchMovements({ status: 'pending' })

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Authorization Queue</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                        Command review required for pending tactical movements.
                    </p>
                </div>
            </div>

            {/* Instructional Alert */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-3 items-start">
                <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                    <p className="font-semibold text-primary">Operational Protocol</p>
                    <p className="text-muted-foreground">Entries in this queue are blocked from TA payment processing until authorized. Ensure all mission documents are verified via the preview action.</p>
                </div>
            </div>

            <ReviewQueue initialData={pendingMovements} />
        </div>
    )
}
