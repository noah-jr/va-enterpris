"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";

// SVGs for icons not in standard Lucide sets (TikTok, Threads)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    <path d="M14.5 10a2.5 2.5 0 1 0-5 0" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setEmail("");
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao enviar. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="py-8 px-6 bg-background border-t border-border/50">
      <div className="tesla-container">
        {/* Newsletter Section */}
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          <h3 className="text-sm font-medium mb-4">Fique Atualizado</h3>
          <p className="text-xs text-muted-foreground mb-6 max-w-sm">
            Receba as últimas novidades sobre tecnologia, segurança e inovação diretamente no seu email.
          </p>
          <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
            <div className="relative w-full">
              <input
                type="email"
                placeholder="Seu email"
                className="w-full bg-secondary/50 border border-transparent hover:border-border focus:border-foreground rounded-sm px-4 py-2 text-sm transition-colors outline-none h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 bg-foreground text-background text-sm font-medium rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '...' : 'Inscrever'}
            </button>
          </form>
          {message && (
            <p className={`mt-3 text-xs ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}
        </div>


        {/* Social Links */}
        <div className="flex justify-center gap-6 mb-8">
          <Link href="https://www.facebook.com/profile.php?id=61587272278325" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook">
            <Facebook className="h-5 w-5" />
          </Link>
          <Link href="https://www.instagram.com/vatechenterprises/" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
            <Instagram className="h-5 w-5" />
          </Link>
          <Link href="https://www.tiktok.com/@vatechenterprises" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="TikTok">
            <TikTokIcon className="h-5 w-5" />
          </Link>
          <Link href="https://www.linkedin.com/company/vatechenterprises" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
            <Linkedin className="h-5 w-5" />
          </Link>
          <Link href="https://threads.net" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Threads">
            <ThreadsIcon className="h-5 w-5" />
          </Link>
        </div>

        {/* Main Links Row */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 mb-6 text-xs font-medium">
          <Link
            href="/services"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Serviços
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Sobre
          </Link>
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contacto
          </Link>
          <Link
            href="/news"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Notícias
          </Link>
          <Link
            href="/shop"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Loja
          </Link>
        </div>

        {/* Bottom Legal Links */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mb-4 text-xs">
          <Link
            href="/privacy"
            className="text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            Privacidade e Legal
          </Link>
          <span className="text-muted-foreground/30">•</span>
          <Link
            href="/cookie-policy"
            className="text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            Política de Cookies
          </Link>
          <span className="text-muted-foreground/30">•</span>
          <Link
            href="/terms"
            className="text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            Termos de Serviço
          </Link>
          <span className="text-muted-foreground/30">•</span>
          <Link
            href="/accessibility"
            className="text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            Acessibilidade
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-muted-foreground/60">
          © {currentYear} VA TECH ENTERPRISES • Tecnologia, Segurança e Marketing
        </div>
      </div>
    </footer>
  );
};

export default Footer;
