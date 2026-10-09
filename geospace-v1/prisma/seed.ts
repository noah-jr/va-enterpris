import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Semeando Ecossistema GEOSPACE — Foco: ANGOLA (Operação Real)...')

  const hashedPassword = await bcrypt.hash('@Geospace2026', 10)

  // 1. Limpar Utilizadores
  console.log('  > Limpando base de dados...')
  await prisma.trafficUpdate.deleteMany()
  await prisma.incident.deleteMany()
  await prisma.densityPoint.deleteMany()
  await prisma.road.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.user.deleteMany()

  // 2. Matriz de Utilizadores (ACL)
  console.log('  > Criando matriz de utilizadores...')
  await prisma.user.createMany({
    data: [
      { name: 'Administrador Root', email: 'admin@geospace.hq', password: hashedPassword, role: 'SUPER_ADMIN', permissions: JSON.stringify(['ALL']) },
      { name: 'Carlos Coordenador', email: 'regional@geospace.hq', password: hashedPassword, role: 'ADMIN_REGIONAL', permissions: JSON.stringify(['VIEW_OPS', 'MANAGE_UNITS', 'VIEW_REPORTS']) },
      { name: 'Operador Central', email: 'operator@geospace.hq', password: hashedPassword, role: 'OPERADOR_GEOSPACE', permissions: JSON.stringify(['VIEW_MAP', 'REPORT_INCIDENT', 'VIEW_TRAFFIC']) },
      { name: 'Agente Terreno', email: 'agent@geospace.hq', password: hashedPassword, role: 'AGENTE_CAMPO', permissions: JSON.stringify(['VIEW_MAP', 'NEARBY_ALERTS']) }
    ]
  })

  // 3. Unidades Estratégicas (Fronteiras, Agências, Radares)
  console.log('  > Semeando Unidades Estratégicas...')
  await prisma.unit.createMany({
    data: [
      { code: 'SEC-01', name: 'Centro de Inteligência Norte', type: 'FRONTEIRA', lat: -8.7900, lng: 13.2300, sector: 'Norte', agentsCount: 45 },
      { code: 'AG-BNA', name: 'Agência BNA Central', type: 'AGENCIA', lat: -8.8200, lng: 13.2300, sector: 'Centro', agentsCount: 8 },
      { code: 'HUB-01', name: 'Radar de Longo Alcance Viana', type: 'ESTRATEGICA', lat: -8.9200, lng: 13.3700, sector: 'Leste', agentsCount: 12 },
      { code: 'SEC-02', name: 'Posto Fronteiriço Soyo', type: 'FRONTEIRA', lat: -6.1300, lng: 12.3700, sector: 'Norte', agentsCount: 30 },
      { code: 'HQ-Hambo', name: 'Comando Regional Huambo', type: 'ESTRATEGICA', lat: -12.7700, lng: 15.7400, sector: 'Sul', agentsCount: 85 },
      { code: 'PORT-LOB', name: 'Monitorização Porto do Lobito', type: 'AGENCIA', lat: -12.3500, lng: 13.5300, sector: 'Benguela', agentsCount: 15 }
    ]
  })

  // 4. Pontos de Densidade Populacional (Luanda Real)
  console.log('  > Semeando Monitorização de Densidade...')
  await prisma.densityPoint.createMany({
    data: [
      { name: 'Roque Santeiro / Rangel', lat: -8.8200, lng: 13.2700, densityValue: 95, populationCount: 85000, classification: 'CRÍTICA', riskScore: 90 },
      { name: 'Cazenga / Palanca', lat: -8.8600, lng: 13.3000, densityValue: 88, populationCount: 72000, classification: 'MUITO_ALTA', riskScore: 85 },
      { name: 'Ingombota / Baixa', lat: -8.8200, lng: 13.2300, densityValue: 75, populationCount: 45000, classification: 'ALTA', riskScore: 50 },
      { name: 'Sambizanga', lat: -8.8150, lng: 13.2500, densityValue: 82, populationCount: 61000, classification: 'MUITO_ALTA', riskScore: 78 },
      { name: 'Kilamba Kiaxi', lat: -8.9200, lng: 13.2600, densityValue: 65, populationCount: 38000, classification: 'ALTA', riskScore: 45 },
      { name: 'Talatona / Belas', lat: -8.9400, lng: 13.1800, densityValue: 35, populationCount: 28000, classification: 'MODERADA', riskScore: 20 },
      { name: 'Cacuaco Central', lat: -8.7600, lng: 13.3450, densityValue: 70, populationCount: 52000, classification: 'ALTA', riskScore: 55 }
    ]
  })

  // 5. Incidentes
  console.log('  > Semeando Incidentes Ativos...')
  const rootUser = await prisma.user.findFirst();
  await prisma.incident.createMany({
    data: [
      { code: 'INC-2025-001', title: 'Tentativa de assalto à agência bancária', type: 'SEGURANÇA', status: 'ATIVO', location: 'Agência BIC, Talatona', lat: -8.9300, lng: 13.1900, priority: 'ALTA', description: 'Suspeitos armados detectados na periferia.', reporterId: rootUser?.id },
      { code: 'INC-2025-002', title: 'Colisão múltipla — N1', type: 'ACIDENTE', status: 'EM_PROGRESSO', location: 'Estrada de Catete, Viana', lat: -8.9100, lng: 13.3500, priority: 'MEDIA', description: '3 viaturas envolvidas, via obstruída.', reporterId: rootUser?.id },
      { code: 'INC-2025-003', title: 'Incêndio Industrial', type: 'INCENDIO', status: 'ATIVO', location: 'Polo Industrial Viana', lat: -8.9000, lng: 13.3800, priority: 'ALTA', description: 'Fogo em armazém de plásticos.', reporterId: rootUser?.id }
    ]
  })

  // 6. Rodovias (Principais vias de Angola)
  console.log('  > Semeando Malha Rodoviária Estratégica...')
  await prisma.road.createMany({
    data: [
      { code: 'EN-100', name: 'Estrada do Morro Bento', type: 'PRINCIPAL', geometry: JSON.stringify([[-8.89, 13.18], [-8.94, 13.18], [-8.99, 13.17]]), status: 'BOA', maxSpeed: 100 },
      { code: 'EN-230', name: 'Via Expressa Fidel Castro', type: 'PRINCIPAL', geometry: JSON.stringify([[-8.85, 13.35], [-8.95, 13.35], [-9.10, 13.40]]), status: 'BOA', maxSpeed: 120 },
      { code: 'AV-4FEV', name: 'Avenida 4 de Fevereiro (Marginal)', type: 'PRINCIPAL', geometry: JSON.stringify([[-8.81, 13.22], [-8.82, 13.24]]), status: 'BOA', maxSpeed: 60 }
    ]
  })

  // 7. Tráfego em Tempo Real
  console.log('  > Semeando Monitorização de Tráfego...')
  await prisma.trafficUpdate.createMany({
    data: [
      { roadId: 'EN-100', avgSpeed: 65, vehicles: 1250, status: 'FLUIDO', delay: '0 min' },
      { roadId: 'EN-230', avgSpeed: 22, vehicles: 2840, status: 'CONGESTIONADO', delay: '45 min' },
      { roadId: 'AV-4FEV', avgSpeed: 35, vehicles: 820, status: 'LENTO', delay: '12 min' },
    ]
  })

  console.log('✅ Base de Dados GEOSPACE Angola Pronta!')
  console.log('🔑 Credenciais: admin@geospace.hq / @Geospace2026')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
