import { NextResponse } from 'next/server';
import { PrismaDemographicRepository } from '@/infrastructure/db/repositories/ModelRepositories';

const demoRepo = new PrismaDemographicRepository();

export async function GET() {
    try {
        const demographics = await demoRepo.findAll();

        const national = demographics.find((d: any) => d.regionType === 'NACIONAL');
        const regional = demographics.filter((d: any) => d.regionType !== 'NACIONAL');
        
        const totalPopulation = national ? national.totalPopulation : regional.reduce((acc: number, curr: any) => acc + curr.totalPopulation, 0);
        const avgDensity = national ? (national.density || 0) : (regional.reduce((acc: number, curr: any) => acc + (curr.density || 0), 0) / (regional.length || 1)).toFixed(1);
        const avgGrowth = national ? (national.growthRate || 0) : (regional.reduce((acc: number, curr: any) => acc + (curr.growthRate || 0), 0) / (regional.length || 1)).toFixed(1);
        
        // Data for charts
        const chartData = regional.map((r: any) => ({
            name: r.regionName,
            populacao: r.totalPopulation,
            densidade: r.density
        }));

        let pyramidData: any[] = [];
        if (national && national.agePyramid) {
            try {
                const parsed = typeof national.agePyramid === 'string' ? JSON.parse(national.agePyramid) : national.agePyramid;
                pyramidData = Object.keys(parsed).map(key => ({
                    idade: key,
                    percentagem: parsed[key]
                }));
            } catch (e) {}
        }

        return NextResponse.json({
            status: 'success',
            object: {
                totalPopulation,
                avgDensity,
                avgGrowth,
                chartData,
                pyramidData,
                demographics
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const demo = await demoRepo.create({
            regionName: body.regionName,
            regionType: body.regionType || 'MUNICIPAL',
            totalPopulation: parseInt(body.totalPopulation) || 0,
            density: parseFloat(body.density) || 0,
            growthRate: parseFloat(body.growthRate) || 0,
            agePyramid: body.agePyramid || '{}',
            birthRate: parseFloat(body.birthRate) || 0,
            lat: parseFloat(body.lat),
            lng: parseFloat(body.lng),
            province: body.province,
            municipality: body.municipality
        });
        return NextResponse.json({ status: 'success', data: demo });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
