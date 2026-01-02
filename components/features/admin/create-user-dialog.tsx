"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus, Copy, Check, ShieldAlert } from "lucide-react"
import { createManagedUser } from "@/lib/actions/users"
import { AppRole } from "@/types/app"

const formSchema = z.object({
    email: z.string().email("Invalid mission email address."),
    fullName: z.string().min(2, "Full legal name is required."),
    role: z.enum(["admin", "data_entry", "viewer"] as const),
    password: z.string().min(8, "Temporary password must be at least 8 characters.").optional().or(z.literal("")),
})

export function CreateUserDialog() {
    const [open, setOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [credentials, setCredentials] = React.useState<{ email: string; password: string } | null>(null)
    const [copied, setCopied] = React.useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            fullName: "",
            role: "viewer",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const result = await createManagedUser({
                email: values.email,
                fullName: values.fullName,
                role: values.role,
                password: values.password || undefined,
            })

            if (result.success) {
                toast.success("Tactical personnel created successfully.")
                setCredentials(result.credentials)
                form.reset()
            }
        } catch (error: any) {
            toast.error(error.message || "Authorization failure: User creation rejected.")
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!credentials) return
        const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.info("Credentials copied to clipboard.")
    }

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v)
            if (!v) setCredentials(null)
        }}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 font-bold gap-2">
                    <UserPlus className="h-4 w-4" /> Recruit Personnel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                        <UserPlus className="h-5 w-5" /> Commission New User
                    </DialogTitle>
                    <DialogDescription>
                        Authorize new personnel access to the tactical environment.
                    </DialogDescription>
                </DialogHeader>

                {!credentials ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Full Legal Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Lt. Commander Smith" className="bg-secondary/50 border-border" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Operational Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="personnel@navy.gov.bd" className="bg-secondary/50 border-border" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Command Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-secondary/50 border-border">
                                                    <SelectValue placeholder="Select authorization level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-popover border-border">
                                                <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                                                <SelectItem value="data_entry">Data Entry (Operational)</SelectItem>
                                                <SelectItem value="admin">Administrator (Command Authority)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Temp Password (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Leave blank to auto-generate" className="bg-secondary/50 border-border" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-[10px]">
                                            Minimum 8 characters. Defaults to secure generation.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isLoading}>
                                    Abort
                                </Button>
                                <Button type="submit" className="font-bold min-w-[120px]" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authorizing...
                                        </>
                                    ) : (
                                        "Confirm Access"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                ) : (
                    <div className="space-y-6 pt-4 animate-in fade-in zoom-in duration-300">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex gap-3 items-start">
                            <ShieldAlert className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                            <div className="text-sm">
                                <p className="font-bold text-emerald-500">Authorization Granted</p>
                                <p className="text-muted-foreground text-xs">Credentials generated successfully. Share these with the personnel immediately.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-secondary/50 rounded-lg border border-border space-y-3 font-mono text-sm relative">
                                <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
                                    <span>Tactical Credentials</span>
                                    <span className="text-emerald-500">Verified</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Email:</p>
                                    <p className="text-foreground font-bold">{credentials.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Temporary Password:</p>
                                    <p className="text-foreground font-bold break-all">{credentials.password}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8 text-primary hover:text-primary-foreground hover:bg-primary"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>

                            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-[10px] text-amber-500/80 font-medium text-center uppercase tracking-wider italic">
                                ⚠️ Save this password now. It won't be shown again for security protocols.
                            </div>
                        </div>

                        <Button className="w-full font-bold" onClick={() => setOpen(false)}>
                            Complete Onboarding
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
