'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className="p-2 rounded-md hover:bg-gray-100 dark:bg-gray-900 transition-colors"
                aria-label="Toggle theme"
            >
                <Sun size={20} />
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-gray-100 dark:bg-gray-900 transition-colors group"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun size={20} className="group-hover:rotate-180 transition-transform duration-300" />
            ) : (
                <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-300" />
            )}
        </button>
    );
}
