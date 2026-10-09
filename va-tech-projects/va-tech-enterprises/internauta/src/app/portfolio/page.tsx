import { prisma } from "@/lib/prisma";
import PortfolioView from "./PortfolioView";

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
    const projects = await prisma.project.findMany({
        orderBy: { year: "desc" },
    });

    return <PortfolioView projects={projects.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        image: p.image || "/placeholder.svg",
        year: p.year || "",
        slug: p.slug
    }))} />;
}
