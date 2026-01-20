import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserClassrooms() {
  try {
    console.log('🔍 Checking user accounts and classroom memberships...\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log(`Found ${users.length} users:\n`);
    
    for (const user of users) {
      const memberships = await prisma.classroomMember.findMany({
        where: { userId: user.id },
        include: {
          Classroom: {
            select: { name: true }
          }
        }
      });

      console.log(`${user.role} - ${user.email} (${user.firstName} ${user.lastName})`);
      console.log(`  Classrooms: ${memberships.length}`);
      if (memberships.length > 0) {
        memberships.slice(0, 3).forEach(m => {
          console.log(`    - ${m.Classroom.name} (${m.role})`);
        });
        if (memberships.length > 3) {
          console.log(`    ... and ${memberships.length - 3} more`);
        }
      }
      console.log('');
    }

    // Get total classrooms
    const totalClassrooms = await prisma.classroom.count();
    console.log(`\n📊 Total classrooms in database: ${totalClassrooms}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkUserClassrooms()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
