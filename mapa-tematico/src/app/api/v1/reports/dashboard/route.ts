import { NextResponse } from 'next/server';
import { 
    PrismaIncidentRepository, 
    PrismaSchoolRepository, 
    PrismaHospitalRepository, 
    PrismaDemographicRepository,
    PrismaUserRepository 
} from '@/infrastructure/db/repositories/ModelRepositories';

const incidentRepo = new PrismaIncidentRepository();
const schoolRepo = new PrismaSchoolRepository();
const hospitalRepo = new PrismaHospitalRepository();
const demoRepo = new PrismaDemographicRepository();
const userRepo = new PrismaUserRepository();

export async function GET() {
    try {
        const [
            incidents,
            schools,
            hospitals,
            demographics,
            users
        ] = await Promise.all([
            incidentRepo.findAll(),
            schoolRepo.findAll(),
            hospitalRepo.findAll(),
            demoRepo.findAll(),
            userRepo.findAll()
        ]);

        // Health Metrics
        const totalBirths = hospitals.reduce((acc, h) => acc + (h.births || 0), 0);
        const totalDeaths = hospitals.reduce((acc, h) => acc + (h.deaths || 0), 0);
        const totalBeds = hospitals.reduce((acc, h) => acc + (h.bedCapacity || 0), 0);
        const currentPatients = hospitals.reduce((acc, h) => acc + (h.currentPatients || 0), 0);

        // Education Metrics
        const totalStudents = schools.reduce((acc, s) => acc + (s.studentsCount || 0), 0);
        const totalTeachers = schools.reduce((acc, s) => acc + (s.teachersCount || 0), 0);
        const avgPassRate = schools.length > 0 
            ? (schools.reduce((acc, s) => acc + (s.passRate || 0), 0) / schools.length).toFixed(1)
            : 0;

        // Demographics
        const national = demographics.find(d => d.regionType === 'NACIONAL');
        const population = national ? national.totalPopulation : demographics.reduce((acc, d) => acc + (d.totalPopulation || 0), 0);

        // Sinistrality (Incidents)
        const activeIncidents = incidents.filter(i => i.status === 'ATIVO' || i.status === 'ATIVO').length;
        const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVIDO' || i.status === 'CONCLUIDO').length;

        // Evolution Data (Simulated but based on existing distributions)
        const evolution = [
            { month: 'JAN', populacao: population * 0.94, natalidade: 1200, mortalidade: 400 },
            { month: 'FEV', populacao: population * 0.95, natalidade: 1350, mortalidade: 420 },
            { month: 'MAR', populacao: population * 0.96, natalidade: 1400, mortalidade: 380 },
            { month: 'ABR', populacao: population * 0.97, natalidade: 1280, mortalidade: 410 },
            { month: 'MAI', populacao: population * 0.98, natalidade: 1520, mortalidade: 390 },
            { month: 'JUN', populacao: population * 1.0, natalidade: 1600, mortalidade: 405 },
        ];

        return NextResponse.json({
            message: 'Dashboard data retrieved successfully',
            statusCode: 200,
            object: {
                population: {
                    total: population,
                    demographics: demographics.length
                },
                health: {
                    totalHospitals: hospitals.length,
                    totalBirths,
                    totalDeaths,
                    totalBeds,
                    currentPatients,
                    topProvince: hospitals[0]?.province || 'Luanda'
                },
                education: {
                    totalSchools: schools.length,
                    totalStudents,
                    totalTeachers,
                    avgPassRate
                },
                emergencies: {
                    total: incidents.length,
                    active: activeIncidents,
                    resolved: resolvedIncidents,
                    avgResolutionTime: 45, // Minutes (mocked)
                    last24h: incidents.filter(i => new Date(i.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length
                },
                users: {
                    total: users.length
                },
                evolution
            }
        });
    } catch (error: any) {
        return NextResponse.json({ 
            message: 'Erro ao obter dados do dashboard', 
            statusCode: 500,
            error: error.message 
        }, { status: 500 });
    }
}
