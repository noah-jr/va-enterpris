import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/QueryProvider";
import CookieConsent from "@/components/CookieConsent";
import ChatWidget from "@/components/ChatWidget";
import MouseSpotlight from "@/components/MouseSpotlight";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "VA TECH ENTERPRISES | Tecnologia, Segurança e Marketing Digital",
    description: "VA TECH ENTERPRISES é líder em soluções integradas de tecnologia, cibersegurança e marketing digital para transformar e proteger o seu negócio.",
    authors: [{ name: "VA TECH ENTERPRISES" }],
    openGraph: {
        title: "VA TECH ENTERPRISES | Tecnologia, Segurança e Marketing",
        description: "Soluções completas em tecnologia, segurança e marketing digital para empresas inovadoras.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt" suppressHydrationWarning>
            <body className={outfit.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        <TooltipProvider>
                            {children}
                            <Toaster />
                            <Sonner />
                            <CookieConsent />
                            <ChatWidget />
                            <MouseSpotlight />
                        </TooltipProvider>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
