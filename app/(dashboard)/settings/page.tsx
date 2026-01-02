import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Bell, Shield, Eye, Palette, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/features/shared/mode-toggle";

export default function SettingsPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary">System Configuration</h1>
                <p className="text-muted-foreground">
                    Manage operational preferences and interface protocols.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Interface Settings */}
                <Card className="bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Palette className="w-5 h-5 text-primary" /> Display Protocols
                        </CardTitle>
                        <CardDescription>Customize the visual interface and theme behavior.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-semibold">Active Theme</Label>
                                <p className="text-xs text-muted-foreground">Toggle between Light and Tactical Dark modes.</p>
                            </div>
                            <ModeToggle />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-semibold">Reduced Motion</Label>
                                <p className="text-xs text-muted-foreground">Minimize tactical animations and transitions.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card className="bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" /> Alert Protocols
                        </CardTitle>
                        <CardDescription>Configure how mission authorizations and updates are signaled.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-semibold">Mission Updates</Label>
                                <p className="text-xs text-muted-foreground">Receive alerts for movement status changes.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-semibold">Authorization Requests</Label>
                                <p className="text-xs text-muted-foreground">Notify when new movements require command review.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" /> Security Clearances
                        </CardTitle>
                        <CardDescription>Manage tactical permissions and session behavior.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-semibold">Auto-Lock Personnel Log</Label>
                                <p className="text-xs text-muted-foreground">Automatically obscure personnel data after inactivity.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-semibold">Session Lifetime</Label>
                                <p className="text-xs text-muted-foreground">Logged out after 8 hours of inactivity by default.</p>
                            </div>
                            <Badge variant="outline">STANDARD</Badge>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button className="font-bold px-8">Sync Procedures</Button>
                </div>
            </div>
        </div>
    );
}
