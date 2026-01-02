"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
    CheckCircle2,
    XCircle,
    Eye,
    Clock,
    MapPin,
    AlertCircle,
    Loader2
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MovementDetailsDrawer } from "./movement-details-drawer"
import { updateMovementStatus } from "@/lib/actions/movements"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ReviewQueueProps {
    initialData: any[]
}

export function ReviewQueue({ initialData }: ReviewQueueProps) {
    const router = useRouter()
    const [data, setData] = useState(initialData)
    const [selectedMovement, setSelectedMovement] = useState<any | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [rejectionNotes, setRejectionNotes] = useState("")
    const [processingId, setProcessingId] = useState<string | null>(null)

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
        setProcessingId(id)
        try {
            const result = await updateMovementStatus(id, status, notes)
            if (result.success) {
                toast.success(`Movement ${status === 'approved' ? 'authorized' : 'rejected'}`)
                setData(prev => prev.filter(m => m.id !== id))
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update status")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setProcessingId(null)
            setIsRejectDialogOpen(false)
            setRejectionNotes("")
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-card/20 border border-border/50 rounded-xl overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-secondary/60">
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider py-4 font-bold">Personnel</TableHead>
                            <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Mission Route</TableHead>
                            <TableHead className="text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Schedule & Type</TableHead>
                            <TableHead className="text-right text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Allowance</TableHead>
                            <TableHead className="text-right text-primary font-mono text-[10px] uppercase tracking-wider font-bold">Review Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((movement) => (
                                <TableRow key={movement.id} className="group hover:bg-secondary/30 border-border/50 transition-all">
                                    <TableCell className="py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-foreground">{movement.soldier?.full_name}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{movement.soldier?.rank} • {movement.soldier?.service_number}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2.5 text-sm">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-muted-foreground">{movement.from_location}</span>
                                            <div className="flex items-center justify-center w-5 h-px bg-border mx-1" />
                                            <span className="font-semibold text-foreground">{movement.to_location}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                {format(new Date(movement.start_time), "dd MMM, HH:mm")}
                                            </div>
                                            <Badge variant="outline" className="w-fit border-border bg-secondary/30 text-[9px] h-4 px-1.5 text-muted-foreground uppercase tracking-widest font-mono">
                                                {movement.movement_type}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-primary text-base">
                                        ৳{movement.ta_amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-3 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all focus-visible:ring-emerald-500/50"
                                                disabled={!!processingId}
                                                onClick={() => handleStatusUpdate(movement.id, 'approved')}
                                            >
                                                {processingId === movement.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                )}
                                                Approve
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-3 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all focus-visible:ring-red-500/50"
                                                disabled={!!processingId}
                                                onClick={() => {
                                                    setSelectedMovement(movement)
                                                    setIsRejectDialogOpen(true)
                                                }}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject/Hold
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                                onClick={() => {
                                                    setSelectedMovement(movement)
                                                    setIsDrawerOpen(true)
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-80 text-center bg-secondary/20">
                                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6 border border-border shadow-xl">
                                            <CheckCircle2 className="h-10 w-10 text-emerald-500/30" />
                                        </div>
                                        <h3 className="text-foreground font-bold text-xl mb-2">Queue All Clear</h3>
                                        <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                                            No tactical movements are currently awaiting command authorization. Status: Active Operations Ready.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Rejection Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" /> Deny Movement Authorization
                        </DialogTitle>
                        <DialogDescription>
                            Provide a clear operational reason for rejecting this movement for <strong>{selectedMovement?.soldier?.full_name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="e.g., Incomplete mission documentation / Route safety concerns..."
                            className="min-h-[120px] bg-secondary/20"
                            value={rejectionNotes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionNotes(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleStatusUpdate(selectedMovement?.id, 'rejected', rejectionNotes)}
                            disabled={!rejectionNotes.trim() || !!processingId}
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <MovementDetailsDrawer
                movement={selectedMovement}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
            />
        </div>
    )
}
