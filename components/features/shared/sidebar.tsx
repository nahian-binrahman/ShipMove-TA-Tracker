"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Map as MapIcon,
    ClipboardCheck,
    Settings,
    ShieldCheck,
    Ship
} from "lucide-react";

interface SidebarProps {
    role?: string;
}

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Soldiers', href: '/soldiers', icon: Users },
    { name: 'Movements', href: '/movements', icon: MapIcon },
    { name: 'Review', href: '/review', icon: ClipboardCheck, roles: ['admin', 'data_entry'] },
    { name: 'Admin', href: '/admin', icon: ShieldCheck, roles: ['admin'] },
    { name: 'Users', href: '/admin/users', icon: Users, roles: ['admin'], isSubItem: true },
];

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();

    const filteredNavigation = navigation.filter(item => {
        if (!item.roles) return true;
        return role && item.roles.includes(role);
    });

    return (
        <div className="flex h-full w-64 flex-col bg-card border-r border-border shrink-0">
            <div className="flex h-16 items-center px-6 border-b border-border gap-3">
                <div className="bg-primary p-1.5 rounded-lg">
                    <Ship className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">ShipMove TA</span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {filteredNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                                isActive
                                    ? "bg-secondary text-primary font-bold shadow-sm"
                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                                (item as any).isSubItem && "ml-4 text-xs opacity-80"
                            )}
                        >
                            <item.icon className={cn(
                                (item as any).isSubItem ? "mr-2 h-4 w-4" : "mr-3 h-5 w-5",
                                "flex-shrink-0",
                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-border">
                <Link
                    href="/settings"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                >
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                </Link>
            </div>
        </div>
    );
}
