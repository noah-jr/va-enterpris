import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Navigation, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const FindUs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const locations = [
    {
      id: 1,
      name: "Tesla Store - Downtown",
      type: "store",
      address: "123 Main Street, New York, NY 10001",
      phone: "+1 (555) 123-4567",
      hours: "Mon-Sat: 10am-8pm, Sun: 11am-6pm",
      image: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?auto=format&fit=crop&w=600&q=80",
      services: ["Sales", "Test Drives", "Delivery"],
    },
    {
      id: 2,
      name: "Tesla Service Center",
      type: "service",
      address: "456 Tech Boulevard, San Francisco, CA 94102",
      phone: "+1 (555) 234-5678",
      hours: "Mon-Fri: 8am-6pm, Sat: 9am-4pm",
      image: "https://images.unsplash.com/photo-1619317990207-7f0c33f11bce?auto=format&fit=crop&w=600&q=80",
      services: ["Repairs", "Maintenance", "Parts"],
    },
    {
      id: 3,
      name: "Tesla Supercharger - Highway Plaza",
      type: "supercharger",
      address: "789 Highway 101, Los Angeles, CA 90001",
      phone: null,
      hours: "24/7",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80",
      services: ["V3 Supercharging", "250kW"],
    },
    {
      id: 4,
      name: "Tesla Store - Mall Location",
      type: "store",
      address: "321 Shopping Center Dr, Chicago, IL 60601",
      phone: "+1 (555) 345-6789",
      hours: "Mon-Sat: 10am-9pm, Sun: 12pm-6pm",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80",
      services: ["Sales", "Test Drives", "Merchandise"],
    },
    {
      id: 5,
      name: "Tesla Service Center - East",
      type: "service",
      address: "654 Industrial Way, Boston, MA 02101",
      phone: "+1 (555) 456-7890",
      hours: "Mon-Fri: 7am-7pm, Sat: 8am-5pm",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80",
      services: ["Body Shop", "Repairs", "Collision"],
    },
    {
      id: 6,
      name: "Tesla Supercharger - City Center",
      type: "supercharger",
      address: "987 Urban Street, Seattle, WA 98101",
      phone: null,
      hours: "24/7",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=600&q=80",
      services: ["V3 Supercharging", "12 Stalls"],
    },
  ];

  const types = [
    { id: "all", label: "All Locations" },
    { id: "store", label: "Stores" },
    { id: "service", label: "Service Centers" },
    { id: "supercharger", label: "Superchargers" },
  ];

  const filteredLocations = locations.filter((location) => {
    const matchesType = selectedType === "all" || location.type === selectedType;
    const matchesSearch =
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "store":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "service":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "supercharger":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2070&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-medium text-white text-center"
          >
            Find Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-xl text-white/80 text-center"
          >
            Locate Tesla stores, service centers, and Superchargers near you
          </motion.p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-secondary/50 sticky top-0 z-40">
        <div className="tesla-container px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by location or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              {types.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.id)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16">
        <div className="tesla-container px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <img
                      src={location.image}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(
                        location.type
                      )}`}
                    >
                      {location.type}
                    </span>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-medium mb-3">{location.name}</h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <span>{location.address}</span>
                      </div>

                      {location.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{location.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{location.hours}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {location.services.map((service) => (
                        <span
                          key={service}
                          className="px-2 py-1 bg-secondary rounded text-xs"
                        >
                          {service}
                        </span>
                      ))}
                    </div>

                    <Button className="w-full mt-4" variant="outline">
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredLocations.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No locations found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FindUs;
