// server/prisma/seeds/bsmt-curriculum.seed.ts
// Seed data for Bachelor of Science in Medical Technology curriculum

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PROGRAM_NAME = 'BS Medical Technology';

interface SubjectData {
  code: string;
  name: string;
  program: string;
}

const BSMT_SUBJECTS: SubjectData[] = [
  // FIRST YEAR - 1ST SEMESTER
  { code: 'GEC 101', name: 'Understanding the Self', program: PROGRAM_NAME },
  { code: 'GEC 102', name: 'Mathematics in the Modern World', program: PROGRAM_NAME },
  { code: 'GEC 103', name: 'Purposive Communication', program: PROGRAM_NAME },
  { code: 'BIO 101', name: 'General Biology', program: PROGRAM_NAME },
  { code: 'CHEM 101', name: 'General Chemistry', program: PROGRAM_NAME },
  { code: 'PE 101', name: 'PATHFIT 1', program: PROGRAM_NAME },
  { code: 'NSTP 101', name: 'National Service Training Program 1', program: PROGRAM_NAME },

  // FIRST YEAR - 2ND SEMESTER
  { code: 'GEC 104', name: 'Readings in Philippine History', program: PROGRAM_NAME },
  { code: 'GEC 105', name: 'The Contemporary World', program: PROGRAM_NAME },
  { code: 'GEC 106', name: 'Science, Technology and Society', program: PROGRAM_NAME },
  { code: 'BIO 102', name: 'Human Anatomy and Physiology', program: PROGRAM_NAME },
  { code: 'CHEM 102', name: 'Organic Chemistry', program: PROGRAM_NAME },
  { code: 'PE 102', name: 'PATHFIT 2', program: PROGRAM_NAME },
  { code: 'NSTP 102', name: 'National Service Training Program 2', program: PROGRAM_NAME },

  // SECOND YEAR - 1ST SEMESTER
  { code: 'MT 201', name: 'Clinical Chemistry 1', program: PROGRAM_NAME },
  { code: 'MT 202', name: 'Hematology 1', program: PROGRAM_NAME },
  { code: 'MT 203', name: 'Principles of Medical Laboratory Science', program: PROGRAM_NAME },
  { code: 'MT 204', name: 'Community & Public Health', program: PROGRAM_NAME },
  { code: 'BIO 201', name: 'Microbiology', program: PROGRAM_NAME },
  { code: 'PE 103', name: 'PATHFIT 3', program: PROGRAM_NAME },

  // SECOND YEAR - 2ND SEMESTER
  { code: 'MT 205', name: 'Clinical Chemistry 2', program: PROGRAM_NAME },
  { code: 'MT 206', name: 'Hematology 2', program: PROGRAM_NAME },
  { code: 'MT 207', name: 'Immunology & Serology', program: PROGRAM_NAME },
  { code: 'MT 208', name: 'Histopathologic Techniques', program: PROGRAM_NAME },
  { code: 'RIZAL 101', name: "Rizal's Life and Works", program: PROGRAM_NAME },
  { code: 'PE 104', name: 'PATHFIT 4', program: PROGRAM_NAME },

  // THIRD YEAR - 1ST SEMESTER
  { code: 'MT 301', name: 'Clinical Bacteriology', program: PROGRAM_NAME },
  { code: 'MT 302', name: 'Clinical Parasitology', program: PROGRAM_NAME },
  { code: 'MT 303', name: 'Clinical Microscopy (Urinalysis & Body Fluids)', program: PROGRAM_NAME },
  { code: 'MT 304', name: 'Immunohematology (Blood Banking)', program: PROGRAM_NAME },
  { code: 'MT 305', name: 'Mycology & Virology', program: PROGRAM_NAME },

  // THIRD YEAR - 2ND SEMESTER
  { code: 'MT 306', name: 'Clinical Toxicology', program: PROGRAM_NAME },
  { code: 'MT 307', name: 'Laboratory Management', program: PROGRAM_NAME },
  { code: 'MT 308', name: 'Medical Technology Laws & Ethics', program: PROGRAM_NAME },
  { code: 'MT 309', name: 'Research in Medical Technology (Thesis 1)', program: PROGRAM_NAME },

  // FOURTH YEAR
  { code: 'MT 401', name: 'Clinical Internship (Hospital-Based Laboratory Training)', program: PROGRAM_NAME },
  { code: 'MT 402', name: 'Research in Medical Technology (Thesis 2)', program: PROGRAM_NAME },
  { code: 'MT 403', name: 'Seminar / Comprehensive Review', program: PROGRAM_NAME },
];

export async function seedBSMTSubjects() {
  console.log('🔬 Seeding BS Medical Technology subjects...');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const subject of BSMT_SUBJECTS) {
    const existing = await prisma.subject.findFirst({
      where: { code: subject.code }
    });

    if (existing) {
      // Update program field if not set
      if (!existing.program) {
        await prisma.subject.update({
          where: { id: existing.id },
          data: { program: subject.program }
        });
        updated++;
      } else {
        skipped++;
      }
    } else {
      await prisma.subject.create({
        data: {
          code: subject.code,
          name: subject.name,
          program: subject.program
        }
      });
      created++;
    }
  }

  console.log(`✅ BS Medical Technology subjects seeded: ${created} created, ${updated} updated, ${skipped} skipped`);
}

// Run directly if executed as main
if (require.main === module) {
  seedBSMTSubjects()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error seeding BSMT subjects:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
