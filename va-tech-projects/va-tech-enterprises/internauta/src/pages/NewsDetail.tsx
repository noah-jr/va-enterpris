import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, Facebook, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const newsData = [
  {
    id: "1",
    slug: "new-model-s-plaid",
    title: "Introducing the New Model S Plaid: The Fastest Production Car Ever",
    excerpt: "With a 0-60 mph time of under 2 seconds, the new Model S Plaid sets a new standard for electric performance vehicles.",
    content: `
      <p>Tesla has unveiled the latest iteration of the Model S Plaid, a vehicle that redefines what's possible in electric performance. With a tri-motor setup delivering over 1,020 horsepower, the Model S Plaid accelerates from 0 to 60 mph in under 2 seconds, making it the fastest production car ever made.</p>
      
      <h2>Revolutionary Performance</h2>
      <p>The new carbon-sleeved rotors in the drive units allow for higher peak power at sustained speeds. This technology, derived from aerospace applications, enables the Model S Plaid to achieve a quarter-mile time of 9.23 seconds.</p>
      
      <h2>Interior Innovation</h2>
      <p>Inside, the Model S Plaid features a completely redesigned cabin with a 17-inch cinematic display, a yoke steering wheel, and the most advanced audio system ever developed for a production vehicle. The 22-speaker, 960-watt system delivers an immersive listening experience.</p>
      
      <h2>Extended Range</h2>
      <p>Despite its incredible performance, the Model S Plaid offers up to 390 miles of range on a single charge. The new 4680 battery cells and improved thermal management make this possible without compromising on power delivery.</p>
      
      <h2>Software-Defined Experience</h2>
      <p>Like all Tesla vehicles, the Model S Plaid receives over-the-air updates that continuously improve performance, add features, and enhance safety. The latest Autopilot hardware enables the full suite of advanced driver assistance features.</p>
    `,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=80",
    category: "vehicles",
    date: "Jan 25, 2026",
    readTime: "5 min read",
    author: {
      name: "Tesla Newsroom",
      avatar: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=100&q=80",
    },
  },
  {
    id: "2",
    slug: "supercharger-expansion-60000",
    title: "Tesla Expands Supercharger Network to 60,000 Stations Worldwide",
    excerpt: "Our global charging network continues to grow, making electric travel more convenient than ever.",
    content: `
      <p>Tesla has reached a major milestone with the installation of its 60,000th Supercharger station worldwide. This expansion marks a significant step in making electric vehicle travel as convenient as traditional fuel-powered transportation.</p>
      
      <h2>Global Coverage</h2>
      <p>The Supercharger network now spans across 6 continents, with stations strategically placed along major highways, in city centers, and at popular destinations. Travelers can now drive from coast to coast in North America, across Europe, and throughout Asia with ease.</p>
      
      <h2>V4 Superchargers</h2>
      <p>The latest V4 Superchargers deliver up to 350 kW of power, adding up to 200 miles of range in just 15 minutes. The new design features longer cables for easier access and compatibility with a wider range of vehicles.</p>
      
      <h2>Open Network</h2>
      <p>Tesla has opened its Supercharger network to non-Tesla electric vehicles in many regions, supporting the broader transition to sustainable transportation. The Tesla app makes it easy for all EV drivers to locate, use, and pay for charging.</p>
    `,
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1600&q=80",
    category: "technology",
    date: "Jan 23, 2026",
    readTime: "3 min read",
    author: {
      name: "Tesla Newsroom",
      avatar: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=100&q=80",
    },
  },
  {
    id: "3",
    slug: "solar-roof-new-markets",
    title: "Solar Roof Now Available in 25 New Markets",
    excerpt: "Expanding our mission to accelerate sustainable energy adoption across the globe.",
    content: `
      <p>Tesla Solar Roof is now available in 25 additional markets, bringing the total to over 40 countries worldwide. This expansion represents a significant step in Tesla's mission to accelerate the world's transition to sustainable energy.</p>
      
      <h2>Beautiful and Durable</h2>
      <p>Solar Roof tiles are designed to blend seamlessly with your home's architecture while generating clean energy for decades. Made with tempered glass, they're three times stronger than standard roofing tiles and come with a 25-year warranty.</p>
      
      <h2>Integrated System</h2>
      <p>When paired with Powerwall, Solar Roof provides 24/7 energy security. Generate power during the day, store it for night use, and maintain power during grid outages. The Tesla app gives you complete visibility and control over your home energy system.</p>
    `,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=80",
    category: "energy",
    date: "Jan 20, 2026",
    readTime: "4 min read",
    author: {
      name: "Tesla Newsroom",
      avatar: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=100&q=80",
    },
  },
];

const relatedArticles = [
  {
    id: "4",
    slug: "q4-2025-results",
    title: "Q4 2025 Financial Results: Record Revenue and Deliveries",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400&q=80",
    category: "company",
    date: "Jan 18, 2026",
  },
  {
    id: "5",
    slug: "cybertruck-deliveries",
    title: "Cybertruck Deliveries Begin: What Owners Are Saying",
    image: "https://images.unsplash.com/photo-1693823842209-dbb1de43c1aa?auto=format&fit=crop&w=400&q=80",
    category: "vehicles",
    date: "Jan 15, 2026",
  },
  {
    id: "6",
    slug: "ai-day-2026",
    title: "Tesla AI Day 2026: What to Expect",
    image: "https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&w=400&q=80",
    category: "events",
    date: "Jan 12, 2026",
  },
];

const NewsDetail = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const article = newsData.find((a) => a.slug === slug) || newsData[0];

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

      {/* Hero Image */}
      <section className="relative h-[50vh] md:h-[60vh] lg:h-[70vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${article.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="tesla-container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to News
              </Link>

              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize mb-4 ${getCategoryColor(
                  article.category
                )}`}
              >
                {article.category}
              </span>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-4 drop-shadow-lg">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span>{article.author.name}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {article.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readTime}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 md:py-16">
        <div className="tesla-container px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_300px] gap-12 max-w-6xl mx-auto">
            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="prose prose-lg dark:prose-invert max-w-none"
            >
              <p className="lead text-xl text-muted-foreground mb-8">
                {article.excerpt}
              </p>

              <div
                dangerouslySetInnerHTML={{ __html: article.content }}
                className="
                  [&>h2]:text-2xl [&>h2]:font-medium [&>h2]:mt-8 [&>h2]:mb-4
                  [&>p]:text-foreground/80 [&>p]:leading-relaxed [&>p]:mb-6
                "
              />
            </motion.article>

            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              {/* Share */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Article
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Related Articles */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.id}
                        href={`/news/${related.slug}`}
                        className="flex gap-3 group"
                      >
                        <img
                          src={related.image}
                          alt={related.title}
                          className="w-20 h-14 rounded object-cover flex-shrink-0"
                        />
                        <div>
                          <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {related.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {related.date}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter CTA */}
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <h3 className="font-medium mb-2">Stay Updated</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Subscribe to our newsletter for the latest news and updates.
                  </p>
                  <Button variant="secondary" className="w-full">
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            </motion.aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsDetail;
