// server/prisma/seed.ts
import { PrismaClient, UserRole, LearningStyle, CourseLevel, CourseStatus, LessonType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding for AI Inclusive Learning Platform...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@ailearning.com' },
    update: {},
    create: {
      email: 'admin@ailearning.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('Created admin user: admin@ailearning.com');

  // Create sample teacher
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@ailearning.com' },
    update: {},
    create: {
      email: 'teacher@ailearning.com',
      password: teacherPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.TEACHER,
      isActive: true,
    },
  });
  console.log('Created teacher user: teacher@ailearning.com');

  // Create sample students
  const studentPassword = await bcrypt.hash('student123', 10);
  
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@ailearning.com' },
    update: {},
    create: {
      email: 'student1@ailearning.com',
      password: studentPassword,
      firstName: 'Alex',
      lastName: 'Martinez',
      role: UserRole.STUDENT,
      learningStyle: LearningStyle.VISUAL,
      gradeLevel: '10',
      isActive: true,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@ailearning.com' },
    update: {},
    create: {
      email: 'student2@ailearning.com',
      password: studentPassword,
      firstName: 'Jordan',
      lastName: 'Lee',
      role: UserRole.STUDENT,
      learningStyle: LearningStyle.AUDITORY,
      gradeLevel: '11',
      isActive: true,
    },
  });

  console.log('Created sample students');

  // Create accessibility settings for student1 (visual learner with dyslexia)
  await prisma.accessibilitySettings.upsert({
    where: { userId: student1.id },
    update: {},
    create: {
      userId: student1.id,
      fontSize: 18,
      fontFamily: 'OpenDyslexic',
      colorScheme: 'dyslexia',
      textToSpeechEnabled: true,
      ttsSpeed: 1.2,
      captionsEnabled: true,
      transcriptsEnabled: true,
    },
  });

  console.log('Created accessibility settings');

  // Create sample courses
  const mathCourse = await prisma.course.create({
    data: {
      title: 'Introduction to Algebra',
      description: 'Learn fundamental algebraic concepts with AI-powered personalized learning paths. Perfect for beginners!',
      level: CourseLevel.BEGINNER,
      status: CourseStatus.PUBLISHED,
      duration: 480, // 8 hours
      price: 0, // Free course
      tags: ['Math', 'Algebra', 'Beginner', 'STEM'],
      creatorId: teacher.id,
      teacherId: teacher.id,
      Lesson: {
        create: [
          {
            title: 'Welcome to Algebra',
            description: 'Introduction to algebraic thinking and basic concepts',
            type: LessonType.VIDEO,
            content: JSON.stringify({
              videoId: 'intro-algebra-001',
              description: 'Learn what algebra is and why it matters',
              keyPoints: ['Variables and constants', 'Expressions', 'Equations'],
            }),
            videoUrl: 'https://example.com/videos/intro-algebra.mp4',
            transcript: 'Welcome to Introduction to Algebra. In this lesson, we will explore what algebra is...',
            duration: 15,
            order: 1,
            isPublished: true,
          },
          {
            title: 'Variables and Expressions',
            description: 'Understanding variables, constants, and algebraic expressions',
            type: LessonType.INTERACTIVE,
            content: JSON.stringify({
              exercises: [
                { question: 'What is a variable?', type: 'multiple-choice' },
                { question: 'Simplify: 2x + 3x', type: 'short-answer' },
              ],
            }),
            duration: 20,
            order: 2,
            isPublished: true,
          },
          {
            title: 'Solving Simple Equations',
            description: 'Learn to solve one-step and two-step equations',
            type: LessonType.VIDEO,
            content: JSON.stringify({
              videoId: 'solving-equations-001',
              examples: ['x + 5 = 12', '2x = 10', '3x - 4 = 11'],
            }),
            videoUrl: 'https://example.com/videos/solving-equations.mp4',
            transcript: 'Now lets learn how to solve simple equations step by step...',
            duration: 25,
            order: 3,
            isPublished: true,
          },
        ],
      },
    },
  });

  const scienceCourse = await prisma.course.create({
    data: {
      title: 'Biology Basics: Cell Structure',
      description: 'Explore the fascinating world of cells with interactive 3D models and AI tutor support',
      level: CourseLevel.BEGINNER,
      status: CourseStatus.PUBLISHED,
      duration: 360, // 6 hours
      price: 0,
      tags: ['Science', 'Biology', 'Cells', 'Life Science'],
      creatorId: teacher.id,
      teacherId: teacher.id,
      Lesson: {
        create: [
          {
            title: 'Introduction to Cells',
            description: 'What are cells and why are they important?',
            type: LessonType.VIDEO,
            content: JSON.stringify({
              videoId: 'intro-cells-001',
              description: 'Discover the building blocks of life',
            }),
            videoUrl: 'https://example.com/videos/intro-cells.mp4',
            transcript: 'Cells are the basic unit of life. Every living organism is made of cells...',
            duration: 18,
            order: 1,
            isPublished: true,
          },
          {
            title: 'Cell Parts and Functions',
            description: 'Learn about organelles and their roles',
            type: LessonType.INTERACTIVE,
            content: JSON.stringify({
              interactiveModel: '3d-cell-model',
              organelles: ['nucleus', 'mitochondria', 'cell membrane', 'cytoplasm'],
            }),
            duration: 30,
            order: 2,
            isPublished: true,
          },
        ],
      },
    },
  });

  console.log('Created sample courses');

  // Enroll students in courses
  await prisma.enrollment.create({
    data: {
      userId: student1.id,
      courseId: mathCourse.id,
      progress: 33.33,
      lastAccessedAt: new Date(),
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: student2.id,
      courseId: mathCourse.id,
      progress: 0,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: student1.id,
      courseId: scienceCourse.id,
      progress: 50,
      lastAccessedAt: new Date(),
    },
  });

  console.log('Created enrollments');

  // Create some AI interactions
  await prisma.aIInteraction.create({
    data: {
      userId: student1.id,
      type: 'QUESTION',
      context: `Course: ${mathCourse.id}`,
      userMessage: 'Can you explain what a variable is in simple terms?',
      aiResponse: 'Of course! A variable is like a container or box that can hold different values. Think of it like a backpack - you can put different things in it at different times. In math, we use letters like x, y, or z to represent these containers. For example, if x = 5, then x is our variable and 5 is the value it currently holds.',
      helpful: true,
    },
  });

  await prisma.aIInteraction.create({
    data: {
      userId: student1.id,
      type: 'HINT',
      context: `Course: ${mathCourse.id}`,
      userMessage: 'I\'m stuck on solving 2x + 3 = 11',
      aiResponse: 'Great question! Here\'s a hint: Start by getting all the numbers on one side and the variable on the other. What would you subtract from both sides first to isolate the term with x?',
      helpful: true,
    },
  });

  console.log('Created AI interactions');

  // Create achievement
  await prisma.achievement.create({
    data: {
      userId: student1.id,
      type: 'COURSE_COMPLETION',
      title: 'First Lesson Complete!',
      description: 'Completed your first lesson in Introduction to Algebra',
      icon: '🎯',
      points: 10,
    },
  });

  console.log('Created achievements');

  // Create a study group
  await prisma.studyGroup.create({
    data: {
      name: 'Algebra Study Buddies',
      description: 'A group for students learning algebra together',
      courseId: mathCourse.id,
      maxMembers: 10,
      StudyGroupMember: {
        create: [
          {
            userId: student1.id,
            role: 'admin',
          },
          {
            userId: student2.id,
            role: 'member',
          },
        ],
      },
    },
  });

  console.log('Created study group');

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: student1.id,
      title: 'Welcome to AI Inclusive Learning!',
      message: 'Start your learning journey with personalized AI-powered education',
      type: 'info',
      link: '/dashboard',
    },
  });

  await prisma.notification.create({
    data: {
      userId: student1.id,
      title: 'New Lesson Available',
      message: 'Check out "Solving Simple Equations" in your Algebra course',
      type: 'success',
      link: `/courses/${mathCourse.id}`,
    },
  });

  console.log('Created notifications');

  console.log('Seeding completed!');
  console.log('\n=== Login Credentials ===');
  console.log('Admin: admin@ailearning.com / admin123');
  console.log('Teacher: teacher@ailearning.com / teacher123');
  console.log('Student 1: student1@ailearning.com / student123');
  console.log('Student 2: student2@ailearning.com / student123');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
