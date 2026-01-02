import { fetchManagedUsers } from "@/lib/actions/users"
import { UserManagementTable } from "@/components/features/admin/user-management-table"
import { CreateUserDialog } from "@/components/features/admin/create-user-dialog"
import { ShieldCheck, Info } from "lucide-react"
import { AdminOnly } from "@/lib/auth/role-guards"

export default async function AdminUsersPage() {
    const users = await fetchManagedUsers()

    return (
        <AdminOnly>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Personnel Management</h1>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Secure authority to commission and manage tactical personnel.
                        </p>
                    </div>
                    <CreateUserDialog />
                </div>

                {/* Dashboard Information */}
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-3 items-start">
                    <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="text-sm">
                        <p className="font-semibold text-primary">Command Protocol</p>
                        <p className="text-muted-foreground">
                            Users created here are automatically confirmed and given access based on their assigned role.
                            Audit logs are maintained for every commissioning action to ensure system accountability.
                        </p>
                    </div>
                </div>

                <UserManagementTable users={users} />
            </div>
        </AdminOnly>
    )
}
