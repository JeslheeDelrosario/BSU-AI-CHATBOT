import { PrismaClient, RoomType, MeetingType } from '@prisma/client';

const prisma = new PrismaClient();

const COLLEGE_OF_SCIENCE_ROOMS = [
  // Computer Science Building
  { name: 'CS-101', building: 'Computer Science Building', floor: 1, capacity: 40, type: RoomType.COMPUTER_LAB, facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Whiteboard'] },
  { name: 'CS-102', building: 'Computer Science Building', floor: 1, capacity: 45, type: RoomType.CLASSROOM, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Whiteboard', 'Sound System'] },
  { name: 'CS-201', building: 'Computer Science Building', floor: 2, capacity: 35, type: RoomType.COMPUTER_LAB, facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Smart Board'] },
  { name: 'CS-202', building: 'Computer Science Building', floor: 2, capacity: 30, type: RoomType.COMPUTER_LAB, facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Lab Equipment'] },
  { name: 'CS-301', building: 'Computer Science Building', floor: 3, capacity: 45, type: RoomType.COMPUTER_LAB, facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Smart Board', 'Video Conferencing'] },
  { name: 'CS-302', building: 'Computer Science Building', floor: 3, capacity: 25, type: RoomType.COMPUTER_LAB, facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Lab Equipment'] },
  { name: 'CS-401', building: 'Computer Science Building', floor: 4, capacity: 35, type: RoomType.COMPUTER_LAB, facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Smart Board', 'Lab Equipment'] },
  { name: 'CS-402', building: 'Computer Science Building', floor: 4, capacity: 30, type: RoomType.COMPUTER_LAB, facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Whiteboard'] },
  
  // Biology Building
  { name: 'BIO-101', building: 'Biology Building', floor: 1, capacity: 40, type: RoomType.LABORATORY, facilities: ['Lab Equipment', 'Microscopes', 'Air Conditioning', 'WiFi', 'Whiteboard', 'Storage Cabinets'] },
  { name: 'BIO-102', building: 'Biology Building', floor: 1, capacity: 35, type: RoomType.CLASSROOM, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Whiteboard'] },
  { name: 'BIO-201', building: 'Biology Building', floor: 2, capacity: 30, type: RoomType.LABORATORY, facilities: ['Lab Equipment', 'Microscopes', 'Air Conditioning', 'WiFi', 'Projector', 'Storage Cabinets'] },
  { name: 'BIO-202', building: 'Biology Building', floor: 2, capacity: 25, type: RoomType.LABORATORY, facilities: ['Lab Equipment', 'Microscopes', 'Air Conditioning', 'WiFi', 'Whiteboard'] },
  { name: 'BIO-301', building: 'Biology Building', floor: 3, capacity: 40, type: RoomType.CLASSROOM, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Whiteboard', 'Sound System'] },
  
  // Chemistry Building
  { name: 'CHEM-101', building: 'Chemistry Building', floor: 1, capacity: 35, type: RoomType.LABORATORY, facilities: ['Lab Equipment', 'Fume Hoods', 'Air Conditioning', 'WiFi', 'Safety Equipment', 'Storage Cabinets'] },
  { name: 'CHEM-102', building: 'Chemistry Building', floor: 1, capacity: 40, type: RoomType.CLASSROOM, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Whiteboard'] },
  { name: 'CHEM-201', building: 'Chemistry Building', floor: 2, capacity: 30, type: RoomType.LABORATORY, facilities: ['Lab Equipment', 'Fume Hoods', 'Air Conditioning', 'WiFi', 'Projector', 'Safety Equipment'] },
  { name: 'CHEM-202', building: 'Chemistry Building', floor: 2, capacity: 28, type: RoomType.LABORATORY, facilities: ['Lab Equipment', 'Air Conditioning', 'WiFi', 'Whiteboard', 'Storage Cabinets'] },
  { name: 'CHEM-301', building: 'Chemistry Building', floor: 3, capacity: 45, type: RoomType.LECTURE_HALL, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Sound System', 'Microphones'] },
  
  // Physics Building
  { name: 'PHYS-101', building: 'Physics Building', floor: 1, capacity: 35, type: RoomType.LABORATORY, facilities: ['Lab Equipment', 'Projector', 'Air Conditioning', 'WiFi', 'Whiteboard'] },
  { name: 'PHYS-102', building: 'Physics Building', floor: 1, capacity: 40, type: RoomType.CLASSROOM, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Whiteboard'] },
  { name: 'PHYS-201', building: 'Physics Building', floor: 2, capacity: 30, type: RoomType.LABORATORY, facilities: ['Lab Equipment', 'Projector', 'Air Conditioning', 'WiFi', 'Smart Board'] },
  { name: 'PHYS-301', building: 'Physics Building', floor: 3, capacity: 50, type: RoomType.LECTURE_HALL, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Sound System', 'Microphones', 'Video Conferencing'] },
  
  // Mathematics Building
  { name: 'MATH-101', building: 'Mathematics Building', floor: 1, capacity: 45, type: RoomType.CLASSROOM, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Whiteboard'] },
  { name: 'MATH-102', building: 'Mathematics Building', floor: 1, capacity: 40, type: RoomType.CLASSROOM, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Whiteboard'] },
  { name: 'MATH-201', building: 'Mathematics Building', floor: 2, capacity: 35, type: RoomType.CLASSROOM, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Smart Board'] },
  { name: 'MATH-202', building: 'Mathematics Building', floor: 2, capacity: 30, type: RoomType.STUDY_ROOM, facilities: ['Air Conditioning', 'WiFi', 'Whiteboard'] },
  { name: 'MATH-301', building: 'Mathematics Building', floor: 3, capacity: 60, type: RoomType.LECTURE_HALL, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Sound System', 'Microphones'] },
  
  // Science Complex
  { name: 'SCI-CONF-A', building: 'Science Complex', floor: 1, capacity: 20, type: RoomType.CONFERENCE, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Video Conferencing', 'Whiteboard'] },
  { name: 'SCI-CONF-B', building: 'Science Complex', floor: 1, capacity: 15, type: RoomType.CONFERENCE, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Video Conferencing'] },
  { name: 'SCI-AUD', building: 'Science Complex', floor: 2, capacity: 200, type: RoomType.AUDITORIUM, facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Sound System', 'Microphones', 'Video Conferencing'] },
  { name: 'SCI-LIB', building: 'Science Complex', floor: 3, capacity: 80, type: RoomType.LIBRARY, facilities: ['Air Conditioning', 'WiFi', 'Desktop Computers', 'Projector'] },
];

const SAMPLE_SCHEDULES = [
  { roomName: 'CS-101', title: 'Introduction to Programming', meetingType: MeetingType.CLASS, dayOffset: 0, startHour: 8, endHour: 10 },
  { roomName: 'CS-101', title: 'Data Structures Lab', meetingType: MeetingType.CLASS, dayOffset: 0, startHour: 13, endHour: 15 },
  { roomName: 'CS-201', title: 'Web Development Workshop', meetingType: MeetingType.WORKSHOP, dayOffset: 0, startHour: 10, endHour: 12 },
  { roomName: 'CS-301', title: 'AI/ML Seminar', meetingType: MeetingType.SEMINAR, dayOffset: 0, startHour: 14, endHour: 16 },
  { roomName: 'BIO-101', title: 'General Biology Lab', meetingType: MeetingType.CLASS, dayOffset: 0, startHour: 9, endHour: 12 },
  { roomName: 'BIO-201', title: 'Microbiology Lab', meetingType: MeetingType.CLASS, dayOffset: 0, startHour: 13, endHour: 16 },
  { roomName: 'CHEM-101', title: 'Organic Chemistry Lab', meetingType: MeetingType.CLASS, dayOffset: 0, startHour: 8, endHour: 11 },
  { roomName: 'CHEM-201', title: 'Analytical Chemistry Lab', meetingType: MeetingType.CLASS, dayOffset: 0, startHour: 14, endHour: 17 },
  { roomName: 'PHYS-101', title: 'Physics Lab I', meetingType: MeetingType.CLASS, dayOffset: 0, startHour: 10, endHour: 12 },
  { roomName: 'PHYS-201', title: 'Electronics Lab', meetingType: MeetingType.CLASS, dayOffset: 0, startHour: 13, endHour: 15 },
  { roomName: 'MATH-101', title: 'Calculus I', meetingType: MeetingType.CLASS, dayOffset: 0, startHour: 8, endHour: 10 },
  { roomName: 'MATH-201', title: 'Linear Algebra', meetingType: MeetingType.CLASS, dayOffset: 0, startHour: 10, endHour: 12 },
  { roomName: 'MATH-301', title: 'Statistics Lecture', meetingType: MeetingType.CLASS, dayOffset: 0, startHour: 14, endHour: 16 },
  { roomName: 'SCI-CONF-A', title: 'Faculty Meeting', meetingType: MeetingType.IN_PERSON, dayOffset: 0, startHour: 15, endHour: 17 },
  { roomName: 'SCI-AUD', title: 'Science Week Opening', meetingType: MeetingType.SEMINAR, dayOffset: 1, startHour: 9, endHour: 12 },
  { roomName: 'CS-102', title: 'Programming Fundamentals', meetingType: MeetingType.CLASS, dayOffset: 1, startHour: 8, endHour: 10 },
  { roomName: 'CS-202', title: 'Database Systems', meetingType: MeetingType.CLASS, dayOffset: 1, startHour: 10, endHour: 12 },
  { roomName: 'CS-401', title: 'Machine Learning Lab', meetingType: MeetingType.CLASS, dayOffset: 1, startHour: 13, endHour: 16 },
  { roomName: 'BIO-301', title: 'Genetics Lecture', meetingType: MeetingType.CLASS, dayOffset: 1, startHour: 14, endHour: 16 },
  { roomName: 'CHEM-301', title: 'Physical Chemistry Lecture', meetingType: MeetingType.CLASS, dayOffset: 1, startHour: 10, endHour: 12 },
  { roomName: 'PHYS-301', title: 'Quantum Physics Lecture', meetingType: MeetingType.CLASS, dayOffset: 1, startHour: 8, endHour: 10 },
];

export async function seedCollegeOfScienceRooms() {
  console.log('🏫 Seeding College of Science Rooms...');

  let roomsCreated = 0;
  let roomsSkipped = 0;
  const roomMap: Record<string, string> = {};

  for (const room of COLLEGE_OF_SCIENCE_ROOMS) {
    try {
      const existing = await prisma.room.findFirst({
        where: { name: room.name, building: room.building },
      });

      if (existing) {
        roomMap[room.name] = existing.id;
        roomsSkipped++;
        continue;
      }

      const created = await prisma.room.create({
        data: {
          name: room.name,
          building: room.building,
          floor: room.floor,
          capacity: room.capacity,
          type: room.type,
          facilities: room.facilities,
          isActive: true,
        },
      });

      roomMap[room.name] = created.id;
      roomsCreated++;
      console.log(`  ✅ Created room: ${room.name} (${room.building})`);
    } catch (error) {
      console.error(`  ❌ Failed to create room: ${room.name}`, error);
    }
  }

  console.log(`✅ Rooms: Created ${roomsCreated}, Skipped ${roomsSkipped} existing`);

  // Get admin user for organizer
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    console.log('⚠️ No admin user found, skipping schedule seeding');
    return;
  }

  console.log('📅 Seeding Sample Schedules...');

  let schedulesCreated = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const schedule of SAMPLE_SCHEDULES) {
    try {
      const roomId = roomMap[schedule.roomName];
      if (!roomId) {
        console.log(`  ⚠️ Room not found: ${schedule.roomName}`);
        continue;
      }

      const startTime = new Date(today);
      startTime.setDate(startTime.getDate() + schedule.dayOffset);
      startTime.setHours(schedule.startHour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(schedule.endHour, 0, 0, 0);

      // Check for existing meeting
      const existing = await prisma.meeting.findFirst({
        where: {
          roomId,
          title: schedule.title,
          startTime,
        },
      });

      if (existing) continue;

      await prisma.meeting.create({
        data: {
          title: schedule.title,
          organizerId: adminUser.id,
          roomId,
          meetingType: schedule.meetingType,
          startTime,
          endTime,
          status: 'SCHEDULED',
          isRecurring: false,
        },
      });

      schedulesCreated++;
      console.log(`  ✅ Created schedule: ${schedule.title} in ${schedule.roomName}`);
    } catch (error) {
      console.error(`  ❌ Failed to create schedule: ${schedule.title}`, error);
    }
  }

  console.log(`✅ Schedules: Created ${schedulesCreated}`);
}

export default seedCollegeOfScienceRooms;

// Run directly if executed as script
if (require.main === module) {
  seedCollegeOfScienceRooms()
    .then(() => {
      console.log('✅ College of Science rooms seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
