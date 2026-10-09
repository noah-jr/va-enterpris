import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import os from 'os';

export class MonitoringController {
    static async getSystemStatus(req: Request, res: Response) {
        try {
            // Check if user is SUPER_ADMIN
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({ error: 'Acesso negado. Apenas para Super Administradores.' });
            }

            // 1. Database Latency Check
            const startDb = Date.now();
            await prisma.$queryRaw`SELECT 1`;
            const dbLatency = Date.now() - startDb;

            // 2. Real System Stats
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const memUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);
            const loadAvg = os.loadavg(); // [1, 5, 15] minute load averages
            const systemUptime = os.uptime(); // in seconds

            // 3. Real counts from DB
            const [totalCompanies, totalUsers, activeSubscriptions, totalAuditLogs] = await Promise.all([
                prisma.company.count(),
                prisma.user.count(),
                prisma.subscription.count({ where: { status: 'ACTIVE' } }),
                prisma.auditLog.count()
            ]);

            // 4. API Calls Activity (Real data from AuditLog last 24h)
            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

            const recentLogs = await prisma.auditLog.findMany({
                where: { createdAt: { gte: twentyFourHoursAgo } },
                select: { createdAt: true }
            });

            // Group logs by hour for the chart
            const logsByHour: Record<string, number> = {};
            for (let i = 0; i < 24; i++) {
                const d = new Date();
                d.setHours(d.getHours() - i, 0, 0, 0);
                logsByHour[d.toISOString()] = 0;
            }

            recentLogs.forEach(log => {
                const d = new Date(log.createdAt);
                d.setMinutes(0, 0, 0);
                const iso = d.toISOString();
                if (logsByHour[iso] !== undefined) {
                    logsByHour[iso]++;
                }
            });

            const apiCallsData = Object.entries(logsByHour)
                .map(([time, value]) => ({ 
                    time: new Date(time).getHours() + ':00', 
                    value,
                    rawTime: new Date(time).getTime()
                }))
                .sort((a, b) => a.rawTime - b.rawTime);

            // 5. Real Incidents (HSE incidents or system errors if we had a table)
            // Using HSEIncident table as a proxy for "System Incidents" or real HSE data
            const dbIncidents = await prisma.hSEIncident.findMany({
                take: 10,
                orderBy: { date: 'desc' }
            });

            const incidents = dbIncidents.map(inc => ({
                id: inc.id,
                service: inc.type,
                date: new Date(inc.date).toLocaleString('pt-PT'),
                description: inc.description || inc.title,
                duration: '--',
                severity: inc.level === 'HIGH' ? 'HIGH' : 'MEDIUM',
                status: inc.status === 'OPEN' ? 'MONITORING' : 'RESOLVED'
            }));

            // 6. Service Status (Combining real and simulated based on environment)
            const services = [
                { 
                    name: 'API Gateway (Node.js)', 
                    status: 'ONLINE', 
                    uptime: 99.99, 
                    latency: 5, 
                    lastChecked: new Date().toISOString(),
                    description: `Serviço operacional. Carga: ${loadAvg[0].toFixed(2)} (1m)`,
                    icon: 'Server'
                },
                { 
                    name: 'Base de Dados (PostgreSQL)', 
                    status: dbLatency < 500 ? 'ONLINE' : 'DEGRADED', 
                    uptime: 99.99, 
                    latency: dbLatency, 
                    lastChecked: new Date().toISOString(),
                    description: `Persistência de dados activa. Latência: ${dbLatency}ms`,
                    icon: 'Database'
                },
                { 
                    name: 'Memória do Sistema', 
                    status: memUsage < 90 ? 'ONLINE' : 'DEGRADED', 
                    uptime: 99.9, 
                    latency: memUsage, 
                    lastChecked: new Date().toISOString(),
                    description: `Uso de memória: ${memUsage}% de ${(totalMem / (1024**3)).toFixed(1)}GB`,
                    icon: 'Cpu'
                }
            ];

            // Latency Chart - Showing only current real latency since we don't store history yet
            const latencyData = [
                { time: new Date().getHours() + ':00', value: dbLatency }
            ];

            res.json({
                services,
                incidents,
                apiCallsData,
                latencyData,
                systemStats: {
                    totalCompanies,
                    totalUsers,
                    activeSubscriptions,
                    totalAuditLogs,
                    cpuLoad: loadAvg[0],
                    memUsage,
                    uptime: systemUptime
                }
            });
        } catch (error) {
            console.error('[Monitoring Error]', error);
            res.status(500).json({ error: 'Erro ao carregar estado do sistema' });
        }
    }
}
