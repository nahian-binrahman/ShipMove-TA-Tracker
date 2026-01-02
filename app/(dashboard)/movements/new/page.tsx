import { ArrowLeft, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { MovementForm } from "@/components/features/movements/movement-form";
import { WriteAccess } from "@/lib/auth/role-guards";

export default function NewMovementPage() {
    return (
        <WriteAccess>
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="flex flex-col gap-4">
                    <Link
                        href="/movements"
                        className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Logs
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <MapIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-primary">Record Tactical Movement</h1>
                            <p className="text-muted-foreground mt-1">
                                Authorize and log personnel movement for TA calculation.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card/30 border border-border/50 rounded-xl p-6 md:p-10 shadow-sm backdrop-blur-sm">
                    <MovementForm />
                </div>
            </div>
        </WriteAccess>
    );
}
