// server/prisma/seed-knowledge.ts
// Seed script to populate FAQs, Room Schedules, and other knowledge data for AI responses

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFAQs() {
  console.log('🔄 Seeding FAQs...');
  
  const faqs = [
    // Grading System FAQs
    {
      category: 'Grading System',
      question: 'What is the grading scale used at Bulacan State University?',
      answer: `BulSU evaluates academic performance using numerical grades and letter equivalents:

| Grade | Percentage | Remark |
|-------|------------|--------|
| 1.00 | 97-100% | Excellent |
| 1.25 | 94-96% | Very Good |
| 1.50 | 91-93% | Very Good |
| 1.75 | 88-90% | Good |
| 2.00 | 85-87% | Good |
| 2.25 | 82-84% | Satisfactory |
| 2.50 | 79-81% | Satisfactory |
| 2.75 | 76-78% | Fair |
| 3.00 | 75% | Passed (Lowest Passing Grade) |
| 4.00 | Conditional | Slight deficiency; must be resolved |
| 5.00 | ≤74% | Failed |
| Inc. | N/A | Incomplete |
| D | N/A | Officially Dropped |
| FDA/UD | N/A | Failure Due to Absences / Unofficially Dropped |`,
      keywords: ['grading', 'scale', 'grades', 'percentage', 'passing', 'failed', 'excellent', 'good', 'satisfactory'],
      isPublished: true
    },
    {
      category: 'Grading System',
      question: 'What does a 4.00 (Conditional Passed) grade mean?',
      answer: `A 4.00 grade is given when a student is slightly below the passing criteria but has the potential to pass the course.

Key points:
• The student must consult with the subject teacher to address deficiencies within 2 weeks
• If deficiencies are not resolved within 2 weeks, the grade automatically changes to 5.00 (Failed)
• The 4.00 grade does not appear on the student's permanent record or transcript

This policy encourages students to actively address minor academic deficiencies before failing.`,
      keywords: ['conditional', '4.00', 'passed', 'deficiency', 'two weeks'],
      isPublished: true
    },
    {
      category: 'Grading System',
      question: 'What is an "Inc." (Incomplete) grade?',
      answer: `An Incomplete (Inc.) is assigned when a student is passing all grading criteria except for missing certain requirements such as projects, assignments, or activities.

Key points:
• Students have a grace period of one (1) year to complete the missing requirements
• If requirements are not completed within one year, the grade automatically becomes 5.00 (Failed)
• If the incomplete grade is in a prerequisite subject, the student cannot enroll in the subsequent subject until the prerequisite is completed`,
      keywords: ['incomplete', 'inc', 'missing', 'requirements', 'one year', 'prerequisite'],
      isPublished: true
    },
    {
      category: 'Grading System',
      question: 'What does "D" (Officially Dropped) mean?',
      answer: `"D" indicates that a student has officially dropped a subject by submitting a formal dropping form, which must be signed by the instructor, dean, and university registrar.

This grade ensures that the student's withdrawal is properly documented and does not affect other academic records adversely.`,
      keywords: ['dropped', 'officially', 'withdrawal', 'dropping form'],
      isPublished: true
    },
    {
      category: 'Grading System',
      question: 'What does FDA or UD mean?',
      answer: `FDA (Failure Due to Absences) occurs when a student discontinues attending class without informing the instructor, resulting in failure.

UD (Unofficially Dropped) occurs when a student stops attending the class without filing a formal dropping form, which also counts as failure.

These grades highlight the importance of regular attendance and proper communication with instructors.`,
      keywords: ['fda', 'ud', 'absences', 'unofficially dropped', 'attendance'],
      isPublished: true
    },
    // University History FAQs
    {
      category: 'University History',
      question: 'When and how was Bulacan State University established?',
      answer: `BulSU started in 1904 as an intermediate school during the early years of the American occupation in the Philippines. It was established under Act 74 of the Philippine Commission (1901), which aimed to set up schools in every town and reorganize existing ones.

Key milestones:
• 1907: Governor Teodoro Sandiko sought funds to create a trade school
• 1909: Became the Bulacan Trade School
• 1953: Nationalized as Bulacan National Trade School (BNTS) via R.A. 908
• 1957: Converted to Bulacan National School of Arts and Trades (BNSAT)
• 1965: Became Bulacan College of Arts and Trades (BCAT)
• 1993: Formally became Bulacan State University (BSU) via R.A. 7665`,
      keywords: ['history', 'established', 'founded', '1904', 'trade school', 'bcat', 'bnts'],
      isPublished: true
    },
    {
      category: 'University History',
      question: 'Who were the notable leaders of BSU?',
      answer: `Notable BSU Presidents:

• Dr. Rosario Pimentel (1993-1997): First President of BSU; oversaw university conversion and campus expansion

• Dr. Mariano C. De Jesus (2006-2014): Second President; strengthened partnerships with local government and developed facilities

• Dr. Cecilia N. Gascon (2015-present): First lady President; focuses on instruction, research, extension, and production; developed 25 hectares of land donated by the national government`,
      keywords: ['president', 'leader', 'pimentel', 'de jesus', 'gascon', 'administration'],
      isPublished: true
    },
    // Vision and Mission
    {
      category: 'Vision and Mission',
      question: 'What is the vision of Bulacan State University?',
      answer: `The Bulacan State University is a progressive knowledge generating institution globally recognized for excellent instruction, pioneering research, and responsive community engagements.`,
      keywords: ['vision', 'mission', 'goals', 'progressive', 'knowledge'],
      isPublished: true
    },
    {
      category: 'Vision and Mission',
      question: 'What is the mission of Bulacan State University?',
      answer: `The Bulacan State University exists to produce highly competent, ethical, and service-oriented professionals that contribute to the sustainable socio-economic growth and development of the nation.`,
      keywords: ['mission', 'competent', 'ethical', 'professionals', 'development'],
      isPublished: true
    },
    {
      category: 'Vision and Mission',
      question: 'What are the goals of Bulacan State University?',
      answer: `BulSU directs its initiatives toward achieving these goals:

1. **Provide Relevant, Quality, and Accessible Education** – Ensure education meets the needs of students and society

2. **Provide Innovative and Responsive Research and Extension Programs** – Promote research and community engagement

3. **BulSU in Regional Development** – Contribute actively to socio-economic growth of the region

4. **Sound Financial Management and Resource Generation** – Maintain financial stability

5. **Good Governance** – Uphold transparency, accountability, and efficiency`,
      keywords: ['goals', 'objectives', 'education', 'research', 'governance'],
      isPublished: true
    },
    // Student Classification
    {
      category: 'Student Classification',
      question: 'What is a regular student?',
      answer: `A regular student is one who registers for formal academic credits and carries the full load of subjects required for a given semester and curriculum.`,
      keywords: ['regular', 'student', 'full load', 'classification'],
      isPublished: true
    },
    {
      category: 'Student Classification',
      question: 'What is an irregular student?',
      answer: `An irregular student is one who registers for formal credits but carries less than the full load in a given semester, usually to complete specific curriculum requirements.`,
      keywords: ['irregular', 'student', 'less than full load', 'classification'],
      isPublished: true
    },
    {
      category: 'Student Classification',
      question: 'What is a shifter student?',
      answer: `A shifter student is one who changes from one course to another, either within the same college/campus or in a different college/campus of the University.`,
      keywords: ['shifter', 'change course', 'transfer', 'classification'],
      isPublished: true
    },
    {
      category: 'Student Classification',
      question: 'What is a transfer student?',
      answer: `A transfer student is one who comes from another recognized higher education institution and is officially allowed to enroll in the same or another course at BulSU.`,
      keywords: ['transfer', 'student', 'another school', 'classification'],
      isPublished: true
    },
    {
      category: 'Student Classification',
      question: 'What is a working student?',
      answer: `A working student has a part-time job while studying. They may enroll in a minimum of 15 academic units per term or semester to balance work and studies.`,
      keywords: ['working', 'student', 'part-time', 'job', 'classification'],
      isPublished: true
    },
    // Admission Requirements
    {
      category: 'Admission',
      question: 'Where do I file my application for admission to Bulacan State University?',
      answer: `All applications for admission must be filed with the Office of Admissions and Orientation of Bulacan State University. Applicants are required to submit the prescribed documents, pay the BSU Admission Test (BSUAT) fee, and comply with the admission procedures within the scheduled application period.`,
      keywords: ['admission', 'application', 'file', 'office', 'admissions'],
      isPublished: true
    },
    {
      category: 'Admission',
      question: 'Is admission to Bulacan State University open to everyone?',
      answer: `Admission to BulSU is selective. The University receives more applicants than it can accommodate, so admission is based on:
• Academic performance (GPA)
• BSU Admission Test (BSUAT) scores
• Interview results (if required by the program)

Only qualified applicants are admitted, subject to available slots.`,
      keywords: ['admission', 'selective', 'open', 'requirements', 'bsuat'],
      isPublished: true
    },
    {
      category: 'Admission',
      question: 'Who is eligible to take the BulSU Admission Test (BSUAT)?',
      answer: `The following individuals may apply for the BSUAT:
• Graduates of Grade 12
• High school graduates prior to the K-12 implementation
• PEPT passers with at least 82% average in five subject areas
• ALS A&E Secondary Level passers with a Standard Score of 100 or higher
• Filipino or foreign nationals graduating from foreign schools with K-12 programs
• Foreigners graduating from schools in the Philippines`,
      keywords: ['bsuat', 'eligible', 'admission test', 'grade 12', 'k-12'],
      isPublished: true
    },
    {
      category: 'Admission',
      question: 'What are the requirements for college freshmen applicants?',
      answer: `College freshmen must:
• Have a Senior High School diploma from a recognized school
• Submit a fully accomplished application form
• Provide two (2) 2"×2" ID pictures with white background
• Submit a photocopy of school ID
• Meet the GPA requirement of the chosen program
• Pass the interview, if required`,
      keywords: ['freshmen', 'requirements', 'admission', 'senior high', 'diploma'],
      isPublished: true
    },
    {
      category: 'Admission',
      question: 'What are the requirements for transfer students?',
      answer: `Transfer students must:
• Submit a completed application form with required ID pictures
• Have a GPA of 2.5 or better with no failing grade (5.0)
• Have completed not more than 50% of the total units of the course
• Submit Transcript of Records and Honorable Dismissal

Transfer credits are evaluated by the Office of the Registrar and approved by the Vice President for Academic Affairs.`,
      keywords: ['transfer', 'requirements', 'gpa', 'transcript', 'honorable dismissal'],
      isPublished: true
    },
    {
      category: 'Admission',
      question: 'What is the admission procedure for BulSU applicants?',
      answer: `Applicants must:
1. Secure an application form from the Office of Admissions and Orientation
2. Submit original and photocopies of required academic records
3. Pay the BSUAT fee of ₱300.00 (non-refundable)
4. Take the BSU Admission Test (BSUAT)
5. Check posted results on the scheduled release date
6. Submit original documents if shortlisted for admission
7. Complete reservation and enrollment requirements

Note: Applicants are allowed to take the BSUAT only once.`,
      keywords: ['procedure', 'admission', 'steps', 'bsuat', 'enrollment'],
      isPublished: true
    },
    {
      category: 'Admission',
      question: 'What documents are required once I pass the BSUAT?',
      answer: `Successful applicants must submit:
• Reservation slip
• Original Form 138 (High School Card)
• NSO-authenticated Birth Certificate
• Certificate of Good Moral Character
• Medical Permit from BSU Medical Clinic
• One (1) recent 2"×2" ID picture`,
      keywords: ['documents', 'passed', 'bsuat', 'form 138', 'birth certificate'],
      isPublished: true
    },
    // Student Responsibilities
    {
      category: 'Student Responsibilities',
      question: 'What is the dress code at BulSU?',
      answer: `BulSU Dress Code:

**Daily Uniform:** Monday, Tuesday, Thursday, Friday – as prescribed by college/campus

**Organization Shirt Day:** Friday – optional; daily uniform required if not worn

**Free Days:** Wednesday, Saturday, Sunday – clothing must not offend community values

**NSTP/PE Uniforms:** Only during classes

**Footwear:** Daily uniform paired with black closed shoes

**Laboratory:** Laboratory outfit must be worn for lab work

**Cross-dressing:** Allowed only in official social events (College Night, Students' Ball)`,
      keywords: ['dress code', 'uniform', 'clothing', 'shoes', 'attire'],
      isPublished: true
    },
    {
      category: 'Student Responsibilities',
      question: 'What is the University ID policy?',
      answer: `University ID Policy:

• Required to be worn at all times within campus
• No ID, No Entry Policy applies
• Temporary exceptions with Certificate of Registration (COR) or affidavit of loss for up to three (3) days
• Lost or tampered IDs must be reported to OSAS and Office of the Registrar
• Tampering is a grave violation`,
      keywords: ['id', 'university id', 'no entry', 'policy', 'identification'],
      isPublished: true
    },
    // Academic Policies
    {
      category: 'Academic Policies',
      question: 'What does "change of academic load" mean?',
      answer: `Change of academic load refers to the adding or changing of subjects that a student is officially enrolled in for a given semester.

Key points:
• Any student may request to add or change subjects
• Requests must be made within the first two (2) weeks of regular classes only
• All requests are subject to the approval of the concerned academic unit head`,
      keywords: ['change', 'academic load', 'add', 'subjects', 'enrollment'],
      isPublished: true
    },
    {
      category: 'Academic Policies',
      question: 'What is subject substitution?',
      answer: `Subject substitution refers to the replacement of an old subject with a new one in a student's academic program.

A student may substitute a subject when:
1. The original subject belongs to an old curriculum that has been revised or replaced
2. The old subject and the proposed substitute are similar or closely related in content
3. The substitute subject has equal or greater credit units than the original

Subject substitution must be evaluated and approved by the concerned academic unit and university authorities.`,
      keywords: ['substitution', 'subject', 'replace', 'curriculum', 'credit units'],
      isPublished: true
    },
    {
      category: 'Academic Policies',
      question: 'What are tutorial classes?',
      answer: `Tutorial classes are special academic classes offered exclusively to graduating (senior-level) students when taking or completing one remaining subject is necessary for their graduation in a particular term.

Requirements:
• Only senior-level or graduating students may request tutorial classes
• The subject must be the last subject required for graduation
• Student must secure a certification from the Office of the Registrar confirming graduating status
• Request must be recommended by the College or Campus Dean`,
      keywords: ['tutorial', 'classes', 'graduating', 'senior', 'special class'],
      isPublished: true
    },
    // Social Media and Websites
    {
      category: 'Contact and Resources',
      question: 'What are the official BulSU websites and social media?',
      answer: `Official BulSU Online Resources:

**Main Website:** https://bulsu.edu.ph
**College of Science:** https://bulsu.edu.ph/academics/colleges/CS
**Announcements:** https://bulsu.edu.ph/announcements
**News:** https://bulsu.edu.ph/news
**University Calendar:** https://bulsu.edu.ph/university-calendar
**Official Facebook:** https://www.facebook.com/bulsuofficial/
**Admission Portal:** https://bulsu.heims.ph/admission

For the latest updates, please check BulSU's official Facebook page or the main website.`,
      keywords: ['website', 'social media', 'facebook', 'contact', 'online', 'portal'],
      isPublished: true
    },
    {
      category: 'Contact and Resources',
      question: 'How do I access the admission portal?',
      answer: `The BulSU Admission Portal is available at: https://bulsu.heims.ph/admission

The portal provides guidance for:
• College of Medicine applications
• Graduate School applications
• Transferees
• Shifters
• Freshmen
• Night Class enrollment

Start your application journey there by selecting your program classification.`,
      keywords: ['admission', 'portal', 'heims', 'apply', 'online application'],
      isPublished: true
    }
  ];

  let created = 0;
  let updated = 0;
  
  for (const faq of faqs) {
    // Check if FAQ with this question already exists
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question }
    });
    
    if (existing) {
      await prisma.fAQ.update({
        where: { id: existing.id },
        data: {
          answer: faq.answer,
          category: faq.category,
          keywords: faq.keywords,
          isPublished: faq.isPublished
        }
      });
      updated++;
    } else {
      await prisma.fAQ.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          keywords: faq.keywords,
          isPublished: faq.isPublished
        }
      });
      created++;
    }
  }

  console.log(`✅ Seeded FAQs: ${created} created, ${updated} updated`);
}

async function seedRoomSchedules() {
  console.log('🔄 Seeding Room Schedules...');
  
  // Check if RoomSchedule model exists
  const roomSchedules = [
    // FH 106
    { room: 'FH 106', day: 'Monday', timeSlot: '7am-10am', subject: 'ECO 105', section: 'BSB 1A', instructor: 'CARPIO, ALFREDO' },
    { room: 'FH 106', day: 'Tuesday', timeSlot: '7am-10am', subject: 'STS 101', section: 'BSB 1B', instructor: 'CARPIO, ALFREDO' },
    { room: 'FH 106', day: 'Wednesday', timeSlot: '7am-10am', subject: 'ZOO 103L', section: 'ZOO 103Lab', instructor: 'Vitug, Lawrence V.' },
    { room: 'FH 106', day: 'Thursday', timeSlot: '7am-10am', subject: 'ZOO 103L', section: 'ZOO 103Lab', instructor: 'Vitug, Lawrence V.' },
    { room: 'FH 106', day: 'Friday', timeSlot: '7am-10am', subject: 'CHE 207/207L', section: 'BSFT 2B', instructor: 'BASILIO, Eleonor' },
    { room: 'FH 106', day: 'Saturday', timeSlot: '7am-10am', subject: 'NSTP 11', section: 'BSB 1A', instructor: 'BERNARDINO, Emil' },
    
    // FH 107 (Physics lab)
    { room: 'FH 107', day: 'Monday', timeSlot: '7am-10am', subject: 'EVO 303', section: 'BSB 3B', instructor: 'CLEMENTE, RICHARD FRANC' },
    { room: 'FH 107', day: 'Tuesday', timeSlot: '7am-10am', subject: 'PHY 202a', section: 'BSM AS 2B', instructor: 'Peñado, Rosario' },
    { room: 'FH 107', day: 'Wednesday', timeSlot: '7am-10am', subject: 'CHE 105/105L', section: 'BSFT 1A', instructor: 'TUAZON, Debbie Ann S.' },
    { room: 'FH 107', day: 'Thursday', timeSlot: '7am-10am', subject: 'CHE 306/306L', section: 'BSFT 2A', instructor: 'BARRE, Atheena Cammara T.' },
    { room: 'FH 107', day: 'Friday', timeSlot: '7am-9am', subject: 'MAT 103', section: '', instructor: 'REYES, Jo Ann' },
    
    // FH 108
    { room: 'FH 108', day: 'Monday', timeSlot: '8am-10am', subject: 'MAT 204', section: '', instructor: 'ARELLANO, Ma C.' },
    { room: 'FH 108', day: 'Tuesday', timeSlot: '8:30am-10am', subject: 'THE 301', section: '', instructor: 'TUAZON, Debbie Ann S.' },
    { room: 'FH 108', day: 'Wednesday', timeSlot: '7am-10am', subject: 'FCH 208/208L', section: 'BSFT 2B', instructor: 'BARRE, Atheena Cammara T.' },
    { room: 'FH 108', day: 'Thursday', timeSlot: '8:30am-10am', subject: 'TCW 101', section: '', instructor: 'JOSE, Denmark Q.' },
    { room: 'FH 108', day: 'Friday', timeSlot: '7am-10am', subject: 'FES 408', section: 'BSFT 4B', instructor: 'De Guzman, Maricel' },
    
    // FH 110
    { room: 'FH 110', day: 'Monday', timeSlot: '7am-10am', subject: 'INV 204', section: 'BSB 3A', instructor: 'Lee, Mary Ylane S.' },
    { room: 'FH 110', day: 'Tuesday', timeSlot: '7am-10am', subject: 'PAR 404 L', section: 'BSB 4A', instructor: 'Tan, Judith Clarisse' },
    { room: 'FH 110', day: 'Wednesday', timeSlot: '7am-10am', subject: 'STS 101', section: 'BSB 1A', instructor: 'CARPIO, ALFREDO' },
    { room: 'FH 110', day: 'Thursday', timeSlot: '7am-10am', subject: 'EVO 303 L', section: 'BSB 3A', instructor: 'CLEMENTE, RICHARD FRANC' },
    { room: 'FH 110', day: 'Friday', timeSlot: '7am-10am', subject: 'ECO 105L', section: 'BSB 1A', instructor: 'CARPIO, ALFREDO' },
    
    // CS-AR
    { room: 'FH CS-AR', day: 'Monday', timeSlot: '7am-10am', subject: 'BSM C 107', section: '', instructor: 'Michael Santos' },
    { room: 'FH CS-AR', day: 'Tuesday', timeSlot: '7am-10am', subject: 'BSM BA 2A', section: '', instructor: 'CAMARA, Evelyn' },
    { room: 'FH CS-AR', day: 'Wednesday', timeSlot: '7am-10am', subject: 'MAT 302', section: 'Petition class', instructor: 'Geronimo, Paul' },
    { room: 'FH CS-AR', day: 'Thursday', timeSlot: '7am-10am', subject: 'BSM AS 3A', section: '', instructor: 'CARCOSIA, IMELDA' },
    { room: 'FH CS-AR', day: 'Friday', timeSlot: '7am-10am', subject: 'ELEC II', section: 'BSB 4B', instructor: 'CARCOSIA, IMELDA' },
    
    // AVR A
    { room: 'FH AVR A', day: 'Monday', timeSlot: '7am-10am', subject: 'BSM AS 2A', section: '', instructor: 'Macalisang, Aaron' },
    { room: 'FH AVR A', day: 'Tuesday', timeSlot: '7am-10am', subject: 'BSM AS 2B-G', section: '', instructor: 'CAMARA, Evelyn' },
    { room: 'FH AVR A', day: 'Wednesday', timeSlot: '7am-10am', subject: 'BSM AS 3B', section: '', instructor: 'Morales, Imelda' },
    { room: 'FH AVR A', day: 'Friday', timeSlot: '7am-10am', subject: 'BSM CS 1B G2', section: '', instructor: 'VIOLA, Joselito' },
    
    // FH 205
    { room: 'FH 205', day: 'Monday', timeSlot: '10am-1pm', subject: 'MCS 206', section: 'BSM CS 2A G1', instructor: 'GALVEZ, ARCEL F' },
    { room: 'FH 205', day: 'Tuesday', timeSlot: '10am-1pm', subject: 'MCS 206', section: 'BSM CS 2A G2', instructor: 'GALVEZ, ARCEL F' },
    { room: 'FH 205', day: 'Wednesday', timeSlot: '10am-1pm', subject: 'MCS 206', section: 'BSM CS 2A G1', instructor: 'GALVEZ, ARCEL F' },
    { room: 'FH 205', day: 'Thursday', timeSlot: '1pm-4pm', subject: 'MCS 206', section: 'BSM CS 2B G1', instructor: 'GALVEZ, ARCEL F' },
    { room: 'FH 205', day: 'Friday', timeSlot: '2pm-5pm', subject: 'BST 305L', section: 'BSB 3B', instructor: 'Mandap, Marco' },
    
    // FH 206
    { room: 'FH 206', day: 'Monday', timeSlot: '7am-8:30am', subject: 'BSM AS 4B', section: '', instructor: 'Valeroso, Joshua' },
    { room: 'FH 206', day: 'Tuesday', timeSlot: '8:30am-10am', subject: 'AAH 101a', section: '', instructor: 'De Leon, Shiela' },
    { room: 'FH 206', day: 'Wednesday', timeSlot: '8:30am-10am', subject: 'MAT 306', section: '', instructor: 'Dela Cruz, Harris' },
    { room: 'FH 206', day: 'Friday', timeSlot: '10am-11:30am', subject: 'MAT 307', section: '', instructor: 'Santos, Dr. Edgardo' },
    
    // FH 207
    { room: 'FH 207', day: 'Monday', timeSlot: '7am-9am', subject: 'MCS 103a', section: 'BSM CS 1A G2', instructor: 'Angeles, Deo Stephanie' },
    { room: 'FH 207', day: 'Tuesday', timeSlot: '7am-10am', subject: 'MCS 103a', section: 'BSM CS 1B G1', instructor: 'Angeles, Deo Stephanie' },
    { room: 'FH 207', day: 'Wednesday', timeSlot: '7am-10am', subject: 'MCS 103a', section: 'BSM CS 1A G1', instructor: 'Angeles, Deo Stephanie' },
    { room: 'FH 207', day: 'Thursday', timeSlot: '7am-8:30am', subject: 'BSM AS 3A G1', section: '', instructor: 'Dela Cruz, Aarhus' },
    { room: 'FH 207', day: 'Friday', timeSlot: '7am-8:30am', subject: 'BSM AS 3A', section: '', instructor: 'Dela Cruz, Aarhus' }
  ];

  // Store room schedules as FAQs for AI to access
  const roomScheduleFAQ = {
    category: 'Room Schedules',
    question: 'What are the room schedules in Federizo Hall?',
    answer: `**Federizo Hall Room Schedules (College of Science)**

**FH 106:**
• Monday 7am-10am: ECO 105 (BSB 1A) - CARPIO, ALFREDO
• Tuesday 7am-10am: STS 101 (BSB 1B) - CARPIO, ALFREDO
• Wednesday 7am-10am: ZOO 103L - Vitug, Lawrence V.
• Thursday 7am-10am: ZOO 103L - Vitug, Lawrence V.
• Friday 7am-10am: CHE 207/207L (BSFT 2B) - BASILIO, Eleonor

**FH 107 (Physics Lab):**
• Monday 7am-10am: EVO 303 (BSB 3B) - CLEMENTE, RICHARD FRANC
• Tuesday 7am-10am: PHY 202a (BSM AS 2B) - Peñado, Rosario
• Wednesday 7am-10am: CHE 105/105L (BSFT 1A) - TUAZON, Debbie Ann S.
• Thursday 7am-10am: CHE 306/306L (BSFT 2A) - BARRE, Atheena Cammara T.

**FH 108:**
• Monday 8am-10am: MAT 204 - ARELLANO, Ma C.
• Wednesday 7am-10am: FCH 208/208L (BSFT 2B) - BARRE, Atheena Cammara T.
• Friday 7am-10am: FES 408 (BSFT 4B) - De Guzman, Maricel

**FH 110:**
• Monday 7am-10am: INV 204 (BSB 3A) - Lee, Mary Ylane S.
• Wednesday 7am-10am: STS 101 (BSB 1A) - CARPIO, ALFREDO

For complete schedules, please contact the COS office.`,
    keywords: ['room', 'schedule', 'federizo', 'hall', 'fh', 'classroom', 'where'],
    isPublished: true
  };

  const existingRoomFAQ = await prisma.fAQ.findFirst({
    where: { question: roomScheduleFAQ.question }
  });
  
  if (existingRoomFAQ) {
    await prisma.fAQ.update({
      where: { id: existingRoomFAQ.id },
      data: roomScheduleFAQ
    });
  } else {
    await prisma.fAQ.create({
      data: roomScheduleFAQ
    });
  }

  console.log(`✅ Seeded room schedule FAQ`);
}

async function seedFacultySchedules() {
  console.log('🔄 Seeding Faculty Schedules...');
  
  // Store faculty schedules as FAQs
  const facultyScheduleFAQs = [
    {
      category: 'Faculty Schedules',
      question: 'What is the schedule of Prof. Arcel Galvez?',
      answer: `**Prof. GALVEZ, ARCEL F - Schedule**

**Monday:**
• 9am-11am: MCS 205 (BSM CS 2A G1) - FH 205
• 11am-1pm: MCS 206 (BSM CS 2A G2) - FH 206
• 2pm-4pm: MCS 206 (BSM CS 2B G2) - FH 206
• 4pm-6pm: MCS 206 (BSM CS 2B G1) - FH 206

**Tuesday:**
• 1pm-3pm: MAS 307 (BSM AS 3A) - FH 206
• 5pm-8pm: FEL 401 (BSM AS 4A) - FH 207

**Wednesday:**
• 9am-11am: MCS 205 (BSM CS 2A G1) - FH 205
• 2pm-5pm: MAS 307 (BSM AS 3A) - FH 205
• 5pm-8pm: MAS 307 (BSM AS 3B) - FH 205

**Thursday:**
• 2pm-5pm: MCS 206 (BSM CS 2B G1) - FH 205
• 5pm-8pm: MCS 206 (BSM CS 2B G2) - FH 207

**Friday:**
• 3pm-5pm: MAS 307 (BSM AS 3B) - FH AVR A
• 5pm-8pm: FEL 401 (BSM AS 4B) - FH 207`,
      keywords: ['galvez', 'arcel', 'schedule', 'faculty', 'mcs', 'mas'],
      isPublished: true
    },
    {
      category: 'Faculty Schedules',
      question: 'What is the schedule of Prof. Evelyn Camara?',
      answer: `**Prof. CAMARA, EVELYN - Schedule**

**Tuesday:**
• 7am-8:30am: BSM BA 2A - FH CS AR
• 8:30am-10am: MAT 206 (BSM AS 2A) - FH CS AR

**Wednesday:**
• 7am-8:30am: BSM CS 2B G2 - FED HALL
• 8:30am-10am: MAT 206 (BSM AS 2A) - FH CS AR
• 10am-11:30am: MAT (BSM AS 2A) - FH CS Research Extens
• 11:30am-1pm: MAT 206 (BSM AS 2B) - FH CS AR
• 2pm-3:30pm: MAT 206 (BSM BA 2A) - FH AVR A

**Thursday:**
• 7am-8:30am: BSM CS 2A G1 - FH 206
• 8:30am-10am: MAT 206 (BSM CS 2A G2) - FH AVR A
• 10am-11:30am: MAT 206 (BSM BA 2B) - CS research/Extens

**Friday:**
• 10am-11:30am: MAT 206 (BSM BA 2B) - FH Research/Exte
• 2pm-3:30pm: MAT 206 (BSM AS 2B) - FH CS AR`,
      keywords: ['camara', 'evelyn', 'schedule', 'faculty', 'mat 206'],
      isPublished: true
    },
    {
      category: 'Faculty Schedules',
      question: 'What is the schedule of Prof. Deo Stephanie Angeles?',
      answer: `**Prof. ANGELES, DEO STEPHANIE - Schedule**

**Monday:**
• 7am-9am: MCS 103a (BSM CS 1A G2) - FH 207
• 9am-11am: MCS 103a (BSM CS 1A G1) - FH 207
• 11am-1pm: MCS 103a (BSM CS 1B G1) - FH 207
• 2pm-4pm: MCS 103a (BSM CS 1B G2) - N202

**Tuesday:**
• 7am-10am: MCS 103a (BSM CS 1B G1) - FH 207
• 10am-1pm: MCS 103a (BSM CS 1B G2) - FH 207

**Wednesday:**
• 7am-10am: MCS 103a (BSM CS 1A G1) - FH 207

**Friday:**
• 7am-10am: MST 101d (BSN 2A) - CON Lecture Rm 1
• 10am-1pm: MCS 103a (BSM CS 1A G2) - FH 207`,
      keywords: ['angeles', 'deo', 'stephanie', 'schedule', 'faculty', 'mcs 103'],
      isPublished: true
    },
    {
      category: 'Faculty Schedules',
      question: 'What is the schedule of Prof. Joselito Viola?',
      answer: `**Prof. VIOLA, JOSELITO - Schedule**

**Wednesday:**
• 7:30am-10am: MAT 105 (BSM CS 1B G2) - FH 201 A
• 10am-11:30am: MAT 205 (BSM BA) - FEDERIZO Hall
• 11:30am-1pm: MAT 205 (BSM BA 2B) - FH AVR A

**Tuesday:**
• 10am-11:30am: MAT 205 (BSM BA 2A) - FH
• 2pm-3:30pm: MAT 205 (BSM CS 2A G2) - FH AVR A

**Thursday:**
• 10am-11:30am: BSM AS 2B - FH
• 11:30am-1pm: MAT 206 (BSM CS 2B G2) - FH 201

**Friday:**
• 7am-9am: BSM CS 1B G1 - AVR A
• 8:30am-10am: MAT 205 (BSM CSA 2A) - FH
• 10am-11:30am: MAT 205 (BSM AS 2A) - Federizo Hall
• 11:30am-1pm: MAT 205 (BSM AS 2A) - FH AVR A
• 1pm-2:30pm: MAT 205 (BSM CS 2B G2) - AVR A`,
      keywords: ['viola', 'joselito', 'schedule', 'faculty', 'mat 205', 'mat 105'],
      isPublished: true
    },
    {
      category: 'Faculty Schedules',
      question: 'What is the schedule of Prof. Carla Clemente?',
      answer: `**Prof. CLEMENTE, CARLA M - Schedule**

**Monday:**
• 10am-1pm: MAT 405 (BSM AS 4B) - CS RESEARCH/Extens
• 2pm-5pm: MAT 405 (BSM AS 4A) - CS RESEARCH/EXTe

**Tuesday:**
• 3pm-5pm: MAS 204a (BSM AS 2B) - FH 206

**Wednesday:**
• 10am-1pm: MAS 204a (BSM AS 2B) - FH 207
• 2pm-5pm: MAS 204a (BSM AS 2A) - FH 207

**Thursday:**
• 1pm-3pm: MAS 204a (BSM AS 2A) - FH 201 B

**Friday:**
• 10am-1pm: MAS 306 (BSM AS 3B) - FH 205
• 2pm-5pm: MAS 306 (BSM AS 3A) - FH 207`,
      keywords: ['clemente', 'carla', 'schedule', 'faculty', 'mat 405', 'mas'],
      isPublished: true
    },
    {
      category: 'Faculty Schedules',
      question: 'What is the schedule of Prof. Harris Dela Cruz?',
      answer: `**Prof. DELA CRUZ, HARRIS - Schedule**

**Thursday:**
• 7am-8:30am: BSM CS 3B - Federizo hall
• 8:30am-10am: MAT 306 (BSM AS 3A) - FH 206
• 10am-11:30am: BSM CS 3A - Dela Cruz, Harris

**Friday:**
• 7am-8:30am: BSM AS 3B - Federizo hall
• 8:30am-11:30am: MAT 306 (BSM CS 3A G2) - Federizo Hall
• 10am-11:30am: MAT 306 (BSM CS 3B G2) - AVR A
• 11:30am-1pm: MAT 306 (BSM AS 3B) - FH 206

**Saturday:**
• 7am-10am: MAT 306 (BSM BA 3A) - FH 205
• 10am-1pm: MAT 206 (BSM BA 3B) - FH 206`,
      keywords: ['dela cruz', 'harris', 'schedule', 'faculty', 'mat 306'],
      isPublished: true
    }
  ];

  let created = 0;
  let updated = 0;
  
  for (const faq of facultyScheduleFAQs) {
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question }
    });
    
    if (existing) {
      await prisma.fAQ.update({
        where: { id: existing.id },
        data: faq
      });
      updated++;
    } else {
      await prisma.fAQ.create({
        data: faq
      });
      created++;
    }
  }

  console.log(`✅ Seeded faculty schedule FAQs: ${created} created, ${updated} updated`);
}

async function main() {
  console.log('🚀 Starting knowledge seed...\n');
  
  try {
    await seedFAQs();
    await seedRoomSchedules();
    await seedFacultySchedules();
    
    console.log('\n✅ Knowledge seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding knowledge:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
