"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: 'Mensagem enviada com sucesso! Entraremos em contacto brevemente.' });
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                setStatus({ type: 'error', message: data.message || 'Erro ao enviar mensagem.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Erro de conexão. Tente novamente mais tarde.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="relative bg-background text-foreground min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-muted/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background" />

                <div className="relative tesla-container text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                            Contacte-nos
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Estamos aqui para ajudar o seu negócio a crescer. Entre em contacto connosco para saber mais sobre as nossas soluções.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-20">
                <div className="tesla-container">
                    <div className="grid lg:grid-cols-3 gap-12">

                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-1 space-y-8"
                        >
                            {/* ... Info components ... (mantidos) */}
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Informações</h2>
                                <p className="text-muted-foreground mb-8">
                                    Tem alguma dúvida ou gostaria de solicitar um orçamento? Utilize os nossos canais diretos ou preencha o formulário.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <Mail className="h-6 w-6 text-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Email</h3>
                                        <a href="mailto:vatechcode@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors">
                                            vatechcode@gmail.com
                                        </a>
                                        <p className="text-xs text-muted-foreground/60 mt-1">Resposta em até 24h</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <Phone className="h-6 w-6 text-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Telefone</h3>
                                        <a href="tel:+244934819272" className="text-muted-foreground hover:text-foreground transition-colors">
                                            +244 934 819 272
                                        </a>
                                        <p className="text-xs text-muted-foreground/60 mt-1">Seg-Sex, 9h às 18h</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <MapPin className="h-6 w-6 text-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Escritório</h3>
                                        <p className="text-muted-foreground">
                                            Kikagil, Luanda, Angola
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">Visitas por marcação</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="lg:col-span-2 bg-card rounded-3xl shadow-lg border border-border p-8 md:p-12"
                        >
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <MessageSquare className="h-6 w-6" />
                                Envie-nos uma Mensagem
                            </h2>

                            {status && (
                                <div className={`mb-6 p-4 rounded-lg ${status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                    {status.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">
                                            Nome Completo
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={loading}
                                            placeholder="Ex: João Silva"
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={loading}
                                            placeholder="Ex: joao@empresa.com"
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium">
                                        Assunto
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                                    >
                                        <option value="">Selecione um assunto</option>
                                        <option value="Serviços">Orçamento para Serviços</option>
                                        <option value="Parceria">Proposta de Parceria</option>
                                        <option value="Suporte">Suporte Técnico</option>
                                        <option value="Outro">Outro Assunto</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">
                                        Mensagem
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="Descreva como podemos ajudar..."
                                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                <Button type="submit" size="lg" className="w-full h-12 text-lg" disabled={loading}>
                                    {loading ? 'Enviando...' : 'Enviar Mensagem'}
                                    {!loading && <Send className="ml-2 h-5 w-5" />}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-0 h-[400px] w-full bg-muted/20 relative">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126136.75713962643!2d13.234320499999999!3d-8.8383333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a51f15cdc8d2c7d%3A0x850c1c5c5b29db52!2sLuanda%2C%20Angola!5e0!3m2!1sen!2sao!4v1710000000000!5m2!1sen!2sao"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: "grayscale(100%) invert(0%) contrast(80%)" }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa de Localização"
                />
            </section>

            <Footer />
        </div>
    );
}
