"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
    MapPin,
    Calendar,
    Clock,
    Truck,
    FileText,
    MoreHorizontal,
    ExternalLink,
    Shield,
    Activity
} from "lucide-react"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AuditTimeline } from "./audit-timeline"
import { fetchMovementAudit } from "@/lib/actions/movements"
import { Movement } from "@/types/app"

interface MovementDetailsDrawerProps {
    movement: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function MovementDetailsDrawer({ movement, open, onOpenChange }: MovementDetailsDrawerProps) {
    const [audit, setAudit] = useState<any[]>([])
    const [loadingAudit, setLoadingAudit] = useState(false)

    useEffect(() => {
        if (movement?.id && open) {
            setLoadingAudit(true)
            fetchMovementAudit(movement.id).then(data => {
                setAudit(data)
                setLoadingAudit(false)
            })
        }
    }, [movement?.id, open])

    if (!movement) return null

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20'
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            default: return 'bg-secondary text-secondary-foreground'
        }
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[90vh]">
                <div className="mx-auto w-full max-w-2xl overflow-y-auto px-6 pb-8 pt-4">
                    <DrawerHeader className="px-0">
                        <div className="flex items-center justify-between">
                            <Badge className={getStatusColor(movement.status)} variant="outline">
                                {movement.status.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                                ID: {movement.id.split('-')[0].toUpperCase()}
                            </span>
                        </div>
                        <DrawerTitle className="text-2xl font-bold mt-2">
                            {movement.soldier?.full_name}
                        </DrawerTitle>
                        <DrawerDescription className="flex items-center gap-2">
                            {movement.soldier?.rank} • {movement.soldier?.service_number}
                        </DrawerDescription>
                    </DrawerHeader>

                    <Tabs defaultValue="details" className="mt-4">
                        <TabsList className="grid w-full grid-cols-2 bg-secondary/30">
                            <TabsTrigger value="details">Mission Details</TabsTrigger>
                            <TabsTrigger value="history">Audit History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-6 pt-4">
                            {/* Route Section */}
                            <div className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">From Position</p>
                                        <p className="text-lg font-semibold flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary" /> {movement.from_location}
                                        </p>
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent mx-4" />
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">To Position</p>
                                        <p className="text-lg font-semibold flex items-center gap-2 justify-end">
                                            {movement.to_location} <MapPin className="h-4 w-4 text-primary" />
                                        </p>
                                    </div>
                                </div>

                                <Separator className="bg-border/50" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Departure</p>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            {format(new Date(movement.start_time), "MMM dd, yyyy")}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-2 pl-5">
                                            <Clock className="h-3 w-3" /> {format(new Date(movement.start_time), "HH:mm")}
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Arrival (Est)</p>
                                        <p className="text-sm font-medium flex items-center gap-2 justify-end">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            {format(new Date(movement.end_time), "MMM dd, yyyy")}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-2 justify-end pr-5">
                                            <Clock className="h-3 w-3" /> {format(new Date(movement.end_time), "HH:mm")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-secondary/20 p-4 rounded-lg border border-border/50">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Type</p>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary/70" /> {movement.movement_type}
                                    </p>
                                </div>
                                <div className="bg-secondary/20 p-4 rounded-lg border border-border/50">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Transport</p>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-primary/70" /> {movement.transport_mode}
                                    </p>
                                </div>
                                <div className="bg-secondary/20 p-4 rounded-lg border border-border/50">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Allowance</p>
                                    <p className="text-sm font-bold text-primary flex items-center gap-1">
                                        ৳{movement.ta_amount}
                                    </p>
                                </div>
                            </div>

                            {/* Notes */}
                            {movement.notes && (
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Operational Intel</p>
                                    <p className="text-sm text-foreground/80 leading-relaxed italic bg-card p-4 rounded-lg border border-border/50">
                                        "{movement.notes}"
                                    </p>
                                </div>
                            )}

                            {/* Attachment */}
                            {movement.attachment_url && (
                                <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Authorization Document</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">Form TA-22 / Signed Order</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
                                        <a href={movement.attachment_url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-3.5 w-3.5" /> View
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="history" className="pt-6">
                            {loadingAudit ? (
                                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                                    <Activity className="h-8 w-8 text-primary animate-pulse" />
                                    <p className="text-sm text-muted-foreground">Retrieving tactical timeline...</p>
                                </div>
                            ) : (
                                <AuditTimeline audit={audit} />
                            )}
                        </TabsContent>
                    </Tabs>

                    <DrawerFooter className="px-0 mt-8 gap-3">
                        <Button className="w-full h-11">Approve Movement</Button>
                        <DrawerClose asChild>
                            <Button variant="outline" className="w-full h-11">Dismiss</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
