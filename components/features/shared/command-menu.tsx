"use client"

import * as React from "react"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Search,
    Users,
    Map,
    Plus,
    ShieldAlert,
    LayoutDashboard
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { globalSearch } from "@/lib/actions/search"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<{ soldiers: any[], movements: any[] }>({ soldiers: [], movements: [] })
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    React.useEffect(() => {
        if (query.length > 1) {
            globalSearch(query).then(setResults)
        } else {
            setResults({ soldiers: [], movements: [] })
        }
    }, [query])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-secondary/20 px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-secondary/30 md:w-64"
            >
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>Search tactical ops...</span>
                </div>
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Type a command or search..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    {results.soldiers.length > 0 && (
                        <CommandGroup heading="Personnel">
                            {results.soldiers.map((s) => (
                                <CommandItem
                                    key={s.id}
                                    value={s.full_name}
                                    onSelect={() => runCommand(() => router.push(`/soldiers/${s.id}`))}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>{s.full_name}</span>
                                    <span className="ml-2 text-[10px] text-muted-foreground uppercase">{s.service_number}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results.movements.length > 0 && (
                        <CommandGroup heading="Movements">
                            {results.movements.map((m) => (
                                <CommandItem
                                    key={m.id}
                                    value={`${m.from_location} ${m.to_location}`}
                                    onSelect={() => runCommand(() => router.push(`/movements`))}
                                >
                                    <Map className="mr-2 h-4 w-4" />
                                    <span>{m.from_location} → {m.to_location}</span>
                                    <span className="ml-2 text-[10px] text-muted-foreground capitalize">({m.soldier?.full_name})</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <CommandGroup heading="Navigation">
                        <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/soldiers"))}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Personnel Log</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/movements"))}>
                            <Map className="mr-2 h-4 w-4" />
                            <span>Movement Log</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/review"))}>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            <span>Authorization Queue</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Actions">
                        <CommandItem onSelect={() => runCommand(() => router.push("/movements/new"))}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Create New Movement</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
