import { NextResponse } from 'next/server';
import { PrismaHospitalRepository } from '@/infrastructure/db/repositories/ModelRepositories';

const hospitalRepo = new PrismaHospitalRepository();

// GET all hospitals with stats
export async function GET() {
    try {
        const hospitals = await hospitalRepo.findAll();
        
        const totalHospitals = hospitals.length;
        const totalBeds = hospitals.reduce((acc, curr) => acc + curr.bedCapacity, 0);
        const totalPatients = hospitals.reduce((acc, curr) => acc + curr.currentPatients, 0);
        const avgOccupancy = totalBeds > 0 ? ((totalPatients / totalBeds) * 100).toFixed(1) : 0;

        // Group by municipality
        const byMunicipality: Record<string, { cap: number, pac: number }> = {};
        hospitals.forEach(h => {
            if (!byMunicipality[h.municipality]) byMunicipality[h.municipality] = { cap: 0, pac: 0 };
            byMunicipality[h.municipality].cap += h.bedCapacity;
            byMunicipality[h.municipality].pac += h.currentPatients;
        });

        const chartData = Object.keys(byMunicipality).map(name => ({
            name,
            capacidade: byMunicipality[name].cap,
            pacientes: byMunicipality[name].pac
        }));

        return NextResponse.json({
            status: 'success',
            object: {
                totalHospitals,
                totalBeds,
                totalPatients,
                avgOccupancy,
                chartData,
                hospitals
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST create hospital
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const hospital = await hospitalRepo.create({
            name: body.name,
            code: body.code || `HOS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            type: body.type || 'HOSPITAL_GERAL',
            lat: parseFloat(body.lat),
            lng: parseFloat(body.lng),
            bedCapacity: parseInt(body.bedCapacity) || 0,
            currentPatients: parseInt(body.currentPatients) || 0,
            province: body.province,
            municipality: body.municipality,
            commune: body.commune,
            commonDiseases: body.commonDiseases || '{}'
        });
        return NextResponse.json({ status: 'success', data: hospital });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
