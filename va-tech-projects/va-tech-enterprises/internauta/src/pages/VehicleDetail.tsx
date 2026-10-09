import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Gauge, Timer, BatteryCharging } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageCarousel from "@/components/ImageCarousel";
import { vehiclesData } from "@/data/products";
import { useState } from "react";

const VehicleDetail = () => {
  const params = useParams();
  const vehicleId = params?.vehicleId as string;
  const vehicle = vehicleId ? vehiclesData[vehicleId] : null;
  const [selectedColor, setSelectedColor] = useState(0);

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Vehicle not found</h1>
          <Link href="/" className="text-primary underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Header />

      {/* Hero Section with Carousel */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <ImageCarousel slides={vehicle.heroImages} />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-between pt-32 pb-20 z-10">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-medium text-white drop-shadow-lg"
            >
              {vehicle.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-xl text-white/80"
            >
              {vehicle.tagline}
            </motion.p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-6">
            <Button
              asChild
              size="lg"
              className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-sm h-12"
            >
              <a href="#order">Order Now</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="flex-1 bg-background/80 backdrop-blur-sm hover:bg-background rounded-sm h-12 border-0"
            >
              <Link href="/discover/demo-drive">Demo Drive</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Specs Section */}
      <section className="py-20 bg-secondary/50">
        <div className="tesla-container px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-medium text-center mb-12"
          >
            {vehicle.name} Specs
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <BatteryCharging className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl md:text-4xl font-medium">{vehicle.specs.range}</div>
              <div className="text-sm text-muted-foreground mt-1">Range (EPA est.)</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <Timer className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl md:text-4xl font-medium">{vehicle.specs.acceleration}</div>
              <div className="text-sm text-muted-foreground mt-1">0-60 mph</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <Gauge className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl md:text-4xl font-medium">{vehicle.specs.topSpeed}</div>
              <div className="text-sm text-muted-foreground mt-1">Top Speed</div>
            </motion.div>

            {vehicle.specs.peakPower && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <Zap className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl md:text-4xl font-medium">{vehicle.specs.peakPower}</div>
                <div className="text-sm text-muted-foreground mt-1">Peak Power</div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Color Selector */}
      {vehicle.colors.length > 0 && (
        <section className="py-20">
          <div className="tesla-container px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-medium text-center mb-4"
            >
              Choose Your Color
            </motion.h2>
            <p className="text-center text-muted-foreground mb-12">
              {vehicle.colors[selectedColor].name}
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="aspect-video rounded-lg overflow-hidden mb-8">
                <img
                  src={vehicle.colors[selectedColor].image}
                  alt={vehicle.colors[selectedColor].name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex justify-center gap-4">
                {vehicle.colors.map((color, index) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(index)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === index
                      ? "border-primary scale-110"
                      : "border-transparent hover:scale-105"
                      }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {vehicle.features.length > 0 && (
        <section className="py-20 bg-secondary/50">
          <div className="tesla-container px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-medium text-center mb-12"
            >
              Features
            </motion.h2>

            <div className="space-y-20">
              {vehicle.features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                    } gap-8 items-center`}
                >
                  <div className="flex-1">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-2xl font-medium mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground text-lg">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Order Section */}
      <section id="order" className="py-20">
        <div className="tesla-container px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-medium mb-4"
          >
            Order Your {vehicle.name}
          </motion.h2>
          <p className="text-xl text-muted-foreground mb-8">{vehicle.price}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button size="lg" className="flex-1 h-12">
              Order Now
            </Button>
            <Button asChild size="lg" variant="outline" className="flex-1 h-12">
              <Link href="/">Compare Models</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VehicleDetail;
