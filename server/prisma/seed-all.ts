// Comprehensive Prisma Seed Script
// This script seeds all database tables with proper data mapping
import { PrismaClient } from '@prisma/client';
import { seedFAQs } from './seed-faqs';
import { seedFaculty } from './seed-faculty';
import { seedFaculty as seedCollegeOfScienceFaculty, seedMedTechSubjects } from './seeds/college-of-science-faculty.seed';
import { seedBSMCSCurriculum } from './seed-bsm-cs-curriculum';
import { seedBSMASCurriculum } from './seed-bsm-as-curriculum';
import { seedBSMBACurriculum } from './seed-bsm-ba-curriculum';
import { seedBSBiologyCurriculum } from './seed-bs-biology-curriculum';
import { seedBSEnviSciCCCurriculum } from './seed-bs-envi-sci-cc-curriculum';
import { seedBSEnviSciPCCurriculum } from './seed-bs-envi-sci-pc-curriculum';
import { seedBSFoodTechCurriculum } from './seed-bs-food-tech-curriculum';

const prisma = new PrismaClient();

async function seedAll() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  try {
    // Step 1: Seed FAQs
    console.log('📚 Step 1/3: Seeding FAQs...');
    await seedFAQs();
    console.log('✅ FAQs seeded successfully\n');

    // Step 2: Seed Faculty
    console.log('👨‍🏫 Step 2/4: Seeding Faculty (existing)...');
    await seedFaculty();
    console.log('✅ Faculty seeded successfully\n');

    // Step 2b: Seed College of Science faculty from Excel
    console.log('🔬 Step 2b/4: Seeding College of Science faculty (Medical Technology, Biology, Mathematics)...');
    await seedCollegeOfScienceFaculty();
    await seedMedTechSubjects();
    console.log('✅ College of Science faculty and subjects seeded successfully\n');

    // Step 3: Seed Curriculum for all programs
    console.log('📖 Step 3/4: Seeding Curriculum...');
    
    console.log('  → Seeding BS Mathematics with Specialization in Computer Science...');
    await seedBSMCSCurriculum();
    
    console.log('  → Seeding BS Mathematics with Specialization in Applied Statistics...');
    await seedBSMASCurriculum();
    
    console.log('  → Seeding BS Mathematics with Specialization in Business Applications...');
    await seedBSMBACurriculum();
    
    console.log('  → Seeding BS Biology...');
    await seedBSBiologyCurriculum();
    
    console.log('  → Seeding BS Environmental Science (Climate Change)...');
    await seedBSEnviSciCCCurriculum();
    
    console.log('  → Seeding BS Environmental Science (Pollution Control)...');
    await seedBSEnviSciPCCurriculum();
    
    console.log('  → Seeding BS Food Technology...');
    await seedBSFoodTechCurriculum();
    
    console.log('✅ All curriculum seeded successfully\n');

    console.log('✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    
    // Get counts
    const faqCount = await prisma.fAQ.count();
    const facultyCount = await prisma.faculty.count();
    const programCount = await prisma.universityProgram.count();
    const curriculumCount = await prisma.curriculumEntry.count();
    
    console.log(`  • FAQs: ${faqCount}`);
    console.log(`  • Faculty: ${facultyCount}`);
    console.log(`  • Programs: ${programCount}`);
    console.log(`  • Curriculum Entries: ${curriculumCount}`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  seedAll()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedAll };
