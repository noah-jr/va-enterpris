import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Semeando Ecossistema OKUSANGA — Foco: ANGOLA (Operação Real)...')

  const hashedPassword = await bcrypt.hash('@Mtni2026', 10)

  // 1. Limpar Base de Dados
  console.log('  > Limpando base de dados...')
  await prisma.auditLog.deleteMany()
  await prisma.incident.deleteMany()
  await prisma.school.deleteMany()
  await prisma.hospital.deleteMany()
  await prisma.demographicData.deleteMany()
  await prisma.user.deleteMany()
  console.log('  > Base de dados limpa.')

  // 2. Matriz de Utilizadores (MTNI Roles)
  console.log('  > Criando matriz de utilizadores...')
  await prisma.user.createMany({
    data: [
      { name: 'Administrador Nacional', email: 'admin@mtni.gov.ao', password: hashedPassword, role: 'SUPER_ADMIN', permissions: JSON.stringify(['ALL']), status: 'ACTIVE' },
      { name: 'Gestor Provincial Luanda', email: 'luanda@mtni.gov.ao', password: hashedPassword, role: 'ADMIN_PROVINCIAL', permissions: JSON.stringify(['VIEW_PROVINCE', 'MANAGE_PROVINCE']), status: 'ACTIVE' },
      { name: 'Operador Central C1', email: 'central@mtni.gov.ao', password: hashedPassword, role: 'OPERADOR', permissions: JSON.stringify(['VIEW_MAP', 'REPORT_INCIDENT']), status: 'ACTIVE' },
      { name: 'Agente de Campo Alpha', email: 'campo@mtni.gov.ao', password: hashedPassword, role: 'OPERADOR', permissions: JSON.stringify(['REPORT_INCIDENT']), status: 'ACTIVE' }
    ]
  })
  console.log('  > Matriz de utilizadores criada.')

  // 3. Módulo Educação
  console.log('  > Semeando Escolas...')
  await prisma.school.createMany({
    data: [
      { code: 'ESC-001', name: 'Escola Primária 11 de Novembro', level: 'PRIMARIO', lat: -8.8390, lng: 13.2894, studentsCount: 1200, teachersCount: 35, passRate: 85.5, failRate: 10.2, dropoutRate: 4.3, infrastructure: 'RAZOAVEL', province: 'Luanda', municipality: 'Luanda', commune: 'Maianga' },
      { code: 'ESC-002', name: 'Liceu Mutu-ya-Kevela', level: 'SECUNDARIO', lat: -8.8234, lng: 13.2345, studentsCount: 3500, teachersCount: 110, passRate: 78.0, failRate: 15.0, dropoutRate: 7.0, infrastructure: 'BOA', province: 'Luanda', municipality: 'Luanda', commune: 'Ingombota' },
      { code: 'ESC-003', name: 'Instituto Médio Politécnico', level: 'SECUNDARIO', lat: -8.9213, lng: 13.3712, studentsCount: 2100, teachersCount: 85, passRate: 90.1, failRate: 8.4, dropoutRate: 1.5, infrastructure: 'BOA', province: 'Luanda', municipality: 'Viana', commune: 'Viana (Sede)' }
    ]
  })
  console.log('  > Módulo Educação concluído.')

  // 4. Módulo Saúde
  console.log('  > Semeando Hospitais...')
  await prisma.hospital.createMany({
    data: [
      { code: 'HOSP-001', name: 'Hospital Josina Machel', type: 'HOSPITAL_GERAL', lat: -8.8188, lng: 13.2322, bedCapacity: 800, currentPatients: 750, births: 12, deaths: 3, commonDiseases: JSON.stringify(['Malária', 'Dengue']), province: 'Luanda', municipality: 'Luanda', commune: 'Ingombota' },
      { code: 'HOSP-002', name: 'Hospital Geral de Luanda', type: 'HOSPITAL_GERAL', lat: -8.9100, lng: 13.2500, bedCapacity: 500, currentPatients: 495, births: 20, deaths: 5, commonDiseases: JSON.stringify(['Malária', 'Tuberculose']), province: 'Luanda', municipality: 'Kilamba Kiaxi', commune: 'Golfe' },
      { code: 'HOSP-003', name: 'Centro de Saúde Viana', type: 'CENTRO_SAUDE', lat: -8.9300, lng: 13.3800, bedCapacity: 50, currentPatients: 48, births: 5, deaths: 0, commonDiseases: JSON.stringify(['Gripe', 'Malária']), province: 'Luanda', municipality: 'Viana', commune: 'Viana (Sede)' }
    ]
  })
  console.log('  > Módulo Saúde concluído.')

  // 5. Módulo Demográfico
  console.log('  > Semeando Dados Demográficos...')
  await prisma.demographicData.createMany({
    data: [
      { regionName: 'Angola', regionType: 'NACIONAL', totalPopulation: 34000000, density: 27.3, growthRate: 3.2, birthRate: 38.5, agePyramid: JSON.stringify({ '0-14': 46, '15-64': 51, '65+': 3 }), lat: -11.2, lng: 17.8 },
      { regionName: 'Luanda', regionType: 'PROVINCIAL', totalPopulation: 9000000, density: 450.0, growthRate: 4.1, birthRate: 35.0, agePyramid: JSON.stringify({ '0-14': 40, '15-64': 57, '65+': 3 }), lat: -8.8390, lng: 13.2894, province: 'Luanda' },
      { regionName: 'Viana', regionType: 'MUNICIPAL', totalPopulation: 2500000, density: 850.5, growthRate: 5.0, birthRate: 39.0, agePyramid: JSON.stringify({ '0-14': 42, '15-64': 56, '65+': 2 }), lat: -8.9213, lng: 13.3712, province: 'Luanda', municipality: 'Viana' }
    ]
  })
  console.log('  > Módulo Demográfico concluído.')

  // 6. Módulo Sinistralidade (Incidentes)
  console.log('  > Semeando Incidentes...')
  const rootUser = await prisma.user.findFirst();
  await prisma.incident.createMany({
    data: [
      { code: 'INC-2026-001', title: 'Acidente de Viação - Via Expressa', type: 'ACIDENTE', status: 'ATIVO', location: 'Via Expressa, Luanda', lat: -8.9300, lng: 13.3500, priority: 'ALTA', description: 'Acidente envolvendo 3 viaturas', reporterId: rootUser?.id, province: 'Luanda', municipality: 'Viana' },
      { code: 'INC-2026-002', title: 'Incêndio em Escola Primária', type: 'OCORRENCIA', status: 'RESOLVIDO', location: 'Cazenga', lat: -8.8600, lng: 13.3000, priority: 'BAIXA', description: 'Controlado pelos bombeiros locais.', reporterId: rootUser?.id, province: 'Luanda', municipality: 'Cazenga' }
    ]
  })
  console.log('  > Módulo Sinistralidade concluído.')

  console.log('✅ Base de Dados MTNI Angola Pronta!')
  console.log('🔑 Credenciais: admin@mtni.gov.ao / @Mtni2026')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
