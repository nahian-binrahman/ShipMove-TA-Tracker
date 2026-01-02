"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import {
    Download,
    Search,
    Filter,
    ChevronRight,
    Calendar,
    MoreVertical,
    ArrowUpDown
} from "lucide-react"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MovementDetailsDrawer } from "./movement-details-drawer"
import { cn } from "@/lib/utils"

import { Skeleton } from "@/components/ui/skeleton"

interface MovementLogTableProps {
    data: any[]
    loading?: boolean
}

export function MovementLogTable({ data, loading }: MovementLogTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [dateFilter, setDateFilter] = useState<string>("all")
    const [selectedMovement, setSelectedMovement] = useState<any | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch =
                item.soldier?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.from_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.to_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.soldier?.service_number.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = statusFilter === "all" || item.status === statusFilter
            const matchesType = typeFilter === "all" || item.movement_type === typeFilter

            let matchesDate = true
            if (dateFilter !== "all") {
                const itemDate = new Date(item.start_time)
                const now = new Date()
                if (dateFilter === "today") {
                    matchesDate = itemDate.toDateString() === now.toDateString()
                } else if (dateFilter === "week") {
                    const weekAgo = new Date()
                    weekAgo.setDate(now.getDate() - 7)
                    matchesDate = itemDate >= weekAgo
                } else if (dateFilter === "month") {
                    matchesDate = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
                }
            }

            return matchesSearch && matchesStatus && matchesType && matchesDate
        })
    }, [data, searchTerm, statusFilter, typeFilter, dateFilter])

    const exportToCSV = () => {
        try {
            const headers = ["ID", "Personnel", "Start Time", "End Time", "From", "To", "Type", "Status", "Amount"]
            const rows = filteredData.map(m => [
                m.id,
                m.soldier?.full_name,
                m.start_time,
                m.end_time,
                m.from_location,
                m.to_location,
                m.movement_type,
                m.status,
                m.ta_amount
            ])

            const csvContent = [
                headers.join(","),
                ...rows.map(r => r.join(","))
            ].join("\n")

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `movements_export_${format(new Date(), "yyyy-MM-dd")}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success("Log exported to CSV")
        } catch (error) {
            toast.error("Failed to export log")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase">APPROVED</Badge>
            case 'rejected': return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase">REJECTED</Badge>
            case 'pending': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase">PENDING</Badge>
            default: return <Badge variant="secondary" className="px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between bg-card/40 border border-border p-4 rounded-xl backdrop-blur-sm shadow-inner">
                <div className="flex flex-1 flex-col md:flex-row gap-3 items-center w-full">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by name, route, or SN..."
                            className="pl-10 bg-secondary/50 border-border focus-visible:ring-1 focus-visible:ring-primary/50 transition-all placeholder:text-muted-foreground/60"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-36 bg-secondary/50 border-border h-9 text-xs">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-36 bg-secondary/50 border-border h-9 text-xs">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Internal">Internal</SelectItem>
                                <SelectItem value="External">External</SelectItem>
                                <SelectItem value="Training">Training</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-full md:w-36 bg-secondary/50 border-border h-9 text-xs">
                                <SelectValue placeholder="Date" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                <SelectItem value="all">Any Date</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">Past 7 Days</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 md:flex-none gap-2 bg-secondary/50 border-border hover:bg-secondary transition-colors h-9"
                        onClick={exportToCSV}
                        disabled={filteredData.length === 0}
                    >
                        <Download className="h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            <div className="bg-card/20 border border-border/50 rounded-xl overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-secondary/60">
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="w-[200px] text-primary font-mono text-[10px] uppercase tracking-wider py-4 font-bold">Personnel</TableHead>
                            <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Mission Route</TableHead>
                            <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Schedule</TableHead>
                            <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Type</TableHead>
                            <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Status</TableHead>
                            <TableHead className="text-right text-primary font-mono text-[10px] uppercase tracking-wider font-bold">TA Amount</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-border/50">
                                    <TableCell><Skeleton className="h-10 w-full bg-secondary/50" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-full bg-secondary/50" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-full bg-secondary/50" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-20 bg-secondary/50" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 bg-secondary/50" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-16 bg-secondary/50 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 bg-secondary/50" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredData.length > 0 ? (
                            filteredData.map((movement) => (
                                <TableRow
                                    key={movement.id}
                                    className="cursor-pointer hover:bg-secondary/30 group transition-all border-border/50 focus-within:bg-secondary/40 relative"
                                    onClick={() => {
                                        setSelectedMovement(movement)
                                        setIsDrawerOpen(true)
                                    }}
                                >
                                    <TableCell className="py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-foreground group-hover:text-primary transition-colors">{movement.soldier?.full_name}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{movement.soldier?.service_number} • {movement.soldier?.rank}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2.5 text-sm">
                                            <span className="text-muted-foreground">{movement.from_location}</span>
                                            <div className="flex items-center justify-center w-5 h-px bg-border mx-1" />
                                            <span className="font-semibold text-foreground">{movement.to_location}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                {format(new Date(movement.start_time), "dd MMM yy")}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground pl-5 font-mono">
                                                {format(new Date(movement.start_time), "HH:mm")} TO {format(new Date(movement.end_time), "HH:mm")}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-[11px] text-muted-foreground font-semibold bg-secondary/50 px-2 py-0.5 rounded border border-border/50">{movement.movement_type}</span>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(movement.status)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-primary text-base">
                                        ৳{movement.ta_amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-80 text-center bg-secondary/20">
                                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6 border border-border shadow-xl">
                                            <Filter className="h-8 w-8 text-muted-foreground/40" />
                                        </div>
                                        <h3 className="text-foreground font-bold text-lg mb-2">No Tactical Movements</h3>
                                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                            Adjust your filters or initiate a new movement recording to begin tracking personnel logistics.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <MovementDetailsDrawer
                movement={selectedMovement}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
            />
        </div>
    )
}
