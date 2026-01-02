"use client"

import * as React from "react"
import { Anchor, LogOut, User, ShieldCheck } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Profile } from "@/types/app"
import { cn } from "@/lib/utils"

interface CommandAuthorityProps {
    profile: Profile | null
}

export function CommandAuthority({ profile }: CommandAuthorityProps) {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    if (!profile) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-4 px-4 py-2 rounded-lg transition-all",
                        "bg-card hover:bg-secondary border border-border/50",
                        "group focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                    aria-label="User authority panel"
                >
                    {/* Naval Authority Icon */}
                    <div className="bg-primary/10 p-2 rounded-md border border-primary/20 group-hover:bg-primary/20 transition-colors">
                        <Anchor className="h-5 w-5 text-primary" />
                    </div>

                    {/* Identity Details */}
                    <div className="text-left hidden sm:block">
                        <p className="text-sm font-semibold text-foreground leading-tight">
                            {profile.rank ? `${profile.rank} ` : ""}{profile.full_name}
                        </p>
                        <p className="text-[11px] font-medium text-primary/80 uppercase tracking-wider mt-0.5">
                            {profile.organization || "Bangladesh Navy"}
                        </p>
                    </div>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 bg-popover border-border text-foreground">
                <DropdownMenuLabel className="text-muted-foreground font-mono text-[10px] uppercase tracking-tighter">
                    Tactical Command Authority
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem
                    className="cursor-pointer focus:bg-secondary focus:text-foreground"
                    onSelect={() => router.push("/profile")}
                >
                    <User className="mr-2 h-4 w-4 text-primary" />
                    <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    disabled
                    className="cursor-default opacity-80"
                >
                    <ShieldCheck className="mr-2 h-4 w-4 text-amber-500/70" />
                    <span>System Role: <span className="capitalize">{profile.role}</span></span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
