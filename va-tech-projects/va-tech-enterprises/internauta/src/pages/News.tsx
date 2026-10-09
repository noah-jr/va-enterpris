import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, Tag, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

interface NewsArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
}

const News = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All News" },
    { id: "vehicles", label: "Vehicles" },
    { id: "energy", label: "Energy" },
    { id: "technology", label: "Technology" },
    { id: "company", label: "Company" },
    { id: "events", label: "Events" },
  ];

  const articles: NewsArticle[] = [
    {
      id: 1,
      slug: "new-model-s-plaid",
      title: "Introducing the New Model S Plaid: The Fastest Production Car Ever",
      excerpt: "With a 0-60 mph time of under 2 seconds, the new Model S Plaid sets a new standard for electric performance vehicles.",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
      category: "vehicles",
      date: "Jan 25, 2026",
      readTime: "5 min read",
      featured: true,
    },
    {
      id: 2,
      slug: "supercharger-expansion-60000",
      title: "Tesla Expands Supercharger Network to 60,000 Stations Worldwide",
      excerpt: "Our global charging network continues to grow, making electric travel more convenient than ever.",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
      category: "technology",
      date: "Jan 23, 2026",
      readTime: "3 min read",
    },
    {
      id: 3,
      slug: "solar-roof-new-markets",
      title: "Solar Roof Now Available in 25 New Markets",
      excerpt: "Expanding our mission to accelerate sustainable energy adoption across the globe.",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
      category: "energy",
      date: "Jan 20, 2026",
      readTime: "4 min read",
    },
    {
      id: 4,
      slug: "q4-2025-results",
      title: "Q4 2025 Financial Results: Record Revenue and Deliveries",
      excerpt: "Tesla achieves new milestones with unprecedented vehicle deliveries and revenue growth.",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
      category: "company",
      date: "Jan 18, 2026",
      readTime: "6 min read",
    },
    {
      id: 5,
      slug: "cybertruck-deliveries",
      title: "Cybertruck Deliveries Begin: What Owners Are Saying",
      excerpt: "First impressions from Cybertruck owners highlight the revolutionary design and capabilities.",
      image: "https://images.unsplash.com/photo-1693823842209-dbb1de43c1aa?auto=format&fit=crop&w=800&q=80",
      category: "vehicles",
      date: "Jan 15, 2026",
      readTime: "7 min read",
    },
    {
      id: 6,
      slug: "ai-day-2026",
      title: "Tesla AI Day 2026: What to Expect",
      excerpt: "A preview of the upcoming showcase of our latest advancements in artificial intelligence and robotics.",
      image: "https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&w=800&q=80",
      category: "events",
      date: "Jan 12, 2026",
      readTime: "4 min read",
    },
    {
      id: 7,
      slug: "powerwall-3",
      title: "Powerwall 3: Next Generation Home Battery Announced",
      excerpt: "Double the capacity, faster charging, and seamless integration with Solar Roof.",
      image: "https://images.unsplash.com/photo-1584276433295-4b49a252e5ee?auto=format&fit=crop&w=800&q=80",
      category: "energy",
      date: "Jan 10, 2026",
      readTime: "5 min read",
    },
    {
      id: 8,
      slug: "fsd-europe",
      title: "Full Self-Driving Beta Expands to Europe",
      excerpt: "After regulatory approval, FSD Beta is now available to Tesla owners across European markets.",
      image: "https://images.unsplash.com/photo-1619317990207-7f0c33f11bce?auto=format&fit=crop&w=800&q=80",
      category: "technology",
      date: "Jan 8, 2026",
      readTime: "5 min read",
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles.find((a) => a.featured);
  const regularArticles = filteredArticles.filter((a) => !a.featured);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      vehicles: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      energy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      technology: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      company: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      events: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
    };
    return colors[category] || "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="relative min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=2070&q=80)",
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
              News & Updates
            </h1>
            <p className="text-lg sm:text-xl text-white/80 drop-shadow">
              Stay informed about the latest Tesla innovations, announcements, and stories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-6 sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="tesla-container px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-xs sm:text-sm"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && selectedCategory === "all" && !searchQuery && (
        <section className="py-8 sm:py-12">
          <div className="tesla-container px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link href={`/news/${featuredArticle.slug}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="grid lg:grid-cols-2">
                    <div className="aspect-video lg:aspect-auto lg:h-full overflow-hidden">
                      <img
                        src={featuredArticle.image}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
                      <span className="text-xs font-medium text-primary mb-2">FEATURED</span>
                      <span
                        className={`inline-block w-fit px-3 py-1 rounded-full text-xs font-medium capitalize mb-4 ${getCategoryColor(
                          featuredArticle.category
                        )}`}
                      >
                        {featuredArticle.category}
                      </span>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium mb-4 hover:text-primary transition-colors">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-muted-foreground mb-6">{featuredArticle.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {featuredArticle.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredArticle.readTime}
                        </span>
                      </div>
                      <Button className="w-fit">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-8 sm:py-12">
        <div className="tesla-container px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/news/${article.slug}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group cursor-pointer">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-5">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize mb-3 ${getCategoryColor(
                          article.category
                        )}`}
                      >
                        {article.category}
                      </span>
                      <h3 className="text-lg font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {article.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          {filteredArticles.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Articles
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
