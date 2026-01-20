import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  // First Year, 1st Semester
  { yearLevel: 1, semester: 1, courseCode: 'PCM 101', subjectName: 'Purposive Communication', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'MMW 101', subjectName: 'Mathematics for the Modern World', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'RPH 101', subjectName: 'Readings in Philippine History', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'AAP 101', subjectName: 'Art Appreciation', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'PAL 101', subjectName: 'Panitikan at Lipunan', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'BOT 102', subjectName: 'Botany Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'BOT 102L', subjectName: 'Botany Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'ZOO 103', subjectName: 'Zoology Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'ZOO 103L', subjectName: 'Zoology Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'PE 10', subjectName: 'PATHFIT 1', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'NSTP 10', subjectName: 'National Service Training Program 10', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // First Year, 2nd Semester
  { yearLevel: 1, semester: 2, courseCode: 'UTS 101', subjectName: 'Understanding the Self', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'STS 101', subjectName: 'Science Technology & Society', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'PID 101', subjectName: 'Pagsasalin sa iba\'t ibang Disiplina', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'SYS 104', subjectName: 'Systematics Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['BOT 102', 'ZOO 103'] },
  { yearLevel: 1, semester: 2, courseCode: 'SYS 104L', subjectName: 'Systematics Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'ECO 105', subjectName: 'General Ecology Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'ECO 105L', subjectName: 'General Ecology Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'CHEM 106', subjectName: 'Chemical Biology I Lec (Organic Molecules)', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'CHEM 106L', subjectName: 'Chemical Biology Lab (Organic Molecules)', lec: 0, lab: 1, totalUnits: 1, lecHours: 0, labHours: 3, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'PE 11', subjectName: 'PATHFIT 2', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'NSTP 11', subjectName: 'National Service Training Program 11', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // Second Year, 1st Semester
  { yearLevel: 2, semester: 1, courseCode: 'ETH 101', subjectName: 'Ethics', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'INV 204', subjectName: 'Invertebrate Zoology Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['SYS 104', 'ECO 105'] },
  { yearLevel: 2, semester: 1, courseCode: 'INV 204L', subjectName: 'Invertebrate Zoology Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'ETB 201', subjectName: 'Ethnobotany Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'ETB 201L', subjectName: 'Ethnobotany Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'PHY 205', subjectName: 'Biophysics Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'PHY 205L', subjectName: 'Biophysics Lab', lec: 0, lab: 1, totalUnits: 1, lecHours: 0, labHours: 3, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'CHEM 203', subjectName: 'Chemical Biology II Lec (Analytical Methods for Biology)', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: ['CHEM 106'] },
  { yearLevel: 2, semester: 1, courseCode: 'CHEM 203L', subjectName: 'Chemical Biology II Lab (Analytical Methods for Biology)', lec: 0, lab: 1, totalUnits: 1, lecHours: 0, labHours: 3, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'PE 12', subjectName: 'PATHFIT 3', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },

  // Second Year, 2nd Semester
  { yearLevel: 2, semester: 2, courseCode: 'TCW 101', subjectName: 'The Contemporary World', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'AAH 101a', subjectName: 'Great Books', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'CHEM 204', subjectName: 'Chemical Biology III Lec (Biomolecules Lec)', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['CHEM 203'] },
  { yearLevel: 2, semester: 2, courseCode: 'CHEM 204L', subjectName: 'Chemical Biology III Lab (Biomolecules Lab)', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'MIC 205', subjectName: 'Microbiology Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['BOT 102', 'ZOO 103', 'SYS 104', 'ECO 105'] },
  { yearLevel: 2, semester: 2, courseCode: 'MIC 205L', subjectName: 'Microbiology Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'ECB 205', subjectName: 'Economic Botany Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['ETB 201'] },
  { yearLevel: 2, semester: 2, courseCode: 'ECB 205L', subjectName: 'Economic Botany Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'PE 13', subjectName: 'PATHFIT 4', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },

  // Third Year, 1st Semester
  { yearLevel: 3, semester: 1, courseCode: 'SSP 101d', subjectName: 'The Entrepreneurial Mind', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 1, courseCode: 'MST 101d', subjectName: 'Living in the IT Era', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 1, courseCode: 'RLW 101', subjectName: 'Rizal\'s Life and Works', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 1, courseCode: 'GEN 301', subjectName: 'Genetics Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['CHEM 204', 'MIC 205'] },
  { yearLevel: 3, semester: 1, courseCode: 'GEN 301L', subjectName: 'Genetics Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 3, semester: 1, courseCode: 'CMB 302', subjectName: 'Cell and Molecular Biology Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 1, courseCode: 'CMB 302L', subjectName: 'Cell and Molecular Biology Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },

  // Third Year, 2nd Semester
  { yearLevel: 3, semester: 2, courseCode: 'CVA 302', subjectName: 'Comparative Vertebrate Anatomy Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['ZOO 103', 'SYS 104', 'ECO 105', 'INV 204'] },
  { yearLevel: 3, semester: 2, courseCode: 'CVA 302L', subjectName: 'Comparative Vertebrate Anatomy Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 3, semester: 2, courseCode: 'PAR 304', subjectName: 'Parasitology Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['INV 204', 'MIC 205'] },
  { yearLevel: 3, semester: 2, courseCode: 'PAR 304L', subjectName: 'Parasitology Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 3, semester: 2, courseCode: 'BST 305', subjectName: 'Biostatistics Lec', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: ['MMW 101'] },
  { yearLevel: 3, semester: 2, courseCode: 'BST 305L', subjectName: 'Biostatistics Lab', lec: 0, lab: 1, totalUnits: 1, lecHours: 0, labHours: 3, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 2, courseCode: 'THE 306', subjectName: 'Thesis I', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },

  // Summer
  { yearLevel: 3, semester: 3, courseCode: 'OJT 307A', subjectName: 'On-the-Job Training', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 200, prerequisites: [] },

  // Fourth Year, 1st Semester
  { yearLevel: 4, semester: 1, courseCode: 'GPH 401', subjectName: 'General Physiology Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['CVA 302'] },
  { yearLevel: 4, semester: 1, courseCode: 'GPH 401L', subjectName: 'General Physiology Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 4, semester: 1, courseCode: 'DEV 402', subjectName: 'Developmental Biology Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 4, semester: 1, courseCode: 'DEV 402L', subjectName: 'Developmental Biology Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 4, semester: 1, courseCode: 'THE 403', subjectName: 'Thesis II', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: ['THE 306'] },
  { yearLevel: 4, semester: 1, courseCode: 'ELEC I', subjectName: 'Free Elective I (Personality Development)', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // Fourth Year, 2nd Semester
  { yearLevel: 4, semester: 2, courseCode: 'EVO 303', subjectName: 'Evolutionary Biology Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['GPH 201', 'DEV 202'] },
  { yearLevel: 4, semester: 2, courseCode: 'EVO 303L', subjectName: 'Evolutionary Biology Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 4, semester: 2, courseCode: 'THE 406', subjectName: 'Thesis III', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: ['THE 403'] },
  { yearLevel: 4, semester: 2, courseCode: 'ELEC II', subjectName: 'Free Elective 2 (Foreign Language)', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
];

async function seedBSBiologyCurriculum() {
  try {
    console.log('Starting BS Biology curriculum seeding...');

    let program = await prisma.universityProgram.findUnique({
      where: { title: 'Bachelor of Science in Biology' }
    });

    if (!program) {
      console.log('Creating BS Biology program...');
      program = await prisma.universityProgram.create({
        data: {
          title: 'Bachelor of Science in Biology',
          abbreviation: 'BS Biology',
          college: 'College of Science',
          isActive: true,
          order: 9
        }
      });
      console.log(`[OK] Created program: ${program.title}`);
    } else {
      console.log(`[OK] Program already exists: ${program.title}`);
    }

    const deleteResult = await prisma.curriculumEntry.deleteMany({
      where: { programId: program.id }
    });
    console.log(`Deleted ${deleteResult.count} existing curriculum entries`);

    console.log('Creating curriculum entries...');
    let createdCount = 0;

    for (const entry of curriculumData) {
      await prisma.curriculumEntry.create({
        data: {
          programId: program.id,
          yearLevel: entry.yearLevel,
          semester: entry.semester,
          courseCode: entry.courseCode,
          subjectName: entry.subjectName,
          lec: entry.lec,
          lab: entry.lab,
          totalUnits: entry.totalUnits,
          lecHours: entry.lecHours,
          labHours: entry.labHours,
          totalHours: entry.totalHours,
          prerequisites: entry.prerequisites
        }
      });
      createdCount++;
    }

    console.log(`[OK] Successfully created ${createdCount} curriculum entries`);
    console.log('\nSummary by Year:');
    console.log(`   - First Year: ${curriculumData.filter(e => e.yearLevel === 1).length} subjects`);
    console.log(`   - Second Year: ${curriculumData.filter(e => e.yearLevel === 2).length} subjects`);
    console.log(`   - Third Year: ${curriculumData.filter(e => e.yearLevel === 3).length} subjects (includes Summer OJT)`);
    console.log(`   - Fourth Year: ${curriculumData.filter(e => e.yearLevel === 4).length} subjects`);
    console.log('\n[OK] BS Biology curriculum seeding completed successfully!');

  } catch (error) {
    console.error('[ERROR] Error seeding BS Biology curriculum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedBSBiologyCurriculum();
