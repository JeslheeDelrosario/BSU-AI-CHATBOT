// server/prisma/seeds/sample-consultation-bookings.seed.ts
// Creates sample consultation bookings for testing the faculty calendar

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedSampleConsultationBookings() {
  console.log('🌱 Seeding sample consultation bookings...');

  // Get faculty with consultation days set
  const facultyWithConsultation = await prisma.faculty.findMany({
    where: { consultationDays: { isEmpty: false } },
    take: 5
  });

  if (facultyWithConsultation.length === 0) {
    console.log('⚠️ No faculty with consultation days found. Skipping booking seed.');
    return;
  }

  // Get some students
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    take: 10
  });

  if (students.length === 0) {
    console.log('⚠️ No students found. Skipping booking seed.');
    return;
  }

  // Generate dates for the next 2 weeks
  const today = new Date();
  const dates: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const topics = [
    'Thesis consultation',
    'Grade inquiry',
    'Academic advising',
    'Research proposal discussion',
    'Project guidance',
    'Career counseling',
    'Course enrollment concerns',
    'Internship requirements',
    'Laboratory schedule',
    'Makeup exam request'
  ];

  const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED'] as const;

  let created = 0;
  let skipped = 0;

  for (const faculty of facultyWithConsultation) {
    // Find dates that match faculty's consultation days
    const availableDates = dates.filter(d => 
      faculty.consultationDays.includes(dayNames[d.getDay()])
    );

    // Create 2-4 bookings per faculty
    const numBookings = Math.min(availableDates.length, Math.floor(Math.random() * 3) + 2);
    
    for (let i = 0; i < numBookings; i++) {
      const date = availableDates[i];
      const student = students[Math.floor(Math.random() * students.length)];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      // Generate time slot within faculty's consultation hours
      const startHour = faculty.consultationStart 
        ? parseInt(faculty.consultationStart.split(':')[0]) 
        : 9;
      const slotHour = startHour + Math.floor(Math.random() * 3);
      const startTime = `${slotHour.toString().padStart(2, '0')}:00`;
      const endTime = `${slotHour.toString().padStart(2, '0')}:30`;

      // Determine status based on date
      let status: typeof statuses[number];
      if (date < today) {
        status = 'COMPLETED';
      } else if (date.getTime() === today.getTime()) {
        status = Math.random() > 0.5 ? 'CONFIRMED' : 'PENDING';
      } else {
        status = Math.random() > 0.3 ? 'PENDING' : 'CONFIRMED';
      }

      // Check if booking already exists
      const existing = await prisma.consultationBooking.findFirst({
        where: {
          facultyId: faculty.id,
          studentId: student.id,
          date: date,
          startTime: startTime
        }
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.consultationBooking.create({
        data: {
          facultyId: faculty.id,
          studentId: student.id,
          date: date,
          startTime: startTime,
          endTime: endTime,
          topic: topic,
          notes: Math.random() > 0.5 ? `Notes for ${topic.toLowerCase()}` : null,
          status: status
        }
      });
      created++;
    }
  }

  console.log(`✅ Sample bookings seeded: ${created} created, ${skipped} skipped (already exist)`);
}

// Run directly if executed as script
if (require.main === module) {
  seedSampleConsultationBookings()
    .then(() => prisma.$disconnect())
    .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
}
