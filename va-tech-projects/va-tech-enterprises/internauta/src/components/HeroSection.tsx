"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export interface HeroSlide {
  title: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  backgroundImage: string;
  orderLink?: string;
  learnMoreLink?: string;
  disclaimer?: string;
}

interface HeroSectionProps {
  // Single Mode Props
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  backgroundImage?: string;
  orderLink?: string;
  learnMoreLink?: string;
  disclaimer?: string;
  showScrollIndicator?: boolean;

  // Carousel Mode Props
  slides?: HeroSlide[];
  autoPlay?: boolean;
  interval?: number;
}

const HeroSection = ({
  title: singleTitle,
  subtitle: singleSubtitle,
  primaryCta: singlePrimaryCta = "Order Now",
  secondaryCta: singleSecondaryCta = "Learn More",
  backgroundImage: singleBackgroundImage,
  orderLink: singleOrderLink,
  learnMoreLink: singleLearnMoreLink,
  disclaimer: singleDisclaimer,
  showScrollIndicator = false,
  slides,
  autoPlay = true,
  interval = 5000,
}: HeroSectionProps) => {
  const isCarousel = slides && slides.length > 0;
  const [currentIndex, setCurrentIndex] = useState(0);

  // If generic carousel logic needed
  useEffect(() => {
    if (!isCarousel || !autoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [isCarousel, autoPlay, interval, slides?.length]);

  const currentSlide = isCarousel ? slides[currentIndex] : {
    title: singleTitle,
    subtitle: singleSubtitle,
    primaryCta: singlePrimaryCta,
    secondaryCta: singleSecondaryCta,
    backgroundImage: singleBackgroundImage,
    orderLink: singleOrderLink,
    learnMoreLink: singleLearnMoreLink,
    disclaimer: singleDisclaimer,
  };

  const nextSlide = () => {
    if (slides) setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides) setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!currentSlide.title && !isCarousel) return null; // Safety check

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-between overflow-hidden bg-black">
      {/* Background Transition */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={isCarousel ? currentIndex : "static"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${currentSlide.backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-black/10" /> {/* Slight overlay */}
        </motion.div>
      </AnimatePresence>

      {/* Content Transition */}
      <div className="relative z-10 flex flex-col items-center pt-32 text-center w-full px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={isCarousel ? currentIndex : "content"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white drop-shadow-lg">
              {currentSlide.title}
            </h1>
            {currentSlide.subtitle && (
              <p className="mt-2 text-sm md:text-base text-white/80 drop-shadow-md max-w-2xl">
                {currentSlide.subtitle}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls (Carousel only) */}
      {isCarousel && (
        <>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-8 z-30 pointer-events-none">
            <button
              onClick={prevSlide}
              className="p-4 rounded-full bg-black/10 hover:bg-black/30 backdrop-blur-md border border-white/10 transition-all text-white pointer-events-auto group/btn"
            >
              <ChevronLeft className="w-8 h-8 transition-transform group-hover/btn:-translate-x-1" />
            </button>
            <button
              onClick={nextSlide}
              className="p-4 rounded-full bg-black/10 hover:bg-black/30 backdrop-blur-md border border-white/10 transition-all text-white pointer-events-auto group/btn"
            >
              <ChevronRight className="w-8 h-8 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                  }`}
              />
            ))}
          </div>
        </>
      )}

      {/* CTAs */}
      <div className="relative z-10 pb-20 flex flex-col items-center gap-4 w-full max-w-md px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={isCarousel ? currentIndex : "cta"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto"
          >
            {(currentSlide.orderLink || currentSlide.primaryCta) && (
              <Button
                asChild
                size="lg"
                className="flex-1 bg-white text-black hover:bg-white/90 rounded-full h-14 text-base font-bold tracking-wide transition-all shadow-lg"
              >
                <Link href={currentSlide.orderLink || "#"}>{currentSlide.primaryCta || "Order Now"}</Link>
              </Button>
            )}
            {(currentSlide.learnMoreLink || currentSlide.secondaryCta) && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="flex-1 bg-black/40 backdrop-blur-md hover:bg-white/10 text-white border-2 border-white/20 rounded-full h-14 text-base font-bold tracking-wide transition-all"
              >
                <Link href={currentSlide.learnMoreLink || "#"}>{currentSlide.secondaryCta || "Learn More"}</Link>
              </Button>
            )}
          </motion.div>
        </AnimatePresence>

        {currentSlide.disclaimer && (
          <p className="text-xs text-white/70">{currentSlide.disclaimer}</p>
        )}
        {showScrollIndicator && !isCarousel && (
          <ChevronDown className="h-6 w-6 animate-bounce mt-4 text-white" />
        )}
      </div>
    </section >
  );
};

export default HeroSection;
