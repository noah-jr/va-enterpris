import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Car, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DemoDrive = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const vehicles = [
    { id: "model-s", name: "Model S", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80" },
    { id: "model-3", name: "Model 3", image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400&q=80" },
    { id: "model-x", name: "Model X", image: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?auto=format&fit=crop&w=400&q=80" },
    { id: "model-y", name: "Model Y", image: "https://images.unsplash.com/photo-1619317190385-f07c2d4e4a07?auto=format&fit=crop&w=400&q=80" },
    { id: "cybertruck", name: "Cybertruck", image: "https://images.unsplash.com/photo-1693823842209-dbb1de43c1aa?auto=format&fit=crop&w=400&q=80" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="relative">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&w=2070&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-medium text-white text-center"
          >
            Schedule a Demo Drive
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-xl text-white/80 text-center max-w-2xl px-6"
          >
            Experience the future of driving. Book your test drive today.
          </motion.p>
        </div>
      </section>

      {/* Vehicle Selection */}
      <section className="py-16 bg-background">
        <div className="tesla-container px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-medium text-center mb-12"
          >
            Select Your Vehicle
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedVehicle(vehicle.id)}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedVehicle === vehicle.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/30"
                }`}
              >
                <div className="aspect-video">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 text-center bg-secondary">
                  <span className="font-medium">{vehicle.name}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Booking Form */}
          {!formSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Book Your Demo Drive
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          First Name
                        </label>
                        <Input placeholder="John" required />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Last Name
                        </label>
                        <Input placeholder="Doe" required />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Email
                      </label>
                      <Input type="email" placeholder="john@example.com" required />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Phone
                      </label>
                      <Input type="tel" placeholder="+1 (555) 000-0000" required />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Preferred Location
                      </label>
                      <Input placeholder="Enter your city" required />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Preferred Date
                        </label>
                        <Input type="date" required />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Preferred Time
                        </label>
                        <Input type="time" required />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full mt-6"
                      disabled={!selectedVehicle}
                    >
                      Schedule Demo Drive
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-medium mb-2">Demo Drive Scheduled!</h3>
              <p className="text-muted-foreground mb-6">
                We'll send you a confirmation email with all the details.
              </p>
              <Button onClick={() => setFormSubmitted(false)} variant="outline">
                Schedule Another
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-16 bg-secondary/50">
        <div className="tesla-container px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Choose Your Model</h3>
              <p className="text-muted-foreground">
                Experience any Tesla model in our lineup
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">30-Minute Experience</h3>
              <p className="text-muted-foreground">
                Enough time to explore all features
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Multiple Locations</h3>
              <p className="text-muted-foreground">
                Find a Tesla store near you
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DemoDrive;
