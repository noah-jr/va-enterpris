"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface CarouselItem {
  image: string;
  title: string;
  subtitle?: string;
  link: string;
}

interface IrregularCarouselProps {
  title?: string;
  items: [CarouselItem, CarouselItem];
  reversed?: boolean;
}

const IrregularCarousel = ({ title, items, reversed = false }: IrregularCarouselProps) => {
  const [large, small] = reversed ? [items[1], items[0]] : items;

  return (
    <section className="py-16 bg-secondary/30">
      <div className="tesla-container px-4 sm:px-6 lg:px-12">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-medium mb-8 text-center"
          >
            {title}
          </motion.h2>
        )}

        <div
          className={`grid lg:grid-cols-3 gap-6 ${reversed ? "lg:grid-flow-dense" : ""
            }`}
        >
          {/* Large Card */}
          <motion.div
            initial={{ opacity: 0, x: reversed ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`lg:col-span-2 ${reversed ? "lg:col-start-2" : ""}`}
          >
            <Link
              href={large.link}
              className="group block relative rounded-xl overflow-hidden aspect-[16/9] lg:aspect-[2/1] shadow-xl"
            >
              <img
                src={large.image}
                alt={large.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-2xl md:text-3xl font-medium text-white mb-2 drop-shadow-lg">
                  {large.title}
                </h3>
                {large.subtitle && (
                  <p className="text-white/80 text-sm md:text-base drop-shadow">
                    {large.subtitle}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>

          {/* Small Card */}
          <motion.div
            initial={{ opacity: 0, x: reversed ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={reversed ? "lg:col-start-1 lg:row-start-1" : ""}
          >
            <Link
              href={small.link}
              className="group block relative rounded-xl overflow-hidden aspect-[16/9] lg:aspect-[1/1] h-full shadow-xl"
            >
              <img
                src={small.image}
                alt={small.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl md:text-2xl font-medium text-white mb-1 drop-shadow-lg">
                  {small.title}
                </h3>
                {small.subtitle && (
                  <p className="text-white/80 text-sm drop-shadow">
                    {small.subtitle}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default IrregularCarousel;
