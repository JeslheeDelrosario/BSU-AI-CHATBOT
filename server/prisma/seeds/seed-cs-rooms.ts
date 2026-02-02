import { PrismaClient } from '@prisma/client';
import { seedCSRooms } from './cs-rooms.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting CS Rooms seeding...');
  await seedCSRooms();
  console.log('CS Rooms seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during CS rooms seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
