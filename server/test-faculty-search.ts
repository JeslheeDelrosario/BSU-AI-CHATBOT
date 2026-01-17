// Test script to check faculty search functionality
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFacultySearch() {
  console.log('🔍 Testing Faculty Search Functionality\n');

  // Test 1: Get all faculty
  console.log('1. All Faculty Members:');
  const allFaculty = await prisma.faculty.findMany({
    where: { college: { contains: 'College of Science', mode: 'insensitive' } },
    select: { firstName: true, lastName: true, position: true }
  });
  console.log(`   Found ${allFaculty.length} faculty members`);
  allFaculty.forEach(f => console.log(`   - ${f.firstName} ${f.lastName} (${f.position})`));

  // Test 2: Search by first name only
  console.log('\n2. Search by first name "Arcel":');
  const arcelSearch = await prisma.faculty.findMany({
    where: {
      college: { contains: 'College of Science', mode: 'insensitive' },
      OR: [
        { firstName: { contains: 'Arcel', mode: 'insensitive' } },
        { lastName: { contains: 'Arcel', mode: 'insensitive' } }
      ]
    }
  });
  console.log(`   Found ${arcelSearch.length} matches`);
  arcelSearch.forEach(f => console.log(`   - ${f.firstName} ${f.lastName} (${f.position})`));

  // Test 3: Search by first name "Benedict"
  console.log('\n3. Search by first name "Benedict":');
  const benedictSearch = await prisma.faculty.findMany({
    where: {
      college: { contains: 'College of Science', mode: 'insensitive' },
      OR: [
        { firstName: { contains: 'Benedict', mode: 'insensitive' } },
        { lastName: { contains: 'Benedict', mode: 'insensitive' } }
      ]
    }
  });
  console.log(`   Found ${benedictSearch.length} matches`);
  benedictSearch.forEach(f => console.log(`   - ${f.firstName} ${f.lastName} (${f.position})`));

  // Test 4: Check if there are any faculty at all
  const totalFaculty = await prisma.faculty.count();
  console.log(`\n4. Total faculty in database: ${totalFaculty}`);

  await prisma.$disconnect();
}

testFacultySearch().catch(console.error);
