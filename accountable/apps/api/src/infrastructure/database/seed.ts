import '../config/env.js';
import { prisma } from './prisma.client.js';
import { BcryptHasher } from '../auth/bcrypt.hasher.js';

const PERMISSIONS = [
  // Documents
  { name: 'documents:create', description: 'Criar novos documentos/processos' },
  { name: 'documents:read', description: 'Visualizar documentos' },
  { name: 'documents:update', description: 'Editar metadados de documentos' },
  { name: 'documents:delete', description: 'Eliminar documentos' },
  { name: 'documents:change_status', description: 'Alterar estado de documentos' },
  { name: 'documents:assign', description: 'Atribuir documentos a consultores' },
  { name: 'documents:request_file', description: 'Solicitar documentos adicionais ao cliente' },

  // Files
  { name: 'files:upload', description: 'Fazer upload de ficheiros' },
  { name: 'files:download', description: 'Descarregar ficheiros' },
  { name: 'files:delete', description: 'Eliminar ficheiros' },

  // Messages
  { name: 'messages:send', description: 'Enviar mensagens no processo' },
  { name: 'messages:read', description: 'Ler mensagens no processo' },
  { name: 'messages:send_internal', description: 'Enviar notas internas no processo' },

  // Tickets
  { name: 'tickets:create', description: 'Criar tickets de suporte' },
  { name: 'tickets:read', description: 'Visualizar tickets de suporte' },
  { name: 'tickets:reply', description: 'Responder a tickets de suporte' },
  { name: 'tickets:update_status', description: 'Alterar estado de tickets' },

  // Clients
  { name: 'clients:read', description: 'Visualizar clientes' },
  { name: 'clients:update', description: 'Atualizar dados de clientes' },
  { name: 'clients:block', description: 'Bloquear/desbloquear clientes' },

  // Users & Roles
  { name: 'users:create', description: 'Criar utilizadores internos' },
  { name: 'users:read', description: 'Listar e ver utilizadores internos' },
  { name: 'users:update', description: 'Atualizar utilizadores internos' },
  { name: 'users:delete', description: 'Desativar/eliminar utilizadores internos' },
  { name: 'roles:manage', description: 'Gerir perfis e permissões' },

  // Audit
  { name: 'audit:read', description: 'Visualizar registos de auditoria' },

  // Backups
  { name: 'backups:create', description: 'Criar cópias de segurança' },
  { name: 'backups:read', description: 'Listar cópias de segurança' },
  { name: 'backups:restore', description: 'Restaurar cópias de segurança' },

  // Plans
  { name: 'plans:read', description: 'Visualizar planos de subscrição (admin)' },
  { name: 'plans:manage', description: 'Criar, editar e eliminar planos de subscrição' },

  // Contacts
  { name: 'contacts:read', description: 'Visualizar pedidos de contacto recebidos' },

  // Configurações do sistema
  { name: 'settings:manage', description: 'Gerir configurações do sistema (servidor de email)' },

  // Subscrições
  { name: 'subscriptions:read', description: 'Visualizar subscrições de clientes' },
  { name: 'subscriptions:manage', description: 'Criar, renovar, suspender e cancelar subscrições' },

  // Relatórios
  { name: 'reports:read', description: 'Visualizar estatísticas e gráficos do painel' },

  // Document Types (Templates & Slots Dinâmicos)
  { name: 'document_types:read', description: 'Visualizar tipos e slots de documentos' },
  { name: 'document_types:manage', description: 'Criar, editar e gerir tipos e slots de documentos' },
] as const;

const CONSULTANT_PERMISSIONS = [
  'documents:create',
  'documents:read',
  'documents:update',
  'documents:change_status',
  'documents:assign',
  'documents:request_file',
  'document_types:read',
  'files:upload',
  'files:download',
  'files:delete',
  'messages:send',
  'messages:read',
  'messages:send_internal',
  'tickets:create',
  'tickets:read',
  'tickets:reply',
  'tickets:update_status',
  'clients:read',
  'clients:update',
  'contacts:read',
  'subscriptions:read',
  'reports:read',
];

const SUPPORT_PERMISSIONS = [
  'documents:create',
  'documents:read',
  'files:upload',
  'files:download',
  'tickets:create',
  'tickets:read',
  'tickets:reply',
  'tickets:update_status',
  'clients:read',
  'contacts:read',
  'messages:read',
  'messages:send',
];

const PLAN_SEEDS = [
  {
    name: 'Starter',
    badge: 'Escritórios & Gabinetes',
    description:
      'Ideal para pequenas equipas que pretendem abandonar o email e organizar os processos com segurança.',
    priceMonthly: 45000,
    priceAnnual: 36000,
    currency: 'AOA',
    features: [
      'Até 250 processos de tramitação / mês',
      'Até 5 utilizadores internos (Consultores/Suporte)',
      'Clientes externos ilimitados com portal próprio',
      '50 GB de espaço para os seus documentos, sempre em segurança',
      'Cada ficheiro é verificado antes de ser aceite',
      'Acesso a documentos protegido, com ligações que expiram em 15 min',
      'Histórico completo de cada processo, guardado 12 meses',
      'Suporte técnico por email (resposta em até 24h)',
    ],
    ctaText: 'Começar com Starter',
    isPopular: false,
    sortOrder: 0,
  },
  {
    name: 'Profissional',
    badge: 'Mais Escolhido',
    description:
      'A solução definitiva para consultorias e departamentos jurídicos com fluxos volumosos e prazos rigorosos.',
    priceMonthly: 125000,
    priceAnnual: 100000,
    currency: 'AOA',
    features: [
      'Processos e tramitações ilimitadas',
      'Até 25 utilizadores, cada um com as permissões certas para a sua função',
      'Clientes externos ilimitados',
      '500 GB de espaço dedicado para os seus documentos',
      'Gestão de notas internas confidenciais',
      'Cópias de segurança automáticas e verificadas',
      'Histórico completo de cada processo, sem limite de tempo',
      'Controlo de prazos legais e notificações em tempo real',
      'Suporte prioritário 24/7 com SLA de 4 horas',
    ],
    ctaText: 'Aderir ao Profissional',
    isPopular: true,
    sortOrder: 1,
  },
  {
    name: 'Enterprise',
    badge: 'Banca & Setor Público',
    description:
      'Infraestrutura isolada, opções on-premises e acordos de nível de serviço com garantias contratuais.',
    priceMonthly: null,
    priceAnnual: null,
    currency: 'AOA',
    features: [
      'Tudo do plano Profissional',
      'Utilizadores e armazenamento à medida',
      'Opção de alojamento on-premises ou Cloud privada',
      'SLA garantido por contrato de 99.99%',
      'Gestor de conta e consultor de segurança dedicado',
      'Integração direta com ERPs corporativos e Webhooks',
      'Auditoria física e relatórios de conformidade ISO',
      'Formação presencial ou remota para as equipas',
    ],
    ctaText: 'Contactar Equipa Enterprise',
    isPopular: false,
    sortOrder: 2,
  },
];

export async function seed(): Promise<void> {
  console.log('Iniciando seed da base de dados...');

  // 1. Criar ou atualizar Permissões
  console.log('Seeding permissões...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: { name: perm.name, description: perm.description },
    });
  }

  // Obter todas as permissões do banco
  const allPermissions = await prisma.permission.findMany();
  const permMap = new Map<string, string>(allPermissions.map((p) => [p.name, p.id]));

  // 2. Criar ou atualizar Roles
  console.log('Seeding roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMINISTRATOR' },
    update: { description: 'Acesso total a todas as funcionalidades do sistema', isSystem: true },
    create: {
      name: 'ADMINISTRATOR',
      description: 'Acesso total a todas as funcionalidades do sistema',
      isSystem: true,
    },
  });

  const consultantRole = await prisma.role.upsert({
    where: { name: 'CONSULTANT' },
    update: { description: 'Tramitação e análise de processos documentais', isSystem: true },
    create: {
      name: 'CONSULTANT',
      description: 'Tramitação e análise de processos documentais',
      isSystem: true,
    },
  });

  const supportRole = await prisma.role.upsert({
    where: { name: 'SUPPORT' },
    update: { description: 'Atendimento e suporte ao cliente', isSystem: true },
    create: {
      name: 'SUPPORT',
      description: 'Atendimento e suporte ao cliente',
      isSystem: true,
    },
  });

  // 3. Associar Permissões aos Roles
  console.log('Associando permissões aos roles...');

  // ADMINISTRATOR recebe todas as permissões
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // CONSULTANT recebe CONSULTANT_PERMISSIONS
  for (const permName of CONSULTANT_PERMISSIONS) {
    const permId = permMap.get(permName);
    if (permId) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: consultantRole.id,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId: consultantRole.id,
          permissionId: permId,
        },
      });
    }
  }

  // SUPPORT recebe SUPPORT_PERMISSIONS
  for (const permName of SUPPORT_PERMISSIONS) {
    const permId = permMap.get(permName);
    if (permId) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: supportRole.id,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId: supportRole.id,
          permissionId: permId,
        },
      });
    }
  }

  // 4. Criar utilizador Administrador default se não existir
  console.log('Seeding utilizador Administrador inicial...');
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@accountable.local';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'AccountableAdmin2026!';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hasher = new BcryptHasher(12);
    const passwordHash = await hasher.hash(adminPassword);

    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        isActive: true,
      },
    });

    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: adminRole.id,
      },
    });

    console.log(`Utilizador administrador criado: ${adminEmail}`);
  } else {
    console.log(`Utilizador administrador já existe: ${adminEmail}`);
  }

  // 5. Criar cliente de teste default se não existir
  console.log('Seeding cliente de teste inicial...');
  const clientEmail = process.env.INITIAL_CLIENT_EMAIL || 'cliente@empresa.com';
  const clientPassword = process.env.INITIAL_CLIENT_PASSWORD || 'AccountableClient2026!';

  const existingClient = await prisma.client.findUnique({
    where: { email: clientEmail },
  });

  if (!existingClient) {
    const hasher = new BcryptHasher(12);
    const passwordHash = await hasher.hash(clientPassword);

    await prisma.client.create({
      data: {
        nip: '500123456',
        name: 'Empresa Demonstração Lda',
        company: 'Empresa Demonstração Lda',
        department: 'Financeiro',
        email: clientEmail,
        passwordHash,
        isActive: true,
        emailVerified: true,
      },
    });

    console.log(`Cliente de teste criado: ${clientEmail}`);
  } else {
    console.log(`Cliente de teste já existe: ${clientEmail}`);
  }

const DOCUMENT_TYPE_SEEDS = [
  {
    code: 'comprovativo_imposto',
    name: 'Comprovativo de Pagamento de Imposto',
    description: 'Comprovativos de liquidação de impostos (ex: DAR, IVA, IRT, Imposto Industrial, Imposto Predial).',
    category: 'Fiscal',
    required: true,
    isActive: true,
    sortOrder: 1,
    allowedExtensions: '.pdf,.png,.jpg,.jpeg',
  },
  {
    code: 'comprovativo_pagamentos',
    name: 'Comprovativo de Pagamentos',
    description: 'Comprovativos de pagamentos diversos e transferências efetuadas pela empresa.',
    category: 'Bancário',
    required: true,
    isActive: true,
    sortOrder: 2,
    allowedExtensions: '.pdf,.png,.jpg,.jpeg',
  },
  {
    code: 'extratos_bancarios',
    name: 'Extratos Bancarios',
    description: 'Extratos bancários mensais de todas as contas da instituição.',
    category: 'Bancário',
    required: true,
    isActive: true,
    sortOrder: 3,
    allowedExtensions: '.pdf,.xls,.xlsx,.csv',
  },
  {
    code: 'factura_fornecedores',
    name: 'Factura de Fornecedores',
    description: 'Faturas e recibos de compras e serviços prestados por fornecedores.',
    category: 'Contabilidade',
    required: true,
    isActive: true,
    sortOrder: 4,
    allowedExtensions: '.pdf,.png,.jpg,.jpeg',
  },
  {
    code: 'factura_vendas',
    name: 'Factura de Vendas',
    description: 'Faturas, faturas-recibo e notas de crédito/débito emitidas a clientes.',
    category: 'Contabilidade',
    required: true,
    isActive: true,
    sortOrder: 5,
    allowedExtensions: '.pdf,.png,.jpg,.jpeg',
  },
  {
    code: 'ficheiro_saft',
    name: 'Ficheiro Saft',
    description: 'Ficheiro SAF-T de faturação e contabilidade mensal no formato XML auditável.',
    category: 'Fiscal',
    required: true,
    isActive: true,
    sortOrder: 6,
    allowedExtensions: '.xml,.zip,.txt',
  },
  {
    code: 'folha_caixa',
    name: 'Folha de Caixa',
    description: 'Livro e mapa de fecho de caixa, reconciliação de numerário e pequenas despesas.',
    category: 'Tesouraria',
    required: true,
    isActive: true,
    sortOrder: 7,
    allowedExtensions: '.pdf,.xls,.xlsx',
  },
  {
    code: 'folha_salarios',
    name: 'Folha de Salários',
    description: 'Mapa de processamento salarial, recibos de vencimento e mapa de pessoal.',
    category: 'Recursos Humanos',
    required: true,
    isActive: true,
    sortOrder: 8,
    allowedExtensions: '.pdf,.xls,.xlsx',
  },
  {
    code: 'mapa_inss',
    name: 'Mapa de Guia de Pagamento INSS',
    description: 'Guia de pagamento da Segurança Social (INSS) e folhas de remuneração associadas.',
    category: 'Fiscal/Social',
    required: true,
    isActive: true,
    sortOrder: 9,
    allowedExtensions: '.pdf,.png,.jpg,.jpeg',
  },
  {
    code: 'outros_documentos',
    name: 'Outros Documentos',
    description: 'Documentação complementar, contratos, atas, pareceres ou declarações avulsas.',
    category: 'Geral',
    required: false,
    isActive: true,
    sortOrder: 10,
    allowedExtensions: '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip',
  },
  {
    code: 'recibo_pagamentos',
    name: 'Recibo de Pagamentos',
    description: 'Recibos de quitação e liquidação de dívidas/fornecimentos.',
    category: 'Tesouraria',
    required: true,
    isActive: true,
    sortOrder: 11,
    allowedExtensions: '.pdf,.png,.jpg,.jpeg',
  },
];

  // 6. Criar ou atualizar os Planos de subscrição
  console.log('Seeding planos de subscrição...');
  for (const planSeed of PLAN_SEEDS) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: planSeed.name, deletedAt: null },
    });

    if (existingPlan) {
      await prisma.plan.update({
        where: { id: existingPlan.id },
        data: planSeed,
      });
    } else {
      await prisma.plan.create({ data: planSeed });
    }
  }

  // 7. Criar ou atualizar os Tipos de Documentos Dinâmicos (Templates de Slots)
  console.log('Seeding tipos de documentos...');
  for (const docTypeSeed of DOCUMENT_TYPE_SEEDS) {
    const existingDocType = await prisma.documentType.findFirst({
      where: { code: docTypeSeed.code, deletedAt: null },
    });

    if (existingDocType) {
      await prisma.documentType.update({
        where: { id: existingDocType.id },
        data: docTypeSeed,
      });
    } else {
      await prisma.documentType.create({ data: docTypeSeed });
    }
  }

  console.log('Seed concluído com sucesso.');
}

// Executar diretamente se chamado via CLI
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seed()
    .catch((err: unknown) => {
      console.error('Erro durante o seed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
