import { getCurrentProfile } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Building, Mail, Award, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function ProfilePage() {
    const profile = await getCurrentProfile();

    if (!profile) {
        redirect("/login");
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Command Identity</h1>
                <p className="text-muted-foreground">
                    Verified tactical profile and authorization level.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-1 bg-card/40 border-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                    <CardHeader className="flex flex-col items-center pb-8">
                        <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-4">
                            <User className="w-12 h-12 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-bold text-center">{profile.full_name}</CardTitle>
                        <CardDescription className="text-primary/70 font-mono text-xs uppercase tracking-widest mt-1">
                            {profile.rank || "Personnel"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                ACTIVE DUTY
                            </Badge>
                        </div>
                        <Separator className="bg-border/50" />
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Shield className="w-4 h-4 text-primary/60" />
                                <span className="text-muted-foreground">Role:</span>
                                <span className="font-semibold capitalize">{profile.role.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Award className="w-4 h-4 text-primary/60" />
                                <span className="text-muted-foreground">Rank:</span>
                                <span className="font-semibold">{profile.rank || "N/A"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Section */}
                <Card className="md:col-span-2 bg-card/40 border-border relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-primary">Operational Details</CardTitle>
                        <CardDescription>Official command and contact information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Full Legal Name</label>
                                <div className="p-3 bg-secondary/30 rounded-lg border border-border flex items-center gap-3">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{profile.full_name}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Service Number / ID</label>
                                <div className="p-3 bg-secondary/30 rounded-lg border border-border flex items-center gap-3">
                                    <Award className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-mono">{profile.id.split('-')[0].toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Organization</label>
                                <div className="p-3 bg-secondary/30 rounded-lg border border-border flex items-center gap-3">
                                    <Building className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{profile.organization || "Bangladesh Navy"}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Command Authority</label>
                                <div className="p-3 bg-secondary/30 rounded-lg border border-border flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium capitalize">{profile.role.split('_').join(' ')} Level</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1 pt-2">
                            <label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Account Security</label>
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <div className="text-sm">
                                        <p className="font-semibold text-primary">Last Profile Update</p>
                                        <p className="text-muted-foreground text-xs">{new Date(profile.updated_at).toLocaleDateString()} at {new Date(profile.updated_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="text-[10px]">VERIFIED</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
