"use client";

import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Battery, Zap, Gauge, Calendar } from "lucide-react";
import Link from "next/link";

const vehicleData: Record<string, {
    name: string;
    tagline: string;
    price: string;
    image: string;
    specs: {
        range: string;
        topSpeed: string;
        acceleration: string;
        horsepower: string;
    };
    features: string[];
    gallery: string[];
}> = {
    "model-s": {
        name: "Model S",
        tagline: "Plaid - Beyond Ludicrous",
        price: "From $71,090",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=2070&q=80",
        specs: {
            range: "405 mi",
            topSpeed: "200 mph",
            acceleration: "1.99s 0-60 mph",
            horsepower: "1,020 hp"
        },
        features: [
            "Tri Motor All-Wheel Drive",
            "Carbon fiber spoiler",
            "Premium interior with heated seats",
            "17\" Cinematic Display",
            "Autopilot included",
            "Full Self-Driving Capability (optional)"
        ],
        gallery: [
            "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=2070&q=80",
            "https://images.unsplash.com/photo-1619317990207-7f0c33f11bce?auto=format&fit=crop&w=2070&q=80",
            "https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&w=2070&q=80"
        ]
    },
    "model-3": {
        name: "Model 3",
        tagline: "The Future of Driving",
        price: "From $38,990",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=2071&q=80",
        specs: {
            range: "358 mi",
            topSpeed: "162 mph",
            acceleration: "3.1s 0-60 mph",
            horsepower: "480 hp"
        },
        features: [
            "Dual Motor All-Wheel Drive",
            "15\" touchscreen display",
            "Premium audio system",
            "Glass roof",
            "Autopilot included",
            "Over-the-air updates"
        ],
        gallery: [
            "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=2071&q=80",
            "https://images.unsplash.com/photo-1561580125-028ee3bd62eb?auto=format&fit=crop&w=2070&q=80"
        ]
    },
    "model-x": {
        name: "Model X",
        tagline: "Utility Meets Performance",
        price: "From $68,590",
        image: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?auto=format&fit=crop&w=2070&q=80",
        specs: {
            range: "348 mi",
            topSpeed: "155 mph",
            acceleration: "2.5s 0-60 mph",
            horsepower: "1,020 hp"
        },
        features: [
            "Falcon Wing Doors",
            "Seating for up to 7",
            "Tri Motor All-Wheel Drive",
            "17\" Cinematic Display",
            "HEPA air filtration",
            "Towing capacity up to 5,000 lbs"
        ],
        gallery: [
            "https://images.unsplash.com/photo-1566473965997-3de9c817e938?auto=format&fit=crop&w=2070&q=80"
        ]
    },
    "model-y": {
        name: "Model Y",
        tagline: "Versatility at its Best",
        price: "From $36,490",
        image: "https://images.unsplash.com/photo-1619317190385-f07c2d4e4a07?auto=format&fit=crop&w=2071&q=80",
        specs: {
            range: "330 mi",
            topSpeed: "155 mph",
            acceleration: "3.5s 0-60 mph",
            horsepower: "480 hp"
        },
        features: [
            "Dual Motor All-Wheel Drive",
            "Seating for up to 7",
            "68 cu ft cargo space",
            "15\" touchscreen display",
            "Panoramic glass roof",
            "Autopilot included"
        ],
        gallery: [
            "https://images.unsplash.com/photo-1619317190385-f07c2d4e4a07?auto=format&fit=crop&w=2071&q=80",
            "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=2071&q=80"
        ]
    },
    "cybertruck": {
        name: "Cybertruck",
        tagline: "Better Utility Than a Truck",
        price: "From $60,990",
        image: "https://images.unsplash.com/photo-1693823842209-dbb1de43c1aa?auto=format&fit=crop&w=2070&q=80",
        specs: {
            range: "340 mi",
            topSpeed: "130 mph",
            acceleration: "2.9s 0-60 mph",
            horsepower: "845 hp"
        },
        features: [
            "Ultra-Hard 30X Cold-Rolled stainless steel",
            "Armor Glass",
            "Tri Motor All-Wheel Drive",
            "Adaptive Air Suspension",
            "Payload capacity of 3,500 lbs",
            "Towing capacity up to 14,000 lbs"
        ],
        gallery: [
            "https://images.unsplash.com/photo-1693823842209-dbb1de43c1aa?auto=format&fit=crop&w=2070&q=80"
        ]
    }
};

export default function VehicleDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const vehicle = vehicleData[slug];

    if (!vehicle) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Vehicle Not Found</h1>
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
                        style={{ backgroundImage: `url(${vehicle.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
                    <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h1 className="text-5xl md:text-7xl font-bold mb-4">{vehicle.name}</h1>
                            <p className="text-xl md:text-2xl mb-8">{vehicle.tagline}</p>
                            <p className="text-lg mb-8">{vehicle.price}</p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Button size="lg" asChild>
                                    <Link href={`/vehicles/${slug}#order`}>Order Now</Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/discover/demo-drive">Schedule Test Drive</Link>
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
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <Battery className="h-12 w-12 mx-auto mb-4 text-primary" />
                                <h3 className="text-3xl font-bold mb-2">{vehicle.specs.range}</h3>
                                <p className="text-muted-foreground">Range (EPA est.)</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-center"
                            >
                                <Gauge className="h-12 w-12 mx-auto mb-4 text-primary" />
                                <h3 className="text-3xl font-bold mb-2">{vehicle.specs.topSpeed}</h3>
                                <p className="text-muted-foreground">Top Speed</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-center"
                            >
                                <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
                                <h3 className="text-3xl font-bold mb-2">{vehicle.specs.acceleration}</h3>
                                <p className="text-muted-foreground">Acceleration</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="text-center"
                            >
                                <Gauge className="h-12 w-12 mx-auto mb-4 text-primary" />
                                <h3 className="text-3xl font-bold mb-2">{vehicle.specs.horsepower}</h3>
                                <p className="text-muted-foreground">Peak Power</p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-secondary/30">
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
                            {vehicle.features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-background p-6 rounded-lg"
                                >
                                    <p className="text-lg">{feature}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Gallery Section */}
                <section className="py-20 bg-background">
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
                            {vehicle.gallery.map((image, index) => (
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
                                        alt={`${vehicle.name} ${index + 1}`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section id="order" className="py-20 bg-secondary/30">
                    <div className="tesla-container px-4 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold mb-6">Ready to Order?</h2>
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Experience the future of driving. Schedule a test drive or order your {vehicle.name} today.
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Button size="lg" asChild>
                                    <Link href="/discover/demo-drive">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Schedule Test Drive
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/contact">Contact Us</Link>
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
