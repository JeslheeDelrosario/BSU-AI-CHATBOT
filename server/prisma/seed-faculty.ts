// server/prisma/seed-faculty.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const facultyData = [
  // Mathematics Faculty
  { surname: 'Amores', firstName: 'Minerva', middleInitial: 'R.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Angeles', firstName: 'Deo Stephanie', middleInitial: 'R.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Arellano', firstName: 'Ma. Concepcion', middleInitial: 'DC.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Balagtas', firstName: 'Michael', middleInitial: 'R.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Baldevarona', firstName: 'Irish', middleInitial: 'T.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Balilla', firstName: 'Jeffrhaim', middleInitial: '', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Camara', firstName: 'Evelyn', middleInitial: 'R.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Carcosia', firstName: 'Imelda Cristina', middleInitial: 'B.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Clemente', firstName: 'Carla', middleInitial: 'M.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Dela Cruz', firstName: 'Harris', middleInitial: 'R.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Dela Cruz', firstName: 'Luzviminda', middleInitial: 'F.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Duque', firstName: 'Rainilyn', middleInitial: 'L.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Estrella', firstName: 'Benedict', middleInitial: 'M.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Gonzales', firstName: 'Raevinor', middleInitial: 'R.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Lampayan', firstName: 'Valentine Blez', middleInitial: 'L.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Magtulis', firstName: 'Mary Ann', middleInitial: 'C.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Manalaysay', firstName: 'Ellenita', middleInitial: 'G.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Mangaran', firstName: 'Armele', middleInitial: 'J.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Marcelino', firstName: 'Lyca', middleInitial: 'D.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Martin', firstName: 'Maria Cecilia', middleInitial: 'E.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Pagtalunan', firstName: 'Thelma', middleInitial: 'V.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Reyes', firstName: 'Jo Ann', middleInitial: 'V.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Roberto', firstName: 'Yolanda', middleInitial: 'C.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Santos', firstName: 'Edgardo', middleInitial: 'M.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Victorino', firstName: 'Adolfo Jr.', middleInitial: 'D.', position: 'Faculty', department: 'Mathematics' },
  { surname: 'Viola', firstName: 'Joselito', middleInitial: 'V.', position: 'Faculty', department: 'Mathematics' },
  
  // Mathematics Part-Time Faculty
  { surname: 'Galvez', firstName: 'Arcel', middleInitial: 'F.', position: 'Faculty (Part-Time)', department: 'Mathematics' },
  { surname: 'Regalado', firstName: 'Cherielyn', middleInitial: 'C.', position: 'Faculty (Part-Time)', department: 'Mathematics' },
  { surname: 'Reyes', firstName: 'Gertrudes', middleInitial: 'C.', position: 'Faculty (Part-Time)', department: 'Mathematics' },
  { surname: 'Roxas', firstName: 'Mara', middleInitial: 'N.', position: 'Faculty (Part-Time)', department: 'Mathematics' },
  { surname: 'Sumala', firstName: 'Judy Ann', middleInitial: 'T.', position: 'Faculty (Part-Time)', department: 'Mathematics' },
  { surname: 'Valeroso', firstName: 'Joshua', middleInitial: 'P.', position: 'Faculty (Part-Time)', department: 'Mathematics' },
  
  // Mathematics Adjunct Faculty
  { surname: 'Gan', firstName: 'Aubrey Rose', middleInitial: 'T.', position: 'Faculty (Adjunct)', department: 'Mathematics' },
  
  // Science Faculty
  { surname: 'Agustin', firstName: 'Michelle', middleInitial: 'S.', position: 'Faculty', department: 'Science' },
  { surname: 'Alaijos', firstName: 'Oliver', middleInitial: 'R.', position: 'Faculty', department: 'Science' },
  { surname: 'Arrieta', firstName: 'Thelma', middleInitial: 'D.C.', position: 'Faculty', department: 'Science' },
  { surname: 'Basilio', firstName: 'Eleonor', middleInitial: 'R.', position: 'Faculty', department: 'Science' },
  { surname: 'Canta', firstName: 'Kristan Diane', middleInitial: 'B.', position: 'Faculty', department: 'Science' },
  { surname: 'Clavio', firstName: 'Rachel', middleInitial: 'D.C.', position: 'Faculty', department: 'Science' },
  { surname: 'Clemente', firstName: 'Richard', middleInitial: 'F.', position: 'Faculty', department: 'Science' },
  { surname: 'Cristobal', firstName: 'Maria Lin', middleInitial: 'D.', position: 'Faculty', department: 'Science' },
  { surname: 'Cruz', firstName: 'Merlyn', middleInitial: 'C.', position: 'Faculty', department: 'Science' },
  { surname: 'Dela Cruz', firstName: 'Marissa', middleInitial: 'DA.', position: 'Faculty', department: 'Science' },
  { surname: 'Javier', firstName: 'Raymundo', middleInitial: 'F.', position: 'Faculty', department: 'Science' },
  { surname: 'Jingco', firstName: 'Freya Gay', middleInitial: 'A.', position: 'Faculty', department: 'Science' },
  { surname: 'Lee', firstName: 'Mary Ylane', middleInitial: 'S.', position: 'Faculty', department: 'Science' },
  { surname: 'Neo', firstName: 'Mery day', middleInitial: 'P.', position: 'Faculty', department: 'Science' },
  { surname: 'Nepomuceno', firstName: 'Joana May', middleInitial: 'C.', position: 'Faculty', department: 'Science' },
  { surname: 'Paitan', firstName: 'Virginia', middleInitial: 'P.', position: 'Faculty', department: 'Science' },
  { surname: 'Poñado', firstName: 'Rosario', middleInitial: 'M.', position: 'Faculty', department: 'Science' },
  { surname: 'Ocampo', firstName: 'Jose Ravenal', middleInitial: 'S.', position: 'Faculty', department: 'Science' },
  { surname: 'Reyes', firstName: 'Ma. Theresa', middleInitial: 'F.', position: 'Faculty', department: 'Science' },
  { surname: 'Ronquillo', firstName: 'Eden', middleInitial: 'C.', position: 'Faculty', department: 'Science' },
  { surname: 'Sacdalan', firstName: 'Marlyn Rose', middleInitial: 'M.', position: 'Faculty', department: 'Science' },
  { surname: 'Salunga', firstName: 'Anna Dominique', middleInitial: 'M.', position: 'Faculty', department: 'Science' },
  { surname: 'Singian', firstName: 'Eloisa', middleInitial: 'Q.', position: 'Faculty', department: 'Science' },
  { surname: 'Tadiosa', firstName: 'Edwin', middleInitial: 'R.', position: 'Faculty', department: 'Science' },
  { surname: 'Tan', firstName: 'Judith Clarisse', middleInitial: 'J.', position: 'Faculty', department: 'Science' },
  { surname: 'Tiongson', firstName: 'Ma. Victoria', middleInitial: 'S.', position: 'Faculty', department: 'Science' },
  { surname: 'Tuazon', firstName: 'Debbie Ann', middleInitial: 'S.', position: 'Faculty', department: 'Science' },
  { surname: 'Villareal', firstName: 'Cielo Emar', middleInitial: 'M.', position: 'Faculty', department: 'Science' },
  
  // Science Part-Time Faculty
  { surname: 'Abuzo', firstName: 'Ria Laura', middleInitial: 'B.', position: 'Faculty (Part-Time)', department: 'Science' },
  { surname: 'Anacleto', firstName: 'Mark Andrew', middleInitial: 'R.', position: 'Faculty (Part-Time)', department: 'Science' },
  { surname: 'Barre', firstName: 'Atheena Cammara', middleInitial: 'T.', position: 'Faculty (Part-Time)', department: 'Science' },
  { surname: 'Bernardo', firstName: 'Emily', middleInitial: 'K.', position: 'Faculty (Part-Time)', department: 'Science' },
  { surname: 'Carpio', firstName: 'Alfredo', middleInitial: 'P.', position: 'Faculty (Part-Time)', department: 'Science' },
  { surname: 'Cayetano', firstName: 'Jayson', middleInitial: 'V.', position: 'Faculty (Part-Time)', department: 'Science' },
  { surname: 'Jacinto', firstName: 'Reynaldo', middleInitial: 'S.', position: 'Faculty (Part-Time)', department: 'Science' },
  { surname: 'Martinez', firstName: 'Maribeth', middleInitial: 'V.', position: 'Faculty (Part-Time)', department: 'Science' },
  { surname: 'Nicolas', firstName: 'Jovie', middleInitial: 'E.', position: 'Faculty (Part-Time)', department: 'Science' },
  { surname: 'Politano', firstName: 'Alma', middleInitial: 'D.', position: 'Faculty (Part-Time)', department: 'Science' },
  { surname: 'Rubico', firstName: 'Racquel', middleInitial: 'Z.', position: 'Faculty (Part-Time)', department: 'Science' },
  { surname: 'Santos', firstName: 'Maria Salome', middleInitial: 'C.', position: 'Faculty (Part-Time)', department: 'Science' },
  { surname: 'Santos', firstName: 'Marianne', middleInitial: 'P.', position: 'Faculty (Part-Time)', department: 'Science' },
  
  // Science Guest Lecturers
  { surname: 'Degala', firstName: 'Julius Victor', middleInitial: 'C.', position: 'Guest Lecturer', department: 'Science' },
  { surname: 'Gan', firstName: 'Agatha Ruth', middleInitial: 'T.', position: 'Guest Lecturer', department: 'Science' },
  { surname: 'Santos', firstName: 'Karl Kenneth', middleInitial: 'R.', position: 'Guest Lecturer', department: 'Science' },
  
  // Science Adjunct Faculty
  { surname: 'Nicolas', firstName: 'Mary Ann', middleInitial: 'L.', position: 'Faculty (Adjunct)', department: 'Science' },
];

async function seedFaculty() {
  console.log('Starting BSU College of Science faculty seeding...');

  try {
    // Clear existing faculty data
    await prisma.faculty.deleteMany({});
    console.log('Cleared existing faculty data');

    // Create faculty members
    for (const faculty of facultyData) {
      // Generate email from name
      const emailName = faculty.firstName.toLowerCase().replace(/\s+/g, '') + '.' + faculty.surname.toLowerCase().replace(/\s+/g, '');
      const email = `${emailName}@bulsu.edu.ph`;

      await prisma.faculty.create({
        data: {
          firstName: faculty.firstName,
          middleName: faculty.middleInitial || undefined,
          lastName: faculty.surname,
          email: email,
          position: faculty.position,
          college: `College of Science - ${faculty.department}`,
          officeHours: 'By Appointment',
          consultationDays: ['Monday', 'Wednesday', 'Friday'],
          consultationStart: '14:00',
          consultationEnd: '16:00',
        },
      });
    }

    console.log(`✓ Successfully added ${facultyData.length} faculty members`);
    console.log(`   - Mathematics Faculty: ${facultyData.filter(f => f.department === 'Mathematics').length}`);
    console.log(`   - Science Faculty: ${facultyData.filter(f => f.department === 'Science').length}`);
  } catch (error) {
    console.error('Error seeding faculty:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  seedFaculty()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export { seedFaculty };
