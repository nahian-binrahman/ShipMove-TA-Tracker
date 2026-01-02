"use client"

import { format } from "date-fns"
import { Circle, CheckCircle2, History, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuditEntry {
    id: string
    action: string
    new_status: string | null
    old_status: string | null
    created_at: string
    notes: string | null
    profile: {
        full_name: string | null
    } | null
}

interface AuditTimelineProps {
    audit: AuditEntry[]
}

export function AuditTimeline({ audit }: AuditTimelineProps) {
    if (!audit || audit.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <History className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No audit history available.</p>
            </div>
        )
    }

    return (
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border before:to-transparent">
            {audit.map((entry, index) => (
                <div key={entry.id} className="relative flex items-start gap-4">
                    <div className="absolute left-0 mt-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-background ring-4 ring-background">
                        {entry.action === 'created' ? (
                            <Circle className="h-4 w-4 text-primary fill-primary" />
                        ) : entry.new_status === 'approved' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                            <div className="h-3 w-3 rounded-full bg-border" />
                        )}
                    </div>
                    <div className="ml-12 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm capitalize">
                                {entry.action.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(entry.created_at), "MMM dd, HH:mm")}
                            </span>
                        </div>

                        {(entry.old_status || entry.new_status) && (
                            <div className="text-xs mb-2">
                                <span className="text-muted-foreground">Status: </span>
                                {entry.old_status && (
                                    <span className="line-through text-muted-foreground/50 mr-2">{entry.old_status}</span>
                                )}
                                <span className="font-medium text-primary uppercase">{entry.new_status}</span>
                            </div>
                        )}

                        {entry.notes && (
                            <p className="text-sm text-foreground/80 bg-secondary/20 p-2 rounded-md border border-border/50 mb-2">
                                {entry.notes}
                            </p>
                        )}

                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                            <User className="h-3 w-3" />
                            {entry.profile?.full_name || "System Automated"}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
