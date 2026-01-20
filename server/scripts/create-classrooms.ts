import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createClassrooms() {
  try {
    console.log('🏫 Starting classroom creation...\n');

    // Get all active programs
    const programs = await prisma.universityProgram.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    console.log(`Found ${programs.length} active programs\n`);

    // Get all courses
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true }
    });

    if (courses.length === 0) {
      console.log('❌ No courses found. Please create courses first.');
      return;
    }

    console.log(`Found ${courses.length} courses\n`);

    // Get a teacher user to assign as classroom creator
    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' }
    });

    if (!teacher) {
      console.log('❌ No teacher found. Please create a teacher account first.');
      return;
    }

    console.log(`Using teacher: ${teacher.firstName} ${teacher.lastName}\n`);

    const yearLevels = [1, 2, 3, 4];
    const sections = ['A', 'B', 'C'];
    let createdCount = 0;

    // For each program, create classrooms for each year level
    for (const program of programs) {
      console.log(`\n📚 Processing: ${program.title} (${program.abbreviation})`);
      
      for (const year of yearLevels) {
        for (const section of sections) {
          // Use the first course as default (you can modify this logic)
          const course = courses[0];
          
          const classroomName = `${program.abbreviation} ${year}${section}`;
          const description = `${program.title} - Year ${year} Section ${section}`;

          // Check if classroom already exists
          const existing = await prisma.classroom.findFirst({
            where: {
              name: classroomName,
              courseId: course.id
            }
          });

          if (existing) {
            console.log(`  ⏭️  Skipped: ${classroomName} (already exists)`);
            continue;
          }

          // Generate a unique invite code
          const inviteCode = `${program.abbreviation?.replace(/\s+/g, '')}-${year}${section}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

          // Create classroom
          const classroom = await prisma.classroom.create({
            data: {
              courseId: course.id,
              name: classroomName,
              section: section,
              description: description,
              inviteCode: inviteCode,
              isArchived: false,
              updatedAt: new Date(),
              ClassroomMembers: {
                create: {
                  userId: teacher.id,
                  role: 'TEACHER'
                }
              }
            }
          });

          console.log(`  ✅ Created: ${classroomName} (Invite: ${inviteCode})`);
          createdCount++;
        }
      }
    }

    console.log(`\n\n🎉 Successfully created ${createdCount} classrooms!`);
    console.log(`\nClassroom Summary:`);
    
    const allClassrooms = await prisma.classroom.findMany({
      include: {
        Course: { select: { title: true } },
        _count: { select: { ClassroomMembers: true } }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`Total classrooms in database: ${allClassrooms.length}\n`);
    
    // Group by program
    const grouped = allClassrooms.reduce((acc, classroom) => {
      const programCode = classroom.name.split(' ')[0];
      if (!acc[programCode]) acc[programCode] = [];
      acc[programCode].push(classroom);
      return acc;
    }, {} as Record<string, typeof allClassrooms>);

    for (const [programCode, classrooms] of Object.entries(grouped)) {
      console.log(`\n${programCode}:`);
      classrooms.forEach(c => {
        console.log(`  - ${c.name} (Members: ${c._count.ClassroomMembers}, Invite: ${c.inviteCode})`);
      });
    }

  } catch (error) {
    console.error('❌ Error creating classrooms:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createClassrooms()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
