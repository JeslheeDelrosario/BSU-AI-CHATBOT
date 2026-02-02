import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CS_CLASSROOMS = [
  {
    courseName: 'Introduction to Programming',
    courseCode: 'CS 101',
    classroomName: 'CS 101 - Introduction to Programming',
    section: 'Section A',
    description: 'Learn the fundamentals of programming using Python. Topics include variables, data types, control structures, functions, and basic algorithms.',
    tags: ['Programming', 'Python', 'Beginner', 'CS']
  },
  {
    courseName: 'Data Structures and Algorithms',
    courseCode: 'CS 201',
    classroomName: 'CS 201 - Data Structures and Algorithms',
    section: 'Section A',
    description: 'Study fundamental data structures (arrays, linked lists, stacks, queues, trees, graphs) and algorithms (sorting, searching, recursion).',
    tags: ['Data Structures', 'Algorithms', 'Intermediate', 'CS']
  },
  {
    courseName: 'Database Systems',
    courseCode: 'CS 202',
    classroomName: 'CS 202 - Database Systems',
    section: 'Section A',
    description: 'Introduction to database design, SQL, normalization, transactions, and database management systems.',
    tags: ['Database', 'SQL', 'Intermediate', 'CS']
  },
  {
    courseName: 'Software Engineering',
    courseCode: 'CS 301',
    classroomName: 'CS 301 - Software Engineering',
    section: 'Section A',
    description: 'Learn software development lifecycle, design patterns, testing, version control, and agile methodologies.',
    tags: ['Software Engineering', 'Development', 'Advanced', 'CS']
  },
  {
    courseName: 'Computer Networks',
    courseCode: 'CS 302',
    classroomName: 'CS 302 - Computer Networks',
    section: 'Section A',
    description: 'Study network protocols, TCP/IP, network security, routing, and network architecture.',
    tags: ['Networks', 'TCP/IP', 'Advanced', 'CS']
  },
  {
    courseName: 'Operating Systems',
    courseCode: 'CS 303',
    classroomName: 'CS 303 - Operating Systems',
    section: 'Section A',
    description: 'Explore OS concepts including processes, threads, memory management, file systems, and synchronization.',
    tags: ['Operating Systems', 'Systems', 'Advanced', 'CS']
  },
  {
    courseName: 'Artificial Intelligence & Machine Learning',
    courseCode: 'CS 401',
    classroomName: 'CS 401 - AI & Machine Learning',
    section: 'Section A',
    description: 'Introduction to AI concepts, machine learning algorithms, neural networks, and practical applications.',
    tags: ['AI', 'Machine Learning', 'Advanced', 'CS']
  },
  {
    courseName: 'Web Development',
    courseCode: 'CS 402',
    classroomName: 'CS 402 - Web Development',
    section: 'Section A',
    description: 'Full-stack web development covering HTML, CSS, JavaScript, React, Node.js, and modern web frameworks.',
    tags: ['Web Development', 'Full Stack', 'Advanced', 'CS']
  },
  {
    courseName: 'Cybersecurity',
    courseCode: 'CS 403',
    classroomName: 'CS 403 - Cybersecurity',
    section: 'Section A',
    description: 'Learn security principles, cryptography, network security, ethical hacking, and security best practices.',
    tags: ['Cybersecurity', 'Security', 'Advanced', 'CS']
  },
  {
    courseName: 'Mobile App Development',
    courseCode: 'CS 404',
    classroomName: 'CS 404 - Mobile App Development',
    section: 'Section A',
    description: 'Develop mobile applications for iOS and Android using React Native and modern mobile development practices.',
    tags: ['Mobile Development', 'React Native', 'Advanced', 'CS']
  }
];

export async function seedCSClassrooms() {
  console.log('🏫 Seeding Computer Science Classrooms...');

  // Get the teacher user
  const teacher = await prisma.user.findUnique({
    where: { email: 'teacher@ailearning.com' }
  });

  if (!teacher) {
    console.error('❌ Teacher user not found. Please run main seed first.');
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const classroomData of CS_CLASSROOMS) {
    try {
      // Check if course exists
      let course = await prisma.course.findFirst({
        where: { title: classroomData.courseName }
      });

      // Create course if it doesn't exist
      if (!course) {
        course = await prisma.course.create({
          data: {
            title: classroomData.courseName,
            description: classroomData.description,
            level: 'INTERMEDIATE',
            status: 'PUBLISHED',
            duration: 480, // 8 hours per week
            price: 0,
            tags: classroomData.tags,
            creatorId: teacher.id,
            teacherId: teacher.id,
          }
        });
        console.log(`  📚 Created course: ${course.title}`);
      }

      // Check if classroom already exists
      const existingClassroom = await prisma.classroom.findFirst({
        where: {
          courseId: course.id,
          name: classroomData.classroomName,
        }
      });

      if (existingClassroom) {
        skipped++;
        continue;
      }

      // Create classroom
      const classroom = await prisma.classroom.create({
        data: {
          courseId: course.id,
          name: classroomData.classroomName,
          section: classroomData.section,
          description: classroomData.description,
          ClassroomMembers: {
            create: {
              userId: teacher.id,
              role: 'TEACHER'
            }
          }
        },
        include: {
          Course: true,
          ClassroomMembers: {
            include: {
              User: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      created++;
      console.log(`  ✅ Created classroom: ${classroom.name}`);
      console.log(`     Teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.email})`);
    } catch (error) {
      console.error(`  ❌ Failed to create classroom: ${classroomData.classroomName}`, error);
    }
  }

  console.log(`✅ Created ${created} CS classrooms, skipped ${skipped} existing`);
  console.log(`👨‍🏫 All classrooms assigned to: ${teacher.firstName} ${teacher.lastName} (${teacher.email})`);
}

export default seedCSClassrooms;
