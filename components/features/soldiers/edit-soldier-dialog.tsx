"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Soldier } from "@/types/app"

const soldierSchema = z.object({
    service_number: z.string().min(3, "Required"),
    full_name: z.string().min(3, "Required"),
    rank: z.string().min(1, "Required"),
    unit: z.string().min(1, "Required"),
    is_active: z.boolean(),
})

type SoldierFormValues = z.infer<typeof soldierSchema>

interface EditSoldierDialogProps {
    soldier: Soldier | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onRefresh: () => void
}

export function EditSoldierDialog({ soldier, open, onOpenChange, onRefresh }: EditSoldierDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const form = useForm<SoldierFormValues>({
        resolver: zodResolver(soldierSchema),
        defaultValues: {
            service_number: "",
            full_name: "",
            rank: "",
            unit: "",
            is_active: true,
        },
    })

    useEffect(() => {
        if (soldier) {
            form.reset({
                service_number: soldier.service_number,
                full_name: soldier.full_name,
                rank: soldier.rank,
                unit: soldier.unit,
                is_active: soldier.is_active,
            })
        }
    }, [soldier, form])

    async function onSubmit(values: SoldierFormValues) {
        if (!soldier) return
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from("soldiers")
                .update(values)
                .eq("id", soldier.id)

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success("Personnel updated successfully")
            onOpenChange(false)
            onRefresh()
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Edit Personnel Details</DialogTitle>
                    <DialogDescription>
                        Modify tactical details for {soldier?.full_name}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit_service_number">ID No.</Label>
                        <Input
                            id="edit_service_number"
                            {...form.register("service_number")}
                            className="bg-secondary/30"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_full_name">Full Name</Label>
                        <Input
                            id="edit_full_name"
                            {...form.register("full_name")}
                            className="bg-secondary/30"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_unit">Assigned Unit</Label>
                        <Input
                            id="edit_unit"
                            {...form.register("unit")}
                            className="bg-secondary/30"
                        />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="edit_active"
                            checked={form.watch("is_active")}
                            onCheckedChange={(checked) => form.setValue("is_active", !!checked)}
                        />
                        <Label htmlFor="edit_active" className="text-sm font-medium leading-none">
                            Mark as Active Personnel
                        </Label>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
