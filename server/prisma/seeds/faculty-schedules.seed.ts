// server/prisma/seeds/faculty-schedules.seed.ts
// Add teaching schedules for faculty members
// This seed file creates FacultySchedule entries for all faculty

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Faculty Schedule Data ───────────────────────────────────────────────────
// Format: { facultyName, schedules: [{ dayOfWeek, startTime, endTime, subject, room }] }

interface ScheduleEntry {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
}

interface FacultyScheduleData {
  firstName: string;
  lastName: string;
  schedules: ScheduleEntry[];
}

const FACULTY_SCHEDULES: FacultyScheduleData[] = [
  // ── Mathematics Department ────────────────────────────────────────────────
  {
    firstName: 'Arcel',
    lastName: 'Galvez',
    schedules: [
      { dayOfWeek: 'Monday', startTime: '08:00', endTime: '09:30', subject: 'Calculus I', room: 'Room 101' },
      { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '11:30', subject: 'Linear Algebra', room: 'Room 205' },
      { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '09:30', subject: 'Calculus II', room: 'Room 101' },
      { dayOfWeek: 'Thursday', startTime: '14:00', endTime: '15:30', subject: 'Calculus I', room: 'Room 102' },
      { dayOfWeek: 'Friday', startTime: '10:00', endTime: '11:30', subject: 'Linear Algebra', room: 'Room 205' },
    ],
  },
  {
    firstName: 'Marco',
    lastName: 'Mandap',
    schedules: [
      { dayOfWeek: 'Monday', startTime: '16:30', endTime: '18:30', subject: 'BST 305', room: 'Federizo Hall - FH 107 (Physics Lab)' },
      { dayOfWeek: 'Friday', startTime: '14:00', endTime: '17:00', subject: 'BST 305', room: 'Federizo Hall - FH 205' },
      { dayOfWeek: 'Saturday', startTime: '10:00', endTime: '13:00', subject: 'MBA 306', room: 'Federizo Hall - FH 207' },
      { dayOfWeek: 'Saturday', startTime: '13:00', endTime: '16:00', subject: 'MBA 306', room: 'Federizo Hall - FH 207' },
    ],
  },
  {
    firstName: 'Agape A.',
    lastName: 'Eusebio',
    schedules: [
      { dayOfWeek: 'Saturday', startTime: '10:00', endTime: '13:00', subject: 'MST 101d', room: 'Federizo Hall - FH 206' },
      { dayOfWeek: 'Saturday', startTime: '14:30', endTime: '17:30', subject: 'MST 101d', room: 'Federizo Hall - FH 206' },
    ],
  },
  {
    firstName: 'Lyca',
    lastName: 'Marcelino',
    schedules: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:30', subject: 'Discrete Mathematics', room: 'Room 103' },
      { dayOfWeek: 'Tuesday', startTime: '13:00', endTime: '14:30', subject: 'Abstract Algebra', room: 'Room 204' },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '10:30', subject: 'Discrete Mathematics', room: 'Room 103' },
      { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '11:30', subject: 'Numerical Methods', room: 'Room 206' },
      { dayOfWeek: 'Friday', startTime: '13:00', endTime: '14:30', subject: 'Abstract Algebra', room: 'Room 204' },
    ],
  },
  {
    firstName: 'Rainilyn',
    lastName: 'Duque',
    schedules: [
      { dayOfWeek: 'Monday', startTime: '10:00', endTime: '11:30', subject: 'Calculus III', room: 'Room 104' },
      { dayOfWeek: 'Tuesday', startTime: '14:00', endTime: '15:30', subject: 'Differential Equations', room: 'Room 207' },
      { dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '11:30', subject: 'Calculus III', room: 'Room 104' },
      { dayOfWeek: 'Thursday', startTime: '13:00', endTime: '14:30', subject: 'Mathematical Analysis', room: 'Room 208' },
      { dayOfWeek: 'Friday', startTime: '14:00', endTime: '15:30', subject: 'Differential Equations', room: 'Room 207' },
    ],
  },
  {
    firstName: 'Minerva',
    lastName: 'Amores',
    schedules: [
      { dayOfWeek: 'Monday', startTime: '11:00', endTime: '12:30', subject: 'Statistics and Probability', room: 'Room 105' },
      { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '10:30', subject: 'Operations Research', room: 'Room 209' },
      { dayOfWeek: 'Wednesday', startTime: '11:00', endTime: '12:30', subject: 'Statistics and Probability', room: 'Room 105' },
      { dayOfWeek: 'Thursday', startTime: '15:00', endTime: '16:30', subject: 'Calculus I', room: 'Room 106' },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '10:30', subject: 'Operations Research', room: 'Room 209' },
    ],
  },

  // ── Science Department ────────────────────────────────────────────────────
  {
    firstName: 'Edwin',
    lastName: 'Tadiosa',
    schedules: [
      { dayOfWeek: 'Monday', startTime: '08:00', endTime: '10:00', subject: 'General Biology', room: 'Lab 301' },
      { dayOfWeek: 'Tuesday', startTime: '13:00', endTime: '15:00', subject: 'Cell Biology', room: 'Lab 302' },
      { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '10:00', subject: 'General Biology', room: 'Lab 301' },
      { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '12:00', subject: 'Genetics', room: 'Room 301' },
      { dayOfWeek: 'Friday', startTime: '13:00', endTime: '15:00', subject: 'Cell Biology', room: 'Lab 302' },
    ],
  },
  {
    firstName: 'Oliver',
    lastName: 'Alaijos',
    schedules: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '11:00', subject: 'Clinical Chemistry', room: 'Lab 303' },
      { dayOfWeek: 'Tuesday', startTime: '14:00', endTime: '16:00', subject: 'Hematology', room: 'Lab 304' },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '11:00', subject: 'Clinical Chemistry', room: 'Lab 303' },
      { dayOfWeek: 'Thursday', startTime: '11:00', endTime: '13:00', subject: 'Medical Microbiology', room: 'Lab 305' },
      { dayOfWeek: 'Friday', startTime: '14:00', endTime: '16:00', subject: 'Hematology', room: 'Lab 304' },
    ],
  },
  {
    firstName: 'Rosario',
    lastName: 'Poñado',
    schedules: [
      { dayOfWeek: 'Monday', startTime: '10:00', endTime: '12:00', subject: 'Immunology and Serology', room: 'Lab 306' },
      { dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '10:00', subject: 'Parasitology', room: 'Lab 307' },
      { dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '12:00', subject: 'Immunology and Serology', room: 'Lab 306' },
      { dayOfWeek: 'Thursday', startTime: '14:00', endTime: '16:00', subject: 'Histopathology', room: 'Lab 308' },
      { dayOfWeek: 'Friday', startTime: '08:00', endTime: '10:00', subject: 'Parasitology', room: 'Lab 307' },
    ],
  },
  {
    firstName: 'Anna',
    lastName: 'Salunga',
    schedules: [
      { dayOfWeek: 'Monday', startTime: '11:00', endTime: '13:00', subject: 'Blood Banking and Transfusion Medicine', room: 'Lab 309' },
      { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '11:00', subject: 'Urinalysis and Body Fluids', room: 'Lab 310' },
      { dayOfWeek: 'Wednesday', startTime: '11:00', endTime: '13:00', subject: 'Blood Banking and Transfusion Medicine', room: 'Lab 309' },
      { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '11:00', subject: 'Clinical Microscopy', room: 'Lab 311' },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '11:00', subject: 'Urinalysis and Body Fluids', room: 'Lab 310' },
    ],
  },

  // ── Add more faculty as needed ────────────────────────────────────────────
  // Follow the same pattern above
];

export async function seedFacultySchedules() {
  console.log('🌱 Seeding faculty teaching schedules...');
  let created = 0;
  let skipped = 0;
  let notFound = 0;

  for (const scheduleData of FACULTY_SCHEDULES) {
    // Find faculty by name
    const faculty = await prisma.faculty.findFirst({
      where: {
        firstName: { equals: scheduleData.firstName, mode: 'insensitive' },
        lastName: { equals: scheduleData.lastName, mode: 'insensitive' },
      },
    });

    if (!faculty) {
      console.warn(`⚠️  Faculty not found: ${scheduleData.firstName} ${scheduleData.lastName}`);
      notFound++;
      continue;
    }

    // Delete existing schedules for this faculty (to avoid duplicates)
    await prisma.facultySchedule.deleteMany({
      where: { facultyId: faculty.id },
    });

    // Create new schedules
    for (const schedule of scheduleData.schedules) {
      await prisma.facultySchedule.create({
        data: {
          facultyId: faculty.id,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          subject: schedule.subject,
          room: schedule.room,
          scheduleType: 'CLASS',
        },
      });
      created++;
    }

    console.log(`✅ Added ${scheduleData.schedules.length} schedules for ${faculty.firstName} ${faculty.lastName}`);
  }

  console.log(`\n📊 Faculty schedules seeded:`);
  console.log(`   ✅ Created: ${created} schedule entries`);
  console.log(`   ⚠️  Not found: ${notFound} faculty members`);
}

async function main() {
  try {
    await seedFacultySchedules();
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run directly: npx ts-node prisma/seeds/faculty-schedules.seed.ts
if (require.main === module) {
  main();
}
