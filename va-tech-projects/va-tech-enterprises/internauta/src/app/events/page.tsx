"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const events = [
    {
        id: 1,
        title: "Model Y Launch Event",
        description: "Join us for the official launch of the new Model Y with exclusive first looks and test drives.",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2070&q=80",
        date: "2024-02-15",
        time: "18:00 - 21:00",
        location: "Lisboa, Portugal",
        venue: "Tesla Store Lisboa",
        capacity: "200 attendees",
        available: 50,
        category: "Product Launch"
    },
    {
        id: 2,
        title: "Supercharger Network Expansion",
        description: "Discover the latest additions to our Supercharger network and learn about upcoming locations.",
        image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=2070&q=80",
        date: "2024-02-20",
        time: "14:00 - 17:00",
        location: "Porto, Portugal",
        venue: "Tesla Service Center Porto",
        capacity: "100 attendees",
        available: 80,
        category: "Infrastructure"
    },
    {
        id: 3,
        title: "Energy Solutions Workshop",
        description: "Learn about Tesla's complete energy ecosystem including Solar Roof, Powerwall, and Megapack.",
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2070&q=80",
        date: "2024-03-10",
        time: "10:00 - 13:00",
        location: "Faro, Portugal",
        venue: "Faro Convention Center",
        capacity: "150 attendees",
        available: 120,
        category: "Energy"
    },
    {
        id: 4,
        title: "Autopilot & FSD Demonstration",
        description: "Experience the latest Autopilot features and Full Self-Driving capabilities in a controlled environment.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2070&q=80",
        date: "2024-03-25",
        time: "09:00 - 18:00",
        location: "Coimbra, Portugal",
        venue: "Coimbra Test Track",
        capacity: "300 attendees",
        available: 150,
        category: "Technology"
    },
    {
        id: 5,
        title: "Tesla Owners Meetup",
        description: "Connect with fellow Tesla owners, share experiences, and participate in exclusive activities.",
        image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=2070&q=80",
        date: "2024-04-05",
        time: "15:00 - 19:00",
        location: "Braga, Portugal",
        venue: "Braga City Park",
        capacity: "500 attendees",
        available: 320,
        category: "Community"
    },
    {
        id: 6,
        title: "Sustainable Future Summit",
        description: "Join industry leaders discussing the future of sustainable transportation and energy.",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2070&q=80",
        date: "2024-04-20",
        time: "09:00 - 17:00",
        location: "Lisboa, Portugal",
        venue: "Centro de Congressos de Lisboa",
        capacity: "1000 attendees",
        available: 450,
        category: "Conference"
    }
];

export default function EventsPage() {
    return (
        <div className="relative">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative h-[60vh] min-h-[500px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: "url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2070&q=80)"
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                    <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h1 className="text-5xl md:text-7xl font-bold mb-4">Events</h1>
                            <p className="text-xl md:text-2xl max-w-2xl mx-auto">
                                Join us at upcoming events and experience the future of sustainable transportation
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Events Grid */}
                <section className="py-20 bg-background">
                    <div className="tesla-container px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl font-bold mb-4">Upcoming Events</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Discover, learn, and connect at our exclusive events
                            </p>
                        </motion.div>

                        <div className="grid lg:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
                            {events.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-secondary/30 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    <div className="relative aspect-video overflow-hidden">
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <span className="absolute top-4 left-4 px-4 py-2 bg-primary/90 backdrop-blur-sm rounded-full text-sm text-white font-medium">
                                            {event.category}
                                        </span>
                                    </div>
                                    <div className="p-6 md:p-8">
                                        <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                                            {event.title}
                                        </h3>
                                        <p className="text-muted-foreground mb-6">
                                            {event.description}
                                        </p>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span>
                                                    {new Date(event.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span>{event.time}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span>{event.venue}, {event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Users className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span>{event.capacity} • {event.available} spots available</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button className="flex-1" asChild>
                                                <Link href="/contact">Register Now</Link>
                                            </Button>
                                            <Button variant="outline" asChild>
                                                <Link href="/contact">Learn More</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-secondary/30">
                    <div className="tesla-container px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-3xl mx-auto text-center"
                        >
                            <h2 className="text-4xl font-bold mb-6">Don't Miss Out</h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                Subscribe to our newsletter to receive updates about upcoming events and exclusive invitations
                            </p>
                            <div className="flex gap-4 max-w-md mx-auto flex-col sm:flex-row">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-3 rounded-lg border border-input bg-background"
                                />
                                <Button size="lg">Subscribe</Button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
