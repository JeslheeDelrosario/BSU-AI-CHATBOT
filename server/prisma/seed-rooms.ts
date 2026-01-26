import { PrismaClient, RoomType } from '@prisma/client';

const prisma = new PrismaClient();

const roomsData = [
  {
    name: 'Room 101',
    building: 'Science Building A',
    floor: 1,
    capacity: 40,
    type: RoomType.CLASSROOM,
    facilities: ['Whiteboard', 'Projector', 'Air Conditioning', 'WiFi'],
  },
  {
    name: 'Room 102',
    building: 'Science Building A',
    floor: 1,
    capacity: 35,
    type: RoomType.CLASSROOM,
    facilities: ['Whiteboard', 'Projector', 'Air Conditioning'],
  },
  {
    name: 'Room 201',
    building: 'Science Building A',
    floor: 2,
    capacity: 45,
    type: RoomType.CLASSROOM,
    facilities: ['Smart Board', 'Projector', 'Air Conditioning', 'WiFi', 'Sound System'],
  },
  {
    name: 'Room 202',
    building: 'Science Building A',
    floor: 2,
    capacity: 40,
    type: RoomType.CLASSROOM,
    facilities: ['Whiteboard', 'Projector', 'Air Conditioning', 'WiFi'],
  },
  {
    name: 'Lab 103',
    building: 'Science Building A',
    floor: 1,
    capacity: 30,
    type: RoomType.LABORATORY,
    facilities: ['Lab Equipment', 'Fume Hood', 'Safety Shower', 'Eye Wash Station', 'Storage Cabinets'],
  },
  {
    name: 'Lab 104',
    building: 'Science Building A',
    floor: 1,
    capacity: 30,
    type: RoomType.LABORATORY,
    facilities: ['Lab Equipment', 'Microscopes', 'Incubator', 'Centrifuge', 'Storage Cabinets'],
  },
  {
    name: 'Computer Lab 301',
    building: 'Science Building B',
    floor: 3,
    capacity: 50,
    type: RoomType.COMPUTER_LAB,
    facilities: ['50 Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Printer'],
  },
  {
    name: 'Computer Lab 302',
    building: 'Science Building B',
    floor: 3,
    capacity: 40,
    type: RoomType.COMPUTER_LAB,
    facilities: ['40 Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi'],
  },
  {
    name: 'Conference Room A',
    building: 'Science Building B',
    floor: 2,
    capacity: 20,
    type: RoomType.CONFERENCE,
    facilities: ['Conference Table', 'Video Conferencing', 'Smart TV', 'Whiteboard', 'Air Conditioning', 'WiFi'],
  },
  {
    name: 'Conference Room B',
    building: 'Science Building B',
    floor: 2,
    capacity: 15,
    type: RoomType.CONFERENCE,
    facilities: ['Conference Table', 'Projector', 'Whiteboard', 'Air Conditioning', 'WiFi'],
  },
  {
    name: 'Lecture Hall 1',
    building: 'Main Building',
    floor: 1,
    capacity: 150,
    type: RoomType.LECTURE_HALL,
    facilities: ['Theater Seating', 'Projector', 'Sound System', 'Microphones', 'Air Conditioning', 'WiFi'],
  },
  {
    name: 'Lecture Hall 2',
    building: 'Main Building',
    floor: 2,
    capacity: 120,
    type: RoomType.LECTURE_HALL,
    facilities: ['Theater Seating', 'Projector', 'Sound System', 'Air Conditioning', 'WiFi'],
  },
  {
    name: 'Study Room 1',
    building: 'Library Building',
    floor: 2,
    capacity: 8,
    type: RoomType.STUDY_ROOM,
    facilities: ['Study Table', 'Whiteboard', 'WiFi', 'Charging Ports'],
  },
  {
    name: 'Study Room 2',
    building: 'Library Building',
    floor: 2,
    capacity: 10,
    type: RoomType.STUDY_ROOM,
    facilities: ['Study Table', 'Whiteboard', 'TV Screen', 'WiFi', 'Charging Ports'],
  },
  {
    name: 'Study Room 3',
    building: 'Library Building',
    floor: 3,
    capacity: 6,
    type: RoomType.STUDY_ROOM,
    facilities: ['Study Table', 'Whiteboard', 'WiFi'],
  },
  {
    name: 'Auditorium',
    building: 'Main Building',
    floor: 1,
    capacity: 500,
    type: RoomType.AUDITORIUM,
    facilities: ['Theater Seating', 'Stage', 'Sound System', 'Lighting System', 'Projector', 'Air Conditioning', 'WiFi'],
  },
  {
    name: 'Physics Lab',
    building: 'Science Building A',
    floor: 2,
    capacity: 25,
    type: RoomType.LABORATORY,
    facilities: ['Lab Equipment', 'Oscilloscopes', 'Power Supplies', 'Measurement Tools', 'Storage Cabinets'],
  },
  {
    name: 'Chemistry Lab',
    building: 'Science Building A',
    floor: 1,
    capacity: 28,
    type: RoomType.LABORATORY,
    facilities: ['Lab Equipment', 'Fume Hood', 'Chemical Storage', 'Safety Equipment', 'Glassware'],
  },
  {
    name: 'Biology Lab',
    building: 'Science Building A',
    floor: 2,
    capacity: 30,
    type: RoomType.LABORATORY,
    facilities: ['Lab Equipment', 'Microscopes', 'Specimens', 'Incubator', 'Refrigerator'],
  },
  {
    name: 'Room 301',
    building: 'Science Building B',
    floor: 3,
    capacity: 35,
    type: RoomType.CLASSROOM,
    facilities: ['Whiteboard', 'Projector', 'Air Conditioning', 'WiFi'],
  },
  {
    name: 'Room 401',
    building: 'Science Building B',
    floor: 4,
    capacity: 40,
    type: RoomType.CLASSROOM,
    facilities: ['Smart Board', 'Projector', 'Air Conditioning', 'WiFi'],
  },
  {
    name: 'Room 402',
    building: 'Science Building B',
    floor: 4,
    capacity: 38,
    type: RoomType.CLASSROOM,
    facilities: ['Whiteboard', 'Projector', 'Air Conditioning', 'WiFi'],
  },
];

async function seedRooms() {
  console.log('Starting room seeding...');

  try {
    await prisma.room.deleteMany({});
    console.log('Cleared existing room data');

    for (const room of roomsData) {
      await prisma.room.create({
        data: room,
      });
    }

    console.log(`✓ Successfully added ${roomsData.length} rooms`);
    console.log(`   - Classrooms: ${roomsData.filter(r => r.type === RoomType.CLASSROOM).length}`);
    console.log(`   - Laboratories: ${roomsData.filter(r => r.type === RoomType.LABORATORY).length}`);
    console.log(`   - Computer Labs: ${roomsData.filter(r => r.type === RoomType.COMPUTER_LAB).length}`);
    console.log(`   - Conference Rooms: ${roomsData.filter(r => r.type === RoomType.CONFERENCE).length}`);
    console.log(`   - Lecture Halls: ${roomsData.filter(r => r.type === RoomType.LECTURE_HALL).length}`);
    console.log(`   - Study Rooms: ${roomsData.filter(r => r.type === RoomType.STUDY_ROOM).length}`);
    console.log(`   - Auditoriums: ${roomsData.filter(r => r.type === RoomType.AUDITORIUM).length}`);
  } catch (error) {
    console.error('Error seeding rooms:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedRooms()
  .catch((e) => {
    console.error(e);
    throw e;
  });
