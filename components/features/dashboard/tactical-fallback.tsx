import { Ship } from "lucide-react"

export function TacticalFallback() {
    return (
        <div className="w-full h-full min-h-[400px] relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-slate-900 flex items-center justify-center border border-border/50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(45,212,191,0.05),transparent)] pointer-events-none" />

            <div className="text-center relative">
                <div className="mx-auto w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 mb-6">
                    <Ship className="h-10 w-10 text-primary/30 animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold text-slate-300">Tactical Visualization Offline</h3>
                    <p className="text-xs text-muted-foreground max-w-[200px] mx-auto uppercase tracking-tighter">
                        System initializing or high load protection active.
                    </p>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50 animate-ping" />
                <span className="text-[10px] text-emerald-500/60 font-mono">SCN_READY</span>
            </div>
        </div>
    )
}
