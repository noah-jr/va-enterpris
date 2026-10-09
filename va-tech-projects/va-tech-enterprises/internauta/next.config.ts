import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    experimental: {
        optimizePackageImports: ["lucide-react", "framer-motion", "@radix-ui/react-icons"],
    },
};

export default withNextIntl(nextConfig);
