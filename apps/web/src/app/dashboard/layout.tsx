'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    MessageSquare,
    Inbox,
    BookOpen,
    Settings,
    Users,
    BarChart3,
    LogOut,
    ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Inbox', href: '/dashboard', icon: Inbox },
    { name: 'Knowledge', href: '/dashboard/knowledge', icon: BookOpen },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="h-screen flex bg-muted/30">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center gap-2 px-4 border-b">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-semibold">SupportAI</span>
                </div>

                {/* Workspace Selector */}
                <div className="p-4 border-b">
                    <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-sm font-medium">
                                A
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium">Acme Inc</p>
                                <p className="text-xs text-muted-foreground">Free trial</p>
                            </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            JD
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">John Doe</p>
                            <p className="text-xs text-muted-foreground truncate">john@acme.com</p>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    );
}
