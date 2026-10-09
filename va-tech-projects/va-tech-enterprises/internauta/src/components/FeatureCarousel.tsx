"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCard {
  image: string;
  title: string;
  description?: string;
  link?: string;
}

interface FeatureCarouselProps {
  title?: string;
  cards: FeatureCard[];
}

const FeatureCarousel = ({ title, cards }: FeatureCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const scrollAmount = 400;
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const CardWrapper = ({ card, children }: { card: FeatureCard; children: React.ReactNode }) => {
    if (card.link) {
      return (
        <Link href={card.link} className="flex-shrink-0 w-80 group cursor-pointer">
          {children}
        </Link>
      );
    }
    return <div className="flex-shrink-0 w-80 group cursor-pointer">{children}</div>;
  };

  return (
    <section className="py-16 bg-secondary/50">
      <div className="px-6 lg:px-12">
        {title && (
          <h2 className="text-3xl font-medium mb-8 text-center">{title}</h2>
        )}

        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-background shadow-lg hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Cards Container */}
          <div
            ref={containerRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {cards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CardWrapper card={card}>
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-lg font-medium group-hover:underline">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {card.description}
                    </p>
                  )}
                </CardWrapper>
              </motion.div>
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-background shadow-lg hover:bg-accent transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeatureCarousel;
