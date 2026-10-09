export interface VehicleData {
  id: string;
  name: string;
  tagline: string;
  price: string;
  heroImages: { image: string; title: string; description?: string }[];
  specs: {
    range: string;
    topSpeed: string;
    acceleration: string;
    peakPower?: string;
  };
  features: {
    title: string;
    description: string;
    image: string;
  }[];
  colors: { name: string; hex: string; image: string }[];
  interiorImages: string[];
}

export const vehiclesData: Record<string, VehicleData> = {
  "model-s": {
    id: "model-s",
    name: "Model S",
    tagline: "Plaid",
    price: "From $71,090",
    heroImages: [
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
    specs: {
      range: "405 mi",
      topSpeed: "200 mph",
      acceleration: "1.99 s",
      peakPower: "1,020 hp",
    },
    features: [
      {
        title: "Cinematic Experience",
        description: "A 17-inch cinematic display with exceptional responsiveness and integrated gaming experience.",
        image: "https://images.unsplash.com/photo-1619317990207-7f0c33f11bce?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Autopilot",
        description: "Advanced safety and convenience features designed to assist you with driving.",
        image: "https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Tri Motor All-Wheel Drive",
        description: "Enables incredible handling with torque vectoring and three independent motors.",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    colors: [
      { name: "Pearl White", hex: "#f2f2f2", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80" },
      { name: "Solid Black", hex: "#1a1a1a", image: "https://images.unsplash.com/photo-1619317990207-7f0c33f11bce?auto=format&fit=crop&w=800&q=80" },
      { name: "Midnight Silver", hex: "#424242", image: "https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&w=800&q=80" },
      { name: "Deep Blue", hex: "#1e3a5f", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80" },
      { name: "Red Multi-Coat", hex: "#a82721", image: "https://images.unsplash.com/photo-1619317990207-7f0c33f11bce?auto=format&fit=crop&w=800&q=80" },
    ],
    interiorImages: [
      "https://images.unsplash.com/photo-1619317990207-7f0c33f11bce?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1561580125-028ee3bd62eb?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  "model-3": {
    id: "model-3",
    name: "Model 3",
    tagline: "Performance",
    price: "From $38,990",
    heroImages: [
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
    specs: {
      range: "333 mi",
      topSpeed: "162 mph",
      acceleration: "3.1 s",
      peakPower: "510 hp",
    },
    features: [
      {
        title: "All-Glass Roof",
        description: "Expansive overhead visibility with UV and infrared protection.",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Minimal Interior",
        description: "A clean, distraction-free dashboard with a single touchscreen.",
        image: "https://images.unsplash.com/photo-1561580125-028ee3bd62eb?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    colors: [
      { name: "Pearl White", hex: "#f2f2f2", image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80" },
      { name: "Solid Black", hex: "#1a1a1a", image: "https://images.unsplash.com/photo-1561580125-028ee3bd62eb?auto=format&fit=crop&w=800&q=80" },
      { name: "Midnight Silver", hex: "#424242", image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80" },
      { name: "Red Multi-Coat", hex: "#a82721", image: "https://images.unsplash.com/photo-1561580125-028ee3bd62eb?auto=format&fit=crop&w=800&q=80" },
    ],
    interiorImages: [
      "https://images.unsplash.com/photo-1561580125-028ee3bd62eb?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  "model-x": {
    id: "model-x",
    name: "Model X",
    tagline: "Plaid",
    price: "From $68,590",
    heroImages: [
      {
        image: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?auto=format&fit=crop&w=2070&q=80",
        title: "Falcon Wing Doors",
        description: "Iconic design",
      },
    ],
    specs: {
      range: "348 mi",
      topSpeed: "163 mph",
      acceleration: "2.5 s",
      peakPower: "1,020 hp",
    },
    features: [
      {
        title: "Falcon Wing Doors",
        description: "Sensors detect obstacles and adjust the opening angle for tight spaces.",
        image: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    colors: [
      { name: "Pearl White", hex: "#f2f2f2", image: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?auto=format&fit=crop&w=800&q=80" },
      { name: "Solid Black", hex: "#1a1a1a", image: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?auto=format&fit=crop&w=800&q=80" },
    ],
    interiorImages: [],
  },
  "model-y": {
    id: "model-y",
    name: "Model Y",
    tagline: "Long Range",
    price: "From $36,490",
    heroImages: [
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
    specs: {
      range: "330 mi",
      topSpeed: "135 mph",
      acceleration: "4.8 s",
    },
    features: [
      {
        title: "Versatile Cargo",
        description: "68 cubic feet of cargo space with all seats folded.",
        image: "https://images.unsplash.com/photo-1619317190385-f07c2d4e4a07?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    colors: [
      { name: "Pearl White", hex: "#f2f2f2", image: "https://images.unsplash.com/photo-1619317190385-f07c2d4e4a07?auto=format&fit=crop&w=800&q=80" },
      { name: "Solid Black", hex: "#1a1a1a", image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80" },
    ],
    interiorImages: [],
  },
  "cybertruck": {
    id: "cybertruck",
    name: "Cybertruck",
    tagline: "Cyberbeast",
    price: "From $79,990",
    heroImages: [
      {
        image: "https://images.unsplash.com/photo-1693823842209-dbb1de43c1aa?auto=format&fit=crop&w=2070&q=80",
        title: "Exoskeleton",
        description: "Ultra-Hard 30X Cold-Rolled Stainless Steel",
      },
    ],
    specs: {
      range: "340 mi",
      topSpeed: "130 mph",
      acceleration: "2.6 s",
      peakPower: "845 hp",
    },
    features: [
      {
        title: "Ultra-Hard Exoskeleton",
        description: "30X cold-rolled stainless steel exterior for dent and damage resistance.",
        image: "https://images.unsplash.com/photo-1693823842209-dbb1de43c1aa?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    colors: [
      { name: "Stainless Steel", hex: "#9a9a9a", image: "https://images.unsplash.com/photo-1693823842209-dbb1de43c1aa?auto=format&fit=crop&w=800&q=80" },
    ],
    interiorImages: [],
  },
};

export interface EnergyProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  features: { title: string; description: string; image: string }[];
}

export const energyData: Record<string, EnergyProduct> = {
  "solar-panels": {
    id: "solar-panels",
    name: "Solar Panels",
    tagline: "Lowest Cost Solar Panels in America",
    description: "Produce clean energy from sunlight and power your home with beautiful, durable solar panels.",
    heroImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2072&q=80",
    features: [
      {
        title: "Sleek Design",
        description: "Low-profile panels blend into your roof.",
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  "solar-roof": {
    id: "solar-roof",
    name: "Solar Roof",
    tagline: "Produce Clean Energy From Your Roof",
    description: "Transform your roof into a power source with beautiful solar tiles.",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2072&q=80",
    features: [],
  },
  "powerwall": {
    id: "powerwall",
    name: "Powerwall",
    tagline: "Home Battery Backup",
    description: "Store energy during the day and use it at night for energy independence.",
    heroImage: "https://images.unsplash.com/photo-1584276433295-4b49a252e5ee?auto=format&fit=crop&w=2070&q=80",
    features: [],
  },
  "megapack": {
    id: "megapack",
    name: "Megapack",
    tagline: "Massive Energy Storage",
    description: "A powerful battery system designed for utility-scale storage.",
    heroImage: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=2070&q=80",
    features: [],
  },
};
