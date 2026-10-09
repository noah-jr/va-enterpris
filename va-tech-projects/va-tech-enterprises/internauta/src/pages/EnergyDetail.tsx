import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { energyData } from "@/data/products";

const EnergyDetail = () => {
  const params = useParams();
  const productId = params?.productId as string;
  const product = productId ? energyData[productId] : null;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Product not found</h1>
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

      {/* Hero Section */}
      <section className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${product.heroImage})` }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-between pt-32 pb-20">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-medium text-white drop-shadow-lg"
            >
              {product.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-xl text-white/80 max-w-xl mx-auto px-6"
            >
              {product.tagline}
            </motion.p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-6">
            <Button
              size="lg"
              className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-sm h-12"
            >
              Order Now
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

      {/* Description Section */}
      <section className="py-20">
        <div className="tesla-container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-6">
              Clean Energy for Your Home
            </h2>
            <p className="text-xl text-muted-foreground">{product.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      {product.features.length > 0 && (
        <section className="py-20 bg-secondary/50">
          <div className="tesla-container px-6">
            <div className="space-y-20">
              {product.features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col lg:flex-row gap-8 items-center"
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="tesla-container px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-medium mb-8"
          >
            Get Started with {product.name}
          </motion.h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button size="lg" className="flex-1 h-12">
              Order Now
            </Button>
            <Button size="lg" variant="outline" className="flex-1 h-12">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EnergyDetail;
