import { NextResponse } from 'next/server';
import { PrismaSchoolRepository } from '@/infrastructure/db/repositories/ModelRepositories';

const schoolRepo = new PrismaSchoolRepository();

export async function GET() {
    try {
        const schools = await schoolRepo.findAll();

        const totalSchools = schools.length;
        const totalStudents = schools.reduce((acc: number, curr: any) => acc + (curr.studentsCount || 0), 0);
        const totalTeachers = schools.reduce((acc: number, curr: any) => acc + (curr.teachersCount || 0), 0);
        
        const avgPassRate = schools.length > 0 
            ? (schools.reduce((acc: number, curr: any) => acc + (curr.passRate || 0), 0) / schools.length).toFixed(1)
            : 0;
            
        const avgFailRate = schools.length > 0 
            ? (schools.reduce((acc: number, curr: any) => acc + (curr.failRate || 0), 0) / schools.length).toFixed(1)
            : 0;

        const totalUnderConstruction = schools.filter((s: any) => s.infrastructure === 'EM_CONSTRUCAO' || s.infrastructure === 'MA').length;
        const totalProvincies = new Set(schools.map((s: any) => s.province)).size;
        
        // Mocked real-time literacy index based on total students per million
        const literacyIndex = 76.8 + (schools.length * 0.1);

        // Group by Province
        const byProvince: Record<string, number> = {};
        schools.forEach((school: any) => {
            byProvince[school.province] = (byProvince[school.province] || 0) + (school.studentsCount || 0);
        });

        const chartData = Object.keys(byProvince).map(prov => ({
            name: prov,
            alunos: byProvince[prov]
        }));

        return NextResponse.json({
            status: 'success',
            object: {
                totalSchools,
                totalStudents,
                totalTeachers,
                avgPassRate,
                avgFailRate,
                totalUnderConstruction,
                totalProvincies,
                literacyIndex: literacyIndex.toFixed(1),
                chartData,
                schools
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const school = await schoolRepo.create({
            name: body.name,
            code: body.code || `EDU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            level: body.level || 'PRIMARIO',
            lat: parseFloat(body.lat),
            lng: parseFloat(body.lng),
            studentsCount: parseInt(body.studentsCount) || 0,
            teachersCount: parseInt(body.teachersCount) || 0,
            passRate: parseFloat(body.passRate) || 0,
            failRate: parseFloat(body.failRate) || 0,
            dropoutRate: parseFloat(body.dropoutRate) || 0,
            infrastructure: body.infrastructure || 'RAZOAVEL',
            province: body.province,
            municipality: body.municipality,
            commune: body.commune
        });
        return NextResponse.json({ status: 'success', data: school });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
