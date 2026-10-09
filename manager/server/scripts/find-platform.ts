
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findPlatform() {
  const users = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN' },
    include: { company: true }
  });

  console.log('SuperAdmins and their companies:');
  users.forEach(u => {
    console.log(`User: ${u.name} (${u.email}) | Company: ${u.company?.name || 'ROOT'} | ID: ${u.companyId}`);
  });
}

findPlatform().finally(() => prisma.$disconnect());
