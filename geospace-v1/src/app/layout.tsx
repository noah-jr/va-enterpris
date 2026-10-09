import QueryProvider from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { RealTimeSync } from '@/providers/RealTimeSync';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OKUSANGA — Sistema de Geolocalização Regional Inteligente',
  description: 'Plataforma de Inteligência Territorial para monitoramento geoespacial, análise preditiva e apoio a decisões estratégicas em Angola.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-AO" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <SocketProvider>
              <RealTimeSync />
              {children}
            </SocketProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
