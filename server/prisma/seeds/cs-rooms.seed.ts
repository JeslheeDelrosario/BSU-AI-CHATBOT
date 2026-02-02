import { PrismaClient, RoomType } from '@prisma/client';

const prisma = new PrismaClient();

const CS_ROOMS = [
  {
    name: 'CS-101',
    building: 'Computer Science Building',
    floor: 1,
    capacity: 40,
    type: RoomType.COMPUTER_LAB,
    facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Whiteboard'],
    isActive: true,
    description: 'Introduction to Programming Lab'
  },
  {
    name: 'CS-201',
    building: 'Computer Science Building',
    floor: 2,
    capacity: 35,
    type: RoomType.COMPUTER_LAB,
    facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Smart Board'],
    isActive: true,
    description: 'Data Structures and Algorithms Lab'
  },
  {
    name: 'CS-202',
    building: 'Computer Science Building',
    floor: 2,
    capacity: 30,
    type: RoomType.COMPUTER_LAB,
    facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Lab Equipment'],
    isActive: true,
    description: 'Database Systems Lab'
  },
  {
    name: 'CS-301',
    building: 'Computer Science Building',
    floor: 3,
    capacity: 45,
    type: RoomType.COMPUTER_LAB,
    facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Smart Board', 'Video Conferencing'],
    isActive: true,
    description: 'Software Engineering Lab'
  },
  {
    name: 'CS-302',
    building: 'Computer Science Building',
    floor: 3,
    capacity: 25,
    type: RoomType.COMPUTER_LAB,
    facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Lab Equipment'],
    isActive: true,
    description: 'Computer Networks Lab'
  },
  {
    name: 'CS-303',
    building: 'Computer Science Building',
    floor: 3,
    capacity: 30,
    type: RoomType.COMPUTER_LAB,
    facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Whiteboard'],
    isActive: true,
    description: 'Operating Systems Lab'
  },
  {
    name: 'CS-401',
    building: 'Computer Science Building',
    floor: 4,
    capacity: 35,
    type: RoomType.COMPUTER_LAB,
    facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Smart Board', 'Lab Equipment'],
    isActive: true,
    description: 'Artificial Intelligence & Machine Learning Lab'
  },
  {
    name: 'CS-402',
    building: 'Computer Science Building',
    floor: 4,
    capacity: 30,
    type: RoomType.COMPUTER_LAB,
    facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Whiteboard'],
    isActive: true,
    description: 'Web Development Lab'
  },
  {
    name: 'CS-403',
    building: 'Computer Science Building',
    floor: 4,
    capacity: 28,
    type: RoomType.COMPUTER_LAB,
    facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Lab Equipment'],
    isActive: true,
    description: 'Cybersecurity Lab'
  },
  {
    name: 'CS-404',
    building: 'Computer Science Building',
    floor: 4,
    capacity: 32,
    type: RoomType.COMPUTER_LAB,
    facilities: ['Desktop Computers', 'Projector', 'Air Conditioning', 'WiFi', 'Smart Board', 'Video Conferencing'],
    isActive: true,
    description: 'Mobile App Development Lab'
  }
];

export async function seedCSRooms() {
  console.log('🏫 Seeding Computer Science Rooms...');

  let created = 0;
  let skipped = 0;

  for (const room of CS_ROOMS) {
    try {
      const existing = await prisma.room.findFirst({
        where: {
          name: room.name,
          building: room.building,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.room.create({
        data: {
          name: room.name,
          building: room.building,
          floor: room.floor,
          capacity: room.capacity,
          type: room.type,
          facilities: room.facilities,
          isActive: room.isActive,
        },
      });

      created++;
      console.log(`  ✅ Created room: ${room.name} - ${room.description}`);
    } catch (error) {
      console.error(`  ❌ Failed to create room: ${room.name}`, error);
    }
  }

  console.log(`✅ Created ${created} CS rooms, skipped ${skipped} existing`);
}

export default seedCSRooms;
