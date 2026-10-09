import { motion } from "framer-motion";
import { Calendar, MapPin, Users, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Events = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "Cybertruck Experience Tour",
      date: "Feb 15, 2026",
      time: "10:00 AM - 6:00 PM",
      location: "Tesla Fremont Factory",
      image: "https://images.unsplash.com/photo-1693823842209-dbb1de43c1aa?auto=format&fit=crop&w=800&q=80",
      description: "Get an exclusive hands-on experience with the Cybertruck. Test drive available.",
      attendees: 245,
      type: "Experience",
    },
    {
      id: 2,
      title: "EV Ownership Workshop",
      date: "Feb 22, 2026",
      time: "2:00 PM - 4:00 PM",
      location: "Tesla Store - Downtown LA",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
      description: "Learn everything about owning an electric vehicle, from charging to maintenance.",
      attendees: 89,
      type: "Workshop",
    },
    {
      id: 3,
      title: "Solar & Powerwall Open House",
      date: "Mar 1, 2026",
      time: "11:00 AM - 5:00 PM",
      location: "Tesla Energy Center - San Jose",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
      description: "Discover how Tesla Energy products can power your home with clean energy.",
      attendees: 156,
      type: "Open House",
    },
    {
      id: 4,
      title: "Model S Plaid Track Day",
      date: "Mar 8, 2026",
      time: "9:00 AM - 3:00 PM",
      location: "Laguna Seca Raceway",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
      description: "Experience the world's quickest production car on a professional track.",
      attendees: 50,
      type: "Track Day",
    },
    {
      id: 5,
      title: "Tesla Owners Meetup",
      date: "Mar 15, 2026",
      time: "4:00 PM - 8:00 PM",
      location: "Tesla Supercharger - Santa Monica",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
      description: "Connect with fellow Tesla owners, share experiences, and enjoy refreshments.",
      attendees: 320,
      type: "Community",
    },
  ];

  const pastEvents = [
    {
      id: 6,
      title: "Model Y Launch Event",
      date: "Jan 20, 2026",
      location: "Tesla HQ - Austin",
      image: "https://images.unsplash.com/photo-1619317190385-f07c2d4e4a07?auto=format&fit=crop&w=800&q=80",
      attendees: 1200,
    },
    {
      id: 7,
      title: "Autopilot Deep Dive",
      date: "Jan 10, 2026",
      location: "Virtual Event",
      image: "https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&w=800&q=80",
      attendees: 5000,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Experience":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Workshop":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Open House":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Track Day":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Community":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
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
              "url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2070&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-medium text-white text-center"
          >
            Events
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-xl text-white/80 text-center"
          >
            Join us for exclusive Tesla experiences and community gatherings
          </motion.p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16">
        <div className="tesla-container px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-medium mb-12"
          >
            Upcoming Events
          </motion.h2>

          <div className="space-y-6">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-80 h-48 md:h-auto shrink-0">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="flex-1 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${getTypeColor(
                              event.type
                            )}`}
                          >
                            {event.type}
                          </span>
                          <h3 className="text-2xl font-medium">{event.title}</h3>
                        </div>
                        <Button>
                          Register Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>

                      <p className="text-muted-foreground mb-4">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="py-16 bg-secondary/50">
        <div className="tesla-container px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-medium mb-12"
          >
            Past Events
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {pastEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden opacity-75">
                  <div className="flex">
                    <div className="w-32 h-32 shrink-0">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover grayscale"
                      />
                    </div>
                    <CardContent className="flex-1 p-4">
                      <h3 className="font-medium mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{event.attendees} attended</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="tesla-container px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-medium mb-4">Stay Updated</h2>
              <p className="text-muted-foreground mb-8">
                Subscribe to get notified about upcoming Tesla events in your area.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-md border bg-background"
                />
                <Button size="lg">Subscribe</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
