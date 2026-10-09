"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Navigation, Store, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const locations = [
    {
        id: 1,
        name: "Tesla Store Lisboa",
        type: "Store & Service",
        address: "Avenida da Liberdade 123, 1250-096 Lisboa",
        phone: "+351 21 123 4567",
        hours: "Mon-Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 6:00 PM",
        services: ["Sales", "Service", "Test Drives", "Supercharger"],
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
        coordinates: { lat: 38.7223, lng: -9.1450 }
    },
    {
        id: 2,
        name: "Tesla Service Center Porto",
        type: "Service Center",
        address: "Rua de Santa Catarina 456, 4000-442 Porto",
        phone: "+351 22 234 5678",
        hours: "Mon-Fri: 9:00 AM - 6:00 PM, Sat: 10:00 AM - 4:00 PM",
        services: ["Service", "Parts", "Supercharger"],
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
        coordinates: { lat: 41.1579, lng: -8.6291 }
    },
    {
        id: 3,
        name: "Tesla Showroom Faro",
        type: "Showroom",
        address: "Avenida 5 de Outubro 789, 8000-076 Faro",
        phone: "+351 28 345 6789",
        hours: "Mon-Sat: 10:00 AM - 7:00 PM, Sun: Closed",
        services: ["Sales", "Test Drives"],
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
        coordinates: { lat: 37.0194, lng: -7.9304 }
    },
    {
        id: 4,
        name: "Tesla Experience Center Coimbra",
        type: "Experience Center",
        address: "Praça da República 321, 3000-343 Coimbra",
        phone: "+351 23 456 7890",
        hours: "Tue-Sun: 11:00 AM - 7:00 PM, Mon: Closed",
        services: ["Sales", "Test Drives", "Events"],
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
        coordinates: { lat: 40.2033, lng: -8.4103 }
    },
    {
        id: 5,
        name: "Tesla Store Braga",
        type: "Store",
        address: "Avenida Central 654, 4710-229 Braga",
        phone: "+351 25 567 8901",
        hours: "Mon-Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 6:00 PM",
        services: ["Sales", "Test Drives", "Supercharger"],
        image: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=800&q=80",
        coordinates: { lat: 41.5454, lng: -8.4265 }
    }
];

const serviceIcons: Record<string, any> = {
    "Sales": Store,
    "Service": Wrench,
    "Test Drives": Navigation,
    "Supercharger": Zap,
    "Parts": Wrench,
    "Events": Store
};

export default function FindUsPage() {
    return (
        <div className="relative">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative h-[50vh] min-h-[400px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: "url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2070&q=80)"
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                    <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h1 className="text-5xl md:text-7xl font-bold mb-4">Find Us</h1>
                            <p className="text-xl md:text-2xl max-w-2xl mx-auto">
                                Visit our stores, service centers, and Supercharger locations
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Map Section */}
                <section className="py-20 bg-background">
                    <div className="tesla-container px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-6xl mx-auto"
                        >
                            <div className="aspect-video rounded-2xl overflow-hidden bg-secondary/30 mb-12">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3112.8449!2d-9.1450!3d38.7223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDQzJzIwLjMiTiA5wrAwOCc0Mi4wIlc!5e0!3m2!1sen!2spt!4v1234567890"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>

                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold mb-4">Our Locations</h2>
                                <p className="text-xl text-muted-foreground">
                                    Find a Tesla location near you
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Locations Grid */}
                <section className="py-20 bg-secondary/30">
                    <div className="tesla-container px-4">
                        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            {locations.map((location, index) => (
                                <motion.div
                                    key={location.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-background rounded-2xl overflow-hidden"
                                >
                                    <div className="relative aspect-video">
                                        <img
                                            src={location.image}
                                            alt={location.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <span className="absolute top-4 left-4 px-4 py-2 bg-primary/90 backdrop-blur-sm rounded-full text-sm text-white font-medium">
                                            {location.type}
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold mb-4">{location.name}</h3>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{location.address}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                                                <a href={`tel:${location.phone}`} className="text-sm hover:text-primary transition-colors">
                                                    {location.phone}
                                                </a>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{location.hours}</span>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <h4 className="font-semibold mb-3">Services Available:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {location.services.map((service) => {
                                                    const Icon = serviceIcons[service] || Store;
                                                    return (
                                                        <span
                                                            key={service}
                                                            className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-sm"
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                            {service}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button className="flex-1" asChild>
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Navigation className="mr-2 h-4 w-4" />
                                                    Get Directions
                                                </a>
                                            </Button>
                                            <Button variant="outline" asChild>
                                                <Link href="/contact">Contact</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Services Overview */}
                <section className="py-20 bg-background">
                    <div className="tesla-container px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl font-bold mb-4">What We Offer</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Comprehensive services at our locations
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                            {[
                                {
                                    icon: Store,
                                    title: "Sales & Showrooms",
                                    description: "Explore our full range of vehicles and configure your perfect Tesla"
                                },
                                {
                                    icon: Navigation,
                                    title: "Test Drives",
                                    description: "Experience the performance and technology firsthand with a test drive"
                                },
                                {
                                    icon: Wrench,
                                    title: "Service Centers",
                                    description: "Expert maintenance and repairs from Tesla-certified technicians"
                                },
                                {
                                    icon: Zap,
                                    title: "Superchargers",
                                    description: "Fast charging available at select locations for your convenience"
                                }
                            ].map((service, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                        <service.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                                    <p className="text-muted-foreground">{service.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-secondary/30">
                    <div className="tesla-container px-4 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold mb-6">Visit Us Today</h2>
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Stop by any of our locations to learn more about Tesla vehicles and services
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Button size="lg" asChild>
                                    <Link href="/discover/demo-drive">Schedule Test Drive</Link>
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
