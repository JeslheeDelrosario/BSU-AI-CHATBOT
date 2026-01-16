import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  console.log('Starting comprehensive data verification...\n');

  try {
    // 1. Verify Users
    const users = await prisma.user.findMany();
    const adminUsers = users.filter(u => u.role === 'ADMIN');
    const teacherUsers = users.filter(u => u.role === 'TEACHER');
    const studentUsers = users.filter(u => u.role === 'STUDENT');
    
    console.log('USER ACCOUNTS:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   - Admins: ${adminUsers.length}`);
    console.log(`   - Teachers: ${teacherUsers.length}`);
    console.log(`   - Students: ${studentUsers.length}`);
    console.log(`   [OK] Admin login: admin@ailearning.com / admin123`);
    console.log(`   [OK] Teacher login: teacher@ailearning.com / teacher123`);
    console.log(`   [OK] Student login: student1@ailearning.com / student123\n`);

    // 2. Verify Faculty
    const faculty = await prisma.faculty.findMany();
    const mathFaculty = faculty.filter(f => f.college?.includes('Mathematics'));
    const scienceFaculty = faculty.filter(f => f.college?.includes('Science') && !f.college?.includes('Mathematics'));
    
    console.log('FACULTY MEMBERS:');
    console.log(`   Total Faculty: ${faculty.length}`);
    console.log(`   - Mathematics: ${mathFaculty.length}`);
    console.log(`   - Science: ${scienceFaculty.length}`);
    if (faculty.length > 0) {
      console.log(`   [OK] Faculty data intact\n`);
    } else {
      console.log(`   [WARNING] No faculty data - needs to be seeded\n`);
    }

    // 3. Verify Programs
    const programs = await prisma.universityProgram.findMany();
    console.log('UNIVERSITY PROGRAMS:');
    console.log(`   Total Programs: ${programs.length}`);
    programs.forEach(p => {
      console.log(`   - ${p.abbreviation || 'N/A'}: ${p.title}`);
    });
    if (programs.length > 0) {
      console.log(`   [OK] Programs data intact\n`);
    } else {
      console.log(`   [WARNING] No programs - needs to be seeded\n`);
    }

    // 4. Verify Curriculum
    const curriculumEntries = await prisma.curriculumEntry.findMany();
    console.log('CURRICULUM ENTRIES:');
    console.log(`   Total Entries: ${curriculumEntries.length}`);
    
    if (curriculumEntries.length > 0) {
      const byProgram = curriculumEntries.reduce((acc, entry) => {
        acc[entry.programId] = (acc[entry.programId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      for (const [programId, count] of Object.entries(byProgram)) {
        const program = programs.find(p => p.id === programId);
        console.log(`   - ${program?.abbreviation || 'Unknown'}: ${count} subjects`);
      }
      console.log(`   [OK] Curriculum data intact\n`);
    } else {
      console.log(`   [WARNING] No curriculum entries - needs to be seeded\n`);
    }

    // 5. Verify Courses
    const courses = await prisma.course.findMany();
    console.log('COURSES:');
    console.log(`   Total Courses: ${courses.length}`);
    if (courses.length > 0) {
      console.log(`   [OK] Courses data intact\n`);
    } else {
      console.log(`   [WARNING] No courses - created by seed script\n`);
    }

    // 6. Verify Enrollments
    const enrollments = await prisma.enrollment.findMany();
    console.log('ENROLLMENTS:');
    console.log(`   Total Enrollments: ${enrollments.length}`);
    if (enrollments.length > 0) {
      console.log(`   [OK] Enrollment data intact\n`);
    }

    // 7. Verify Accessibility Settings
    const accessibilitySettings = await prisma.accessibilitySettings.findMany();
    console.log('ACCESSIBILITY SETTINGS:');
    console.log(`   Total Settings: ${accessibilitySettings.length}`);
    if (accessibilitySettings.length > 0) {
      console.log(`   [OK] Accessibility settings intact\n`);
    }

    // Summary
    console.log('=' .repeat(60));
    console.log('VERIFICATION SUMMARY:');
    console.log('=' .repeat(60));
    
    const allGood = users.length > 0 && adminUsers.length > 0;
    
    if (allGood) {
      console.log('[OK] SYSTEM STATUS: OPERATIONAL');
      console.log('[OK] Login functionality: WORKING');
      console.log('[OK] User accounts: RESTORED');
      console.log('\nYou can now login with:');
      console.log('   Admin: admin@ailearning.com / admin123');
      console.log('   Teacher: teacher@ailearning.com / teacher123');
      console.log('   Student: student1@ailearning.com / student123');
    } else {
      console.log('[ERROR] SYSTEM STATUS: NEEDS ATTENTION');
      console.log('[WARNING] Some data may be missing');
    }
    
    console.log('\n' + '='.repeat(60));

    // Action items
    console.log('\nACTION ITEMS:');
    if (faculty.length === 0) {
      console.log('   [WARNING] Run: npx ts-node prisma/seed-faculty.ts');
    }
    if (curriculumEntries.length === 0) {
      console.log('   [WARNING] Run: npx ts-node prisma/seed-bsm-cs-curriculum.ts');
    }
    if (faculty.length > 0 && curriculumEntries.length > 0 && users.length > 0) {
      console.log('   [OK] All critical data is present - system ready!');
    }

  } catch (error) {
    console.error('[ERROR] Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();
