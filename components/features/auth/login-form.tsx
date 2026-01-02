"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Ship, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const authSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type AuthFormValues = z.infer<typeof authSchema>

export function LoginForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const supabase = createClient()

    const form = useForm<AuthFormValues>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: AuthFormValues) {
        setIsLoading(true)
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email: values.email,
                    password: values.password,
                    options: {
                        data: {
                            full_name: "New Tactical User", // This triggers our DB Sync function
                        }
                    }
                })
                if (error) {
                    toast.error(error.message)
                    return
                }
                toast.success("Account created! You can now log in.")
                setIsSignUp(false)
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: values.email,
                    password: values.password,
                })

                if (error) {
                    toast.error("Access Denied: Invalid credentials")
                    return
                }

                toast.success("Successfully logged in")
                router.push("/")
                router.refresh()
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-primary p-2 rounded-xl text-primary-foreground transform transition-transform hover:scale-110">
                        <Ship className="h-8 w-8" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                    {isSignUp ? "Register Personnel" : "Navy Ops Login"}
                </CardTitle>
                <CardDescription>
                    {isSignUp
                        ? "Create your tactical credentials for access"
                        : "Enter your credentials to access the TA Tracker"}
                </CardDescription>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Service Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@branch.gov"
                            disabled={isLoading}
                            {...form.register("email")}
                            className="bg-secondary/30 border-border/50 focus-visible:ring-primary"
                        />
                        {form.formState.errors.email && (
                            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Security Token / Password</Label>
                        <Input
                            id="password"
                            type="password"
                            disabled={isLoading}
                            {...form.register("password")}
                            className="bg-secondary/30 border-border/50 focus-visible:ring-primary"
                        />
                        {form.formState.errors.password && (
                            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        className="w-full font-bold uppercase tracking-wider"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            isSignUp ? "Create Account" : "Board Vessel"
                        )}
                    </Button>
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                    >
                        {isSignUp ? "Already registered? Login" : "Need access? Register here"}
                    </button>
                </CardFooter>
            </form>
        </Card>
    )
}
