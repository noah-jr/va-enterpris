import React, { useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { StatementSection } from './components/StatementSection.js';
import { TrustMetrics } from './components/TrustMetrics.js';
import { WorkflowSection } from './components/WorkflowSection.js';
import { FeaturesSection } from './components/FeaturesSection.js';
import { SecuritySection } from './components/SecuritySection.js';
import { PricingSection } from './components/PricingSection.js';
import { FaqSection } from './components/FaqSection.js';
import { ContactSection } from './components/ContactSection.js';
import { Footer } from './components/Footer.js';
import { ChatWidget } from './components/ChatWidget.js';

export const App: React.FC = () => {
  const clientUrl = 'http://localhost:5173/auth/login';

  useEffect(() => {
    if (!window.location.hash) return;

    const id = window.location.hash.slice(1);
    const scrollToTarget = () => {
      const target = document.getElementById(id);
      target?.scrollIntoView();
    };

    const attempts = [0, 150, 400, 800, 1500, 2500, 3500];
    const timers = attempts.map((delay) => window.setTimeout(scrollToTarget, delay));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900 overflow-x-hidden">
      <Navbar clientUrl={clientUrl} />

      <main className="flex-1">
        <HeroSection clientUrl={clientUrl} />
        <StatementSection clientUrl={clientUrl} />
        <TrustMetrics />
        <FeaturesSection />
        <WorkflowSection />
        <SecuritySection />
        <PricingSection />
        <FaqSection />
        <ContactSection />
      </main>

      <Footer clientUrl={clientUrl} />
      <ChatWidget />
    </div>
  );
};

export default App;
