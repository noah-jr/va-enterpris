import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare, ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+1 (888) 518-3752", "Available 24/7"],
      action: "Call Now",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["Geral@vatech.pt", "comercial@vatech.pt"],
      action: "Send Email",
    },
    {
      icon: MapPin,
      title: "Headquarters",
      details: ["3500 Deer Creek Road", "Palo Alto, CA 94304"],
      action: "Get Directions",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon-Fri: 9am - 6pm", "Sat-Sun: 10am - 5pm"],
      action: "Schedule Call",
    },
  ];

  const departments = [
    {
      title: "Sales",
      description: "Questions about purchasing a Tesla vehicle or energy product",
      action: "Contact Sales",
      link: "/discover/demo-drive",
    },
    {
      title: "Service",
      description: "Schedule service or get help with your Tesla",
      action: "Schedule Service",
      link: "/discover/find-us",
    },
    {
      title: "Charging",
      description: "Questions about Supercharging or home charging",
      action: "Charging Support",
      link: "/charging",
    },
    {
      title: "Business",
      description: "Fleet, commercial, or partnership inquiries",
      action: "Business Inquiries",
      link: "/contact",
    },
  ];

  const quickLinks = [
    {
      title: "Find a Store",
      description: "Locate the nearest Tesla store or service center",
      icon: MapPin,
      link: "/discover/find-us",
    },
    {
      title: "Schedule Test Drive",
      description: "Experience Tesla firsthand",
      icon: ArrowRight,
      link: "/discover/demo-drive",
    },
    {
      title: "International",
      description: "Contact Tesla in your country",
      icon: Globe,
      link: "/discover/find-us",
    },
  ];

  return (
    <div className="relative min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2070&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl px-4"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium text-white mb-4 drop-shadow-lg">
              Contact Us
            </h1>
            <p className="text-lg sm:text-xl text-white/80 drop-shadow">
              We're here to help with any questions you may have
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 sm:py-16 bg-secondary/30">
        <div className="tesla-container px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow group">
                  <CardContent className="pt-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <info.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">{info.title}</h3>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {detail}
                      </p>
                    ))}
                    <Button variant="link" className="mt-3 p-0 h-auto">
                      {info.action}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12">
        <div className="tesla-container px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-medium mb-2">Quick Links</h2>
            <p className="text-muted-foreground">Find what you're looking for faster</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4">
            {quickLinks.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={item.link}>
                  <Card className="h-full hover:shadow-lg transition-all group hover:border-primary/50">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Departments */}
      <section className="py-12 sm:py-16 bg-secondary/20">
        <div className="tesla-container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {!formSubmitted ? (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Send us a Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Full Name *
                          </label>
                          <Input
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="h-11"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Email *
                          </label>
                          <Input
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="h-11"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Phone
                          </label>
                          <Input
                            name="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={handleChange}
                            className="h-11"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Subject *
                          </label>
                          <Input
                            name="subject"
                            placeholder="How can we help?"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="h-11"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Message *
                        </label>
                        <Textarea
                          name="message"
                          placeholder="Tell us more about your inquiry..."
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full h-12">
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg">
                  <CardContent className="py-16 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-medium mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground mb-6">
                        We'll get back to you within 24 hours.
                      </p>
                      <Button onClick={() => setFormSubmitted(false)} variant="outline">
                        Send Another Message
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Departments */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-medium mb-6">Departments</h2>
              <div className="space-y-4">
                {departments.map((dept, index) => (
                  <motion.div
                    key={dept.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={dept.link}>
                      <Card className="hover:shadow-lg transition-all group hover:border-primary/50">
                        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
                              {dept.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {dept.description}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {dept.action}
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* FAQ Link */}
              <Card className="mt-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/10 rounded-full -ml-12 -mb-12" />
                  <div className="relative">
                    <h3 className="text-xl font-medium mb-2">
                      Looking for quick answers?
                    </h3>
                    <p className="opacity-90 mb-4">
                      Check out our FAQ section for commonly asked questions.
                    </p>
                    <Button variant="secondary" className="shadow-lg">
                      Visit FAQ
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 sm:py-16">
        <div className="tesla-container px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-medium mb-2">Visit Us</h2>
            <p className="text-muted-foreground">Find Tesla locations near you</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden">
              <div className="aspect-[21/9] bg-secondary relative">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=2000&q=80"
                  alt="World Map"
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Link href="/discover/find-us">
                    <Button size="lg" className="shadow-lg">
                      <MapPin className="h-5 w-5 mr-2" />
                      Find Locations
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
