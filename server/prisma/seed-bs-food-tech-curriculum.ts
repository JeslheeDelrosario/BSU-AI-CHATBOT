
// server\prisma\seed-bs-food-tech-curriculum.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  // First Year, 1st Semester
  { yearLevel: 1, semester: 1, courseCode: 'PCM 101', subjectName: 'Purposive Communication', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'MMW 101', subjectName: 'Mathematics in the Modern World', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'RPH 101', subjectName: 'Readings in Philippine History', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'AAP 101', subjectName: 'Art Appreciation', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'PE 10', subjectName: 'PATHFit 1', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'NSTP 10', subjectName: 'National Service Training Program 1', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'CHE 102/L', subjectName: 'Qualitative Chemistry', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'BFP 201/201L', subjectName: 'Basic Food Preparation', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'FIF 102', subjectName: 'Introduction to Food Science and Technology', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // First Year, 2nd Semester
  { yearLevel: 1, semester: 2, courseCode: 'PHY 106', subjectName: 'Applied Physics', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'MAT 204', subjectName: 'Calculus (Integral and Differential)', lec: 5, lab: 0, totalUnits: 5, lecHours: 5, labHours: 0, totalHours: 5, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'STS 101', subjectName: 'Science Technology and Society', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'PE 11', subjectName: 'PATHFit 2', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'NSTP 11', subjectName: 'National Service Training Program 2', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['NSTP 10'] },
  { yearLevel: 1, semester: 2, courseCode: 'FMB 104/104L', subjectName: 'General Microbiology', lec: 3, lab: 2, totalUnits: 5, lecHours: 3, labHours: 6, totalHours: 9, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'CHE 105/105L', subjectName: 'Quantitative Chemistry', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['CHE102/L'] },
  { yearLevel: 1, semester: 2, courseCode: 'FCS 401', subjectName: 'Culinary Science and Technology', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // Second Year, 1st Semester
  { yearLevel: 2, semester: 1, courseCode: 'MST 101d', subjectName: 'Living in the IT Era', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'PE 12', subjectName: 'PATHFit 3', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'PID 101', subjectName: 'Pagsasalin sa Iba\'t-ibang Disiplina', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'CHE202/202L', subjectName: 'Organic Chemistry', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['CHE105/105L'] },
  { yearLevel: 2, semester: 1, courseCode: 'FBM 103', subjectName: 'Business Management and Entrepreneurship', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'FMB 203/203L', subjectName: 'Food Microbiology', lec: 3, lab: 2, totalUnits: 5, lecHours: 3, labHours: 6, totalHours: 9, prerequisites: ['FMB 104/104L'] },
  { yearLevel: 2, semester: 1, courseCode: 'FFP 310', subjectName: 'Food Packaging and Labelling', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'RLW 101', subjectName: 'Life and Works of Rizal', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'TCW 101', subjectName: 'The Contemporary World', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // Second Year, 2nd Semester
  { yearLevel: 2, semester: 2, courseCode: 'UTS 101', subjectName: 'Understanding the Self', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'PE 13', subjectName: 'PATHFit 4', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'FPR 206/206L', subjectName: 'Food Processing I', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['FMB 203/203L'] },
  { yearLevel: 2, semester: 2, courseCode: 'CHE 207/207L', subjectName: 'General Biochemistry', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['CHE202/202L'] },
  { yearLevel: 2, semester: 2, courseCode: 'FCH 208/208L', subjectName: 'Food Chemistry I', lec: 3, lab: 2, totalUnits: 5, lecHours: 3, labHours: 6, totalHours: 9, prerequisites: ['CHE 207/207L', 'CHE202/202L'] },
  { yearLevel: 2, semester: 2, courseCode: 'MAT305', subjectName: 'Applied Statistics', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'CHE 306/306L', subjectName: 'Physical Chemistry', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: [] },

  // Second Year Midyear - OJT-1
  { yearLevel: 2, semester: 3, courseCode: 'OJT-1', subjectName: 'On-the-Job Training', lec: 5, lab: 0, totalUnits: 5, lecHours: 5, labHours: 0, totalHours: 250, prerequisites: [] },

  // Third Year, 1st Semester
  { yearLevel: 3, semester: 1, courseCode: 'ETH 101', subjectName: 'Ethics', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 1, courseCode: 'FPR 301/301L', subjectName: 'Food Processing II', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['FPR 206/206L', 'FMB 203/203L'] },
  { yearLevel: 3, semester: 1, courseCode: 'FSE 303/302L', subjectName: 'Sensory Evaluation', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['MAT 305'] },
  { yearLevel: 3, semester: 1, courseCode: 'FBN 403', subjectName: 'Basic Nutrition', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['BFP 201/201L', 'CHE 207/207L'] },
  { yearLevel: 3, semester: 1, courseCode: 'FFE 304/304L', subjectName: 'Food Engineering', lec: 3, lab: 2, totalUnits: 5, lecHours: 3, labHours: 6, totalHours: 9, prerequisites: ['FPR 301/301L'] },
  { yearLevel: 3, semester: 1, courseCode: 'FCH 307/307L', subjectName: 'Food Chemistry II', lec: 3, lab: 2, totalUnits: 5, lecHours: 3, labHours: 6, totalHours: 9, prerequisites: ['FCH 302/302L'] },

  // Third Year, 2nd Semester
  { yearLevel: 3, semester: 2, courseCode: 'FFS 308', subjectName: 'Food Safety', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['FMB 203/203L', 'FPR 206/206L', 'FPR 301/301L'] },
  { yearLevel: 3, semester: 2, courseCode: 'FFA 309', subjectName: 'Food Analysis', lec: 3, lab: 2, totalUnits: 5, lecHours: 3, labHours: 6, totalHours: 9, prerequisites: ['FCH 307/307L', 'FSE 303/302L', 'FMB 203/203L'] },
  { yearLevel: 3, semester: 2, courseCode: 'FPH 303/303L', subjectName: 'Post-harvest Handling Technology', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['FMB 206/206L', 'FCH 307/307L'] },
  { yearLevel: 3, semester: 2, courseCode: 'FBT 406', subjectName: 'Biotechnology', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 2, courseCode: 'TW1', subjectName: 'Technical / Scientific Writing', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // Third Year Midyear - OJT-2
  { yearLevel: 3, semester: 3, courseCode: 'OJT-2', subjectName: 'On-the-Job Training', lec: 6, lab: 0, totalUnits: 6, lecHours: 6, labHours: 0, totalHours: 300, prerequisites: [] },

  // Fourth Year, 1st Semester
  { yearLevel: 4, semester: 1, courseCode: 'FFL 401', subjectName: 'Food Laws', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['FPR 301/301L'] },
  { yearLevel: 4, semester: 1, courseCode: 'FQA 402/402L', subjectName: 'Food Quality Assurance', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['FPR 301/301L', 'FFS 203', 'MAT305'] },
  { yearLevel: 4, semester: 1, courseCode: 'FPD 404/404L', subjectName: 'Food Product Development and Innovation', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['FPR 301/301L', 'FFP 310', 'FSE 303/302L', 'FFA 309'] },
  { yearLevel: 4, semester: 1, courseCode: 'FMR 405', subjectName: 'Methods of Research in Food Science and Technology', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['TW1'] },

  // Fourth Year, 2nd Semester
  { yearLevel: 4, semester: 2, courseCode: 'FUS 407', subjectName: 'Undergraduate Seminar', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 4, semester: 2, courseCode: 'FTH 409', subjectName: 'Thesis', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['FMR 405'] },
  { yearLevel: 4, semester: 2, courseCode: 'FES 408', subjectName: 'Environmental Sustainability in the Food Industry', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['FPR 301/301L', 'FFA 309', 'FFS 203'] },
];

async function seedBSFoodTechCurriculum() {
  try {
    console.log('Starting BS Food Technology curriculum seeding...');

    // Check if program exists, if not create it
    let program = await prisma.universityProgram.findUnique({
      where: { title: 'Bachelor of Science in Food Technology' }
    });

    if (!program) {
      console.log('Creating BS Food Technology program...');
      program = await prisma.universityProgram.create({
        data: {
          title: 'Bachelor of Science in Food Technology',
          abbreviation: 'BS Food Tech',
          college: 'College of Science',
          isActive: true,
          order: 5
        }
      });
      console.log(`[OK] Created program: ${program.title}`);
    } else {
      console.log(`[OK] Program already exists: ${program.title}`);
    }

    // Delete existing curriculum entries for this program
    const deleteResult = await prisma.curriculumEntry.deleteMany({
      where: { programId: program.id }
    });
    console.log(`Deleted ${deleteResult.count} existing curriculum entries`);

    // Create curriculum entries
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
    console.log(`   - Second Year: ${curriculumData.filter(e => e.yearLevel === 2).length} subjects (includes Midyear OJT-1)`);
    console.log(`   - Third Year: ${curriculumData.filter(e => e.yearLevel === 3).length} subjects (includes Midyear OJT-2)`);
    console.log(`   - Fourth Year: ${curriculumData.filter(e => e.yearLevel === 4).length} subjects`);
    console.log('\n[OK] BS Food Technology curriculum seeding completed successfully!');

  } catch (error) {
    console.error('[ERROR] Error seeding BS Food Tech curriculum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedBSFoodTechCurriculum();

export { seedBSFoodTechCurriculum };
