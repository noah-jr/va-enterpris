"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Calendar, MapPin, Car, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const vehicles = [
    { id: "model-s", name: "Model S", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80" },
    { id: "model-3", name: "Model 3", image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80" },
    { id: "model-x", name: "Model X", image: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?auto=format&fit=crop&w=800&q=80" },
    { id: "model-y", name: "Model Y", image: "https://images.unsplash.com/photo-1619317190385-f07c2d4e4a07?auto=format&fit=crop&w=800&q=80" },
    { id: "cybertruck", name: "Cybertruck", image: "https://images.unsplash.com/photo-1693823842209-dbb1de43c1aa?auto=format&fit=crop&w=800&q=80" }
];

const locations = [
    "Lisboa - Tesla Store",
    "Porto - Tesla Service Center",
    "Faro - Tesla Showroom",
    "Coimbra - Tesla Experience Center",
    "Braga - Tesla Store"
];

export default function DemoDrivePage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        vehicle: "",
        location: "",
        date: "",
        time: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Test drive scheduled:", formData);
        alert("Your test drive has been scheduled! We'll send you a confirmation email shortly.");
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            vehicle: "",
            location: "",
            date: "",
            time: "",
            message: ""
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="relative">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative h-[60vh] min-h-[500px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: "url(https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=2070&q=80)"
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                    <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h1 className="text-5xl md:text-7xl font-bold mb-4">Schedule a Test Drive</h1>
                            <p className="text-xl md:text-2xl max-w-2xl mx-auto">
                                Experience the future of driving. Book your test drive today.
                            </p>
                        </motion.div>
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
                            <h2 className="text-4xl font-bold mb-4">Why Test Drive a Tesla?</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Experience the difference that makes Tesla vehicles extraordinary
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                            {[
                                {
                                    icon: Car,
                                    title: "Instant Acceleration",
                                    description: "Feel the thrill of instant torque and seamless power delivery"
                                },
                                {
                                    icon: CheckCircle,
                                    title: "Advanced Technology",
                                    description: "Experience Autopilot and the latest driver assistance features"
                                },
                                {
                                    icon: MapPin,
                                    title: "Convenient Locations",
                                    description: "Test drive at a location near you with flexible scheduling"
                                },
                                {
                                    icon: Calendar,
                                    title: "No Obligation",
                                    description: "Try before you buy with no pressure or commitment"
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

                {/* Booking Form */}
                <section className="py-20 bg-secondary/30">
                    <div className="tesla-container px-4">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center mb-12"
                            >
                                <h2 className="text-4xl font-bold mb-4">Book Your Test Drive</h2>
                                <p className="text-xl text-muted-foreground">
                                    Fill out the form below and we'll confirm your appointment
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-background rounded-2xl p-8 md:p-12"
                            >
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Personal Information */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="+351 123 456 789"
                                            />
                                        </div>
                                    </div>

                                    {/* Vehicle Selection */}
                                    <div>
                                        <label className="block text-sm font-medium mb-4">
                                            Select Vehicle *
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {vehicles.map((vehicle) => (
                                                <label
                                                    key={vehicle.id}
                                                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${formData.vehicle === vehicle.id
                                                            ? "border-primary ring-2 ring-primary/20"
                                                            : "border-border hover:border-primary/50"
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="vehicle"
                                                        value={vehicle.id}
                                                        checked={formData.vehicle === vehicle.id}
                                                        onChange={handleChange}
                                                        required
                                                        className="sr-only"
                                                    />
                                                    <div className="aspect-video relative">
                                                        <img
                                                            src={vehicle.image}
                                                            alt={vehicle.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="p-2 text-center text-sm font-medium">
                                                        {vehicle.name}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Location & Date */}
                                    <div>
                                        <label htmlFor="location" className="block text-sm font-medium mb-2">
                                            Preferred Location *
                                        </label>
                                        <select
                                            id="location"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Select a location</option>
                                            {locations.map((location) => (
                                                <option key={location} value={location}>
                                                    {location}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="date" className="block text-sm font-medium mb-2">
                                                Preferred Date *
                                            </label>
                                            <input
                                                type="date"
                                                id="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleChange}
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="time" className="block text-sm font-medium mb-2">
                                                Preferred Time *
                                            </label>
                                            <select
                                                id="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="">Select a time</option>
                                                <option value="09:00">09:00 AM</option>
                                                <option value="10:00">10:00 AM</option>
                                                <option value="11:00">11:00 AM</option>
                                                <option value="12:00">12:00 PM</option>
                                                <option value="14:00">02:00 PM</option>
                                                <option value="15:00">03:00 PM</option>
                                                <option value="16:00">04:00 PM</option>
                                                <option value="17:00">05:00 PM</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium mb-2">
                                            Additional Notes (Optional)
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                            placeholder="Any special requests or questions?"
                                        />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Schedule Test Drive
                                    </Button>

                                    <p className="text-sm text-muted-foreground text-center">
                                        By scheduling a test drive, you agree to our terms and conditions.
                                        We'll contact you to confirm your appointment.
                                    </p>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* What to Expect */}
                <section className="py-20 bg-background">
                    <div className="tesla-container px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto"
                        >
                            <h2 className="text-4xl font-bold text-center mb-12">What to Expect</h2>
                            <div className="space-y-8">
                                {[
                                    {
                                        step: "1",
                                        title: "Confirmation",
                                        description: "We'll confirm your appointment via email and phone within 24 hours."
                                    },
                                    {
                                        step: "2",
                                        title: "Arrival",
                                        description: "Arrive at your selected location 10 minutes early. Our team will greet you and verify your driver's license."
                                    },
                                    {
                                        step: "3",
                                        title: "Vehicle Overview",
                                        description: "Learn about the vehicle's features and capabilities from our product specialist."
                                    },
                                    {
                                        step: "4",
                                        title: "Test Drive",
                                        description: "Experience the vehicle on a pre-planned route that showcases its performance and technology."
                                    },
                                    {
                                        step: "5",
                                        title: "Q&A",
                                        description: "Ask any questions and discuss financing options, if interested."
                                    }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex gap-6"
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
            </main>
            <Footer />
        </div>
    );
}
