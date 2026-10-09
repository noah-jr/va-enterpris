// Route.ts for Units
import { NextResponse } from "next/server";
import { PrismaUnitRepository } from "@/infrastructure/db/repositories/ModelRepositories";
import { UnitService } from "@/application/services/GenericService";

const unitRepo = new PrismaUnitRepository();
const unitService = new UnitService(unitRepo);

/**
 * GET - Listar todas as unidades
 */
export async function GET() {
    try {
        const units = await unitService.getAll();
        return NextResponse.json(units);
    } catch (error) {
        console.error("API Units GET Error:", error);
        return NextResponse.json({ error: "Erro ao buscar unidades" }, { status: 500 });
    }
}

/**
 * POST - Criar nova unidade
 */
export async function POST(request: Request) {
    try {
        const data = await request.json();
        // Aqui deve entrar validação com Zod
        const newUnit = await unitService.create(data);
        return NextResponse.json(newUnit, { status: 201 });
    } catch (error) {
        console.error("API Units POST Error:", error);
        return NextResponse.json({ error: "Erro ao criar unidade" }, { status: 400 });
    }
}
