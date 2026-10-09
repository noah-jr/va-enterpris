import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import PartnersSection from "@/components/PartnersSection";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
    const { id } = await params;

    const project = await prisma.project.findFirst({
        where: {
            OR: [
                { id: id },
                { slug: id }
            ]
        }
    });

    if (!project) {
        notFound();
    }

    // Split content into paragraphs or just use it as is
    const detailedDescription = project.content || project.description;

    return (
        <div className="bg-background text-foreground min-h-screen">
            <Header />

            <div className="pt-32 pb-20 tesla-container px-6">
                <Link
                    href="/portfolio"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground mb-12 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao Portfólio
                </Link>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Content */}
                    <div>
                        <div className="mb-6">
                            <span className="text-sm font-medium text-accent uppercase tracking-wider">
                                {project.category}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6 leading-tight">
                                {project.title}
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                {project.description}
                            </p>
                        </div>

                        <div className="space-y-8 my-12 py-12 border-y border-border/40">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground uppercase mb-2">Cliente</h3>
                                <p className="text-muted-foreground">{project.client}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground uppercase mb-2">Ano</h3>
                                <p className="text-muted-foreground">{project.year}</p>
                            </div>
                        </div>

                        <div className="prose prose-lg dark:prose-invert text-muted-foreground">
                            <p>{detailedDescription}</p>
                        </div>

                        {project.link && (
                            <div className="mt-10">
                                <Link
                                    href={project.link}
                                    target="_blank"
                                    className="inline-flex items-center px-8 py-4 bg-foreground text-background font-medium rounded-full hover:opacity-90 transition-opacity"
                                >
                                    Visitar Website <ExternalLink className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right: Images */}
                    <div className="space-y-8">
                        <div className="rounded-sm overflow-hidden bg-secondary/20 aspect-[4/5] relative">
                            <img
                                src={project.image || "/placeholder.svg"}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <PartnersSection />
            <Footer />
        </div>
    );
}
