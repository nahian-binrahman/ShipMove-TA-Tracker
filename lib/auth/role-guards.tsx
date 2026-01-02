import { redirect } from "next/navigation";
import { getCurrentUser, getProfileRole } from "@/lib/supabase/server";
import { AppRole } from "@/types/app";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: AppRole[];
    fallbackPath?: string;
}

export async function RoleGuard({
    children,
    allowedRoles,
    fallbackPath = "/"
}: RoleGuardProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const role = await getProfileRole(user.id);

    if (!allowedRoles.includes(role)) {
        redirect(fallbackPath);
    }

    return <>{children}</>;
}

/**
 * Highly specific guard for Admin-only routes/actions.
 */
export async function AdminOnly({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={["admin"]}>
            {children}
        </RoleGuard>
    );
}

/**
 * Guard for Data Entry or Admin (Write access).
 */
export async function WriteAccess({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={["admin", "data_entry"]}>
            {children}
        </RoleGuard>
    );
}
