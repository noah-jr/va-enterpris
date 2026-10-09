import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Shop = () => {
  const categories = [
    {
      title: "Charging",
      image: "https://images.unsplash.com/photo-1619317490533-fa8c9ef7f9bb?auto=format&fit=crop&w=800&q=80",
      href: "/shop/charging",
    },
    {
      title: "Vehicle Accessories",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
      href: "/shop/vehicle-accessories",
    },
    {
      title: "Apparel",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
      href: "/shop/apparel",
    },
    {
      title: "Lifestyle",
      image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
      href: "/shop/lifestyle",
    },
  ];

  const featuredProducts = [
    {
      name: "Wall Connector",
      price: "$475",
      image: "https://images.unsplash.com/photo-1619317490533-fa8c9ef7f9bb?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Mobile Connector",
      price: "$230",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Model S Floor Mats",
      price: "$225",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Tesla Tee",
      price: "$35",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <div className="relative">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="tesla-container text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-medium mb-4"
          >
            Shop
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground"
          >
            Official Tesla merchandise and accessories
          </motion.p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-6">
        <div className="tesla-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={category.href} className="group block">
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="font-medium group-hover:underline">{category.title}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-6 bg-secondary/50">
        <div className="tesla-container">
          <h2 className="text-2xl md:text-3xl font-medium mb-8">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-square bg-background rounded-lg overflow-hidden mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-muted-foreground">{product.price}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
