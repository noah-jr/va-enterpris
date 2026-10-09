import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class DashboardController {
    static async getOverview(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'ID da Empresa (companyId) não fornecido.' });

            const range = (req.query.range as string) || 'monthly';
            const currentDate = new Date();
            
            let startDate = new Date();
            if (range === 'monthly') {
                startDate.setDate(currentDate.getDate() - 30);
            } else if (range === 'weekly') {
                startDate.setDate(currentDate.getDate() - 7);
            } else if (range === 'daily') {
                startDate.setHours(0, 0, 0, 0);
            }

            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

            // Fetch aggregate data
            const [
                totalClients,
                totalProducts,
                totalSuppliers,
                totalInvoicesCount,
                invoicesList,
                recentClients,
                pendingFinanceResult,
                ongoingProjects,
                activeEmployees,
                totalVehicles
            ] = await Promise.all([
                prisma.client.count({ where: { companyId } }),
                prisma.product.count({ where: { companyId } }),
                prisma.supplier.count({ where: { companyId } }),
                prisma.invoice.count({ 
                    where: { 
                        companyId,
                        createdAt: { gte: startDate }
                    } 
                }),
                prisma.invoice.findMany({
                    where: { 
                        companyId,
                        createdAt: { gte: startDate }
                    },
                    orderBy: { createdAt: 'desc' },
                    include: { client: { select: { name: true } } },
                    take: 20
                }),
                prisma.client.findMany({
                    where: { companyId },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }),
                prisma.financialEntry.aggregate({
                    where: { companyId, status: 'PENDING' },
                    _sum: { amount: true }
                }),
                prisma.project.count({
                    where: { companyId, status: 'IN_PROGRESS' }
                }),
                prisma.employee.count({
                    where: { companyId, status: 'ACTIVE' }
                }),
                prisma.fleetVehicle.count({
                    where: { companyId }
                })
            ]);

            // Calculate Revenue and Pending Amounts
            let totalRevenue = 0;
            let pendingRevenue = 0;
            
            const salesDataMap = new Map<string, number>();
            const statusMap = new Map<string, number>();
            const categoryMap = new Map<string, number>();

            invoicesList.forEach((inv: any) => {
                if (inv.status === 'PAID' || inv.status === 'FINAL') totalRevenue += inv.totalAmount;
                if (inv.status === 'DRAFT' || (inv.status === 'FINAL' && new Date(inv.dueDate) > new Date())) {
                    pendingRevenue += inv.totalAmount;
                }

                // Status Distribution
                statusMap.set(inv.status, (statusMap.get(inv.status) || 0) + 1);

                // Chart generation data
                const dateKey = new Date(inv.createdAt).toISOString().split('T')[0];
                if (inv.status === 'PAID' || inv.status === 'FINAL') {
                    salesDataMap.set(dateKey, (salesDataMap.get(dateKey) || 0) + inv.totalAmount);
                }
            });

            // Category Distribution from InvoiceItems (requires more deep fetch if needed, but using products for now)
            const recentInvoicesWithItems = await prisma.invoice.findMany({
                where: { companyId, createdAt: { gte: startDate } },
                include: { items: { include: { product: true } } },
                take: 50
            });

            recentInvoicesWithItems.forEach(inv => {
                inv.items.forEach(item => {
                    const cat = item.product?.category || 'Geral';
                    categoryMap.set(cat, (categoryMap.get(cat) || 0) + item.totalAmount);
                });
            });

            // Convert stats
            const salesChartData = Array.from(salesDataMap.entries())
                .map(([date, amount]) => ({ name: date, value: amount }))
                .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
                .slice(-14);

            const statusDistribution = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));
            const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

            res.json({
                stats: {
                    totalRevenue,
                    pendingRevenue,
                    totalClients,
                    totalProducts,
                    totalSuppliers,
                    totalInvoices: totalInvoicesCount,
                    pendingFinance: pendingFinanceResult._sum?.amount || 0,
                    ongoingProjects,
                    activeEmployees,
                    totalVehicles
                },
                salesChartData,
                statusDistribution,
                categoryDistribution,
                recentInvoices: invoicesList.map((i: any) => ({
                    id: i.id,
                    number: i.number,
                    clientName: i.client?.name || i.customerName || 'Consumidor Final',
                    amount: i.totalAmount,
                    status: i.status,
                    date: i.createdAt
                })),
                recentClients
            });

        } catch (error) {
            console.error('[Dashboard Error]', error);
            res.status(500).json({ error: 'Erro ao carregar Dashboard' });
        }
    }
}
