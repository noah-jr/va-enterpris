'use client';

import { useState, useEffect } from 'react';
import { User, Settings, LogOut, Shield, HelpCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logOut } from '@/lib/actions';
import Link from 'next/link';

interface UserData {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
}

export default function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<UserData>({ name: 'Admin', email: 'admin@vatech.com' });

    useEffect(() => {
        // Fetch user data from API
        fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => {
                if (data?.user) {
                    setUser(data.user);
                }
            })
            .catch((error) => {
                console.error('Error fetching session:', error);
            });
    }, []);

    const userInitials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'AD';

    const handleLogout = async () => {
        await logOut();
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 pr-3 transition-colors">
                    <Avatar className="h-9 w-9 border-2 border-gray-200 dark:border-gray-700">
                        <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">{user?.name || 'Admin'}</p>
                            {user?.role && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    {user.role}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {user?.email || 'admin@vatech.com'}
                        </p>
                    </div>

                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name || 'Admin'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email || 'admin@vatech.com'}
                        </p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href="/security" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Segurança</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/help" className="cursor-pointer">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Ajuda</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
