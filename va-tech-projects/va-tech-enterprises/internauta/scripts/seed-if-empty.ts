import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Checking database state for seeding...')

        // Tenta contar registros. Se falhar a conexão, assume que não pode seedar agora.
        let userCount
        try {
            userCount = await prisma.user.count()
        } catch (e) {
            console.warn('Could not connect to database or User table does not exist. Skipping seed check.', e)
            return
        }

        const serviceCount = await prisma.service.count()
        const sectorCount = await prisma.sector.count()

        console.log(`Current state: ${userCount} users, ${serviceCount} services, ${sectorCount} sectors.`)

        if (userCount > 0 && serviceCount > 0 && sectorCount > 0) {
            console.log('Database already initialized with core data. Skipping seed.')
            return
        }

        console.log('Database is empty. Executing seed...')

        // Executa o comando de seed definido no package.json (prisma.seed)
        // Geralmente é "tsx prisma/seed.ts"
        const { stdout, stderr } = await execAsync('npx prisma db seed')

        console.log('Seed output:', stdout)
        if (stderr) {
            console.error('Seed stderr:', stderr)
        }

        console.log('Seed completed successfully.')

    } catch (error) {
        console.error('Unexpected error in seed-if-empty script:', error)
        // Não lançamos erro fatal (process.exit(1)) para não impedir o build de completar 
        // caso o problema seja apenas conexão temporária com o DB
    } finally {
        await prisma.$disconnect()
    }
}

main()
