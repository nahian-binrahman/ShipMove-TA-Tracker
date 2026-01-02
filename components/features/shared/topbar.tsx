import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandMenu } from "./command-menu";
import { CommandAuthority } from "./command-authority";
import { ModeToggle } from "./mode-toggle";
import { Profile } from "@/types/app";

interface TopbarProps {
    profile: Profile | null
}

export function Topbar({ profile }: TopbarProps) {
    return (
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex flex-1 items-center max-w-md">
                <CommandMenu />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <ModeToggle />

                <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                </Button>

                <div className="h-8 w-px bg-border hidden md:block" />

                <CommandAuthority profile={profile} />
            </div>
        </header>
    );
}
