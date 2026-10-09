import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Playfair_Display } from 'next/font/google';
// import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { CookieConsent } from '@/components/ui/cookie-consent';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

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

export const metadata: Metadata = {
  title: 'Luclima - Climatização e Higienização de Alta Performance',
  description: 'Especialistas em instalação, manutenção e higienização de sistemas de ar condicionado em Angola.',
  keywords: ['ar condicionado', 'climatização', 'angola', 'luclima', 'higienização', 'manutenção ac'],
  authors: [{ name: 'Luclima Pro' }],
  openGraph: {
    title: 'Luclima - Climatização e Higienização de Alta Performance',
    description: 'Especialistas em instalação, manutenção e higienização de sistemas de ar condicionado em Angola.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>


  );
}
