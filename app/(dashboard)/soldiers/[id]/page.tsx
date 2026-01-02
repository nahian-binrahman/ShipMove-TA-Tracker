"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    User,
    MapPin,
    Clock,
    Shield,
    BadgeCheck,
    Calendar,
    History,
    TrendingUp,
    ExternalLink
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Soldier, Movement } from "@/types/app"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

export default function SoldierProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [soldier, setSoldier] = useState<Soldier | null>(null)
    const [movements, setMovements] = useState<Movement[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchDetails() {
            setLoading(true)
            try {
                // Fetch Soldier
                const { data: soldierData, error: sError } = await supabase
                    .from("soldiers")
                    .select("*")
                    .eq("id", id)
                    .single()

                if (sError) throw sError
                setSoldier(soldierData)

                // Fetch Movements
                const { data: moveData, error: mError } = await supabase
                    .from("movements")
                    .select("*")
                    .eq("soldier_id", id)
                    .order("start_time", { ascending: false })

                if (!mError) setMovements(moveData || [])

            } catch (error) {
                toast.error("Failed to load personnel documentation")
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchDetails()
    }, [id, supabase])

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-[400px] md:col-span-1" />
                    <Skeleton className="h-[400px] md:col-span-2" />
                </div>
            </div>
        )
    }

    if (!soldier) {
        return (
            <div className="text-center py-20 bg-card/20 rounded-xl border border-dashed border-border">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <h2 className="text-xl font-bold">Personnel Not Found</h2>
                <p className="text-muted-foreground">The requested ID is not in our active tactical registry.</p>
                <Button variant="link" onClick={() => router.back()} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Return to HQ
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info Side Box */}
                <Card className="lg:col-span-1 bg-card/50 border-primary/10">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4 shadow-xl shadow-primary/5">
                            <User className="h-12 w-12 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{soldier.full_name}</CardTitle>
                        <CardDescription className="font-mono text-xs uppercase tracking-widest text-primary pt-1">
                            SN: {soldier.service_number}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex justify-center">
                            <Badge variant={soldier.is_active ? "default" : "secondary"} className="uppercase tracking-tighter px-4 py-1">
                                {soldier.is_active ? "Active Duty" : "Inactive"}
                            </Badge>
                        </div>
                        <Separator className="bg-border/50" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <p className="text-muted-foreground text-xs uppercase">Rank</p>
                                <p className="font-bold flex items-center gap-2">
                                    <BadgeCheck className="h-4 w-4 text-primary" /> {soldier.rank}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground text-xs uppercase">Unit</p>
                                <p className="font-bold flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" /> {soldier.unit}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tactical Overview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-card/40 border-border/50">
                            <CardContent className="pt-6">
                                <TrendingUp className="h-4 w-4 text-emerald-500 mb-2" />
                                <div className="text-2xl font-bold">{movements.length}</div>
                                <p className="text-xs text-muted-foreground">Total Movements</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/40 border-border/50">
                            <CardContent className="pt-6">
                                <Clock className="h-4 w-4 text-amber-500 mb-2" />
                                <div className="text-2xl font-bold">42h</div>
                                <p className="text-xs text-muted-foreground">Duty Flight Time</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/40 border-border/50">
                            <CardContent className="pt-6">
                                <MapPin className="h-4 w-4 text-blue-500 mb-2" />
                                <div className="text-2xl font-bold">6</div>
                                <p className="text-xs text-muted-foreground">Active Locations</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="history" className="w-full">
                        <TabsList className="bg-secondary/50 border border-border">
                            <TabsTrigger value="history" className="gap-2">
                                <History className="h-4 w-4" /> Movement History
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="gap-2">
                                <TrendingUp className="h-4 w-4" /> Tactical Stats
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="history" className="pt-4">
                            <Card className="bg-card/30 border-border/50">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border/50">
                                        {movements.length === 0 ? (
                                            <div className="p-8 text-center text-muted-foreground">
                                                No movement records found for this personnel.
                                            </div>
                                        ) : (
                                            movements.map((move) => (
                                                <div key={move.id} className="p-4 hover:bg-primary/5 transition-colors flex items-center justify-between group">
                                                    <div className="flex gap-4 items-center">
                                                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
                                                            <Calendar className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm tracking-tight">{move.from_location}</span>
                                                                <ArrowLeft className="h-3 w-3 rotate-180 text-muted-foreground" />
                                                                <span className="font-bold text-sm tracking-tight">{move.to_location}</span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                {format(new Date(move.start_time), "MMM dd, yyyy")} • {move.transport_mode}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest px-2 opacity-70">
                                                            {move.status}
                                                        </Badge>
                                                        <Button variant="ghost" size="icon" className="group-hover:text-primary h-8 w-8 rounded-full">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="stats" className="pt-4">
                            <Card className="bg-card/30 border-border/50 h-48 flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                    <TrendingUp className="h-8 w-8 mx-auto opacity-10 mb-2" />
                                    <p className="text-sm font-mono tracking-widest">TACTICAL TELEMETRY OFFLINE</p>
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
