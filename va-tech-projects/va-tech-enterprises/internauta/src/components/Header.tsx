"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Globe, ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);

  const services = [
    {
      name: "Infraestrutura de Redes",
      href: "/services/infrastructure",
      description: "Soluções completas de rede",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Cibersegurança",
      href: "/services/cybersecurity",
      description: "Proteção total do seu negócio",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "CCTV",
      href: "/services/cctv",
      description: "Videovigilância 24/7",
      image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Marketing Digital",
      href: "/services/digital-marketing",
      description: "Estratégias digitais eficazes",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Tráfego Pago",
      href: "/services/paid-traffic",
      description: "Anúncios que convertem",
      image: "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?auto=format&fit=crop&w=400&q=80"
    },
  ];

  const portfolio = [
    {
      name: "Websites",
      href: "/services/web-development",
      description: "Sites modernos e profissionais",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Redes Sociais",
      href: "/services/social-media",
      description: "Gestão completa de redes",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80"
    },
  ];

  const discover = [
    {
      name: "Blog",
      href: "/blog",
      description: "Artigos e notícias",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Espaço Internauta",
      href: "/internauta/dashboard",
      description: "Área exclusiva para leads",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Sobre Nós",
      href: "/about",
      description: "Conheça a VA Tech",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80"
    },
  ];

  const sales = [
    {
      name: "Whatsapp",
      href: "https://wa.me/244934819272",
      description: "Fale connosco pelo Whatsapp",
      image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Chamada",
      href: "tel:+244934819272",
      description: "Ligue para nós agora",
      image: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=400&q=80"
    },
  ];

  const mobileMenuItems = [
    { label: "Serviços", items: services },
    { label: "Portfólio", items: portfolio },
    { label: "Vendas", items: sales },
    { label: "Descobrir", items: discover },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center py-2 px-4 transition-all duration-300 pointer-events-none">
      <nav
        className={cn(
          "pointer-events-auto grid grid-cols-3 items-center transition-all duration-500 rounded-full px-5 py-2 gap-4",
          isScrolled
            ? "bg-background/80 backdrop-blur-md shadow-lg border border-border/20 w-full max-w-6xl"
            : "bg-background/40 backdrop-blur-sm border border-transparent w-full max-w-[1400px]"
        )}
      >
        {/* Logo - Column 1 */}
        <div className="justify-self-start">
          <Link href="/" className="flex items-center flex-shrink-0">
            <img
              src="/logo-light.png"
              alt="VA Tech"
              className="h-12 w-auto dark:hidden mix-blend-multiply object-contain transition-all"
            />
            <img
              src="/logo-dark.png"
              alt="VA Tech"
              className="h-12 w-auto hidden dark:block mix-blend-screen object-contain transition-all"
            />
          </Link>
        </div>

        {/* Desktop Navigation - Column 2 */}
        <div className="justify-self-center">
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="bg-transparent gap-1 justify-center">
              {/* Services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm font-medium">
                  Serviços
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="fixed left-0 right-0 top-[60px] w-full bg-background shadow-2xl border-t border-border/10 animate-in slide-in-from-top-2 duration-300">
                    <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-12">
                      <div className="grid grid-cols-5 gap-6">
                        {services.map((item) => (
                          <NavigationMenuLink key={item.name} asChild>
                            <Link
                              href={item.href}
                              className="group block rounded-xl overflow-hidden hover:bg-accent/10 transition-all p-3"
                            >
                              <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                />
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-lg">{item.name}</div>
                                <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Portfolio */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm font-medium">
                  Portfólio
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="fixed left-0 right-0 top-[60px] w-full bg-background shadow-2xl border-t border-border/10 animate-in slide-in-from-top-2 duration-300">
                    <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-12">
                      <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {portfolio.map((item) => (
                          <NavigationMenuLink key={item.name} asChild>
                            <Link
                              href={item.href}
                              className="group block rounded-xl overflow-hidden hover:bg-accent/10 transition-all p-4"
                            >
                              <div className="aspect-video overflow-hidden rounded-lg mb-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                />
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-xl">{item.name}</div>
                                <div className="text-sm text-muted-foreground mt-2">{item.description}</div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Vendas */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm font-medium">
                  Vendas
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="fixed left-0 right-0 top-[60px] w-full bg-background shadow-2xl border-t border-border/10 animate-in slide-in-from-top-2 duration-300">
                    <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-12">
                      <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                        {sales.map((item) => (
                          <NavigationMenuLink key={item.name} asChild>
                            <Link
                              href={item.href}
                              className="group block rounded-xl overflow-hidden hover:bg-accent/10 transition-all p-3"
                            >
                              <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                />
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-lg">{item.name}</div>
                                <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Discover */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm font-medium">
                  Descobrir
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="fixed left-0 right-0 top-[60px] w-full bg-background shadow-2xl animate-in slide-in-from-top-2 duration-300 border-t border-border/10">
                    <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-12">
                      <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                        {discover.map((item) => (
                          <NavigationMenuLink key={item.name} asChild>
                            <Link
                              href={item.href}
                              className="group block rounded-xl overflow-hidden hover:bg-accent/10 transition-all p-3"
                            >
                              <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                />
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-lg">{item.name}</div>
                                <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Side - Column 3 */}
        <div className="justify-self-end flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Link href="/contact" className="text-sm font-medium hover:text-foreground/80 transition-colors">
              Contacto
            </Link>
          </div>

          {/* Mobile Menu Button Container */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            {!isMenuOpen && (
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 relative pointer-events-auto"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-background z-[100] lg:hidden overflow-y-auto pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
          {/* Mobile Overlay Header */}
          <div className="sticky top-0 bg-background/90 backdrop-blur-xl z-[110] flex items-center justify-between px-6 py-4 border-b border-border/10">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
              <img
                src="/logo-light.png"
                alt="VA Tech"
                className="h-10 w-auto dark:hidden mix-blend-multiply object-contain"
              />
              <img
                src="/logo-dark.png"
                alt="VA Tech"
                className="h-10 w-auto hidden dark:block mix-blend-screen object-contain"
              />
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors flex items-center justify-center"
              aria-label="Fechar menu"
            >
              <X className="h-8 w-8 text-foreground" />
            </button>
          </div>

          <div className="flex flex-col pt-4 px-8 pb-12">
            {mobileMenuItems.map((section) => (
              <MobileMenuSection
                key={section.label}
                label={section.label}
                items={section.items}
                onClose={() => setIsMenuOpen(false)}
              />
            ))}

            <div className="mt-8 pt-8 border-t border-border/40 space-y-4">
              <Button
                asChild
                className="w-full h-16 bg-foreground text-background rounded-full font-semibold text-lg"
              >
                <Link href="/contact" onClick={() => setIsMenuOpen(false)}>
                  Fale Connosco
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-16 rounded-full font-semibold text-lg border-border"
              >
                <Link href="/contact?type=meeting" onClick={() => setIsMenuOpen(false)}>
                  Marcar Reunião
                </Link>
              </Button>

              <div className="pt-6 text-center">
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Todos os Contactos
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

interface MobileMenuSectionProps {
  label: string;
  items: { name: string; href: string; description: string; image: string }[];
  onClose: () => void;
}

const MobileMenuSection = ({ label, items, onClose }: MobileMenuSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-6 text-xl font-semibold border-b border-border/10"
      >
        {label}
        <ChevronDown
          className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 grid grid-cols-2 gap-3">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-lg overflow-hidden bg-secondary/50"
              onClick={onClose}
            >
              <div className="aspect-video">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <div className="p-3">
                <div className="font-semibold text-base">{item.name}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Header;
