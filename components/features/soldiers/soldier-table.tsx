"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    MoreHorizontal,
    Search,
    User,
    Mail,
    Shield,
    FilterX,
    ChevronRight,
    Filter
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Soldier } from "@/types/app"
import { useRole } from "@/hooks/use-role"
import { EditSoldierDialog } from "./edit-soldier-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface SoldierTableProps {
    data: Soldier[]
    loading: boolean
    onRefresh: () => void
}

export function SoldierTable({ data, loading, onRefresh }: SoldierTableProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [rankFilter, setRankFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [editingSoldier, setEditingSoldier] = useState<Soldier | null>(null)
    const { isAdmin } = useRole()

    const filteredData = data.filter((soldier) => {
        const matchesSearch =
            soldier.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            soldier.service_number.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRank = rankFilter === "all" || soldier.rank === rankFilter
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && soldier.is_active) ||
            (statusFilter === "inactive" && !soldier.is_active)

        return matchesSearch && matchesRank && matchesStatus
    })

    const resetFilters = () => {
        setSearchTerm("")
        setRankFilter("all")
        setStatusFilter("all")
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 border border-border p-4 rounded-xl backdrop-blur-sm shadow-inner">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1 max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by SN or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-card/50 border-border h-9 text-sm focus-visible:ring-primary/50"
                        />
                    </div>

                    <Select value={rankFilter} onValueChange={setRankFilter}>
                        <SelectTrigger className="w-[140px] bg-card/50 border-border h-9 text-xs">
                            <SelectValue placeholder="All Ranks" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            <SelectItem value="all">All Ranks</SelectItem>
                            <SelectItem value="PTE">Private</SelectItem>
                            <SelectItem value="CPL">Corporal</SelectItem>
                            <SelectItem value="SGT">Sergeant</SelectItem>
                            <SelectItem value="LT">Lieutenant</SelectItem>
                            <SelectItem value="CPT">Captain</SelectItem>
                            <SelectItem value="MAJ">Major</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px] bg-card/50 border-border h-9 text-xs">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {(searchTerm || rankFilter !== "all" || statusFilter !== "all") && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground hover:text-foreground">
                        <FilterX className="mr-2 h-4 w-4" /> Reset
                    </Button>
                )}
            </div>

            <div className="bg-secondary/20 border border-border/50 rounded-xl overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-secondary/60">
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="w-[140px] text-primary font-mono text-[10px] uppercase tracking-wider py-4 font-bold">Service No.</TableHead>
                            <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Full Name</TableHead>
                            <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Rank</TableHead>
                            <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Primary Unit</TableHead>
                            <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Ops Status</TableHead>
                            <TableHead className="text-right text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <TableRow key={i} className="border-border/50">
                                    <TableCell><Skeleton className="h-6 w-20 bg-muted" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-48 bg-muted" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 bg-muted" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 bg-muted" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 bg-muted" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded bg-muted" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-80 text-center bg-secondary/20">
                                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6 border border-border shadow-xl">
                                            <Filter className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                        <h3 className="text-foreground font-bold text-lg mb-2">No Personnel Records</h3>
                                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                            No personnel found matching your tactical query. Expand your search parameters or add new personnel.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((soldier) => (
                                <TableRow key={soldier.id} className="group transition-all hover:bg-secondary/30 border-border/50">
                                    <TableCell className="font-mono text-xs font-bold text-primary py-5">
                                        {soldier.service_number}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-bold text-foreground italic transition-colors">
                                            {soldier.full_name}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => router.push(`/soldiers/${soldier.id}`)}
                                            >
                                                <ChevronRight className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-[10px] border-border bg-secondary/30 text-muted-foreground uppercase tracking-tighter">
                                            {soldier.rank}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm font-medium">{soldier.unit}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={soldier.is_active ? "default" : "secondary"}
                                            className={cn(
                                                "px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
                                                soldier.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500/20" : "bg-muted text-muted-foreground border-border"
                                            )}
                                        >
                                            {soldier.is_active ? "READY" : "OFF-DUTY"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-md hover:bg-secondary hover:text-foreground transition-colors">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52 bg-popover border-border shadow-2xl text-foreground">
                                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Operations</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    className="cursor-pointer focus:bg-secondary focus:text-foreground"
                                                    onClick={() => router.push(`/soldiers/${soldier.id}`)}
                                                >
                                                    <User className="mr-2 h-4 w-4 text-primary" /> Personnel File
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer focus:bg-secondary focus:text-foreground">
                                                    <Mail className="mr-2 h-4 w-4 text-emerald-500" /> Operational Message
                                                </DropdownMenuItem>
                                                {isAdmin && (
                                                    <>
                                                        <DropdownMenuSeparator className="bg-border" />
                                                        <DropdownMenuItem
                                                            className="cursor-pointer text-amber-500 focus:text-amber-400 focus:bg-amber-500/10"
                                                            onClick={() => setEditingSoldier(soldier)}
                                                        >
                                                            <Shield className="mr-2 h-4 w-4" /> Modify Authority
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <EditSoldierDialog
                soldier={editingSoldier}
                open={!!editingSoldier}
                onOpenChange={(open) => !open && setEditingSoldier(null)}
                onRefresh={onRefresh}
            />
        </div>
    )
}
