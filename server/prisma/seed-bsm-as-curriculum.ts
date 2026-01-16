import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const curriculumData = [
  // First Year, 1st Semester
  { yearLevel: 1, semester: 1, courseCode: 'MAT 102', subjectName: 'Fundamentals of Computing', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'MAT 103', subjectName: 'Calculus I', lec: 5, lab: 0, totalUnits: 5, lecHours: 5, labHours: 0, totalHours: 5, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'MAS 102', subjectName: 'Statistical Analysis I', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'MMW 101', subjectName: 'Mathematics in the Modern World', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'PCM 101', subjectName: 'Purposive Communication', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'PAL 101', subjectName: 'Panitikan at Lipunan', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'PE 10', subjectName: 'PATHFIT 1', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },
  { yearLevel: 1, semester: 1, courseCode: 'NSTP 10', subjectName: 'National Service Training Program 1', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // First Year, 2nd Semester
  { yearLevel: 1, semester: 2, courseCode: 'MAT 104', subjectName: 'Fundamental Concept of Mathematics', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'MAT 105', subjectName: 'Calculus II', lec: 5, lab: 0, totalUnits: 5, lecHours: 5, labHours: 0, totalHours: 5, prerequisites: ['MAT 103'] },
  { yearLevel: 1, semester: 2, courseCode: 'MAT 107', subjectName: 'Probability', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 103'] },
  { yearLevel: 1, semester: 2, courseCode: 'MAS 103', subjectName: 'Survey Analysis and Operations', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'PID 101', subjectName: 'Pagsasalin sa Iba\'t Ibang Disiplina', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'UTS 101', subjectName: 'Understanding the Self', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'PE 11', subjectName: 'PATHFIT 2', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },
  { yearLevel: 1, semester: 2, courseCode: 'NSTP 11', subjectName: 'National Service Training Program 2', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // Second Year, 1st Semester
  { yearLevel: 2, semester: 1, courseCode: 'MAT 201', subjectName: 'Calculus III', lec: 5, lab: 0, totalUnits: 5, lecHours: 5, labHours: 0, totalHours: 5, prerequisites: ['MAT105'] },
  { yearLevel: 2, semester: 1, courseCode: 'MAT 207', subjectName: 'Abstract Algebra', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT104'] },
  { yearLevel: 2, semester: 1, courseCode: 'MAT 208', subjectName: 'Statistical Theory', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['MAT 107'] },
  { yearLevel: 2, semester: 1, courseCode: 'MAS 205', subjectName: 'Statistical Quality Control', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 107'] },
  { yearLevel: 2, semester: 1, courseCode: 'MST 101a', subjectName: 'Environmental Science', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'PHY201a', subjectName: 'Mechanics and Heat', lec: 3, lab: 1, totalUnits: 4, lecHours: 3, labHours: 3, totalHours: 6, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'ETH 101', subjectName: 'Ethics', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 1, courseCode: 'PE 12', subjectName: 'PATHFIT 3', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },

  // Second Year, 2nd Semester
  { yearLevel: 2, semester: 2, courseCode: 'MAT 204a', subjectName: 'Linear Algebra', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 104'] },
  { yearLevel: 2, semester: 2, courseCode: 'MAT 205', subjectName: 'Differential Equations', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT105'] },
  { yearLevel: 2, semester: 2, courseCode: 'MAT 206', subjectName: 'Number Theory', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT104'] },
  { yearLevel: 2, semester: 2, courseCode: 'MAS 203a', subjectName: 'Time Series Analysis and Forecasting', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['MAT208'] },
  { yearLevel: 2, semester: 2, courseCode: 'MAS 204a', subjectName: 'Statistical Analysis II', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['MAS 102', 'MAT208'] },
  { yearLevel: 2, semester: 2, courseCode: 'PHY202a', subjectName: 'Electricity, Lights and Sounds', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['PHY201a'] },
  { yearLevel: 2, semester: 2, courseCode: 'RPH 101', subjectName: 'Readings in Philippine History', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'SSP 101c', subjectName: 'Gender and Society', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 2, semester: 2, courseCode: 'PE 13', subjectName: 'PATHFIT 4', lec: 2, lab: 0, totalUnits: 2, lecHours: 2, labHours: 0, totalHours: 2, prerequisites: [] },

  // Third Year, 1st Semester
  { yearLevel: 3, semester: 1, courseCode: 'MAT 301', subjectName: 'Advanced Calculus', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 201'] },
  { yearLevel: 3, semester: 1, courseCode: 'MAT 302', subjectName: 'Modern Geometry', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 204a', 'MAT 207'] },
  { yearLevel: 3, semester: 1, courseCode: 'MAT 304a', subjectName: 'Operations Research', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['MAT 107', 'MAT 204a'] },
  { yearLevel: 3, semester: 1, courseCode: 'MAS 301', subjectName: 'Statistical Analysis III', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAS 204a'] },
  { yearLevel: 3, semester: 1, courseCode: 'MAS 303', subjectName: 'Statistical Software Applications', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['MAS 203a', 'MAS 204a'] },
  { yearLevel: 3, semester: 1, courseCode: 'MAS 305a', subjectName: 'Applied Multivariate Analysis', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['MAS 204a'] },
  { yearLevel: 3, semester: 1, courseCode: 'TWM 301', subjectName: 'Technical Writing in Mathematics', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 1, courseCode: 'TCW 101', subjectName: 'The Contemporary World', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
  { yearLevel: 3, semester: 1, courseCode: 'AAP 101', subjectName: 'Art Appreciation', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // Third Year, 2nd Semester
  { yearLevel: 3, semester: 2, courseCode: 'MAT 305', subjectName: 'Mathematical Modeling', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 102', 'MAT 204a', 'MAT 205'] },
  { yearLevel: 3, semester: 2, courseCode: 'MAT 306', subjectName: 'Graph Theory and Applications', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 204a'] },
  { yearLevel: 3, semester: 2, courseCode: 'MAT 308', subjectName: 'Real Analysis', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 301'] },
  { yearLevel: 3, semester: 2, courseCode: 'MAS 306', subjectName: 'Nonparametric Statistics', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: ['MAS 301'] },
  { yearLevel: 3, semester: 2, courseCode: 'MAS 308', subjectName: 'Categorical Data Analysis', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAS 301'] },
  { yearLevel: 3, semester: 2, courseCode: 'MAT 399a', subjectName: 'Thesis I', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 102', 'MAT 103', 'MAT 104', 'MAT 105', 'MAT107', 'MAT 201', 'MAT 204a', 'MAT 205', 'MAT 206', 'MAT 207', 'MAT 208', 'MAT 301', 'MAT 302', 'MAT304a', 'MAS 102', 'MAS 103', 'MAS205', 'MAS 203a', 'MAS 204', 'MAS 301', 'MAS 303', 'MAS 305a'] },
  { yearLevel: 3, semester: 2, courseCode: 'SSP 101d', subjectName: 'Entrepreneurial Mind', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // Fourth Year, 1st Semester
  { yearLevel: 4, semester: 1, courseCode: 'MAT 400a', subjectName: 'Thesis II', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 399a'] },
  { yearLevel: 4, semester: 1, courseCode: 'MAT 403', subjectName: 'Numerical Analysis', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 204a', 'MAT 205'] },
  { yearLevel: 4, semester: 1, courseCode: 'MAT 406', subjectName: 'Complex Analysis', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 301'] },
  { yearLevel: 4, semester: 1, courseCode: 'FEL 401a', subjectName: 'Free Elective I', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: [] },
  { yearLevel: 4, semester: 1, courseCode: 'RLW 401', subjectName: 'Rizal\'s Life and Works', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },

  // Fourth Year, 2nd Semester
  { yearLevel: 4, semester: 2, courseCode: 'INT 401', subjectName: 'Student Internship', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 250, prerequisites: ['MAT 305', 'MAT 306', 'MAT 308', 'MAT 400a', 'MAT 403', 'MAT 406', 'MAS 306', 'MAS 308'] },
  { yearLevel: 4, semester: 2, courseCode: 'MAT 404', subjectName: 'Actuarial Mathematics', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: ['MAT 105', 'MAT 107'] },
  { yearLevel: 4, semester: 2, courseCode: 'FEL 402a', subjectName: 'Free Elective II', lec: 2, lab: 1, totalUnits: 3, lecHours: 2, labHours: 3, totalHours: 5, prerequisites: [] },
  { yearLevel: 4, semester: 2, courseCode: 'STS 101', subjectName: 'Science, Technology, and Society', lec: 3, lab: 0, totalUnits: 3, lecHours: 3, labHours: 0, totalHours: 3, prerequisites: [] },
];

async function seedBSMASCurriculum() {
  try {
    console.log('Starting BSM Applied Statistics curriculum seeding...');

    // Check if program exists, if not create it
    let program = await prisma.universityProgram.findUnique({
      where: { title: 'Bachelor of Science in Mathematics With Specialization in Applied Statistics' }
    });

    if (!program) {
      console.log('Creating BSM Applied Statistics program...');
      program = await prisma.universityProgram.create({
        data: {
          title: 'Bachelor of Science in Mathematics With Specialization in Applied Statistics',
          abbreviation: 'BSM AS',
          college: 'College of Science',
          isActive: true,
          order: 6
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
    console.log(`   - Second Year: ${curriculumData.filter(e => e.yearLevel === 2).length} subjects`);
    console.log(`   - Third Year: ${curriculumData.filter(e => e.yearLevel === 3).length} subjects`);
    console.log(`   - Fourth Year: ${curriculumData.filter(e => e.yearLevel === 4).length} subjects`);
    console.log('\n[OK] BSM Applied Statistics curriculum seeding completed successfully!');

  } catch (error) {
    console.error('[ERROR] Error seeding BSM AS curriculum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedBSMASCurriculum();
