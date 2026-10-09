import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import BlogView from "./BlogView";

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
    const posts = await prisma.post.findMany({
        where: { published: true },
        include: {
            author: true,
            _count: {
                select: { comments: true, likes: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Extract unique categories from tags if needed, or use defaults
    const categories = ["Todos", "Tecnologia", "Segurança", "Marketing", "Inovação"];

    return (
        <div className="relative bg-background text-foreground min-h-screen">
            <Header />
            <BlogView initialPosts={JSON.parse(JSON.stringify(posts))} categories={categories} />
            <Footer />
        </div>
    );
}
