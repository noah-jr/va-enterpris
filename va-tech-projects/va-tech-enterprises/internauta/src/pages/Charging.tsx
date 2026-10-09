import { motion } from "framer-motion";
import { MapPin, Zap, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Charging = () => {
  const chargingOptions = [
    {
      icon: Zap,
      title: "Supercharger",
      description: "Up to 200 miles in 15 minutes",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80",
    },
    {
      icon: MapPin,
      title: "Destination Charging",
      description: "Charge while you shop, dine, or stay",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=1200&q=80",
    },
    {
      icon: Clock,
      title: "Home Charging",
      description: "Wake up to a full charge every day",
      image: "https://images.unsplash.com/photo-1619317490533-fa8c9ef7f9bb?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <div className="relative">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=2070&q=80)",
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-between pt-32 pb-20">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-medium text-white drop-shadow-lg"
            >
              Charging
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-xl text-white/80"
            >
              Go Anywhere with the World's Largest Fast-Charging Network
            </motion.p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-6">
            <Button
              size="lg"
              className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-sm h-12"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Find a Charger
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 bg-background/80 backdrop-blur-sm hover:bg-background rounded-sm h-12 border-0"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Charging Options */}
      <section className="py-20">
        <div className="tesla-container px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-medium text-center mb-12"
          >
            Charging Options
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {chargingOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <img
                    src={option.image}
                    alt={option.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <option.icon className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-medium">{option.title}</h3>
                </div>
                <p className="text-muted-foreground">{option.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary/50">
        <div className="tesla-container px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-medium">50,000+</div>
              <div className="text-muted-foreground mt-2">Superchargers Worldwide</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl md:text-5xl font-medium">15 min</div>
              <div className="text-muted-foreground mt-2">Up to 200 miles of range</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl md:text-5xl font-medium">24/7</div>
              <div className="text-muted-foreground mt-2">Available anytime</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-4xl md:text-5xl font-medium">40+</div>
              <div className="text-muted-foreground mt-2">Countries</div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Charging;
