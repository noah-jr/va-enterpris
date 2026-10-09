import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutContent from "@/components/AboutContent";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
    // Fetch team members from DB
    const teamMembers = await prisma.teamMember.findMany({
        where: { active: true },
        orderBy: { order: 'asc' }
    });

    return (
        <>
            <Header />
            <AboutContent teamMembers={teamMembers} />
            <Footer />
        </>
    );
}
