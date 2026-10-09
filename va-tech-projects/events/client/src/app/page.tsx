import Hero from "@/components/Hero";
import EventCard from "@/components/EventCard";
import { apiService } from "@/services/api";
import { ArrowRight, Sparkles, Mail, Instagram, Facebook, Linkedin } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  let events = [];
  try {
    events = await apiService.getEvents();
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
  }

  return (
    <div className="bg-background min-h-screen font-sans text-dark">
      <Hero />

      {/* Featured Events Section */}
      <section className="py-32 px-6 md:px-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.2em] text-sm mb-6">
                <Sparkles className="w-5 h-5" />
                Destaques da Temporada
              </div>
              <h2 className="text-6xl md:text-8xl font-black text-dark leading-[0.8] tracking-tighter">
                EXPERIÊNCIAS <br />
                <span className="italic text-primary">MEMORÁVEIS.</span>
              </h2>
            </div>
            <div className="flex flex-col items-start gap-8">
              <p className="text-dark/50 text-xl font-medium max-w-sm leading-relaxed">
                Uma curadoria exclusiva dos eventos mais impactantes de Luanda, selecionados para quem busca o extraordinário.
              </p>
              <Link href="/eventos" className="group flex items-center gap-4 text-dark font-black text-xl hover:text-primary transition-colors">
                Ver todos os eventos <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {events.map((event: any) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  titulo={event.titulo}
                  data={event.data}
                  local={event.local}
                  image_url={event.image_url}
                  preco_min={event.preco_min || 0}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  id: "mock-1",
                  titulo: "Gala de Verão Baía de Luanda",
                  data: "2024-12-25T20:00:00Z",
                  local: "Baía de Luanda",
                  image_url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80",
                  preco_min: 25000
                },
                {
                  id: "mock-2",
                  titulo: "Noite de Jazz no Palácio",
                  data: "2024-11-10T19:30:00Z",
                  local: "Palácio de Ferro",
                  image_url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80",
                  preco_min: 15000
                },
                {
                  id: "mock-3",
                  titulo: "Concerto Sinfónico Nacional",
                  data: "2024-10-15T18:00:00Z",
                  local: "Teatro Avenida",
                  image_url: "https://images.unsplash.com/photo-1465847733345-d362d54017e7?auto=format&fit=crop&q=80",
                  preco_min: 10000
                }
              ].map(mock => (
                <EventCard key={mock.id} {...mock} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section - Adveris Style (Clean & Bold) */}
      <section className="py-32 px-6 md:px-24 bg-dark text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-curtain-opening-on-a-theatre-stage-41132-large.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center relative z-10">
          <div className="flex-1">
            <h2 className="text-6xl md:text-8xl font-black leading-[0.8] tracking-tighter mb-8">
              FIQUE POR <br />
              <span className="text-primary italic">DENTRO.</span>
            </h2>
            <p className="text-white/60 text-xl font-medium max-w-md leading-relaxed">
              Subscreva a nossa newsletter para receber convites exclusivos e novidades em primeira mão.
            </p>
          </div>

          <div className="flex-1 w-full">
            <form className="relative">
              <input
                type="email"
                placeholder="O seu melhor e-mail"
                className="w-full bg-transparent border-b-2 border-white/20 py-8 text-2xl font-bold outline-none focus:border-primary transition-colors placeholder:text-white/20"
              />
              <button className="absolute right-0 bottom-8 text-primary hover:text-white transition-colors">
                <ArrowRight className="w-12 h-12" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer - Premium Adveris Style */}
      <footer className="py-32 px-6 md:px-24 bg-white border-t border-dark/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-32">
            <div className="col-span-2">
              <h2 className="text-4xl font-black text-dark tracking-tighter mb-12 uppercase">
                VA<span className="text-primary italic">EVENTS</span>
              </h2>
              <p className="text-dark/40 text-2xl font-medium max-w-md leading-snug">
                Redefinindo a elegância nos eventos e a simplicidade no acesso à cultura em Angola.
              </p>
            </div>

            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-dark/20">Navegação</h4>
              <ul className="space-y-4">
                {['Eventos', 'Sobre Nós', 'Blog', 'Contactos'].map(item => (
                  <li key={item}>
                    <Link href="#" className="text-xl font-bold text-dark hover:text-primary transition-colors whitespace-nowrap">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-dark/20">Social</h4>
              <div className="flex gap-4">
                {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                  <Link key={i} href="#" className="w-12 h-12 rounded-full border border-dark/10 flex items-center justify-center text-dark hover:bg-primary hover:text-white hover:border-primary transition-all">
                    <Icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-dark/5 gap-8">
            <p className="text-dark/30 font-bold uppercase tracking-widest text-[10px]">
              © 2024 VA EVENTS. DIGITAL ARCHITECTURE BY VA.
            </p>
            <div className="flex gap-12">
              <Link href="#" className="text-dark/30 font-bold uppercase tracking-widest text-[10px] hover:text-dark transition-colors">Privacidade</Link>
              <Link href="#" className="text-dark/30 font-bold uppercase tracking-widest text-[10px] hover:text-dark transition-colors">Termos</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

