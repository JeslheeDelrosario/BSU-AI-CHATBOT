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

export async function seedFacultySchedules() {
  console.log('🌱 Seeding faculty teaching schedules...');

  const scheduleData = [
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
  ];

  let created = 0;
  let notFound = 0;

  for (const data of scheduleData) {
    const faculty = await prisma.faculty.findFirst({
      where: {
        firstName: { equals: data.firstName, mode: 'insensitive' },
        lastName: { equals: data.lastName, mode: 'insensitive' },
      },
    });

    if (!faculty) {
      console.warn(`⚠️  Faculty not found: ${data.firstName} ${data.lastName}`);
      notFound++;
      continue;
    }

    await prisma.facultySchedule.deleteMany({
      where: { facultyId: faculty.id },
    });

    for (const schedule of data.schedules) {
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
  }

  console.log(`✅ Faculty schedules seeded: ${created} entries, ${notFound} not found`);
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
    await seedFacultySchedules();
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
