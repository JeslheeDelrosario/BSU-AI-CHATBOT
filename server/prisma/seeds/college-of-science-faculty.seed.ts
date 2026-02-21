// server/prisma/seeds/college-of-science-faculty.seed.ts
// Faculty data sourced from: Faculty-Memebers-College-of-Science-1.xlsx
// Covers: College Administration, Science Department (Medical Technology, Biology, Food Technology, etc.), Mathematics Department

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Helper: parse full name into parts ──────────────────────────────────────
function parseName(fullName: string): { firstName: string; middleName: string | null; lastName: string } {
  // Handle suffixes like "Jr.", "Sr.", "III"
  const suffixPattern = /\s+(Jr\.|Sr\.|III|II|IV)\.?$/i;
  const suffixMatch = fullName.match(suffixPattern);
  const suffix = suffixMatch ? suffixMatch[0].trim() : '';
  const nameWithoutSuffix = fullName.replace(suffixPattern, '').trim();

  const parts = nameWithoutSuffix.split(/\s+/);

  if (parts.length === 1) {
    return { firstName: parts[0], middleName: null, lastName: suffix || parts[0] };
  }

  if (parts.length === 2) {
    return {
      firstName: parts[0],
      middleName: null,
      lastName: suffix ? `${parts[1]} ${suffix}` : parts[1],
    };
  }

  // 3+ parts: first, middle initial(s), last
  const firstName = parts[0];
  const lastName = suffix ? `${parts[parts.length - 1]} ${suffix}` : parts[parts.length - 1];
  const middleParts = parts.slice(1, parts.length - 1);
  const middleName = middleParts.length > 0 ? middleParts.join(' ') : null;

  return { firstName, middleName, lastName };
}

// ─── Consultation schedule helpers ───────────────────────────────────────────
// Assign realistic consultation days/times based on department
function getConsultationSchedule(department: string, index: number): {
  consultationDays: string[];
  consultationStart: string;
  consultationEnd: string;
} {
  const schedules = [
    { consultationDays: ['Monday', 'Wednesday'],        consultationStart: '13:00', consultationEnd: '15:00' },
    { consultationDays: ['Tuesday', 'Thursday'],        consultationStart: '14:00', consultationEnd: '16:00' },
    { consultationDays: ['Monday', 'Friday'],           consultationStart: '09:00', consultationEnd: '11:00' },
    { consultationDays: ['Wednesday', 'Friday'],        consultationStart: '10:00', consultationEnd: '12:00' },
    { consultationDays: ['Tuesday', 'Thursday'],        consultationStart: '09:00', consultationEnd: '11:00' },
    { consultationDays: ['Monday', 'Wednesday', 'Friday'], consultationStart: '13:00', consultationEnd: '14:00' },
    { consultationDays: ['Tuesday', 'Thursday'],        consultationStart: '15:00', consultationEnd: '17:00' },
    { consultationDays: ['Monday', 'Thursday'],         consultationStart: '10:00', consultationEnd: '12:00' },
  ];
  return schedules[index % schedules.length];
}

// ─── Faculty data from Excel ──────────────────────────────────────────────────

interface FacultyEntry {
  fullName: string;
  position: string;
  department: string;
  college: string;
}

const FACULTY_DATA: FacultyEntry[] = [
  // ── College Administration ────────────────────────────────────────────────
  { fullName: 'Thelma V. Pagtalunan',           position: 'Dean',                                     department: 'College Administration', college: 'College of Science' },
  { fullName: 'Benedict M. Estrella',           position: 'Associate Dean',                           department: 'College Administration', college: 'College of Science' },
  { fullName: 'Michelle S. Agustin',            position: 'Extension Coordinator',                    department: 'College Administration', college: 'College of Science' },
  { fullName: 'Jo Ann V. Reyes',                position: 'Research Coordinator',                     department: 'College Administration', college: 'College of Science' },
  { fullName: 'Judith Clarisse J. Tan',         position: 'Faculty',                                  department: 'College Administration', college: 'College of Science' },
  { fullName: 'Christian C. Laquindanum',       position: 'Faculty',                                  department: 'College Administration', college: 'College of Science' },
  { fullName: 'Danica G. Manahan-Del Rosario',  position: 'Faculty',                                  department: 'College Administration', college: 'College of Science' },
  { fullName: 'Bernie Rizza A. Cuenca',         position: 'Faculty',                                  department: 'College Administration', college: 'College of Science' },
  { fullName: 'John Herald E. Reyes',           position: 'Faculty',                                  department: 'College Administration', college: 'College of Science' },

  // ── Science Department (Medical Technology, Biology, Food Technology) ─────
  { fullName: 'Rosario M. Poñado',              position: 'Department Head',                          department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Edwin R. Tadiosa',               position: 'Program Chair, BS Biology',                department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Oliver R. Alaijos',              position: 'Program Chair, BS Medical Technology',     department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Anna Dominique T. Salunga',      position: 'Program Coordinator, BS Medical Technology', department: 'Science Department',   college: 'College of Science' },
  { fullName: 'Merlyn C. Cruz',                 position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Michael John R. Aguilar',        position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Thelma DC. Arrieta',             position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Eleonor R. Basilio',             position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Kristan Diane B. Canta',         position: 'Program Coordinator, BS Food Technology',  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Richard F. Clemente',            position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Maria Lin D. Cristobal',         position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Marissa DA. Dela Cruz',          position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Raymundo F. Javier',             position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Freya Gay A. Jingco',            position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Mary Ylane S. Lee',              position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Maribeth V. Martinez',           position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Meryday P. Neo',                 position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Joana May C. Nepomuceno',        position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Virginia P. Paitan',             position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Jose Ravenal S. Ocampo',         position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Ma. Theresa F. Reyes',           position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Marlyn Rose M. Sacdalan',        position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Karl Kenneth R. Santos',         position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Paul Monching C. Santos',        position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Eloisa Q. Singian',              position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Maria Victoria S. Tiongson',     position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Debbie Ann S. Tuazon',           position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Ryann H. Valenzuela',            position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Cielo Emar M. Villareal',        position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Lawrence Victor D. Vitug',       position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Elcharle D. Bala',               position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Atheena Cammara T. Barre',       position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Thrina O. Bernal',               position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Emily K. Bernardo',              position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Alfredo P. Carpio Jr.',          position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Erica May G. Dacquis',           position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Maricel P. De Guzman',           position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Marvin A. De Leon',              position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Ma. Agustina P. Dela Cruz',      position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Dan Carlo C. Dela Vega',         position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Sarah Joy D. Dizon',             position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Jovie E. Nicolas',               position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Alma D. Politano',               position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Francis C. Rayo',                position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Rolando Regalado',               position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Ariel Rivera',                   position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Eden C. Ronquillo',              position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Racquel Z. Rubico',              position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Christian Lay M. Samson',        position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Maria Salome C. Santos',         position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'John Rhil D. Tobias',            position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Julius Victor Degala',           position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Billy Val O. Hernandez',         position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Michael Dave Magsino',           position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },
  { fullName: 'Mary Ann L. Nicolas',            position: 'Faculty',                                  department: 'Science Department',     college: 'College of Science' },

  // ── Mathematics Department ────────────────────────────────────────────────
  { fullName: 'Rainilyn L. Duque',              position: 'Department Head',                          department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Lyca D. Marcelino',              position: 'Program Chair, BS Mathematics',            department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Minerva R. Amores',              position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Deo Stephanie R. Angeles',       position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Ma. Concepcion DC. Arellano',    position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Evelyn R. Camara',               position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Imelda Cristina B. Carcosia',    position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Carla M. Clemente',              position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Aarhus M. Dela Cruz',            position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Harris R. Dela Cruz',            position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Mary Ann C. Magtulis',           position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Ellenita G. Manalaysay',         position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Maria Cecilia E. Martin',        position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Yolanda C. Roberto',             position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Adolfo Jr. D. Victorino',        position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Joselito V. Viola',              position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Elyssa Grace Antonio',           position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Bernadette C. Dela Cruz',        position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Luzviminda F. Dela Cruz',        position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Reymond Duenas',                 position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Arcel F. Galvez',                position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Paul Andrei Geronimo',           position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Armele J. Mangaran',             position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Dan Loyd Paulino',               position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Cherielyn C. Regalado',          position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Gertrudes C. Reyes',             position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Mara N. Roxas',                  position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Leo Santiago',                   position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Edgardo M. Santos',              position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Judy Ann T. Sumala',             position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Jerica Tolentino',               position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Joshua P. Valeroso',             position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Marco C. Mandap',                position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
  { fullName: 'Agape E. Frontier',              position: 'Faculty',                                  department: 'Mathematics Department', college: 'College of Science' },
];

// ─── Medical Technology program subjects ─────────────────────────────────────
const MEDTECH_SUBJECTS = [
  'Clinical Chemistry',
  'Hematology',
  'Medical Microbiology',
  'Immunology and Serology',
  'Parasitology',
  'Histopathology',
  'Blood Banking and Transfusion Medicine',
  'Urinalysis and Body Fluids',
  'Clinical Microscopy',
  'Medical Technology Laws and Bioethics',
  'Research in Medical Technology',
  'Phlebotomy',
];

const BIOLOGY_SUBJECTS = [
  'General Biology',
  'Cell Biology',
  'Genetics',
  'Ecology',
  'Microbiology',
  'Biochemistry',
  'Anatomy and Physiology',
  'Botany',
  'Zoology',
  'Molecular Biology',
];

const MATH_SUBJECTS = [
  'Calculus I',
  'Calculus II',
  'Differential Equations',
  'Linear Algebra',
  'Statistics and Probability',
  'Discrete Mathematics',
  'Numerical Methods',
  'Abstract Algebra',
  'Mathematical Analysis',
  'Operations Research',
];

const FOOD_TECH_SUBJECTS = [
  'Food Chemistry',
  'Food Microbiology',
  'Food Processing and Preservation',
  'Food Safety and Quality Control',
  'Sensory Evaluation of Food',
  'Food Engineering',
  'Nutrition and Dietetics',
];

export async function seedFaculty() {
  console.log('🌱 Seeding College of Science faculty members...');

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < FACULTY_DATA.length; i++) {
    const entry = FACULTY_DATA[i];
    const { firstName, middleName, lastName } = parseName(entry.fullName);
    const schedule = getConsultationSchedule(entry.department, i);

    // Check if faculty already exists (by first + last name)
    const existing = await prisma.faculty.findFirst({
      where: {
        firstName: { equals: firstName, mode: 'insensitive' },
        lastName: { equals: lastName, mode: 'insensitive' },
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    // Generate a plausible BSU email
    const emailFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const emailLast = lastName.toLowerCase().replace(/[^a-z]/g, '').replace(/\s+jr\.?|sr\.?/gi, '');
    const email = `${emailFirst}.${emailLast}@bulsu.edu.ph`;

    // Build office hours string
    const officeHours = `${schedule.consultationDays.join(' & ')}, ${schedule.consultationStart}–${schedule.consultationEnd}`;

    await prisma.faculty.create({
      data: {
        firstName,
        middleName,
        lastName,
        email,
        position: entry.position,
        college: entry.college,
        officeHours,
        consultationDays: schedule.consultationDays,
        consultationStart: schedule.consultationStart,
        consultationEnd: schedule.consultationEnd,
      },
    });

    created++;
  }

  console.log(`✅ Faculty seeded: ${created} created, ${skipped} already existed.`);
}

export async function seedMedTechSubjects() {
  console.log('🌱 Seeding Medical Technology subjects...');

  const allSubjects = [
    ...MEDTECH_SUBJECTS.map(s => ({ name: s, code: `MT-${s.substring(0, 3).toUpperCase()}`, program: 'BS Medical Technology' })),
    ...BIOLOGY_SUBJECTS.map(s => ({ name: s, code: `BIO-${s.substring(0, 3).toUpperCase()}`, program: 'BS Biology' })),
    ...MATH_SUBJECTS.map(s => ({ name: s, code: `MATH-${s.substring(0, 3).toUpperCase()}`, program: 'BS Mathematics' })),
    ...FOOD_TECH_SUBJECTS.map(s => ({ name: s, code: `FT-${s.substring(0, 3).toUpperCase()}`, program: 'BS Food Technology' })),
  ];

  let created = 0;
  let skipped = 0;

  for (const subject of allSubjects) {
    const existing = await prisma.subject.findFirst({
      where: { name: { equals: subject.name, mode: 'insensitive' } },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.subject.create({
      data: {
        name: subject.name,
        code: subject.code,
      },
    });

    created++;
  }

  console.log(`✅ Subjects seeded: ${created} created, ${skipped} already existed.`);
}

async function main() {
  try {
    await seedFaculty();
    await seedMedTechSubjects();
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run directly: npx ts-node prisma/seeds/college-of-science-faculty.seed.ts
if (require.main === module) {
  main();
}
