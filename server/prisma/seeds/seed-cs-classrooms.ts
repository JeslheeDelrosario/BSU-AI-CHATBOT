import { PrismaClient } from '@prisma/client';
import { seedCSClassrooms } from './cs-classrooms.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting CS Classrooms seeding...');
  await seedCSClassrooms();
  console.log('CS Classrooms seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during CS classrooms seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
