import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  // First Year, 1st Semester
  { yearLevel: 1, semester: 1, courseCode: 'PCM 101', subjectName: 'Purposive Communication', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'MMW 101', subjectName: 'Mathematics for the Modern World', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'RPH 101', subjectName: 'Readings in Philippine History', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'AAP 101', subjectName: 'Art Appreciation', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'PID 101', subjectName: 'Pagsasalin sa Iba\'t Ibang Disiplina', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'BIO 101', subjectName: 'Biology: Foundations of Life Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'BIO 101L', subjectName: 'Biology: Foundations of Life Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'PE 1', subjectName: 'PathFit 1', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'NSTP 10', subjectName: 'NSTP', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // First Year, 2nd Semester
  { yearLevel: 1, semester: 2, courseCode: 'STS 101', subjectName: 'Science Technology & Society', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'UTS 101', subjectName: 'Understanding the Self', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'MAT 102', subjectName: 'Trigonometry', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'BIO 102', subjectName: 'Biodiversity & Evolution Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['BIO 101'] },
  { yearLevel: 1, semester: 2, courseCode: 'BIO 102L', subjectName: 'Biodiversity & Evolution Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: ['BIO 101L'] },
  { yearLevel: 1, semester: 2, courseCode: 'ErS 102', subjectName: 'Earth Science Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'ErS 102L', subjectName: 'Earth Science Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'PE 2', subjectName: 'PathFit 2', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: ['PE 1'] },
  { yearLevel: 1, semester: 2, courseCode: 'NSTP 11', subjectName: 'NSTP', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // Second Year, 1st Semester
  { yearLevel: 2, semester: 1, courseCode: 'MAT 201', subjectName: 'Calculus 1', lec: 4, lab: 0, totalUnits: 4, lecHours: 4, labHours: 0, totalHours: 4, prerequisites: ['MAT 102'] },
  { yearLevel: 2, semester: 1, courseCode: 'CHE 201', subjectName: 'Analytical Chemistry Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'CHE 201L', subjectName: 'Analytical Chemistry Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'PHY 201', subjectName: 'Environmental Physics Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 102'] },
  { yearLevel: 2, semester: 1, courseCode: 'PHY 201L', subjectName: 'Environmental Physics Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: ['MAT 102'] },
  { yearLevel: 2, semester: 1, courseCode: 'ESC 201', subjectName: 'General Ecology Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['BIO 101', 'BIO 102'] },
  { yearLevel: 2, semester: 1, courseCode: 'ESC 201L', subjectName: 'General Ecology Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'ErS 201', subjectName: 'Geography', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['ErS 102'] },
  { yearLevel: 2, semester: 1, courseCode: 'PE 3', subjectName: 'PathFit 3', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: ['PE 2'] },

  // Second Year, 2nd Semester
  { yearLevel: 2, semester: 2, courseCode: 'TCW 101', subjectName: 'The Contemporary World', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'ETH 101', subjectName: 'Ethics', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'GIS 201', subjectName: 'Geographic Information System Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['ErS 102', 'ErS 201'] },
  { yearLevel: 2, semester: 2, courseCode: 'GIS 201L', subjectName: 'Geographic Information System Lab', lec: 0, lab: 1, totalUnits: 1, lecHours: 0, labHours: 3, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'ESC 202', subjectName: 'Soil Science Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['CHE 201', 'ErS 102'] },
  { yearLevel: 2, semester: 2, courseCode: 'ESC 202L', subjectName: 'Soil Science Lab', lec: 0, lab: 1, totalUnits: 1, lecHours: 0, labHours: 3, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'CHE 202', subjectName: 'Organic Chemistry Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['CHE 201'] },
  { yearLevel: 2, semester: 2, courseCode: 'CHE 202L', subjectName: 'Organic Chemistry Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'PE 4', subjectName: 'PathFit 4', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: ['PE 3'] },

  // Third Year, 1st Semester
  { yearLevel: 3, semester: 1, courseCode: 'PAL 101', subjectName: 'Panitikan at Lipunan', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 1, courseCode: 'ESM 301', subjectName: 'Coastal Resource Management', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 1, courseCode: 'ESC 301', subjectName: 'Aquatic and Terrestrial Ecosystem Sampling Techniques', lec: 3, lab: 1, totalUnits: 4, lecHours: 3, labHours: 3, totalHours: 6, prerequisites: ['ESC 201'] },
  { yearLevel: 3, semester: 1, courseCode: 'ESt 301', subjectName: 'Environmental Statistics', lec: 4, lab: 1, totalUnits: 5, lecHours: 4, labHours: 3, totalHours: 7, prerequisites: [] },
  { yearLevel: 3, semester: 1, courseCode: 'CHE 301', subjectName: 'Environmental Chemistry Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['CHE 202'] },
  { yearLevel: 3, semester: 1, courseCode: 'CHE 301L', subjectName: 'Environmental Chemistry Lab', lec: 0, lab: 2, totalUnits: 2, lecHours: 0, labHours: 6, totalHours: 6, prerequisites: [] },
  { yearLevel: 3, semester: 1, courseCode: 'IRS 301', subjectName: 'Introduction to Remote Sensing Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['PHY 202'] },
  { yearLevel: 3, semester: 1, courseCode: 'IRS 301L', subjectName: 'Introduction to Remote Sensing Lab', lec: 0, lab: 1, totalUnits: 1, lecHours: 0, labHours: 3, totalHours: 3, prerequisites: [] },

  // Third Year, 2nd Semester
  { yearLevel: 3, semester: 2, courseCode: 'THE 301', subjectName: 'Thesis 1', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 2, courseCode: 'SSP 101b', subjectName: 'Philippine Indigenous Communities', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 2, courseCode: 'ESC 302', subjectName: 'Environmental Monitoring Lec', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['CHE 202'] },
  { yearLevel: 3, semester: 2, courseCode: 'ESC 302L', subjectName: 'Environmental Monitoring Lab', lec: 0, lab: 1, totalUnits: 1, lecHours: 0, labHours: 3, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 2, courseCode: 'ESM 302', subjectName: 'Natural Resource Valuation and Economics', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['ESM 301'] },
  { yearLevel: 3, semester: 2, courseCode: 'ESC 303', subjectName: 'Climate Change Impacts, Mitigation and Adaptation', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 2, courseCode: 'CDM 301', subjectName: 'Foundations for Risk Assessment Management', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 2, courseCode: 'CDM 302', subjectName: 'Environmental Risk Assessment and Management', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 2, courseCode: 'CDM 303', subjectName: 'Disaster Risk Management', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // Midyear (Summer)
  { yearLevel: 3, semester: 3, courseCode: 'OJT', subjectName: 'On the Job Training', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 200, prerequisites: [] },

  // Fourth Year, 1st Semester
  { yearLevel: 4, semester: 1, courseCode: 'THE 401', subjectName: 'Thesis 2', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: ['THE 301'] },
  { yearLevel: 4, semester: 1, courseCode: 'CDM 401', subjectName: 'Community Based Disaster Risk Management', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['CDM 301', 'CDM 302', 'CDM 303'] },
  { yearLevel: 4, semester: 1, courseCode: 'CDM 402', subjectName: 'Rehabilitation and Recovery Management', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['CDM 301', 'CDM 302', 'CDM 303'] },
  { yearLevel: 4, semester: 1, courseCode: 'ESC 401', subjectName: 'Geological Hazards', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['GIS 201'] },
  { yearLevel: 4, semester: 1, courseCode: 'ESM 401', subjectName: 'Nature Based Solutions for Sustainable Development', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['ESM 302'] },

  // Fourth Year, 2nd Semester
  { yearLevel: 4, semester: 2, courseCode: 'THE 402', subjectName: 'Thesis 3', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: ['THE 401'] },
  { yearLevel: 4, semester: 2, courseCode: 'CDM 403', subjectName: 'Incident Command System Management', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['CDM 401', 'CDM 402'] },
  { yearLevel: 4, semester: 2, courseCode: 'EIA 402', subjectName: 'Environmental Impact Assessment System', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['ESC 401', 'ESM 401'] },
  { yearLevel: 4, semester: 2, courseCode: 'ESC 402', subjectName: 'Environmental Policies and Standards', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['ESC 401', 'ESM 401'] },
  { yearLevel: 4, semester: 2, courseCode: 'RLW 101', subjectName: 'Rizal\'s Life and Works', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
];

async function seedBSEnviSciCCCurriculum() {
  try {
    console.log('Starting BS Environmental Science - Climate Change curriculum seeding...');

    let program = await prisma.universityProgram.findUnique({
      where: { title: 'Bachelor of Science in Environmental Science With Specialization in Climate Change and Disaster Management' }
    });

    if (!program) {
      console.log('Creating BS Environmental Science - Climate Change program...');
      program = await prisma.universityProgram.create({
        data: {
          title: 'Bachelor of Science in Environmental Science With Specialization in Climate Change and Disaster Management',
          abbreviation: 'BS Envi Sci (CC)',
          college: 'College of Science',
          isActive: true,
          order: 8
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
    console.log('\n[OK] BS Environmental Science - Climate Change curriculum seeding completed successfully!');

  } catch (error) {
    console.error('[ERROR] Error seeding BS Envi Sci CC curriculum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedBSEnviSciCCCurriculum();
