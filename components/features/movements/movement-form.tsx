"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import {
    Calendar as CalendarIcon,
    Check,
    ChevronsUpDown,
    Loader2,
    AlertCircle,
    Upload,
    FileText,
    Shield,
    Clock
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { movementSchema, type MovementFormValues } from "@/schemas/movement"
import { generateMovementFingerprint } from "@/lib/fingerprint"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Soldier } from "@/types/app"

export function MovementForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [soldiers, setSoldiers] = useState<Soldier[]>([])
    const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
    const [existingRecord, setExistingRecord] = useState<any>(null)
    const [file, setFile] = useState<File | null>(null)

    const supabase = createClient()

    const form = useForm<MovementFormValues>({
        resolver: zodResolver(movementSchema) as any,
        defaultValues: {
            soldier_id: "",
            from_location: "",
            to_location: "",
            ta_amount: 0,
            notes: "",
        },
    })

    // Fetch soldiers for the picker
    useEffect(() => {
        async function fetchSoldiers() {
            const { data } = await supabase
                .from("soldiers")
                .select("*")
                .eq("is_active", true)
                .order("full_name")
            if (data) setSoldiers(data)
        }
        fetchSoldiers()
    }, [supabase])

    const watchedFields = form.watch(["soldier_id", "start_time", "from_location", "to_location"])

    useEffect(() => {
        const soldierId = watchedFields[0]
        const startTime = watchedFields[1]
        const from = watchedFields[2]
        const to = watchedFields[3]

        if (soldierId && startTime && from && to) {
            const timer = setTimeout(async () => {
                const { checkMovementDuplicate } = await import("@/lib/actions/movements")
                const existing = await checkMovementDuplicate(soldierId, startTime, from, to)
                if (existing) {
                    setExistingRecord(existing)
                    setDuplicateDialogOpen(true)
                }
            }, 500) // Debounce pre-check
            return () => clearTimeout(timer)
        }
    }, [watchedFields])

    async function uploadAttachment(movementId: string) {
        if (!file) return null

        const fileExt = file.name.split('.').pop()
        const fileName = `${movementId}/${Math.random()}.${fileExt}`

        const { data, error } = await supabase.storage
            .from('movement-attachments')
            .upload(fileName, file)

        if (error) {
            console.error('Error uploading file:', error)
            return null
        }

        const { data: { publicUrl } } = supabase.storage
            .from('movement-attachments')
            .getPublicUrl(data.path)

        return publicUrl
    }

    async function onSubmit(values: MovementFormValues) {
        setLoading(true)

        const fingerprint = generateMovementFingerprint(
            values.soldier_id,
            values.start_time,
            values.from_location,
            values.to_location
        )

        try {
            const result = await import("@/lib/actions/movements").then(m =>
                m.createMovementAction({
                    soldier_id: values.soldier_id,
                    start_time: values.start_time.toISOString(),
                    end_time: values.end_time.toISOString(),
                    from_location: values.from_location,
                    to_location: values.to_location,
                    movement_type: values.movement_type,
                    transport_mode: values.transport_mode,
                    ta_amount: values.ta_amount,
                    notes: values.notes,
                    status: 'pending'
                }, fingerprint)
            )

            if (!result.success) {
                if (result.existingId) {
                    // Final race condition catch
                    const existing = await import("@/lib/actions/movements").then(m =>
                        m.checkMovementDuplicate(values.soldier_id, values.start_time, values.from_location, values.to_location)
                    )
                    setExistingRecord(existing)
                    setDuplicateDialogOpen(true)
                    return
                }
                throw new Error(result.error)
            }

            // Upload file if exists
            if (file && result.data) {
                const url = await uploadAttachment(result.data.id)
                if (url) {
                    await supabase
                        .from("movements")
                        .update({ attachment_url: url })
                        .eq("id", result.data.id)
                }
            }

            toast.success("Tactical movement recorded")
            router.push("/movements")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "An error occurred during submission")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 max-w-4xl bg-card/40 p-8 rounded-2xl border border-border shadow-2xl backdrop-blur-sm">
                    <div className="space-y-4">
                        <h2 className="text-xl font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Shield className="h-5 w-5" /> Mission Authorization
                        </h2>
                        <div className="h-px w-full bg-gradient-to-r from-primary/50 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Personnel Picker */}
                        <FormField
                            control={form.control}
                            name="soldier_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">Tactical Personnel *</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between bg-card/50 border-border h-11 hover:bg-secondary transition-all",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? soldiers.find((s) => s.id === field.value)?.full_name
                                                        : "Select personnel..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border">
                                            <Command className="bg-popover">
                                                <CommandInput placeholder="Search personnel by name or SN..." className="h-10 border-none focus:ring-0" />
                                                <CommandList>
                                                    <CommandEmpty className="py-4 text-center text-muted-foreground text-sm">No tactical record found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {soldiers.map((soldier) => (
                                                            <CommandItem
                                                                value={soldier.full_name}
                                                                key={soldier.id}
                                                                className="cursor-pointer hover:bg-secondary focus:bg-secondary transition-colors py-3"
                                                                onSelect={() => {
                                                                    form.setValue("soldier_id", soldier.id)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        soldier.id === field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-foreground">{soldier.full_name}</span>
                                                                    <span className="text-[10px] text-muted-foreground font-mono italic">{soldier.service_number} • {soldier.rank}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className="text-red-400 font-mono text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <div className="hidden md:block" />

                        <FormField
                            control={form.control}
                            name="start_time"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">Mission Commencement *</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal bg-card/50 border-border h-11 hover:bg-secondary transition-all",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP HH:mm")
                                                    ) : (
                                                        <span>Pick departure date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-primary" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                                className="bg-popover text-foreground"
                                            />
                                            <div className="p-4 border-t border-border bg-secondary/50">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                    <Input
                                                        type="time"
                                                        className="bg-card border-border h-9 font-mono text-center"
                                                        onChange={(e) => {
                                                            const [hours, minutes] = e.target.value.split(':')
                                                            const date = field.value || new Date()
                                                            date.setHours(parseInt(hours), parseInt(minutes))
                                                            field.onChange(new Date(date))
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className="text-red-400 font-mono text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="end_time"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">Anticipated Return *</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal bg-card/50 border-border h-11 hover:bg-secondary transition-all",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP HH:mm")
                                                    ) : (
                                                        <span>Pick arrival date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-primary" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                                className="bg-popover text-foreground"
                                            />
                                            <div className="p-4 border-t border-border bg-secondary/50">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                    <Input
                                                        type="time"
                                                        className="bg-card border-border h-9 font-mono text-center"
                                                        onChange={(e) => {
                                                            const [hours, minutes] = e.target.value.split(':')
                                                            const date = field.value || new Date()
                                                            date.setHours(parseInt(hours), parseInt(minutes))
                                                            field.onChange(new Date(date))
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className="text-red-400 font-mono text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="from_location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">Origin Point *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. PORT-A-BASE" className="bg-card/50 border-border h-11 uppercase font-mono tracking-wider " {...field} />
                                    </FormControl>
                                    <FormMessage className="text-red-400 font-mono text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="to_location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">Destination *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. SECTOR-7-B" className="bg-card/50 border-border h-11 uppercase font-mono tracking-wider " {...field} />
                                    </FormControl>
                                    <FormMessage className="text-red-400 font-mono text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="movement_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">Operation Type *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-card/50 border-border h-11 text-foreground">
                                                <SelectValue placeholder="Select context" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-popover border-border">
                                            <SelectItem value="Internal">Internal (Base-to-Base)</SelectItem>
                                            <SelectItem value="External">External (Active Deployment)</SelectItem>
                                            <SelectItem value="Training">Tactical Training</SelectItem>
                                            <SelectItem value="Recon">Reconnaissance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-red-400 font-mono text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="transport_mode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">Logistics Mode *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-card/50 border-border h-11 text-foreground">
                                                <SelectValue placeholder="Select mode" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-popover border-border">
                                            <SelectItem value="Sea">Sea Vessel</SelectItem>
                                            <SelectItem value="Air">Tactical Air</SelectItem>
                                            <SelectItem value="Land">Ground Transport</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-red-400 font-mono text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="ta_amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">Budgetary Allowance (TA)</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold transition-all group-focus-within:scale-110">৳</span>
                                            <Input type="number" step="0.01" className="bg-card/50 border-border h-11 pl-8 font-mono font-bold text-primary text-lg" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-[10px] text-muted-foreground italic">Adjusted Travel Allowance for logistics period.</FormDescription>
                                    <FormMessage className="text-red-400 font-mono text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <FormLabel className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">Mission Documentation</FormLabel>
                            <div className="flex items-center gap-6 p-6 border border-border border-dashed rounded-xl bg-secondary/30 group hover:border-primary/50 transition-all">
                                <div className="p-3 bg-secondary rounded-lg group-hover:scale-110 transition-transform">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-sm font-bold text-foreground">{file ? file.name : "Authorize via Official PDF"}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">Required for audit clearance</span>
                                </div>
                                <Input
                                    type="file"
                                    className="hidden"
                                    id="attachment"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('attachment')?.click()}
                                    className="bg-secondary border-border hover:bg-secondary/80"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {file ? "Change File" : "Choose File"}
                                </Button>
                                {file && (
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)} className="text-red-500 hover:bg-red-500/10">
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">Operational Notes</FormLabel>
                                    <FormControl>
                                        <textarea
                                            className="flex min-h-[120px] w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-sm transition-all focus-within:ring-1 focus-within:ring-primary/50 placeholder:text-muted-foreground outline-none"
                                            placeholder="Provide additional deployment context or special instructions..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400 font-mono text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="pt-6">
                        <Button type="submit" className="w-full md:w-auto px-16 h-12 text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    Encrypting & Submitting...
                                </>
                            ) : (
                                "Authorize Movement"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>

            {/* Duplicate Alert Dialog */}
            <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
                <AlertDialogContent className="bg-card border-destructive/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Duplicate Detection Warning
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                            <p>A movement record already exists for this personnel on the same date with the same route.</p>

                            {existingRecord && (
                                <div className="bg-secondary/30 p-4 rounded-md border border-border text-foreground space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground uppercase tracking-widest">Personnel</span>
                                        <span className="font-bold">{existingRecord.soldier?.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground uppercase tracking-widest">Date</span>
                                        <span className="font-bold">
                                            {format(new Date(existingRecord.start_time), "MMM dd, yyyy")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground uppercase tracking-widest">Route</span>
                                        <span className="font-bold">{existingRecord.from_location} → {existingRecord.to_location}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground uppercase tracking-widest">Status</span>
                                        <Badge variant="outline" className="text-[10px] h-4 uppercase">{existingRecord.status}</Badge>
                                    </div>
                                </div>
                            )}

                            <p className="text-sm">Duplicate entries are blocked to ensure TA audit integrity.</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setDuplicateDialogOpen(false)
                            setExistingRecord(null)
                        }}>
                            Discard Entry
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-primary text-primary-foreground"
                            onClick={() => {
                                if (existingRecord) {
                                    router.push(`/movements/${existingRecord.id}`)
                                }
                            }}
                        >
                            Open record
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
