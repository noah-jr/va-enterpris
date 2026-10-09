import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { startOfMonth, subMonths, endOfMonth, eachMonthOfInterval, format } from 'date-fns';
import { pt } from 'date-fns/locale';

export async function GET(request: NextRequest) {
    try {
        // Counts
        const [usersCount, projectsCount, servicesCount, requestsCount, contactsCount, postsCount] = await Promise.all([
            prisma.user.count(),
            prisma.project.count(),
            prisma.service.count(),
            prisma.serviceRequest.count(),
            prisma.contact.count(),
            prisma.post.count(),
        ]);

        // Growth data (last 6 months)
        const last6Months = eachMonthOfInterval({
            start: subMonths(new Date(), 5),
            end: new Date()
        });

        const userGrowth = await Promise.all(
            last6Months.map(async (month) => {
                const count = await prisma.user.count({
                    where: {
                        createdAt: {
                            lte: endOfMonth(month)
                        }
                    }
                });
                return {
                    name: format(month, 'MMM', { locale: pt }),
                    users: count
                };
            })
        );

        const projectStatus = await prisma.project.groupBy({
            by: ['status'],
            _count: {
                _all: true
            }
        });

        const serviceRequestsByStatus = await prisma.serviceRequest.groupBy({
            by: ['status'],
            _count: {
                _all: true
            }
        });

        return NextResponse.json({
            counts: {
                users: usersCount,
                projects: projectsCount,
                services: servicesCount,
                requests: requestsCount,
                contacts: contactsCount,
                posts: postsCount
            },
            userGrowth,
            projectStatus: projectStatus.map(p => ({ name: p.status, value: p._count._all })),
            requestsStatus: serviceRequestsByStatus.map(r => ({ name: r.status, value: r._count._all }))
        });

    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ error: 'Erro ao obter estatísticas' }, { status: 500 });
    }
}
