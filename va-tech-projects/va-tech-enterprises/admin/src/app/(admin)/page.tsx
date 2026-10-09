import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, Mail, FileText, TrendingUp, Bell, Quote, UserCheck, BarChart3, MessageSquare } from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";
import RecentActivity from "@/components/RecentActivity";
import StatsInsights from "@/components/StatsInsights";
import QuickActions from "@/components/QuickActions";
import BlogAnalytics from "@/components/BlogAnalytics";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { hasPermission } from "@/lib/permissions";

export const dynamic = 'force-dynamic';

// Componente Widget estilo Horizon UI
const Widget = ({ icon: Icon, title, subtitle, href }: { icon: any, title: string, subtitle: string | number, href?: string }) => {
    const Content = () => (
        <Card className="!border-none !bg-white dark:!bg-card shadow-sm rounded-[20px] h-full transition-all hover:shadow-lg dark:shadow-none border dark:border-border">
            <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-muted">
                    <span className="flex items-center text-primary dark:text-foreground">
                        <Icon className="h-7 w-7 text-primary dark:text-foreground" />
                    </span>
                </div>
                <div className="ml-4 h-full flex flex-col justify-center">
                    <p className="font-dm text-sm font-medium text-muted-foreground">{title}</p>
                    <h4 className="text-xl font-bold text-foreground dark:text-foreground">
                        {subtitle}
                    </h4>
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return <Link href={href} className="flex-1 min-w-[200px]"><Content /></Link>;
    }
    return <div className="flex-1 min-w-[200px]"><Content /></div>;
};

export default async function AdminDashboard() {
    // Estatísticas gerais
    const servicesCount = await prisma.service.count();
    const activeServicesCount = await prisma.service.count({ where: { active: true } });
    const contactsCount = await prisma.contact.count();
    const newContactsCount = await prisma.contact.count({ where: { status: 'NEW' } });
    const subscribersCount = await prisma.newsletterSubscriber.count();
    const activeSubscribersCount = await prisma.newsletterSubscriber.count({ where: { active: true } });
    const postsCount = await prisma.post.count();
    const publishedPostsCount = await prisma.post.count({ where: { published: true } });
    const testimonialsCount = await prisma.testimonial.count();
    const activeTestimonialsCount = await prisma.testimonial.count({ where: { active: true } });
    const teamMembersCount = await prisma.teamMember.count();
    const chatsCount = await prisma.chat.count();
    const internautasCount = await prisma.internauta.count();

    // Dados para gráficos - últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const contactsByDay = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE(createdAt) as date, COUNT(*) as count
        FROM Contact
        WHERE createdAt >= ${sevenDaysAgo}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
    `;

    const subscribersByDay = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE(createdAt) as date, COUNT(*) as count
        FROM NewsletterSubscriber
        WHERE createdAt >= ${sevenDaysAgo}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
    `;

    const chatsByDay = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE(createdAt) as date, COUNT(*) as count
        FROM Chat
        WHERE createdAt >= ${sevenDaysAgo}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
    `;

    // Contactos recentes
    const recentContacts = await prisma.contact.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            subject: true,
            status: true,
            createdAt: true
        }
    });

    // Subscritores recentes
    const recentSubscribers = await prisma.newsletterSubscriber.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            createdAt: true,
            active: true
        }
    });

    // Analytics de PageViews - Últimas 24 horas por hora
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const pageViewsByHour = await prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
        SELECT HOUR(createdAt) as hour, COUNT(*) as count
        FROM PageView
        WHERE createdAt >= ${twentyFourHoursAgo}
        GROUP BY HOUR(createdAt)
        ORDER BY hour ASC
    `;

    const blogViewsByHour = await prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
        SELECT HOUR(createdAt) as hour, COUNT(*) as count
        FROM PageView
        WHERE createdAt >= ${twentyFourHoursAgo} AND pageType = 'blog'
        GROUP BY HOUR(createdAt)
        ORDER BY hour ASC
    `;

    // Total de visitantes únicos (baseado em IP)
    const uniqueVisitors = await prisma.pageView.groupBy({
        by: ['ipAddress'],
        where: { createdAt: { gte: twentyFourHoursAgo } },
        _count: true
    });

    const totalPageViews = await prisma.pageView.count({
        where: { createdAt: { gte: twentyFourHoursAgo } }
    });

    // ===== BLOG ANALYTICS =====
    const totalBlogViews = await prisma.pageView.count({ where: { pageType: 'blog' } });
    const uniqueBlogVisitors = await prisma.pageView.groupBy({
        by: ['ipAddress'],
        where: { pageType: 'blog', createdAt: { gte: sevenDaysAgo } },
        _count: true
    });

    const blogViewsByDay = await prisma.$queryRaw<Array<{ date: string; views: bigint; visitors: bigint }>>`
        SELECT DATE(createdAt) as date, COUNT(*) as views, COUNT(DISTINCT ipAddress) as visitors
        FROM PageView WHERE createdAt >= ${sevenDaysAgo} AND pageType = 'blog'
        GROUP BY DATE(createdAt) ORDER BY date ASC
    `;

    const topBlogPosts = await prisma.$queryRaw<Array<{ pageId: string; views: bigint }>>`
        SELECT pageId, COUNT(*) as views FROM PageView WHERE pageType = 'blog' AND pageId IS NOT NULL
        GROUP BY pageId ORDER BY views DESC LIMIT 5
    `;

    const topPostsDetails = await Promise.all(
        topBlogPosts.map(async (post) => {
            const postDetail = await prisma.post.findUnique({ where: { id: post.pageId }, select: { title: true, slug: true } });
            return { title: postDetail?.title || 'Post não encontrado', slug: postDetail?.slug || '', views: Number(post.views) };
        })
    );

    const avgViewsPerDay = blogViewsByDay.length > 0 ? Number(blogViewsByDay.reduce((acc, day) => acc + Number(day.views), 0)) / blogViewsByDay.length : 0;
    const avgViewsPerVisitor = uniqueBlogVisitors.length > 0 ? totalBlogViews / uniqueBlogVisitors.length : 0;

    // Helper to fill missing days with 0
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }
        return days;
    };

    const last7Days = getLast7Days();

    const formatDayData = (rawByDay: any[]) => {
        return last7Days.map(dayStr => {
            const found = rawByDay.find(item => {
                const itemDate = new Date(item.date).toISOString().split('T')[0];
                return itemDate === dayStr;
            });
            return {
                date: new Date(dayStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
                count: found ? Number(found.count) : 0
            };
        });
    };

    // Formatar dados para gráficos
    const chartData = {
        contacts: formatDayData(contactsByDay),
        subscribers: formatDayData(subscribersByDay),
        chats: formatDayData(chatsByDay),
        pageViewsByHour: pageViewsByHour.map((item: any) => ({
            hour: `${item.hour}:00`,
            count: Number(item.count)
        })),
        blogViewsByHour: blogViewsByHour.map((item: any) => ({
            hour: `${item.hour}:00`,
            count: Number(item.count)
        }))
    };

    const analyticsData = { totalPageViews, uniqueVisitors: uniqueVisitors.length };

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const payload = token ? await verifyToken(token) : null;
    const userRole = payload?.role as string;

    const widgets = [
        { icon: Briefcase, title: "Serviços", subtitle: servicesCount, href: "/services" },
        { icon: Mail, title: "Contactos", subtitle: contactsCount, href: "/contacts" },
        { icon: Users, title: "Newsletter", subtitle: subscribersCount, href: "/newsletter" },
        { icon: Users, title: "Internautas", subtitle: internautasCount, href: "/internautas" },
        { icon: FileText, title: "Artigos", subtitle: postsCount, href: "/posts" },
        { icon: Quote, title: "Testemunhos", subtitle: testimonialsCount, href: "/testimonials" },
        { icon: UserCheck, title: "Equipa", subtitle: teamMembersCount, href: "/team" },
        { icon: MessageSquare, title: "Chats", subtitle: chatsCount, href: "/messages" },
    ].filter(w => hasPermission(userRole, w.href));


    return (
        <div className="space-y-6">
            {/* Widgets Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
                {widgets.map((w, i) => (
                    <Widget key={i} {...w} />
                ))}
            </div>

            {/* Charts and Analytics Section */}
            {hasPermission(userRole, '/dashboard/charts') || userRole === 'ADMIN' && (
                <div className="mt-5 grid grid-cols-1">
                    <DashboardCharts data={chartData} analyticsData={analyticsData} />
                </div>
            )}

            {/* Detailed Stats */}
            {(hasPermission(userRole, '/contacts') || hasPermission(userRole, '/newsletter')) && (
                <div className="mt-5">
                    <StatsInsights analytics={{
                        totalPageViews,
                        uniqueVisitors: uniqueVisitors.length,
                        totalContacts: contactsCount,
                        newContacts: newContactsCount,
                        totalSubscribers: subscribersCount,
                        activeSubscribers: activeSubscribersCount
                    }} />
                </div>
            )}

            {/* Blog Analytics */}
            {hasPermission(userRole, '/posts') && (
                <div className="mt-5">
                    <BlogAnalytics
                        stats={{
                            totalBlogViews,
                            totalPosts: postsCount,
                            publishedPosts: publishedPostsCount,
                            uniqueVisitors: uniqueBlogVisitors.length,
                            avgViewsPerDay,
                            avgViewsPerVisitor
                        }}
                        topPosts={topPostsDetails}
                        dailyViews={blogViewsByDay.map((item: any) => ({
                            date: new Date(item.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
                            views: Number(item.views),
                            visitors: Number(item.visitors)
                        }))}
                    />
                </div>
            )}

            {/* Recent Activity and Quick Actions */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="grid grid-cols-1 gap-5">
                    <RecentActivity title="Contactos Recentes" type="contacts" data={recentContacts} />
                    <RecentActivity title="Subscritores Recentes" type="subscribers" data={recentSubscribers} />
                </div>
                <div>
                    <QuickActions />
                </div>
            </div>
        </div>
    );
}

