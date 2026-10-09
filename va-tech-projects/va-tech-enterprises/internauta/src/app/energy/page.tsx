"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Battery, Sun, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const energyProducts = [
    {
        id: "solar-roof",
        name: "Solar Roof",
        tagline: "Beautiful Solar, Without Compromise",
        description: "Transform your roof into a beautiful solar power generator with integrated solar tiles.",
        price: "From $21.85 per sq ft",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2070&q=80",
        icon: Sun,
        features: ["Durable Design", "Integrated Solar", "25-Year Warranty"]
    },
    {
        id: "solar-panels",
        name: "Solar Panels",
        tagline: "Lowest Cost Solar Panels in America",
        description: "High-efficiency solar panels that deliver maximum energy production at the best value.",
        price: "From $8,200",
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2070&q=80",
        icon: Sun,
        features: ["High Efficiency", "Low Profile", "Best Value"]
    },
    {
        id: "powerwall",
        name: "Powerwall",
        tagline: "Store Energy for Anytime Use",
        description: "Store solar energy for use during outages or at night, and reduce your reliance on the grid.",
        price: "From $11,500",
        image: "https://images.unsplash.com/photo-1584276433295-4b49a252e5ee?auto=format&fit=crop&w=2070&q=80",
        icon: Battery,
        features: ["13.5 kWh Capacity", "Backup Power", "Smart Control"]
    },
    {
        id: "megapack",
        name: "Megapack",
        tagline: "Utility-Scale Energy Storage",
        description: "Massive energy storage solution for utilities and large commercial applications.",
        price: "Contact for pricing",
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=2070&q=80",
        icon: Zap,
        features: ["3.9 MWh Capacity", "Grid Scale", "Rapid Deployment"]
    }
];

export default function EnergyPage() {
    return (
        <div className="relative">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative h-screen">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: "url(https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2070&q=80)"
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                    <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h1 className="text-5xl md:text-7xl font-bold mb-4">Tesla Energy</h1>
                            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
                                Power your home and business with clean, renewable energy
                            </p>
                            <Button size="lg" asChild>
                                <Link href="#products">Explore Products</Link>
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 bg-background">
                    <div className="tesla-container px-4">
                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {[
                                { number: "500K+", label: "Solar Installations" },
                                { number: "6 GWh", label: "Energy Storage Deployed" },
                                { number: "100%", label: "Renewable Energy" }
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <h3 className="text-5xl font-bold text-primary mb-2">{stat.number}</h3>
                                    <p className="text-muted-foreground">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Products Section */}
                <section id="products" className="py-20 bg-secondary/30">
                    <div className="tesla-container px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl font-bold mb-4">Our Products</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Complete energy solutions for homes and businesses
                            </p>
                        </motion.div>

                        <div className="grid lg:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
                            {energyProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-background rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    <Link href={`/energy/${product.id}`}>
                                        <div className="relative aspect-video overflow-hidden">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                                <h3 className="text-3xl font-bold mb-2">{product.name}</h3>
                                                <p className="text-lg opacity-90">{product.tagline}</p>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-muted-foreground mb-4">{product.description}</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {product.features.map((feature, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 bg-secondary rounded-full text-sm"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-semibold">{product.price}</span>
                                                <Button variant="ghost" className="group-hover:gap-2 transition-all">
                                                    Learn More
                                                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 bg-background">
                    <div className="tesla-container px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl font-bold mb-4">How Tesla Energy Works</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                A complete ecosystem for clean energy generation and storage
                            </p>
                        </motion.div>

                        <div className="max-w-4xl mx-auto">
                            <div className="space-y-8">
                                {[
                                    {
                                        step: "1",
                                        title: "Generate",
                                        description: "Solar Roof or Solar Panels capture sunlight and convert it into clean electricity for your home.",
                                        icon: Sun
                                    },
                                    {
                                        step: "2",
                                        title: "Store",
                                        description: "Powerwall stores excess solar energy for use during the night or power outages.",
                                        icon: Battery
                                    },
                                    {
                                        step: "3",
                                        title: "Power",
                                        description: "Use stored energy to power your home, charge your Tesla, and reduce your electricity bills.",
                                        icon: Zap
                                    }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex gap-6 bg-secondary/30 p-6 rounded-lg"
                                    >
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                                            {item.step}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <item.icon className="h-6 w-6 text-primary" />
                                                <h3 className="text-xl font-bold">{item.title}</h3>
                                            </div>
                                            <p className="text-muted-foreground">{item.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-20 bg-secondary/30">
                    <div className="tesla-container px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl font-bold mb-4">Why Choose Tesla Energy?</h2>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                            {[
                                {
                                    icon: Sun,
                                    title: "Clean Energy",
                                    description: "Reduce your carbon footprint with 100% renewable solar energy"
                                },
                                {
                                    icon: Battery,
                                    title: "Energy Independence",
                                    description: "Store energy and reduce reliance on the grid"
                                },
                                {
                                    icon: Zap,
                                    title: "Lower Bills",
                                    description: "Save money on electricity with solar power and storage"
                                },
                                {
                                    icon: Sun,
                                    title: "Smart Control",
                                    description: "Monitor and optimize your energy usage with the Tesla app"
                                }
                            ].map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                        <benefit.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                                    <p className="text-muted-foreground">{benefit.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-background">
                    <div className="tesla-container px-4 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold mb-6">Ready to Go Solar?</h2>
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Get a personalized quote for your home or business today
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Button size="lg" asChild>
                                    <Link href="/contact">Get a Quote</Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/contact">Contact Sales</Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
