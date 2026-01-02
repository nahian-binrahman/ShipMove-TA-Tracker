import { LoginForm } from "@/components/features/auth/login-form";

export default function LoginPage() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950">
            {/* Tactical Background Effect */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(2,6,23,1))]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: "radial-gradient(var(--primary) 0.5px, transparent 0.5px)",
                        backgroundSize: "24px 24px"
                    }}
                />
            </div>

            <div className="z-10 w-full px-4">
                <LoginForm />
            </div>

            <div className="absolute bottom-6 text-center z-10">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                    Classified System // Authorized Personnel Only
                </p>
            </div>
        </div>
    );
}
