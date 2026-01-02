import {
    Ship,
    TrendingUp,
    AlertTriangle,
    Plus,
    Search,
    Download,
    Users,
    Map,
    Shield,
    Navigation
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchDashboardStats } from "@/lib/actions/movements";
import { getProfileRole, getCurrentUser } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TacticalSceneContainer } from "@/components/features/dashboard/tactical-scene-container";

export default async function DashboardPage() {
    const user = await getCurrentUser();
    const role = await getProfileRole(user?.id || "");
    const stats = await fetchDashboardStats();

    const isViewer = role === 'viewer';

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-primary uppercase">
                        Tactical Dashboard
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-2xl">
                        Operational overview for personnel logistics and movement authorizations.
                    </p>
                </div>
                {!isViewer && (
                    <div className="flex items-center gap-3">
                        <Link href="/movements/new">
                            <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all px-6 h-11">
                                <Plus className="h-5 w-5" /> New Movement
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/40 border-primary/20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-bold">Today's Missions</CardTitle>
                        <Ship className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground">{stats.todayCount}</div>
                        <p className="text-[10px] text-muted-foreground mt-2 font-mono uppercase">
                            Operational status: Active
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border shadow-2xl relative overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-bold">Pending Review</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground">{stats.pendingCount}</div>
                        <p className="text-[10px] text-muted-foreground mt-2 font-mono uppercase">
                            Awaiting Command Authorization
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border shadow-2xl relative overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-bold">Monthly Spend</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground">৳{stats.monthSpend.toLocaleString()}</div>
                        <p className="text-[10px] text-muted-foreground mt-2 font-mono uppercase font-bold text-emerald-500/80">
                            Within Budget Parameters
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border shadow-2xl relative overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-bold">Authority Limit</CardTitle>
                        <Shield className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground">৳{stats.totalSpend.toLocaleString()}</div>
                        <p className="text-[10px] text-muted-foreground mt-2 font-mono uppercase">
                            Authorized Lifetime Value
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="md:col-span-2 bg-card/40 border-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                            <Navigation className="h-4 w-4" />
                            Tactical Launchpad
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">Rapid deployment and search tools</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {!isViewer && (
                            <Link href="/movements/new" className="block group">
                                <Button variant="secondary" className="w-full h-28 flex-col gap-3 bg-secondary/40 hover:bg-secondary transition-all border border-border border-dashed hover:border-solid hover:border-primary/50 group-hover:scale-[1.02]">
                                    <Plus className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                                    <span className="font-bold tracking-tight">Initiate Movement</span>
                                </Button>
                            </Link>
                        )}
                        <Link href="/soldiers" className="block group">
                            <Button variant="secondary" className="w-full h-28 flex-col gap-3 bg-secondary/40 hover:bg-secondary transition-all border border-border border-dashed hover:border-solid hover:border-blue-500/50 group-hover:scale-[1.02]">
                                <Users className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" />
                                <span className="font-bold tracking-tight">Search Registry</span>
                            </Button>
                        </Link>
                        <Link href="/movements" className="block group">
                            <Button variant="secondary" className="w-full h-28 flex-col gap-3 bg-secondary/40 hover:bg-secondary transition-all border border-border border-dashed hover:border-solid hover:border-emerald-500/50 group-hover:scale-[1.02]">
                                <Map className="h-8 w-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                                <span className="font-bold tracking-tight">Mission Logs</span>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                            <Shield className="h-4 w-4" />
                            Security Protocols
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4 items-start text-sm bg-secondary/60 p-4 rounded-lg border border-border">
                            <div className="bg-primary/10 p-2.5 rounded shadow-inner">
                                <Search className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-foreground font-bold leading-none">Command Palette</p>
                                <p className="text-muted-foreground text-xs leading-relaxed mt-2">
                                    Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                        <span className="text-xs">⌘</span>K
                                    </kbd> for instant navigation and global personnel search.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="pt-4 border-t border-border">
                <TacticalSceneContainer />
            </div>
        </div>
    );
}
