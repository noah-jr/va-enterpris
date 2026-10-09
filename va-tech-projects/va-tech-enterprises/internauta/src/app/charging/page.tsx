"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Zap, MapPin, Clock, DollarSign, Shield, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ChargingPage() {
    return (
        <div className="relative">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative h-screen">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: "url(https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=2070&q=80)"
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                    <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h1 className="text-5xl md:text-7xl font-bold mb-4">Supercharger Network</h1>
                            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
                                The world's fastest charging network with 50,000+ Superchargers worldwide
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Button size="lg" asChild>
                                    <Link href="/discover/find-us">Find a Supercharger</Link>
                                </Button>
                                <Button size="lg" variant="outline">
                                    Learn More
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 bg-background">
                    <div className="tesla-container px-4">
                        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                            {[
                                { number: "50,000+", label: "Superchargers Worldwide" },
                                { number: "15 min", label: "Average Charging Time" },
                                { number: "200 mi", label: "Range in 15 Minutes" },
                                { number: "99.9%", label: "Network Uptime" }
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

                {/* Charging Options */}
                <section className="py-20 bg-secondary/30">
                    <div className="tesla-container px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl font-bold mb-4">Charging Solutions</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Choose the charging solution that fits your lifestyle
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                {
                                    title: "Supercharger",
                                    description: "Ultra-fast charging for long-distance travel",
                                    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
                                    features: [
                                        "Up to 250 kW charging speed",
                                        "200 miles in 15 minutes",
                                        "50,000+ locations worldwide",
                                        "Automatic billing"
                                    ],
                                    price: "Pay per use"
                                },
                                {
                                    title: "Wall Connector",
                                    description: "Home charging solution for daily use",
                                    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=80",
                                    features: [
                                        "Up to 44 miles per hour",
                                        "WiFi connectivity",
                                        "Power sharing capability",
                                        "Customizable power levels"
                                    ],
                                    price: "From $475"
                                },
                                {
                                    title: "Mobile Connector",
                                    description: "Portable charging for any outlet",
                                    image: "https://images.unsplash.com/photo-1619317490533-fa8c9ef7f9bb?auto=format&fit=crop&w=800&q=80",
                                    features: [
                                        "Charge anywhere",
                                        "Multiple adapter options",
                                        "Up to 30 miles per hour",
                                        "Compact and portable"
                                    ],
                                    price: "From $230"
                                }
                            ].map((option, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-background rounded-2xl overflow-hidden"
                                >
                                    <div className="relative aspect-video">
                                        <img
                                            src={option.image}
                                            alt={option.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold mb-2">{option.title}</h3>
                                        <p className="text-muted-foreground mb-4">{option.description}</p>
                                        <ul className="space-y-2 mb-6">
                                            {option.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-semibold">{option.price}</span>
                                            <Button asChild>
                                                <Link href="/contact">Order Now</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-20 bg-background">
                    <div className="tesla-container px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl font-bold mb-4">Why Choose Tesla Charging?</h2>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                {
                                    icon: Zap,
                                    title: "Fastest Charging",
                                    description: "Get up to 200 miles of range in just 15 minutes with our V3 Superchargers"
                                },
                                {
                                    icon: MapPin,
                                    title: "Convenient Locations",
                                    description: "Strategically placed along major routes and in urban areas for maximum convenience"
                                },
                                {
                                    icon: Clock,
                                    title: "24/7 Availability",
                                    description: "Charge anytime, anywhere with our always-available charging network"
                                },
                                {
                                    icon: DollarSign,
                                    title: "Transparent Pricing",
                                    description: "Simple, straightforward pricing with no hidden fees or membership required"
                                },
                                {
                                    icon: Shield,
                                    title: "Reliable Network",
                                    description: "99.9% uptime ensures you can always count on our charging infrastructure"
                                },
                                {
                                    icon: Wifi,
                                    title: "Smart Features",
                                    description: "Monitor charging status, pre-condition your battery, and more through the app"
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

                {/* How It Works */}
                <section className="py-20 bg-secondary/30">
                    <div className="tesla-container px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto"
                        >
                            <h2 className="text-4xl font-bold text-center mb-12">How Supercharging Works</h2>
                            <div className="space-y-8">
                                {[
                                    {
                                        step: "1",
                                        title: "Navigate to a Supercharger",
                                        description: "Use your vehicle's navigation system or the Tesla app to find the nearest Supercharger station."
                                    },
                                    {
                                        step: "2",
                                        title: "Plug In",
                                        description: "Park at an available stall and plug in the connector. Charging starts automatically."
                                    },
                                    {
                                        step: "3",
                                        title: "Monitor Progress",
                                        description: "Track your charging progress on the vehicle's touchscreen or through the mobile app."
                                    },
                                    {
                                        step: "4",
                                        title: "Unplug and Go",
                                        description: "When charging is complete, simply unplug and continue your journey. Billing is automatic."
                                    }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex gap-6 bg-background p-6 rounded-lg"
                                    >
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                            <p className="text-muted-foreground">{item.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
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
                            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Find a Supercharger near you or order a home charging solution today
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Button size="lg" asChild>
                                    <Link href="/discover/find-us">
                                        <MapPin className="mr-2 h-5 w-5" />
                                        Find Superchargers
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/contact">Order Home Charger</Link>
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
