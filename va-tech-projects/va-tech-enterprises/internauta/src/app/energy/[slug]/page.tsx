"use client";

import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Battery, Zap, Sun, Shield, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";

const energyProducts: Record<string, {
    name: string;
    tagline: string;
    price: string;
    image: string;
    heroImage: string;
    specs: {
        capacity?: string;
        power?: string;
        efficiency?: string;
        warranty?: string;
    };
    features: string[];
    benefits: Array<{
        icon: any;
        title: string;
        description: string;
    }>;
    gallery: string[];
}> = {
    "solar-roof": {
        name: "Solar Roof",
        tagline: "Beautiful Solar, Without Compromise",
        price: "From $21.85 per sq ft",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2070&q=80",
        heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2070&q=80",
        specs: {
            power: "71.67 W per tile",
            efficiency: "25% efficiency",
            warranty: "25-year warranty"
        },
        features: [
            "Durable tempered glass tiles",
            "Integrated solar and non-solar tiles",
            "Weather-resistant design",
            "Powerwall integration",
            "Mobile app monitoring",
            "Professional installation included"
        ],
        benefits: [
            {
                icon: Sun,
                title: "Maximum Energy Production",
                description: "Generate clean energy while maintaining the aesthetics of your home"
            },
            {
                icon: Shield,
                title: "Superior Durability",
                description: "Tempered glass tiles are three times stronger than standard roofing tiles"
            },
            {
                icon: DollarSign,
                title: "Lower Energy Bills",
                description: "Reduce or eliminate your electricity bill with solar energy"
            },
            {
                icon: Battery,
                title: "Energy Independence",
                description: "Store excess energy with Powerwall for use anytime"
            }
        ],
        gallery: [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2070&q=80",
            "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2070&q=80"
        ]
    },
    "solar-panels": {
        name: "Solar Panels",
        tagline: "Lowest Cost Solar Panels in America",
        price: "From $8,200",
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2070&q=80",
        heroImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2070&q=80",
        specs: {
            power: "425 W per panel",
            efficiency: "19.3% efficiency",
            warranty: "25-year warranty"
        },
        features: [
            "High-efficiency monocrystalline cells",
            "Sleek, low-profile design",
            "Integrated racking system",
            "Powerwall compatible",
            "Real-time monitoring",
            "Professional installation"
        ],
        benefits: [
            {
                icon: DollarSign,
                title: "Best Value",
                description: "Industry-leading price per watt for maximum savings"
            },
            {
                icon: Sun,
                title: "High Efficiency",
                description: "Convert more sunlight into electricity with premium panels"
            },
            {
                icon: Shield,
                title: "Long-lasting",
                description: "25-year warranty ensures decades of clean energy"
            },
            {
                icon: Zap,
                title: "Smart Integration",
                description: "Seamlessly integrates with Powerwall and your home"
            }
        ],
        gallery: [
            "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2070&q=80",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2070&q=80"
        ]
    },
    "powerwall": {
        name: "Powerwall",
        tagline: "Store Energy for Anytime Use",
        price: "From $11,500",
        image: "https://images.unsplash.com/photo-1584276433295-4b49a252e5ee?auto=format&fit=crop&w=2070&q=80",
        heroImage: "https://images.unsplash.com/photo-1584276433295-4b49a252e5ee?auto=format&fit=crop&w=2070&q=80",
        specs: {
            capacity: "13.5 kWh",
            power: "5 kW continuous / 7 kW peak",
            efficiency: "90% round-trip efficiency",
            warranty: "10-year warranty"
        },
        features: [
            "Compact and stackable design",
            "Seamless backup power",
            "Solar integration",
            "Mobile app control",
            "Time-based control",
            "Storm Watch mode"
        ],
        benefits: [
            {
                icon: Battery,
                title: "Energy Storage",
                description: "Store solar energy for use during outages or at night"
            },
            {
                icon: Shield,
                title: "Backup Protection",
                description: "Keep your home powered during grid outages"
            },
            {
                icon: DollarSign,
                title: "Save Money",
                description: "Use stored energy during peak hours to reduce costs"
            },
            {
                icon: Zap,
                title: "Smart Control",
                description: "Optimize energy usage with intelligent software"
            }
        ],
        gallery: [
            "https://images.unsplash.com/photo-1584276433295-4b49a252e5ee?auto=format&fit=crop&w=2070&q=80"
        ]
    },
    "megapack": {
        name: "Megapack",
        tagline: "Utility-Scale Energy Storage",
        price: "Contact for pricing",
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=2070&q=80",
        heroImage: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=2070&q=80",
        specs: {
            capacity: "3.9 MWh",
            power: "1.9 MW AC",
            efficiency: "Up to 93% round-trip efficiency",
            warranty: "Commercial warranty available"
        },
        features: [
            "Massive energy storage capacity",
            "Rapid deployment",
            "Scalable solution",
            "Grid stabilization",
            "Renewable integration",
            "Advanced monitoring and control"
        ],
        benefits: [
            {
                icon: Battery,
                title: "Massive Scale",
                description: "Store gigawatt-hours of energy for utility-scale applications"
            },
            {
                icon: Zap,
                title: "Grid Support",
                description: "Stabilize the grid and enable renewable energy integration"
            },
            {
                icon: DollarSign,
                title: "Cost Effective",
                description: "Reduce energy costs and maximize renewable energy value"
            },
            {
                icon: Shield,
                title: "Reliable",
                description: "Proven technology with high efficiency and long lifespan"
            }
        ],
        gallery: [
            "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=2070&q=80"
        ]
    }
};

export default function EnergyDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const product = energyProducts[slug];

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
                    <Link href="/">
                        <Button>Return Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative h-screen">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${product.heroImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
                    <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h1 className="text-5xl md:text-7xl font-bold mb-4">{product.name}</h1>
                            <p className="text-xl md:text-2xl mb-8">{product.tagline}</p>
                            <p className="text-lg mb-8">{product.price}</p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Button size="lg" asChild>
                                    <Link href="/contact">Order Now</Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/contact">Get a Quote</Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Specs Section */}
                <section className="py-20 bg-background">
                    <div className="tesla-container px-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-bold text-center mb-12"
                        >
                            Specifications
                        </motion.h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {Object.entries(product.specs).map(([key, value], index) => (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="mb-4">
                                        {key === 'capacity' && <Battery className="h-12 w-12 mx-auto text-primary" />}
                                        {key === 'power' && <Zap className="h-12 w-12 mx-auto text-primary" />}
                                        {key === 'efficiency' && <Sun className="h-12 w-12 mx-auto text-primary" />}
                                        {key === 'warranty' && <Shield className="h-12 w-12 mx-auto text-primary" />}
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold mb-2">{value}</h3>
                                    <p className="text-muted-foreground capitalize">{key.replace('-', ' ')}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-20 bg-secondary/30">
                    <div className="tesla-container px-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-bold text-center mb-12"
                        >
                            Key Benefits
                        </motion.h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                            {product.benefits.map((benefit, index) => (
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

                {/* Features Section */}
                <section className="py-20 bg-background">
                    <div className="tesla-container px-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-bold text-center mb-12"
                        >
                            Features
                        </motion.h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {product.features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-secondary/30 p-6 rounded-lg"
                                >
                                    <p className="text-lg">{feature}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Gallery Section */}
                <section className="py-20 bg-secondary/30">
                    <div className="tesla-container px-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-bold text-center mb-12"
                        >
                            Gallery
                        </motion.h2>
                        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                            {product.gallery.map((image, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative aspect-video rounded-lg overflow-hidden"
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} ${index + 1}`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
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
                            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Transform your energy future with {product.name}. Contact us today for a personalized quote.
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Button size="lg" asChild>
                                    <Link href="/contact">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Get a Quote
                                    </Link>
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
