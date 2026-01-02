"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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

const soldierSchema = z.object({
    service_number: z.string().min(3, "Required"),
    full_name: z.string().min(3, "Required"),
    rank: z.string().min(1, "Required"),
    unit: z.string().min(1, "Required"),
})

type SoldierFormValues = z.infer<typeof soldierSchema>

export function AddSoldierDialog({ onRefresh }: { onRefresh: () => void }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const form = useForm<SoldierFormValues>({
        resolver: zodResolver(soldierSchema),
        defaultValues: {
            service_number: "",
            full_name: "",
            rank: "",
            unit: "",
        },
    })

    async function onSubmit(values: SoldierFormValues) {
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from("soldiers")
                .insert([values])

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success("Personnel recorded successfully")
            setOpen(false)
            form.reset()
            onRefresh()
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Personnel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Register New Personnel</DialogTitle>
                    <DialogDescription>
                        Enter duty details for recording in the tactical registry.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="service_number">Service No.</Label>
                            <Input
                                id="service_number"
                                placeholder="S1234567"
                                {...form.register("service_number")}
                                className="bg-secondary/30"
                            />
                            {form.formState.errors.service_number && (
                                <p className="text-[10px] text-destructive">{form.formState.errors.service_number.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rank">Rank</Label>
                            <Select onValueChange={(v) => form.setValue("rank", v)}>
                                <SelectTrigger className="bg-secondary/30">
                                    <SelectValue placeholder="Select Rank" />
                                </SelectTrigger>
                                <SelectContent className="bg-card">
                                    <SelectItem value="PTE">Private</SelectItem>
                                    <SelectItem value="CPL">Corporal</SelectItem>
                                    <SelectItem value="SGT">Sergeant</SelectItem>
                                    <SelectItem value="LT">Lieutenant</SelectItem>
                                    <SelectItem value="CPT">Captain</SelectItem>
                                    <SelectItem value="MAJ">Major</SelectItem>
                                    <SelectItem value="LTC">Lt. Colonel</SelectItem>
                                    <SelectItem value="COL">Colonel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            placeholder="Full Tactical Name"
                            {...form.register("full_name")}
                            className="bg-secondary/30"
                        />
                        {form.formState.errors.full_name && (
                            <p className="text-[10px] text-destructive">{form.formState.errors.full_name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unit">Assigned Unit</Label>
                        <Input
                            id="unit"
                            placeholder="Tactical Unit / Command"
                            {...form.register("unit")}
                            className="bg-secondary/30"
                        />
                        {form.formState.errors.unit && (
                            <p className="text-[10px] text-destructive">{form.formState.errors.unit.message}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Recording...
                                </>
                            ) : (
                                "Commit to Registry"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
