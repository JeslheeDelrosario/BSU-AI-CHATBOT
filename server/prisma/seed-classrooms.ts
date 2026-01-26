import { PrismaClient, CourseLevel, CourseStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedClassrooms() {
  console.log('Starting classroom seeding...');

  try {
    // Get or create a teacher user
    let teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' }
    });

    if (!teacher) {
      console.log('No teacher found, creating default teacher...');
      teacher = await prisma.user.create({
        data: {
          email: 'teacher@bulsu.edu.ph',
          password: '$2b$10$YourHashedPasswordHere',
          firstName: 'Maria',
          lastName: 'Santos',
          role: 'TEACHER',
        }
      });
    }

    // Get or create courses
    const courses = await prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED },
      take: 5
    });

    if (courses.length === 0) {
      console.log('No courses found, creating sample courses...');
      
      const sampleCourses = [
        {
          title: 'Introduction to Computer Science',
          description: 'Learn the fundamentals of computer science and programming',
          level: CourseLevel.BEGINNER,
          status: CourseStatus.PUBLISHED,
          creatorId: teacher.id,
          teacherId: teacher.id,
          tags: ['Computer Science', 'Programming', 'Fundamentals']
        },
        {
          title: 'Data Structures and Algorithms',
          description: 'Master essential data structures and algorithmic thinking',
          level: CourseLevel.INTERMEDIATE,
          status: CourseStatus.PUBLISHED,
          creatorId: teacher.id,
          teacherId: teacher.id,
          tags: ['Data Structures', 'Algorithms', 'Programming']
        },
        {
          title: 'Web Development Fundamentals',
          description: 'Build modern web applications with HTML, CSS, and JavaScript',
          level: CourseLevel.BEGINNER,
          status: CourseStatus.PUBLISHED,
          creatorId: teacher.id,
          teacherId: teacher.id,
          tags: ['Web Development', 'HTML', 'CSS', 'JavaScript']
        },
        {
          title: 'Database Management Systems',
          description: 'Learn database design, SQL, and database administration',
          level: CourseLevel.INTERMEDIATE,
          status: CourseStatus.PUBLISHED,
          creatorId: teacher.id,
          teacherId: teacher.id,
          tags: ['Database', 'SQL', 'Data Management']
        },
        {
          title: 'Mobile App Development',
          description: 'Create mobile applications for iOS and Android',
          level: CourseLevel.ADVANCED,
          status: CourseStatus.PUBLISHED,
          creatorId: teacher.id,
          teacherId: teacher.id,
          tags: ['Mobile', 'iOS', 'Android', 'App Development']
        }
      ];

      for (const courseData of sampleCourses) {
        await prisma.course.create({ data: courseData });
      }

      console.log('Created 5 sample courses');
    }

    // Fetch courses again
    const availableCourses = await prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED },
      take: 10
    });

    // Clear existing classrooms
    await prisma.classroom.deleteMany({});
    console.log('Cleared existing classrooms');

    // Create test classrooms
    const classroomsData = [
      {
        courseId: availableCourses[0]?.id || '',
        name: 'CS 101 - Section A',
        section: 'Section A',
        description: 'Introduction to Computer Science - Morning class for first-year students',
      },
      {
        courseId: availableCourses[0]?.id || '',
        name: 'CS 101 - Section B',
        section: 'Section B',
        description: 'Introduction to Computer Science - Afternoon class for first-year students',
      },
      {
        courseId: availableCourses[1]?.id || '',
        name: 'CS 201 - Data Structures',
        section: 'Section A',
        description: 'Advanced data structures and algorithms for second-year CS students',
      },
      {
        courseId: availableCourses[2]?.id || '',
        name: 'Web Dev 101',
        section: 'Section A',
        description: 'Learn to build modern web applications from scratch',
      },
      {
        courseId: availableCourses[2]?.id || '',
        name: 'Web Dev 101 - Evening',
        section: 'Section B',
        description: 'Evening class for working students - Web development fundamentals',
      },
      {
        courseId: availableCourses[3]?.id || '',
        name: 'Database Systems',
        section: 'Section A',
        description: 'Comprehensive database management and SQL programming',
      },
      {
        courseId: availableCourses[4]?.id || '',
        name: 'Mobile Dev - iOS',
        section: 'iOS Track',
        description: 'iOS mobile application development with Swift',
      },
      {
        courseId: availableCourses[4]?.id || '',
        name: 'Mobile Dev - Android',
        section: 'Android Track',
        description: 'Android mobile application development with Kotlin',
      },
      {
        courseId: availableCourses[1]?.id || '',
        name: 'Algorithms Lab',
        section: 'Lab Section',
        description: 'Hands-on algorithm implementation and problem solving',
      },
      {
        courseId: availableCourses[3]?.id || '',
        name: 'Database Lab',
        section: 'Lab Section',
        description: 'Practical database design and SQL query optimization',
      },
    ];

    let createdCount = 0;
    for (const classroomData of classroomsData) {
      if (!classroomData.courseId) continue;

      await prisma.classroom.create({
        data: {
          ...classroomData,
          ClassroomMembers: {
            create: {
              userId: teacher.id,
              role: 'TEACHER'
            }
          }
        }
      });
      createdCount++;
    }

    console.log(`✓ Successfully created ${createdCount} classrooms`);
    console.log(`   - Teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.email})`);
    console.log(`   - All classrooms are now browseable`);
  } catch (error) {
    console.error('Error seeding classrooms:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedClassrooms()
  .catch((e) => {
    console.error(e);
    throw e;
  });
