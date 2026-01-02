import { Sidebar } from "@/components/features/shared/sidebar";
import { Topbar } from "@/components/features/shared/topbar";
import { getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const profile = await getCurrentProfile();

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar role={profile?.role} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Topbar profile={profile} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
