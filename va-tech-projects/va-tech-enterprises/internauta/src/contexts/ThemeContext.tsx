"use client";

import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
    const { theme, setTheme, systemTheme } = useNextTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return {
        theme: theme || systemTheme || "dark",
        setTheme,
        toggleTheme,
    };
}
