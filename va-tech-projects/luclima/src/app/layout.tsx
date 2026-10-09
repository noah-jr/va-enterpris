 'use client'

import { Inter, Space_Grotesk, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { CookieConsent } from '@/components/ui/cookie-consent';
import MouseFollowGlow from '@/components/ui/mouse-follow-glow';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

// export const metadata: Metadata = {
//   title: 'Luclima - Climatização e Higienização de Alta Performance',
//   description: 'Especialistas em instalação, manutenção e higienização de sistemas de ar condicionado em Angola.',
//   keywords: ['ar condicionado', 'climatização', 'angola', 'luclima', 'higienização', 'manutenção ac'],
//   authors: [{ name: 'Luclima Pro' }],
//   openGraph: {
//     title: 'Luclima - Climatização e Higienização de Alta Performance',
//     description: 'Especialistas em instalação, manutenção e higienização de sistemas de ar condicionado em Angola.',
//     type: 'website',
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <CookieConsent />
            <MouseFollowGlow />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
