"use client"

import * as React from "react"
import { format } from "date-fns"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldAlert, User, Clock, Mail } from "lucide-react"
import { ManagedUser } from "@/lib/actions/users"
import { AppRole } from "@/types/app"
import { cn } from "@/lib/utils"

interface UserManagementTableProps {
    users: ManagedUser[]
}

export function UserManagementTable({ users }: UserManagementTableProps) {
    const getRoleBadge = (role: AppRole) => {
        switch (role) {
            case "admin":
                return (
                    <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 font-mono text-[10px] tracking-widest uppercase">
                        <ShieldAlert className="h-3 w-3" /> Admin
                    </Badge>
                )
            case "data_entry":
                return (
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5 font-mono text-[10px] tracking-widest uppercase">
                        <Shield className="h-3 w-3" /> Data Entry
                    </Badge>
                )
            default:
                return (
                    <Badge className="bg-muted text-muted-foreground border-border gap-1.5 font-mono text-[10px] tracking-widest uppercase">
                        <User className="h-3 w-3" /> Viewer
                    </Badge>
                )
        }
    }

    const getStatusBadge = (status: "active" | "invited") => {
        if (status === "active") {
            return (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase">
                    ACTIVE
                </Badge>
            )
        }
        return (
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase">
                INVITED
            </Badge>
        )
    }

    return (
        <div className="bg-card/20 border border-border/50 rounded-xl overflow-hidden shadow-2xl">
            <Table>
                <TableHeader className="bg-secondary/60">
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider py-4 font-bold">Personnel Details</TableHead>
                        <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Command Role</TableHead>
                        <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Clearance Status</TableHead>
                        <TableHead className="text-right text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Commissioned On</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <TableRow key={user.id} className="group hover:bg-secondary/30 border-border/50 transition-all">
                                <TableCell className="py-5">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">{user.full_name || "Unknown Identity"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            <span className="font-mono">{user.email || "no-email@navy.gov.bd"}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getRoleBadge(user.role)}
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(user.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            {format(new Date(user.created_at), "dd MMM yyyy")}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-mono uppercase">
                                            {format(new Date(user.created_at), "HH:mm")} HRS
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-64 text-center">
                                <p className="text-muted-foreground">No personnel records found.</p>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
