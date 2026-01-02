import { AdminOnly } from "@/lib/auth/role-guards";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, Activity, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
    return (
        <AdminOnly>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-primary">Command Center (Admin)</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/admin/users">
                        <Card className="bg-card/40 border-border hover:border-primary/50 transition-all cursor-pointer group h-full">
                            <CardHeader>
                                <Users className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>Commission personnel and manage command roles.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground font-mono uppercase">Operational Level: High</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Card className="bg-card/40 border-border grayscale opacity-60 h-full">
                        <CardHeader>
                            <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                            <CardTitle>System Logs</CardTitle>
                            <CardDescription>View audit trails and tactical deployment logs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground font-mono uppercase italic">Protocol: Classified</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 border-border grayscale opacity-60 h-full">
                        <CardHeader>
                            <ShieldAlert className="h-8 w-8 text-muted-foreground mb-2" />
                            <CardTitle>Security Registry</CardTitle>
                            <CardDescription>Review encryption keys and access tokens.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground font-mono uppercase italic">Protocol: Secure</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminOnly>
    );
}
