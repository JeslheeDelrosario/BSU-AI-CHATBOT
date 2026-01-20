import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addStudentToClassrooms() {
  try {
    console.log('👥 Adding students to classrooms...\n');

    // Get student accounts
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' }
    });

    if (students.length === 0) {
      console.log('❌ No student accounts found.');
      return;
    }

    console.log(`Found ${students.length} student(s)\n`);

    // Get some sample classrooms (BSM CS classrooms)
    const classrooms = await prisma.classroom.findMany({
      where: {
        name: {
          startsWith: 'BSM CS'
        }
      },
      take: 12 // All BSM CS classrooms
    });

    console.log(`Found ${classrooms.length} BSM CS classrooms\n`);

    let addedCount = 0;

    // Add each student to BSM CS classrooms
    for (const student of students) {
      console.log(`Adding ${student.firstName} ${student.lastName} to classrooms...`);
      
      for (const classroom of classrooms) {
        // Check if already a member
        const existing = await prisma.classroomMember.findFirst({
          where: {
            classroomId: classroom.id,
            userId: student.id
          }
        });

        if (!existing) {
          await prisma.classroomMember.create({
            data: {
              classroomId: classroom.id,
              userId: student.id,
              role: 'STUDENT'
            }
          });
          console.log(`  ✅ Added to ${classroom.name}`);
          addedCount++;
        } else {
          console.log(`  ⏭️  Already in ${classroom.name}`);
        }
      }
      console.log('');
    }

    console.log(`\n🎉 Successfully added ${addedCount} classroom memberships!`);

    // Show summary
    console.log('\n📊 Student Classroom Summary:');
    for (const student of students) {
      const memberships = await prisma.classroomMember.count({
        where: { userId: student.id }
      });
      console.log(`  ${student.email}: ${memberships} classrooms`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addStudentToClassrooms()
  .then(() => {
    console.log('\n✨ Done! Students can now see their classrooms in the UI.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
