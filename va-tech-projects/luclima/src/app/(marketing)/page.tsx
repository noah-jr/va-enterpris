import { Hero } from '@/components/home/hero';
import { Services } from '@/components/home/services';
import { About } from '@/components/home/about';
import { Team } from '@/components/home/team';
import { Portfolio } from '@/components/home/portfolio';
import { Testimonials } from '@/components/home/testimonials';
import { Newsletter } from '@/components/home/newsletter';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
         {/* <Header /> */}
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Team />
        <Testimonials />
        <Newsletter />
      </main>
       {/* <Footer /> */}
    </div>
  );
}
