"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wrench, ShieldCheck, Zap, Headphones, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Wrench,
    title: "Service & Repairs",
    description: "Expert care from Tesla-trained technicians",
    link: "/discover/find-us",
  },
  {
    icon: ShieldCheck,
    title: "Extended Warranty",
    description: "Comprehensive protection for your vehicle",
    link: "/shop/accessories",
  },
  {
    icon: Zap,
    title: "Charging Solutions",
    description: "Home and on-the-go charging options",
    link: "/charging",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're here whenever you need us",
    link: "/contact",
  },
  {
    icon: Calendar,
    title: "Schedule Service",
    description: "Book your appointment online",
    link: "/discover/demo-drive",
  },
  {
    icon: MapPin,
    title: "Find a Location",
    description: "Stores, service centers & Superchargers",
    link: "/discover/find-us",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="tesla-container px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-medium mb-4">
            Services & Support
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing exceptional service throughout your Tesla ownership journey
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={service.link}
                className="group block p-6 rounded-2xl bg-secondary/50 hover:bg-secondary transition-all duration-300 h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/contact">
            <Button size="lg" variant="outline">
              Contact Us
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
