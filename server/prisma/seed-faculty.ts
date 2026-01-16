// server/prisma/seed-faculty.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const facultyData = [
  // Mathematics Faculty
  { name: 'Amores, Minerva R.', position: 'Faculty', discipline: 'Mathematics', email: 'minerva.amores@bulsu.edu.ph' },
  { name: 'Angeles, Deo Stephanie R.', position: 'Faculty', discipline: 'Mathematics', email: 'deo.angeles@bulsu.edu.ph' },
  { name: 'Arellano, Ma. Concepcion DC.', position: 'Faculty', discipline: 'Mathematics', email: 'concepcion.arellano@bulsu.edu.ph' },
  { name: 'Balagtas, Michael R.', position: 'Faculty', discipline: 'Mathematics', email: 'michael.balagtas@bulsu.edu.ph' },
  { name: 'Baldevarona, Irish T.', position: 'Faculty', discipline: 'Mathematics', email: 'irish.baldevarona@bulsu.edu.ph' },
  { name: 'Balilla, Jeffrhaim', position: 'Faculty', discipline: 'Mathematics', email: 'jeffrhaim.balilla@bulsu.edu.ph' },
  { name: 'Camara, Evelyn R.', position: 'Faculty', discipline: 'Mathematics', email: 'evelyn.camara@bulsu.edu.ph' },
  { name: 'Carcosia, Imelda Cristina B.', position: 'Faculty', discipline: 'Mathematics', email: 'imelda.carcosia@bulsu.edu.ph' },
  { name: 'Clemente, Carla M.', position: 'Faculty', discipline: 'Mathematics', email: 'carla.clemente@bulsu.edu.ph' },
  { name: 'Dela Cruz, Harris R.', position: 'Faculty', discipline: 'Mathematics', email: 'harris.delacruz@bulsu.edu.ph' },
  { name: 'Dela Cruz, Luzviminda F.', position: 'Faculty', discipline: 'Mathematics', email: 'luzviminda.delacruz@bulsu.edu.ph' },
  { name: 'Duque, Rainilyn L.', position: 'Faculty', discipline: 'Mathematics', email: 'rainilyn.duque@bulsu.edu.ph' },
  { name: 'Estrella, Benedict M.', position: 'Faculty', discipline: 'Mathematics', email: 'benedict.estrella@bulsu.edu.ph' },
  { name: 'Gonzales, Raevinor R.', position: 'Faculty', discipline: 'Mathematics', email: 'raevinor.gonzales@bulsu.edu.ph' },
  { name: 'Lampayan, Valentine Blez L.', position: 'Faculty', discipline: 'Mathematics', email: 'valentine.lampayan@bulsu.edu.ph' },
  { name: 'Magtulis, Mary Ann C.', position: 'Faculty', discipline: 'Mathematics', email: 'maryann.magtulis@bulsu.edu.ph' },
  { name: 'Manalaysay, Ellenita G.', position: 'Faculty', discipline: 'Mathematics', email: 'ellenita.manalaysay@bulsu.edu.ph' },
  { name: 'Mangaran, Armele J.', position: 'Faculty', discipline: 'Mathematics', email: 'armele.mangaran@bulsu.edu.ph' },
  { name: 'Marcelino, Lyca D.', position: 'Faculty', discipline: 'Mathematics', email: 'lyca.marcelino@bulsu.edu.ph' },
  { name: 'Martin, Maria Cecilia E.', position: 'Faculty', discipline: 'Mathematics', email: 'cecilia.martin@bulsu.edu.ph' },
  { name: 'Pagtalunan, Thelma V.', position: 'Faculty', discipline: 'Mathematics', email: 'thelma.pagtalunan@bulsu.edu.ph' },
  { name: 'Reyes, Jo Ann V.', position: 'Faculty', discipline: 'Mathematics', email: 'joann.reyes@bulsu.edu.ph' },
  { name: 'Roberto, Yolanda C.', position: 'Faculty', discipline: 'Mathematics', email: 'yolanda.roberto@bulsu.edu.ph' },
  { name: 'Santos, Edgardo M.', position: 'Faculty', discipline: 'Mathematics', email: 'edgardo.santos@bulsu.edu.ph' },
  { name: 'Victorino, Adolfo Jr. D.', position: 'Faculty', discipline: 'Mathematics', email: 'adolfo.victorino@bulsu.edu.ph' },
  { name: 'Viola, Joselito V.', position: 'Faculty', discipline: 'Mathematics', email: 'joselito.viola@bulsu.edu.ph' },
  
  // Mathematics Part-Time Faculty
  { name: 'Galvez, Arcel F.', position: 'Faculty (Part-Time)', discipline: 'Mathematics', email: 'arcel.galvez@bulsu.edu.ph' },
  { name: 'Regalado, Cherielyn C.', position: 'Faculty (Part-Time)', discipline: 'Mathematics', email: 'cherielyn.regalado@bulsu.edu.ph' },
  { name: 'Reyes, Gertrudes C.', position: 'Faculty (Part-Time)', discipline: 'Mathematics', email: 'gertrudes.reyes@bulsu.edu.ph' },
  { name: 'Roxas, Mara N.', position: 'Faculty (Part-Time)', discipline: 'Mathematics', email: 'mara.roxas@bulsu.edu.ph' },
  { name: 'Sumala, Judy Ann T.', position: 'Faculty (Part-Time)', discipline: 'Mathematics', email: 'judyann.sumala@bulsu.edu.ph' },
  { name: 'Valeroso, Joshua P.', position: 'Faculty (Part-Time)', discipline: 'Mathematics', email: 'joshua.valeroso@bulsu.edu.ph' },
  
  // Mathematics Adjunct Faculty
  { name: 'Gan, Aubrey Rose T.', position: 'Faculty (Adjunct)', discipline: 'Mathematics', email: 'aubreyrose.gan@bulsu.edu.ph' },
  
  // Science Faculty
  { name: 'Agustin, Michelle S.', position: 'Faculty', discipline: 'Science', email: 'michelle.agustin@bulsu.edu.ph' },
  { name: 'Alaijos, Oliver R.', position: 'Faculty', discipline: 'Science', email: 'oliver.alaijos@bulsu.edu.ph' },
  { name: 'Arrieta, Thelma D.C.', position: 'Faculty', discipline: 'Science', email: 'thelma.arrieta@bulsu.edu.ph' },
  { name: 'Basilio, Eleonor R.', position: 'Faculty', discipline: 'Science', email: 'eleonor.basilio@bulsu.edu.ph' },
  { name: 'Canta, Kristan Diane B.', position: 'Faculty', discipline: 'Science', email: 'kristan.canta@bulsu.edu.ph' },
  { name: 'Clavio, Rachel D.C.', position: 'Faculty', discipline: 'Science', email: 'rachel.clavio@bulsu.edu.ph' },
  { name: 'Clemente, Richard F.', position: 'Faculty', discipline: 'Science', email: 'richard.clemente@bulsu.edu.ph' },
  { name: 'Cristobal, Maria Lin D.', position: 'Faculty', discipline: 'Science', email: 'marialin.cristobal@bulsu.edu.ph' },
  { name: 'Cruz, Merlyn C.', position: 'Faculty', discipline: 'Science', email: 'merlyn.cruz@bulsu.edu.ph' },
  { name: 'Dela Cruz, Marissa DA.', position: 'Faculty', discipline: 'Science', email: 'marissa.delacruz@bulsu.edu.ph' },
  { name: 'Javier, Raymundo F.', position: 'Faculty', discipline: 'Science', email: 'raymundo.javier@bulsu.edu.ph' },
  { name: 'Jingco, Freya Gay A.', position: 'Faculty', discipline: 'Science', email: 'freya.jingco@bulsu.edu.ph' },
  { name: 'Lee, Mary Ylane S.', position: 'Faculty', discipline: 'Science', email: 'marylylane.lee@bulsu.edu.ph' },
  { name: 'Neo, Mery day P.', position: 'Faculty', discipline: 'Science', email: 'meryday.neo@bulsu.edu.ph' },
  { name: 'Nepomuceno, Joana May C.', position: 'Faculty', discipline: 'Science', email: 'joanamay.nepomuceno@bulsu.edu.ph' },
  { name: 'Paitan, Virginia P.', position: 'Faculty', discipline: 'Science', email: 'virginia.paitan@bulsu.edu.ph' },
  { name: 'Poñado, Rosario M.', position: 'Faculty', discipline: 'Science', email: 'rosario.ponado@bulsu.edu.ph' },
  { name: 'Ocampo, Jose Ravenal S.', position: 'Faculty', discipline: 'Science', email: 'joseravenal.ocampo@bulsu.edu.ph' },
  { name: 'Reyes, Ma. Theresa F.', position: 'Faculty', discipline: 'Science', email: 'theresa.reyes@bulsu.edu.ph' },
  { name: 'Ronquillo, Eden C.', position: 'Faculty', discipline: 'Science', email: 'eden.ronquillo@bulsu.edu.ph' },
  { name: 'Sacdalan, Marlyn Rose M.', position: 'Faculty', discipline: 'Science', email: 'marlynrose.sacdalan@bulsu.edu.ph' },
  { name: 'Salunga, Anna Dominique M.', position: 'Faculty', discipline: 'Science', email: 'annadominique.salunga@bulsu.edu.ph' },
  { name: 'Singian, Eloisa Q.', position: 'Faculty', discipline: 'Science', email: 'eloisa.singian@bulsu.edu.ph' },
  { name: 'Tadiosa, Edwin R.', position: 'Faculty', discipline: 'Science', email: 'edwin.tadiosa@bulsu.edu.ph' },
  { name: 'Tan, Judith Clarisse J.', position: 'Faculty', discipline: 'Science', email: 'judithclarisse.tan@bulsu.edu.ph' },
  { name: 'Tiongson, Ma. Victoria S.', position: 'Faculty', discipline: 'Science', email: 'victoria.tiongson@bulsu.edu.ph' },
  { name: 'Tuazon, Debbie Ann S.', position: 'Faculty', discipline: 'Science', email: 'debbieann.tuazon@bulsu.edu.ph' },
  { name: 'Villareal, Cielo Emar M.', position: 'Faculty', discipline: 'Science', email: 'cieloemar.villareal@bulsu.edu.ph' },
  
  // Science Part-Time Faculty
  { name: 'Abuzo, Ria Laura B.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'rialaura.abuzo@bulsu.edu.ph' },
  { name: 'Anacleto, Mark Andrew R.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'markandrew.anacleto@bulsu.edu.ph' },
  { name: 'Barre, Atheena Cammara T.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'atheena.barre@bulsu.edu.ph' },
  { name: 'Bernardo, Emily K.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'emily.bernardo@bulsu.edu.ph' },
  { name: 'Carpio, Alfredo P.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'alfredo.carpio@bulsu.edu.ph' },
  { name: 'Cayetano, Jayson V.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'jayson.cayetano@bulsu.edu.ph' },
  { name: 'Jacinto, Reynaldo S.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'reynaldo.jacinto@bulsu.edu.ph' },
  { name: 'Martinez, Maribeth V.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'maribeth.martinez@bulsu.edu.ph' },
  { name: 'Nicolas, Jovie E.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'jovie.nicolas@bulsu.edu.ph' },
  { name: 'Politano, Alma D.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'alma.politano@bulsu.edu.ph' },
  { name: 'Rubico, Racquel Z.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'racquel.rubico@bulsu.edu.ph' },
  { name: 'Santos, Maria Salome C.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'mariasalome.santos@bulsu.edu.ph' },
  { name: 'Santos, Marianne P.', position: 'Faculty (Part-Time)', discipline: 'Science', email: 'marianne.santos@bulsu.edu.ph' },
  
  // Science Guest Lecturers
  { name: 'Degala, Atty. Julius Victor C.', position: 'Guest Lecturer', discipline: 'Science', email: 'juliusvictor.degala@bulsu.edu.ph' },
  { name: 'Gan, Agatha Ruth T.', position: 'Guest Lecturer', discipline: 'Science', email: 'agatharuth.gan@bulsu.edu.ph' },
  { name: 'Santos, Karl Kenneth R.', position: 'Guest Lecturer', discipline: 'Science', email: 'karlkenneth.santos@bulsu.edu.ph' },
  
  // Science Adjunct Faculty
  { name: 'Nicolas, Mary Ann L.', position: 'Faculty (Adjunct)', discipline: 'Science', email: 'maryann.nicolas@bulsu.edu.ph' },
];

async function seedFaculty() {
  console.log('Starting BSU College of Science faculty seeding...');

  try {
    // Clear existing faculty data
    await prisma.faculty.deleteMany({});
    console.log('Cleared existing faculty data');

    // Create faculty members
    for (const faculty of facultyData) {
      // Parse name into firstName, middleName, lastName
      const nameParts = faculty.name.split(',').map(s => s.trim());
      const lastName = nameParts[0];
      const firstAndMiddle = nameParts[1]?.split(' ').filter(s => s.length > 0) || [];
      const firstName = firstAndMiddle[0] || '';
      const middleName = firstAndMiddle.slice(1).join(' ') || undefined;

      await prisma.faculty.create({
        data: {
          firstName,
          middleName,
          lastName,
          email: faculty.email,
          position: faculty.position,
          college: 'College of Science',
          officeHours: 'By Appointment',
          consultationDays: ['Monday', 'Wednesday', 'Friday'],
          consultationStart: '14:00',
          consultationEnd: '16:00',
        },
      });
    }

    console.log(` Successfully added ${facultyData.length} faculty members`);
    console.log(`   - Mathematics Faculty: ${facultyData.filter(f => f.discipline === 'Mathematics').length}`);
    console.log(`   - Science Faculty: ${facultyData.filter(f => f.discipline === 'Science').length}`);
  } catch (error) {
    console.error('Error seeding faculty:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedFaculty()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
