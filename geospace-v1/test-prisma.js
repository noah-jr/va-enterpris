const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const inc = await prisma.incident.count();
    console.log('Incidents:', inc);
    const users = await prisma.user.count();
    console.log('Users:', users);
    const units = await prisma.unit.count();
    console.log('Units:', units);
    const trips = await prisma.trip.count();
    console.log('Trips:', trips);
    console.log('SUCCESS');
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
