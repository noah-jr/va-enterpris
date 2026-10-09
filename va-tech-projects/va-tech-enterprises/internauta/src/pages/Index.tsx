
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeatureCarousel from "@/components/FeatureCarousel";
import ServicesSection from "@/components/ServicesSection";
import IrregularCarousel from "@/components/IrregularCarousel";
import Footer from "@/components/Footer";

const Index = () => {
  const heroSections = [
    {
      id: "model-s",
      title: "Model S",
      subtitle: "From $71,090",
      primaryCta: "Order Now",
      secondaryCta: "Learn More",
      link: "/vehicles/model-s",
      orderLink: "/vehicles/model-s#order",
      carouselImages: [
        {
          image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=2070&q=80",
          title: "Exterior",
          description: "Designed for efficiency",
        },
        {
          image: "https://images.unsplash.com/photo-1619317990207-7f0c33f11bce?auto=format&fit=crop&w=2070&q=80",
          title: "Interior",
          description: "Premium comfort",
        },
        {
          image: "https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&w=2070&q=80",
          title: "Performance",
          description: "0-60 mph in 1.99s",
        },
      ],
      showScrollIndicator: true,
    },
    {
      id: "model-3",
      title: "Model 3",
      subtitle: "From $38,990",
      primaryCta: "Order Now",
      secondaryCta: "Learn More",
      link: "/vehicles/model-3",
      orderLink: "/vehicles/model-3#order",
      carouselImages: [
        {
          image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=2071&q=80",
          title: "Exterior",
          description: "Minimalist design",
        },
        {
          image: "https://images.unsplash.com/photo-1561580125-028ee3bd62eb?auto=format&fit=crop&w=2070&q=80",
          title: "Interior",
          description: "15-inch touchscreen",
        },
      ],
    },
    {
      id: "model-x",
      title: "Model X",
      subtitle: "From $68,590",
      primaryCta: "Order Now",
      secondaryCta: "Learn More",
      link: "/vehicles/model-x",
      orderLink: "/vehicles/model-x#order",
      backgroundImage: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?auto=format&fit=crop&w=2070&q=80",
    },
    {
      id: "model-y",
      title: "Model Y",
      subtitle: "From $36,490",
      primaryCta: "Order Now",
      secondaryCta: "Learn More",
      link: "/vehicles/model-y",
      orderLink: "/vehicles/model-y#order",
      carouselImages: [
        {
          image: "https://images.unsplash.com/photo-1619317190385-f07c2d4e4a07?auto=format&fit=crop&w=2071&q=80",
          title: "Spacious Interior",
          description: "Room for the whole family",
        },
        {
          image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=2071&q=80",
          title: "Versatile Cargo",
          description: "68 cu ft of storage",
        },
      ],
    },
    {
      id: "cybertruck",
      title: "Cybertruck",
      subtitle: "Available Now",
      primaryCta: "Order Now",
      secondaryCta: "Learn More",
      link: "/vehicles/cybertruck",
      orderLink: "/vehicles/cybertruck#order",
      backgroundImage: "https://images.unsplash.com/photo-1693823842209-dbb1de43c1aa?auto=format&fit=crop&w=2070&q=80",
    },
  ];

  const featureCards = [
    {
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
      title: "Supercharger Network",
      description: "15,000+ Superchargers worldwide",
      link: "/charging",
    },
    {
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      title: "Solar Roof",
      description: "Beautiful solar, without compromise",
      link: "/energy/solar-roof",
    },
    {
      image: "https://images.unsplash.com/photo-1584276433295-4b49a252e5ee?auto=format&fit=crop&w=800&q=80",
      title: "Powerwall",
      description: "Home battery backup",
      link: "/energy/powerwall",
    },
    {
      image: "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?auto=format&fit=crop&w=800&q=80",
      title: "Accessories",
      description: "Shop the complete collection",
      link: "/shop/accessories",
    },
    {
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=80",
      title: "Megapack",
      description: "Massive energy storage",
      link: "/energy/megapack",
    },
  ];

  const energyCarouselItems: [
    { image: string; title: string; subtitle?: string; link: string },
    { image: string; title: string; subtitle?: string; link: string }
  ] = [
      {
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=80",
        title: "Solar Panels",
        subtitle: "Lowest Cost Solar Panels in America",
        link: "/energy/solar-panels",
      },
      {
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
        title: "Solar Roof",
        subtitle: "Transform your roof",
        link: "/energy/solar-roof",
      },
    ];

  const storageCarouselItems: [
    { image: string; title: string; subtitle?: string; link: string },
    { image: string; title: string; subtitle?: string; link: string }
  ] = [
      {
        image: "https://images.unsplash.com/photo-1584276433295-4b49a252e5ee?auto=format&fit=crop&w=800&q=80",
        title: "Powerwall",
        subtitle: "Home Battery Backup",
        link: "/energy/powerwall",
      },
      {
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=1600&q=80",
        title: "Megapack",
        subtitle: "Utility-Scale Energy Storage",
        link: "/energy/megapack",
      },
    ];

  const shopCarouselItems: [
    { image: string; title: string; subtitle?: string; link: string },
    { image: string; title: string; subtitle?: string; link: string }
  ] = [
      {
        image: "https://images.unsplash.com/photo-1619317490533-fa8c9ef7f9bb?auto=format&fit=crop&w=1600&q=80",
        title: "Charging",
        subtitle: "Home and travel solutions",
        link: "/shop/charging",
      },
      {
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
        title: "Accessories",
        subtitle: "Enhance your Tesla",
        link: "/shop/accessories",
      },
    ];

  const lifestyleCarouselItems: [
    { image: string; title: string; subtitle?: string; link: string },
    { image: string; title: string; subtitle?: string; link: string }
  ] = [
      {
        image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
        title: "Apparel",
        subtitle: "Clothing & lifestyle",
        link: "/shop/apparel",
      },
      {
        image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1600&q=80",
        title: "Lifestyle",
        subtitle: "For everyday use",
        link: "/shop/lifestyle",
      },
    ];

  return (
    <div className="relative">
      <Header />
      <main>
        {/* Vehicle Hero Sections */}
        {heroSections.map((section) => (
          <HeroSection
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            primaryCta={section.primaryCta}
            secondaryCta={section.secondaryCta}
            backgroundImage={section.backgroundImage}
            slides={section.carouselImages?.map(img => ({
              title: section.title,
              subtitle: `${img.title} - ${img.description}`,
              backgroundImage: img.image,
              primaryCta: section.primaryCta,
              secondaryCta: section.secondaryCta,
              orderLink: section.orderLink,
              learnMoreLink: section.link
            }))}
            showScrollIndicator={section.showScrollIndicator}
            orderLink={section.orderLink}
            learnMoreLink={section.link}
          />
        ))}

        {/* Feature Carousel */}
        <FeatureCarousel title="Explore More" cards={featureCards} />

        {/* Services Section */}
        <ServicesSection />

        {/* Energy Irregular Carousels */}
        <IrregularCarousel title="Solar" items={energyCarouselItems} />
        <IrregularCarousel title="Energy Storage" items={storageCarouselItems} reversed />

        {/* Shop Irregular Carousels */}
        <IrregularCarousel title="Shop" items={shopCarouselItems} />
        <IrregularCarousel items={lifestyleCarouselItems} reversed />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
