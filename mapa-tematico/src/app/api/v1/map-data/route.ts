import { NextResponse } from 'next/server';
import { 
    PrismaSchoolRepository, 
    PrismaHospitalRepository, 
    PrismaDemographicRepository, 
    PrismaIncidentRepository 
} from '@/infrastructure/db/repositories/ModelRepositories';

const schoolRepo = new PrismaSchoolRepository();
const hospitalRepo = new PrismaHospitalRepository();
const demoRepo = new PrismaDemographicRepository();
const incidentRepo = new PrismaIncidentRepository();

export async function GET() {
    try {
        const [schools, hospitals, demographics, incidents] = await Promise.all([
            schoolRepo.findAll(),
            hospitalRepo.findAll(),
            demoRepo.findAll(),
            incidentRepo.findAll()
        ]);

        return NextResponse.json({
            status: 'success',
            data: {
                schools,
                hospitals,
                demographics,
                incidents
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
