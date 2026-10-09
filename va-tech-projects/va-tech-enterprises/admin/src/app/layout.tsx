import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";


const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
    title: "VA TECH - Admin Panel",
    description: "Painel Administrativo da VA TECH ENTERPRISES",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt" suppressHydrationWarning>
            <body className={cn(outfit.className, "antialiased")}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TooltipProvider>
                        {children}
                        <Toaster />
                    </TooltipProvider>

                </ThemeProvider>
            </body>
        </html>
    );
}
