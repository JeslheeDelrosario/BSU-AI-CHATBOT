// server/prisma/seed-knowledge.ts
// Seed script to populate FAQs, Room Schedules, and other knowledge data for AI responses

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedFAQs() {
  console.log("🔄 Seeding FAQs...");

  const faqs = [
    // Grading System FAQs
    {
      category: "Grading System",
      question: "What is the grading scale used at Bulacan State University?",
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
      keywords: [
        "grading",
        "scale",
        "grades",
        "percentage",
        "passing",
        "failed",
        "excellent",
        "good",
        "satisfactory",
      ],
      isPublished: true,
    },
    {
      category: "Grading System",
      question: "What does a 4.00 (Conditional Passed) grade mean?",
      answer: `A 4.00 grade is given when a student is slightly below the passing criteria but has the potential to pass the course.

      Key points:
      • The student must consult with the subject teacher to address deficiencies within 2 weeks
      • If deficiencies are not resolved within 2 weeks, the grade automatically changes to 5.00 (Failed)
      • The 4.00 grade does not appear on the student's permanent record or transcript

      This policy encourages students to actively address minor academic deficiencies before failing.`,
      keywords: ["conditional", "4.00", "passed", "deficiency", "two weeks"],
      isPublished: true,
    },
    {
      category: "Grading System",
      question: 'What is an "Inc." (Incomplete) grade?',
      answer: `An Incomplete (Inc.) is assigned when a student is passing all grading criteria except for missing certain requirements such as projects, assignments, or activities.

      Key points:
      • Students have a grace period of one (1) year to complete the missing requirements
      • If requirements are not completed within one year, the grade automatically becomes 5.00 (Failed)
      • If the incomplete grade is in a prerequisite subject, the student cannot enroll in the subsequent subject until the prerequisite is completed`,
      keywords: [
        "incomplete",
        "inc",
        "missing",
        "requirements",
        "one year",
        "prerequisite",
      ],
      isPublished: true,
    },
    {
      category: "Grading System",
      question: 'What does "D" (Officially Dropped) mean?',
      answer: `"D" indicates that a student has officially dropped a subject by submitting a formal dropping form, which must be signed by the instructor, dean, and university registrar.

      This grade ensures that the student's withdrawal is properly documented and does not affect other academic records adversely.`,
      keywords: ["dropped", "officially", "withdrawal", "dropping form"],
      isPublished: true,
    },
    {
      category: "Grading System",
      question: "What does FDA or UD mean?",
      answer: `FDA (Failure Due to Absences) occurs when a student discontinues attending class without informing the instructor, resulting in failure.

      UD (Unofficially Dropped) occurs when a student stops attending the class without filing a formal dropping form, which also counts as failure.

      These grades highlight the importance of regular attendance and proper communication with instructors.`,
      keywords: ["fda", "ud", "absences", "unofficially dropped", "attendance"],
      isPublished: true,
    },
    // University History FAQs
    {
      category: "University History",
      question: "When and how was Bulacan State University established?",
      answer: `BulSU started in 1904 as an intermediate school during the early years of the American occupation in the Philippines. It was established under Act 74 of the Philippine Commission (1901), which aimed to set up schools in every town and reorganize existing ones.

      Key milestones:
      • 1907: Governor Teodoro Sandiko sought funds to create a trade school
      • 1909: Became the Bulacan Trade School
      • 1953: Nationalized as Bulacan National Trade School (BNTS) via R.A. 908
      • 1957: Converted to Bulacan National School of Arts and Trades (BNSAT)
      • 1965: Became Bulacan College of Arts and Trades (BCAT)
      • 1993: Formally became Bulacan State University (BSU) via R.A. 7665`,
      keywords: [
        "history",
        "established",
        "founded",
        "1904",
        "trade school",
        "bcat",
        "bnts",
      ],
      isPublished: true,
    },
    {
      category: "University History",
      question: "Who were the notable leaders of BSU?",
      answer: `Notable BSU Presidents:

      • Dr. Rosario Pimentel (1993-1997): First President of BSU; oversaw university conversion and campus expansion

      • Dr. Mariano C. De Jesus (2006-2014): Second President; strengthened partnerships with local government and developed facilities

      • Dr. Cecilia N. Gascon (2015-present): First lady President; focuses on instruction, research, extension, and production; developed 25 hectares of land donated by the national government`,
      keywords: [
        "president",
        "leader",
        "pimentel",
        "de jesus",
        "gascon",
        "administration",
      ],
      isPublished: true,
    },
    // Vision and Mission
    {
      category: "Vision and Mission",
      question: "What is the vision of Bulacan State University?",
      answer: `The Bulacan State University is a progressive knowledge generating institution globally recognized for excellent instruction, pioneering research, and responsive community engagements.`,
      keywords: ["vision", "mission", "goals", "progressive", "knowledge"],
      isPublished: true,
    },
    {
      category: "Vision and Mission",
      question: "What is the mission of Bulacan State University?",
      answer: `The Bulacan State University exists to produce highly competent, ethical, and service-oriented professionals that contribute to the sustainable socio-economic growth and development of the nation.`,
      keywords: [
        "mission",
        "competent",
        "ethical",
        "professionals",
        "development",
      ],
      isPublished: true,
    },
    {
      category: "Vision and Mission",
      question: "What are the goals of Bulacan State University?",
      answer: `BulSU directs its initiatives toward achieving these goals:

      1. **Provide Relevant, Quality, and Accessible Education** – Ensure education meets the needs of students and society

      2. **Provide Innovative and Responsive Research and Extension Programs** – Promote research and community engagement

      3. **BulSU in Regional Development** – Contribute actively to socio-economic growth of the region

      4. **Sound Financial Management and Resource Generation** – Maintain financial stability

      5. **Good Governance** – Uphold transparency, accountability, and efficiency`,
      keywords: ["goals", "objectives", "education", "research", "governance"],
      isPublished: true,
    },
    // Student Classification
    {
      category: "Student Classification",
      question: "What is a regular student?",
      answer: `A regular student is one who registers for formal academic credits and carries the full load of subjects required for a given semester and curriculum.`,
      keywords: ["regular", "student", "full load", "classification"],
      isPublished: true,
    },
    {
      category: "Student Classification",
      question: "What is an irregular student?",
      answer: `An irregular student is one who registers for formal credits but carries less than the full load in a given semester, usually to complete specific curriculum requirements.`,
      keywords: [
        "irregular",
        "student",
        "less than full load",
        "classification",
      ],
      isPublished: true,
    },
    {
      category: "Student Classification",
      question: "What is a shifter student?",
      answer: `A shifter student is one who changes from one course to another, either within the same college/campus or in a different college/campus of the University.`,
      keywords: ["shifter", "change course", "transfer", "classification"],
      isPublished: true,
    },
    {
      category: "Student Classification",
      question: "What is a transfer student?",
      answer: `A transfer student is one who comes from another recognized higher education institution and is officially allowed to enroll in the same or another course at BulSU.`,
      keywords: ["transfer", "student", "another school", "classification"],
      isPublished: true,
    },
    {
      category: "Student Classification",
      question: "What is a working student?",
      answer: `A working student has a part-time job while studying. They may enroll in a minimum of 15 academic units per term or semester to balance work and studies.`,
      keywords: ["working", "student", "part-time", "job", "classification"],
      isPublished: true,
    },
    // Admission Requirements
    {
      category: "Admission",
      question:
        "Where do I file my application for admission to Bulacan State University?",
      answer: `All applications for admission must be filed with the Office of Admissions and Orientation of Bulacan State University. Applicants are required to submit the prescribed documents, pay the BSU Admission Test (BSUAT) fee, and comply with the admission procedures within the scheduled application period.`,
      keywords: ["admission", "application", "file", "office", "admissions"],
      isPublished: true,
    },
    {
      category: "Admission",
      question: "Is admission to Bulacan State University open to everyone?",
      answer: `Admission to BulSU is selective. The University receives more applicants than it can accommodate, so admission is based on:
      • Academic performance (GPA)
      • BSU Admission Test (BSUAT) scores
      • Interview results (if required by the program)

      Only qualified applicants are admitted, subject to available slots.`,
      keywords: ["admission", "selective", "open", "requirements", "bsuat"],
      isPublished: true,
    },
    {
      category: "Admission",
      question: "Who is eligible to take the BulSU Admission Test (BSUAT)?",
      answer: `The following individuals may apply for the BSUAT:
      • Graduates of Grade 12
      • High school graduates prior to the K-12 implementation
      • PEPT passers with at least 82% average in five subject areas
      • ALS A&E Secondary Level passers with a Standard Score of 100 or higher
      • Filipino or foreign nationals graduating from foreign schools with K-12 programs
      • Foreigners graduating from schools in the Philippines`,
      keywords: ["bsuat", "eligible", "admission test", "grade 12", "k-12"],
      isPublished: true,
    },
    {
      category: "Admission",
      question: "What are the requirements for college freshmen applicants?",
      answer: `College freshmen must:
      • Have a Senior High School diploma from a recognized school
      • Submit a fully accomplished application form
      • Provide two (2) 2"×2" ID pictures with white background
      • Submit a photocopy of school ID
      • Meet the GPA requirement of the chosen program
      • Pass the interview, if required`,
      keywords: [
        "freshmen",
        "requirements",
        "admission",
        "senior high",
        "diploma",
      ],
      isPublished: true,
    },
    {
      category: "Admission",
      question: "What are the requirements for transfer students?",
      answer: `Transfer students must:
      • Submit a completed application form with required ID pictures
      • Have a GPA of 2.5 or better with no failing grade (5.0)
      • Have completed not more than 50% of the total units of the course
      • Submit Transcript of Records and Honorable Dismissal

      Transfer credits are evaluated by the Office of the Registrar and approved by the Vice President for Academic Affairs.`,
      keywords: [
        "transfer",
        "requirements",
        "gpa",
        "transcript",
        "honorable dismissal",
      ],
      isPublished: true,
    },
    {
      category: "Admission",
      question: "What is the admission procedure for BulSU applicants?",
      answer: `Applicants must:
      1. Secure an application form from the Office of Admissions and Orientation
      2. Submit original and photocopies of required academic records
      3. Pay the BSUAT fee of ₱300.00 (non-refundable)
      4. Take the BSU Admission Test (BSUAT)
      5. Check posted results on the scheduled release date
      6. Submit original documents if shortlisted for admission
      7. Complete reservation and enrollment requirements

      Note: Applicants are allowed to take the BSUAT only once.`,
      keywords: ["procedure", "admission", "steps", "bsuat", "enrollment"],
      isPublished: true,
    },
    {
      category: "Admission",
      question: "What documents are required once I pass the BSUAT?",
      answer: `Successful applicants must submit:
      1. Reservation slip
      2. Original Form 138 (High School Card)
      3. NSO-authenticated Birth Certificate
      4. Certificate of Good Moral Character
      5. Medical Permit from BSU Medical Clinic
      6. One (1) recent 2"×2" ID picture`,
      keywords: [
        "documents",
        "passed",
        "bsuat",
        "form 138",
        "birth certificate",
      ],
      isPublished: true,
    },
    // Student Responsibilities
    {
      category: "Student Responsibilities",
      question: "What is the dress code at BulSU?",
      answer: `BulSU Dress Code:

      **Daily Uniform:** Monday, Tuesday, Thursday, Friday – as prescribed by college/campus

      **Organization Shirt Day:** Friday – optional; daily uniform required if not worn

      **Free Days:** Wednesday, Saturday, Sunday – clothing must not offend community values

      **NSTP/PE Uniforms:** Only during classes

      **Footwear:** Daily uniform paired with black closed shoes

      **Laboratory:** Laboratory outfit must be worn for lab work

      **Cross-dressing:** Allowed only in official social events (College Night, Students' Ball)`,
      keywords: ["dress code", "uniform", "clothing", "shoes", "attire"],
      isPublished: true,
    },
    {
      category: "Student Responsibilities",
      question: "What is the University ID policy?",
      answer: `University ID Policy:

      1. Required to be worn at all times within campus
      2. No ID, No Entry Policy applies
      3. Temporary exceptions with Certificate of Registration (COR) or affidavit of loss for up to three (3) days
      4. Lost or tampered IDs must be reported to OSAS and Office of the Registrar
      5. Tampering is a grave violation`,

      keywords: ["id", "university id", "no entry", "policy", "identification"],
      isPublished: true,
    },
    // Academic Policies
    {
      category: "Academic Policies",
      question: 'What does "change of academic load" mean?',
      answer: `Change of academic load refers to the adding or changing of subjects that a student is officially enrolled in for a given semester.

      Key points:
      • Any student may request to add or change subjects
      • Requests must be made within the first two (2) weeks of regular classes only
      • All requests are subject to the approval of the concerned academic unit head`,
      keywords: ["change", "academic load", "add", "subjects", "enrollment"],
      isPublished: true,
    },
    {
      category: "Academic Policies",
      question: "What is subject substitution?",
      answer: `Subject substitution refers to the replacement of an old subject with a new one in a student's academic program.

        A student may substitute a subject when:
        1. The original subject belongs to an old curriculum that has been revised or replaced
        2. The old subject and the proposed substitute are similar or closely related in content
        3. The substitute subject has equal or greater credit units than the original

        Subject substitution must be evaluated and approved by the concerned academic unit and university authorities.`,
      keywords: [
        "substitution",
        "subject",
        "replace",
        "curriculum",
        "credit units",
      ],
      isPublished: true,
    },
    {
      category: "Academic Policies",
      question: "What are tutorial classes?",
      answer: `Tutorial classes are special academic classes offered exclusively to graduating (senior-level) students when taking or completing one remaining subject is necessary for their graduation in a particular term.

      Requirements:
      • Only senior-level or graduating students may request tutorial classes
      • The subject must be the last subject required for graduation
      • Student must secure a certification from the Office of the Registrar confirming graduating status
      • Request must be recommended by the College or Campus Dean`,
      keywords: [
        "tutorial",
        "classes",
        "graduating",
        "senior",
        "special class",
      ],
      isPublished: true,
    },
    // Social Media and Websites
    {
      category: "Contact and Resources",
      question: "What are the official BulSU websites and social media?",
      answer: `Official BulSU Online Resources:

      **Main Website:** https://bulsu.edu.ph
      **College of Science:** https://bulsu.edu.ph/academics/colleges/CS
      **Announcements:** https://bulsu.edu.ph/announcements
      **News:** https://bulsu.edu.ph/news
      **University Calendar:** https://bulsu.edu.ph/university-calendar
      **Official Facebook:** https://www.facebook.com/bulsuofficial/
      **Admission Portal:** https://bulsu.heims.ph/admission

      For the latest updates, please check BulSU's official Facebook page or the main website.`,
      keywords: [
        "website",
        "social media",
        "facebook",
        "contact",
        "online",
        "portal",
      ],
      isPublished: true,
    },
    {
      category: "Contact and Resources",
      question: "How do I access the admission portal?",
      answer: `The BulSU Admission Portal is available at: https://bulsu.heims.ph/admission

      The portal provides guidance for:
      • College of Medicine applications
      • Graduate School applications
      • Transferees
      • Shifters
      • Freshmen
      • Night Class enrollment

      Start your application journey there by selecting your program classification.`,
      keywords: ["admission", "portal", "heims", "apply", "online application"],
      isPublished: true,
    },
  ];

  let created = 0;
  let updated = 0;

  for (const faq of faqs) {
    // Check if FAQ with this question already exists
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });

    if (existing) {
      await prisma.fAQ.update({
        where: { id: existing.id },
        data: {
          answer: faq.answer,
          category: faq.category,
          keywords: faq.keywords,
          isPublished: faq.isPublished,
        },
      });
      updated++;
    } else {
      await prisma.fAQ.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          keywords: faq.keywords,
          isPublished: faq.isPublished,
        },
      });
      created++;
    }
  }

  console.log(`✅ Seeded FAQs: ${created} created, ${updated} updated`);
}

async function seedRoomSchedules() {
  console.log("🔄 Seeding Room Schedules...");

  // Store room schedules as FAQs for AI to access - create individual FAQs for better matching
  const roomScheduleFAQs = [
    {
      category: "Room Schedules",
      question: "What is the schedule for FH 106 room?",
      answer:
        "**FH 106 Schedule**\n\n**Monday:**\n• 7:00 AM - 10:00 AM: ECO 105 (BSB 1A) - CARPIO, ALFREDO\n• 10:00 AM - 1:00 PM: ECO 105 (BSB 1B) - CARPIO, ALFREDO\n• 1:00 PM - 4:00 PM: ECB 405 (BSB 2B) - JAVIER, RAYMUNDO\n• 4:00 PM - 7:00 PM: ECB 405 (BSB 2A) - JAVIER, RAYMUNDO\n\n**Tuesday:**\n• 7:00 AM - 10:00 AM: STS 101 (BSB 1B) - CARPIO, ALFREDO\n• 10:00 AM - 1:00 PM: ECO 105L (BSB 1A) - CARPIO, ALFREDO\n• 1:00 PM - 4:00 PM: ECB 405 L (BSB 2A) - JAVIER, RAYMUNDO\n• 4:00 PM - 7:00 PM: ECB 405 (BSB 2B) - JAVIER, RAYMUNDO\n\n**Wednesday:**\n• 7:00 AM - 10:00 AM: ZOO 103L (ZOO 103Lab) - VITUG, LAWRENCE V.\n• 10:00 AM - 1:00 PM: ECO 105L (BSB 1C) - ARRIETA, THELMA\n• 1:00 PM - 4:00 PM: ECO 105L (BSB 1B) - CARPIO, ALFREDO\n• 4:00 PM - 7:00 PM: ECB 405 L (BSB 2A) - JAVIER, RAYMUNDO\n\n**Thursday:**\n• 7:00 AM - 10:00 AM: ZOO 103L (ZOO 103Lab) - VITUG, LAWRENCE V.\n• 10:00 AM - 1:00 PM: CB 405 L (BSB 4B) - TADIOSA, EDWIN R.\n• 1:00 PM - 4:00 PM: EVO 303 L (BSB 3B) - CLEMENTE, RICHARD FRANC\n• 4:00 PM - 7:00 PM: STS 101 (BSB 1C) - CARPIO, ALFREDO\n\n**Friday:**\n• 7:00 AM - 10:00 AM: CHE 207/207L (BSFT 2B) - BASILIO, ELEONOR\n• 10:00 AM - 11:30 AM: AAH 101a - LEON, SHEILA MARIE\n• 11:30 AM - 1:00 PM: RLW 101 - MONTEMAYOR, LUZVIMINDA\n• 1:00 PM - 4:00 PM: ECO 105L (BSB 1C) - ARRIETA, THELMA\n\n**Saturday:**\n• 7:00 AM - 10:00 AM: NSTP 11 (BSB 1A) - BERNARDO, EMIL\n• 10:00 AM - 1:00 PM: NSTP 11 (BSB 1B) - DELA CRUZ, CHESALON",
      keywords: [
        "fh106",
        "fh 106",
        "room 106",
        "federizo hall",
        "room schedule",
        "classroom",
        "fh",
      ],
      isPublished: true,
    },
    {
      category: "Room Schedules",
      question: "What is the schedule for FH 107 room?",
      answer:
        "**FH 107 (Physics Lab) Schedule**\n\n**Monday:**\n• 7:00 AM - 10:00 AM: EVO 303 (BSB 3B) - CLEMENTE, RICHARD FRANC\n• 10:00 AM - 1:00 PM: ECB 405 (BSB 4B) - TADIOSA, EDWIN R.\n• 1:00 PM - 4:00 PM: PHY 202a (BSM BA 2B) - PEÑADO, ROSARIO\n• 3:00 PM - 4:30 PM: UTS 101 - Rotaquio, Marionne\n• 4:30 PM - 6:00 PM: BST 305 \n\n**Tuesday:**\n• 7:00 AM - 10:00 AM: PHY 202a (BSM AS 2B) - PEÑADO, ROSARIO\n• 10:00 AM - 1:00 PM: ErS 102L (BSES 1A PCM) - ARRIETA, THELMA\n• 1:00 PM - 4:00 PM: PHY 202a (BSM BA 2A) - PEÑADO, ROSARIO\n• 4:00 PM - 5:00 PM: PHY 202a - REYES, MA THERESA F.\n• 5:00 PM - 8:00 PM: PHY 202a - REYES, MA THERESA F.\n\n**Wednesday:**\n• 7:00 AM - 10:00 AM: CHE 105/105L (BSFT 1A) - TUAZON, DEBBIE ANN S.\n• 10:00 AM - 1:00 PM: ErS 102L (BSES 1A CCDM) - SANTOS, KARL KENNETH\n• 1:00 PM - 4:00 PM: GIS 201 (BSES PCM 2A) - SANTOS, KARL KENNETH\n• 4:00 PM - 7:00 PM: GIS 201 (BSES CCDM 2A) - SANTOS, KARL KENNETH\n\n**Thursday:**\n• 7:00 AM - 10:00 AM: CHE 306/306L (BSFT 2A) - BARRE, ATHEENA CAMMARA T.\n• 10:00 AM - 1:00 PM: ErS 102L (BSES 1A CCDM) - SANTOS, KARL KENNETH\n• 1:00 PM - 4:00 PM: ErS 102L (BSES 1A PCM) - ARRIETA, THELMA\n• 4:00 PM - 7:00 PM: PHY 202a (BSM AS 2A) - REYES, MA THERESA F.\n\n**Friday:**\n• 7:00 AM - 9:00 AM: MAT 103 - REYES, JO ANN\n• 10:00 AM - 1:00 PM: PHY 202a - PEÑADO, ROSARIO\n• 1:00 PM - 4:00 PM: PHY 202a (BSM BA 2B) - PEÑADO, ROSARIO\n• 4:00 PM - 7:00 PM: CHE 306/306L (BSFT 2B) - BARRE, ATHEENA CAMMARA T.",
      keywords: [
        "fh107",
        "fh 107",
        "physics lab",
        "room 107",
        "federizo hall",
        "room schedule",
        "classroom",
        "fh",
      ],
      isPublished: true,
    },
    {
      category: "Room Schedules",
      question: "What is the schedule for FH 108 room?",
      answer:
        "**FH 108 Schedule**\n\n**Monday:**\n• 8:00 AM - 10:00 AM: MAT 204 - ARELLANO, MA C.\n• 10:00 AM - 12:00 PM: MAT 204 - ARELLANO, MA C.\n• 10:00 AM - 12:00 PM: FST 408 - SALUNGA, ANNA DOMINIQUE\n• 1:00 PM - 2:30 PM: UTS 101 - ANG, MARIA CELINA\n• 3:00 PM - 5:00 PM: PHY 101 - INGCO, FREYA G.\n• 5:00 PM - 6:30 PM: FST 408 - NICOLAS, JOSIE\n• 6:30 PM - 8:00 PM: FBT 405 - NICOLAS, JOSIE\n\n**Tuesday:**\n• 8:30 AM - 10:00 AM: THE 301 - TUAZON, DEBBIE ANN S.\n• 10:00 AM - 1:00 PM: FFP 310 - SALUNGA\n• 2:30 PM - 4:00 PM: SSP 101d - JENNET, NATIVIDAD\n• 5:00 PM - 6:30 PM: SSP 101c - AGUSTIN, ALSON\n\n**Wednesday:**\n• 7:00 AM - 10:00 AM: FCH 208/208L (BSFT 2B) - BARRE, ATHEENA CAMMARA T.\n• 10:00 AM - 1:00 PM: STS 101 - DELA CRUZ, MARISSA D.\n• 1:00 PM - 4:00 PM: MAT 204 - ARELLANO, MA C.\n• 4:00 PM - 6:00 PM: STS 101 - SANTIAGO, LEO\n\n**Thursday:**\n• 8:30 AM - 10:00 AM: TCW 101 - JOSE, DENMARK Q.\n• 10:00 AM - 1:00 PM: MAT 204 - ARELLANO, MA C.\n• 1:00 PM - 4:00 PM: STS 101 - DELA CRUZ, MARISSA D.\n• 6:30 PM - 8:00 PM: UTS 101 - ANG, MARIA CELINA\n\n**Friday:**\n• 7:00 AM - 10:00 AM: FES 408 (BSFT 4B) - DE GUZMAN, MARICEL\n• 10:00 AM - 12:00 PM: FES 408 - DE GUZMAN, MARICEL\n• 1:00 PM - 2:30 PM: SSP 101d - JENNET, NATIVIDAD\n• 2:30 PM - 3:30 PM: PID 101 - SOTIO, JAMIE M.",
      keywords: [
        "fh108",
        "fh 108",
        "room 108",
        "federizo hall",
        "room schedule",
        "classroom",
        "fh",
      ],
      isPublished: true,
    },
    {
      category: "Room Schedules",
      question: "What is the schedule for FH 110 room?",
      answer:
        "**FH 110 Schedule**\n\n**Monday:**\n• 7:00 AM - 10:00 AM: INV 204 (BSB 3A) - LEE, MARY YLANE S.\n• 10:00 AM - 1:00 PM: INV 204 (BSB 3B) - LEE, MARY YLANE S.\n• 1:00 PM - 4:00 PM: PAR 404 (BSB 4B) - TAN, JUDITH CLARISSE\n• 4:00 PM - 8:00 PM: ECB 405 (BSB 4A) - TADIOSA, EDWIN R.\n\n**Tuesday:**\n• 7:00 AM - 10:00 AM: PAR 404 (BSB 4A) - TAN, JUDITH CLARISSE\n• 10:00 AM - 1:00 PM: ECB 405 (BSB 4A) - TADIOSA, EDWIN R.\n• 1:00 PM - 2:30 PM: CHE 301L - TUAZON\n• 2:30 PM - 4:00 PM: FedAAN H 101 - DE LEON, SHIELA MARIE\n• 4:00 PM - 5:30 PM: PID 101 - RAMOS, DANTE B.\n\n**Wednesday:**\n• 7:00 AM - 10:00 AM: STS 101 (BSB 1A) - CARPIO, ALFREDO\n• 10:00 AM - 1:00 PM: PAR 404 (BSB 4A) - TAN, JUDITH CLARISSE\n• 1:00 PM - 4:00 PM: PAR 404 (BSB 4B) - TAN, JUDITH CLARISSE\n• 4:00 PM - 8:00 PM: CHE 105/105L (BSFT 1B) - TUAZON, DEBBIE ANN S.\n\n**Thursday:**\n• 7:00 AM - 10:00 AM: EVO 303 (BSB 3A) - CLEMENTE, RICHARD FRANC\n• 10:00 AM - 1:00 PM: MIC 205L (BSB 2A) - VITUG, LAWRENCE V.\n• 1:00 PM - 4:00 PM: ECO 105L (BSB 1B) - CARPIO, ALFREDO\n• 5:00 PM - 8:00 PM: UTS 101 - CATACUTAN, PAULA ANGELICA H.\n\n**Friday:**\n• 7:00 AM - 10:00 AM: ECO 105L (BSB 1A) - CARPIO, ALFREDO\n• 10:00 AM - 1:00 PM: MIC 205 (BSB 2B) - DIZON, SARAH JOY\n• 1:00 PM - 4:00 PM: MIC 205L (BSB 2A) - VITUG, LAWRENCE V.\n• 5:00 PM - 8:00 PM: UTS 101 - CATACUTAN, PAULA ANGELICA H.\n\n**Saturday:**\n• 7:00 AM - 10:00 AM: MIC 205L (BSB 2B) - DIZON, SARAH JOY\n• 2:00 PM - 8:00 PM: GEN 301 L - DIZON, SARAH JOY\n• 4:00 PM - 8:00 PM: GEN 301L",
      keywords: [
        "What is the schedule for FH 110 room?",
        "FH110",
        "FH 110",
        "fh110",
        "fh 110",
        "room 110",
        "federizo hall",
        "room schedule",
        "classroom",
        "fh",
      ],
      isPublished: true,
    },
    {
      category: "Room Schedules",
      question: "What is the schedule for FH CS-AR room?",
      answer:
        "**FH CS-AR Schedule**\n\n**Monday:**\n• 7:00 AM - 10:00 AM: BSM C 107 - Michael Santos\n• 10:00 AM - 1:00 PM: BSM AS 1A - MARCELINO, LYCAD D.\n• 1:00 PM - 4:00 PM: MAT 107 - Michael Santos\n• 4:00 PM - 7:00 PM: BSM BA 2A - Ortiguero, Freddie\n\n**Tuesday:**\n• 7:00 AM - 10:00 AM: BSM BA 2A - CAMARA, EVELYN\n• 10:00 AM - 1:00 PM: UTS 101 - Rotaquio, Marionne\n• 10:00 AM - 1:00 PM: BSM AS 2B - CAMARA, EVELYN\n• 1:00 PM - 4:00 PM: MAT 104 - Regalado, Chereilyn\n• 4:00 PM - 7:00 PM: NSTP 11 (BSM CS 1A G2) - Marcelino, Jon Jon\n\n**Wednesday:**\n• 7:00 AM - 10:00 AM: MAT 302 (Petition class) - Geronimo, Paul\n• 10:00 AM - 1:00 PM: NSTP 11 - Dela Cruz, Julieta\n• 1:00 PM - 4:00 PM: MAT 403 - ROBERTO, YOLANDA C.\n• 4:00 PM - 7:00 PM: BSM BA 4B - YOLANDA C. ROBERTO\n\n**Thursday:**\n• 7:00 AM - 10:00 AM: BSM AS 3A - CARCOSIA, IMELDA\n• 10:00 AM - 1:00 PM: MAT 105 (BSM AS 1A) - CARCOSIA, IMELDA\n• 1:00 PM - 4:00 PM: MAT 104 - Regalado, CHERIELYN\n• 4:00 PM - 7:00 PM: NSTP 11 (FSM 1C) - Marcelino, Jon Jon\n\n**Friday:**\n• 7:00 AM - 10:00 AM: ELEC II (BSB 4B) - CARCOSIA, IMELDA\n• 10:00 AM - 1:00 PM: MAT 205 (BSM AS 2A/2B) - VIOLA, JOSELITO\n• 1:00 PM - 4:00 PM: MAT 206 - CAMARA, EVELYN\n• 4:00 PM - 7:00 PM: UTS 101 (BSES 1A) - Lodrigito, Mark Anthony",
      keywords: [
        "fh cs-ar",
        "cs-ar",
        "computer science ar",
        "fh cs ar",
        "room schedule",
        "classroom",
        "fh",
      ],
      isPublished: true,
    },
    {
      category: "Room Schedules",
      question: "What is the schedule for FS CS R&E room?",
      answer:
        "**FS CS R&E (Computer Science Research & Extension) Schedule**\n\n**Monday:**\n• 7:00 AM - 10:00 AM: PID 101 (BSM AS 1B) - RAMOS, DANTE B.\n• 10:00 AM - 1:00 PM: MAT 405 (BSM AS 4B) - CLEMENTE, CARLA M.\n• 1:00 PM - 4:00 PM: MAT 405 (BSM AS 4A) - CLEMENTE, CARLA M.\n• 4:00 PM - 7:00 PM: BSM CS 4A - G2 - DUQUE, RAINILYN\n\n**Tuesday:**\n• 7:00 AM - 10:00 AM: RPH 101 (BSM BA 2B) - ORTIGUERO, FREDDIE\n• 10:00 AM - 1:00 PM: MAT 405 (BSM BA 4B) - ROBERTO, YOLANDA C.\n• 1:00 PM - 4:00 PM: MBA 204 (BSM BA 2B) - AURE, BENEDICT\n\n**Wednesday:**\n• 7:00 AM - 8:30 AM: BSM AS 2B - MACALISING, AARON\n• 8:30 AM - 10:00 AM: RLW (BSES 3A 2S 25-26) - CRUZ, TEODULO\n• 10:00 AM - 1:00 PM: BSM AS 2A - CAMARA, EVELYN\n• 1:00 PM - 4:00 PM: MAT 205 (BSM BA 2B) - VIOLA, JOSELITO\n\n**Thursday:**\n• 7:00 AM - 10:00 AM: NSTP 11 (BSM AS 1A) - CAMPITA, ELJAY\n• 10:00 AM - 1:00 PM: MAT 206 (BSM BA 2A) - CAMARA, EVELYN\n• 1:00 PM - 4:00 PM: TCW 101 (BSFT 3A) - CERVANTES, NICOLE\n• 4:00 PM - 7:00 PM: FCS 401 (BSFT 1B) - MARTINEZ, MARIBETH\n\n**Friday:**\n• 7:00 AM - 10:00 AM: GEN 301 - DIZON, SARAH JOY\n• 10:00 AM - 1:00 PM: BSFT 4A - CAMARA, EVELYN",
      keywords: [
        "fs cs r&e",
        "cs r&e",
        "computer science research extension",
        "fs cs research",
        "room schedule",
        "classroom",
        "fs",
      ],
      isPublished: true,
    },
    {
      category: "Room Schedules",
      question: "What is the schedule for FH 202 room?",
      answer:
        "**FH 202 Schedule**\n\n**Monday:**\n• 7:00 AM - 10:00 AM: MAT 201 (BSES CCDM 2A)\n• 10:00 AM - 1:00 PM: PAL 101 (BSM CS 1A-G)\n• 1:00 PM - 4:00 PM: PAL 101 (BSM CS 1B-G)\n• 4:00 PM - 7:00 PM: STS 101 (BSM CS 3B-G2)\n\n**Tuesday:**\n• 7:00 AM - 10:00 AM: PAL 101 (BSM CS 1B-G2)\n• 10:00 AM - 1:00 PM: MST 101a (BSM CS 3A-G)\n• 1:00 PM - 4:00 PM: PCM 101 (BSM CS 1B-G)\n\n**Wednesday:**\n• 7:00 AM - 10:00 AM: MAT 402 (BSM CS 4B-G)\n• 10:00 AM - 1:00 PM: SSP 101d (BSM AS 4B)\n• 1:00 PM - 4:00 PM: RLW 101 (BSM BA 4B)\n• 4:00 PM - 7:00 PM: MST 101a (BSM BA 2A)\n\n**Thursday:**\n• 7:00 AM - 10:00 AM: MAT 101a (BSM AS 3B)\n• 10:00 AM - 1:00 PM: MST 101a (BSM BA 3B)\n• 1:00 PM - 4:00 PM: PAL 101 (BSM CS 1B-G)\n• 4:00 PM - 7:00 PM: MST 101a (BSM BA 2B)\n\n**Friday:**\n• 7:00 AM - 10:00 AM: BSB 1B N\n• 10:00 AM - 1:00 PM: BSM CS 4A-G2 N\n• 1:00 PM - 4:00 PM: BSM CS 1A-G2 N",
      keywords: [
        "fh202",
        "fh 202",
        "room 202",
        "federizo hall",
        "room schedule",
        "classroom",
        "fh",
      ],
      isPublished: true,
    },
    {
      category: "Room Schedules",
      question: "What is the schedule for FH AVR A room?",
      answer:
        "**FH AVR A (Audio-Visual Room A) Schedule**\n\n**Monday:**\n• 7:00 AM - 10:00 AM: BSM AS 2A - MACALISIANG, AARON\n• 10:00 AM - 1:00 PM: BSM BA 4A - ROBERTO, YOLANDA C.\n• 1:00 PM - 4:00 PM: MAT 403 (BSM AS 4B) - ROBERTO, YOLANDA C.\n• 4:00 PM - 8:00 PM: BSB A 1C - ANTONIO, ELYSSA\n\n**Tuesday:**\n• 7:00 AM - 10:00 AM: BSM AS 2B-G - CAMARA, EVELYN\n• 10:00 AM - 1:00 PM: BSM BA 2A - VIOLA, JOSELITO\n• 1:00 PM - 4:00 PM: MAT 205 - VIOLA, JOSELITO\n• 4:00 PM - 8:00 PM: BSM AS 2A - ROBERTO, YOLANDA C.\n\n**Wednesday:**\n• 7:00 AM - 10:00 AM: BSM AS 3B - MORALES, IMELDA\n• 10:00 AM - 1:00 PM: BSM BA 4A - ROBERTO, YOLANDA C.\n• 1:00 PM - 4:00 PM: MAT 206 - CAMARA, EVELYN\n• 4:00 PM - 8:00 PM: BSM CS 1A G2 - MARCELINO, LYCAD D.\n\n**Thursday:**\n• 7:30 AM - 8:30 AM: BSM AS 3B - MORALES, IMELDA\n• 8:30 AM - 10:00 AM: BSM CS 2A G2 - VIOLA, JOSELITO\n• 10:00 AM - 1:00 PM: BSM AS 2B - VIOLA, JOSELITO\n• 1:00 PM - 4:00 PM: EFL 301 (BSM BA 3B) - DELA CRUZ, BERNADETTE\n• 5:00 PM - 6:30 PM: BSM BA 2B - DELA CRUZ, BERNADETTE\n• 6:30 PM - 8:00 PM: BSM BA 2A - DELA CRUZ, BERNADETTE\n\n**Friday:**\n• 7:00 AM - 10:00 AM: BSM CS 1B G2 - VIOLA, JOSELITO\n• 10:00 AM - 1:00 PM: BSM CS 3B G2 - HARRIS DELA CRUZ\n• 1:00 PM - 3:00 PM: BSM CS 2B G2 - VIOLA, JOSELITO\n• 3:00 PM - 5:00 PM: MAS 307 (BSM AS 3B) - GALVEZ, ARCEL F.",
      keywords: [
        "fh avr a",
        "avr a",
        "audio visual a",
        "fh avr",
        "room schedule",
        "classroom",
        "fh",
        "audiovisual",
      ],
      isPublished: true,
    },
    {
      category: "Room Schedules",
      question: "What is the schedule for FH 205 room?",
      answer:
        "**FH 205 Schedule**\n\n**Monday:**\n• 10:00 AM - 1:00 PM: MCS 206 (BSM CS 2A G1) - GALVEZ, ARCEL F.\n• 1:00 PM - 4:00 PM: MCS 206 (BSM CS 2B G2) - GALVEZ, ARCEL F.\n• 4:00 PM - 7:00 PM: MCS 206 (BSM CS 2B G1) - GALVEZ, ARCEL F.\n\n**Tuesday:**\n• 7:00 AM - 10:00 AM: BSM AS 4B G - DELA CRUZ, AARHUS M.\n• 10:00 AM - 1:00 PM: MCS 206 (BSM CS 2A G2) - GALVEZ, ARCEL F.\n• 1:00 PM - 4:00 PM: MAS 304 (BSM AS 3B) - VALEROSO, JOSHUA\n• 4:00 PM - 7:00 PM: MAS 304 (BSM AS 3A) - VALEROSO, JOSHUA\n\n**Wednesday:**\n• 7:00 AM - 10:00 AM: BSM CS 4B G2 - DELA CRUZ, AARHUS\n• 10:00 AM - 1:00 PM: MCS 206 (BSM CS 2A G1) - GALVEZ, ARCEL F.\n• 1:00 PM - 4:00 PM: MAS 307 (BSM AS 3A) - GALVEZ, ARCEL F.\n• 4:00 PM - 7:00 PM: MAS 307 (BSM AS 3B) - GALVEZ, ARCEL F.\n\n**Thursday:**\n• 7:00 AM - 8:30 AM: BSM CS 3B - DELA CRUZ, HARRIS\n• 8:30 AM - 11:30 AM: BSM CS 3A G2 - DELA CRUZ, HARRIS\n• 10:00 AM - 11:30 AM: BSM CS 3A - DELA CRUZ, HARRIS\n• 11:30 AM - 1:00 PM: BSM AS 3B - DELA CRUZ, HARRIS\n• 1:00 PM - 4:00 PM: MCS 206 (BSM CS 2B G1) - GALVEZ, ARCEL F.\n• 4:00 PM - 7:00 PM: MCS 206 (BSM CS 2B G2) - GALVEZ, ARCEL F.\n\n**Friday:**\n• 7:00 AM - 8:30 AM: BSM AS 3B - DELA CRUZ, HARRIS\n• 10:00 AM - 1:00 PM: BSM AS 3A - CLEMENTE, CARLA M.\n• 2:00 PM - 5:00 PM: BST 305L (BSM 3B)\n\n**Saturday:**\n• 7:00 AM - 10:00 AM: MAT 306 (BSM BA 3A) - DELA CRUZ, HARRIS\n• 10:00 AM - 1:00 PM: MAT 306 (BSM BA 3B) - DELA CRUZ, HARRIS",
      keywords: [
        "fh205",
        "fh 205",
        "room 205",
        "federizo hall",
        "room schedule",
        "classroom",
        "fh",
      ],
      isPublished: true,
    },
    {
      category: "Room Schedules",
      question: "What is the schedule for FH 206 room?",
      answer:
        "**FH 206 Schedule**\n\n**Monday:**\n• 7:00 AM - 8:30 AM: BSM AS 4B - VALEROSO, JOSHUA\n• 8:30 AM - 10:00 AM: AAH 101a - VALEROSO, JOSHUA\n• 10:00 AM - 11:30 AM: BSM AS 4A - VALEROSO, JOSHUA\n• 11:30 AM - 1:00 PM: BSM CS 4A G2 - VALEROSO, JOSHUA\n• 1:00 PM - 2:30 PM: BSM CS 4B - DUQUE, RAINILYN\n• 2:30 PM - 4:00 PM: BSM BA 4B - VALEROSO, JOSHUA\n• 4:00 PM - 5:30 PM: BSM CS 2A G2 - Ellenita Manalaysay\n\n**Tuesday:**\n• 8:30 AM - 10:00 AM: AAH 101a - DE LEON, SHIELA\n• 10:00 AM - 1:00 PM: BSM CS 2B - Manalaysay Ellenita\n• 1:00 PM - 2:30 PM: MAS 307 - GALVEZ, ARCEL\n• 2:30 PM - 4:00 PM: MAS 204a - CLEMENTE, CARLA\n• 4:00 PM - 5:30 PM: MAT 204a - ESTRELLA, BENEDICT\n\n**Wednesday:**\n• 7:00 AM - 8:30 AM: BSM CS 2A - CAMARA, EVELYN\n• 8:30 AM - 10:00 AM: MAT 306 - DELA CRUZ, HARRIS\n• 11:30 AM - 1:00 PM: BSM CS 4A - Valeroso Joshua\n• 1:00 PM - 2:30 PM: MAT 206 - VALEROSO, JOSHUA\n• 2:30 PM - 4:00 PM: BSM BA 4A - VALEROSO, JOSHUA\n• 4:00 PM - 5:30 PM: BSM AS 4A - VALEROSO, JOSHUA\n• 5:30 PM - 8:00 PM: BSM AS 4B - VALEROSO, JOSHUA\n\n**Thursday:**\n• 11:30 AM - 1:00 PM: BSM CS 3A - SANTOS, EDGARDO\n• 1:00 PM - 2:30 PM: ESM 206 - VITUG, LAWRENCE\n• 4:00 PM - 5:30 PM: MAT 204a - ESTRELLA, BENEDICT\n\n**Friday:**\n• 10:00 AM - 11:30 AM: MAT 307 - SANTOS, DR. EDGARDO\n• 1:00 PM - 2:30 PM: MAT 307 - ROBERTO, YOLANDA\n• 2:30 PM - 4:00 PM: BSM CS 3B G2 - ROBERTO, YOLANDA\n• 4:00 PM - 5:30 PM: MAT 204a - ESTRELLA, BENEDICT",
      keywords: [
        "fh206",
        "fh 206",
        "room 206",
        "federizo hall",
        "room schedule",
        "classroom",
        "fh",
      ],
      isPublished: true,
    },
    {
      category: "Room Schedules",
      question: "What is the schedule for FH 207 room?",
      answer:
        "**FH 207 Schedule**\n\n**Monday:**\n• 7:00 AM - 9:00 AM: MCS 103a (BSM CS 1A G2) - ANGELES, DEO STEPHANIE\n• 9:00 AM - 11:00 AM: MCS 103a (BSM CS 1A G1) - ANGELES, DEO STEPHANIE\n• 11:00 AM - 1:00 PM: MCS 103a (BSM CS 1B G1) - ANGELES, DEO STEPHANIE\n• 1:00 PM - 3:00 PM: MAS 203a (BSM AS 2B) - MAGTULIS, MARYANN C\n• 3:00 PM - 4:00 PM: MAT 405 (BSM CS 4B G1) - DUQUE, RAINILYN\n• 4:00 PM - 6:00 PM: MAS 203a (BSM AS 2A) - MAGTULIS, MARYANN C\n\n**Tuesday:**\n• 7:00 AM - 10:00 AM: MCS 103a (BSM CS 1B G1) - ANGELES, DEO STEPHANIE\n• 10:00 AM - 1:00 PM: MCS 103a (BSM CS 1B G2) - ANGELES, DEO STEPHANIE\n• 2:00 PM - 5:00 PM: MAS 203a (BSM AS 2A) - MAGTULIS, MARYANN C\n• 5:00 PM - 8:00 PM: FEL 401 (BSM AS 4A) - GALVEZ, ARCEL F\n\n**Wednesday:**\n• 7:00 AM - 10:00 AM: MCS 103a (BSM CS 1A G1) - ANGELES, DEO STEPHANIE\n• 10:00 AM - 1:00 PM: MAS 204a (BSM AS 2B) - CLEMENTE, CARLA M\n• 2:00 PM - 5:00 PM: MAS 204a (BSM AS 2A) - CLEMENTE, CARLA M\n• 5:00 PM - 8:00 PM: MAS 103 (BSM AS 1A) - MAGTULIS, MARYANN C\n\n**Thursday:**\n• 7:00 AM - 8:30 AM: BSM CS 3A G1 - DELA CRUZ, AARHUS M M\n• 8:30 AM - 10:00 AM: MAT 305 (BSM CS 3B G1) - DELA CRUZ, AARHUS M M\n• 10:00 AM - 1:00 PM: MAS 305 (BSM AS 3A) - MANGARAN, ARMELE\n• 2:00 PM - 5:00 PM: MAS 305 (BSM AS 3B) - MANGARAN, ARMELE\n• 5:00 PM - 8:00 PM: MAS 103 (BSM AS 1B) - MAGTULIS, MARYANN C\n\n**Friday:**\n• 7:00 AM - 8:30 AM: BSM AS 3A - DELA CRUZ, AARHUS M M\n• 8:30 AM - 10:00 AM: MAT 305 (BSM AS 3B) - DELA CRUZ, AARHUS M M\n• 10:00 AM - 1:00 PM: MCS 103a (BSM CS 1A G2) - ANGELES, DEO STEPHANIE\n• 2:00 PM - 5:00 PM: MAS 306 (BSM AS 3A) - CLEMENTE, CARLA M\n• 5:00 PM - 8:00 PM: FEL 401 (BSM AS 4B) - GALVEZ, ARCEL F\n\n**Saturday:**\n• 10:00 AM - 1:00 PM: MBA 306 (BSM BA 3A)\n• 1:00 PM - 4:00 PM: MBA 306 (BSM BA 3B)",
      keywords: [
        "fh207",
        "fh 207",
        "room 207",
        "federizo hall",
        "room schedule",
        "classroom",
        "fh",
      ],
      isPublished: true,
    },
    {
      category: "Room Schedules",
      question: "What is the schedule for FH 110 room?",
      answer:
        "**FH 110 Schedule**\n\n**Monday:**\n• 7:00 AM - 10:00 AM: INV 204 (BSB 3A) - LEE, MARY YLANE S.\n• 10:00 AM - 1:00 PM: INV 204 (BSB 3B) - LEE, MARY YLANE S.\n• 1:00 PM - 4:00 PM: PAR 404 (BSB 4B) - TAN, JUDITH CLARISSE\n• 4:00 PM - 8:00 PM: ECB 405 (BSB 4A) - TADIOSA, EDWIN R.\n\n**Tuesday:**\n• 7:00 AM - 10:00 AM: PAR 404 (BSB 4A) - TAN, JUDITH CLARISSE\n• 10:00 AM - 1:00 PM: ECB 405 (BSB 4A) - TADIOSA, EDWIN R.\n• 1:00 PM - 2:30 PM: CHE 301L - TUAZON\n• 2:30 PM - 4:00 PM: FedAAN H 101 - DE LEON, SHIELA MARIE\n• 4:00 PM - 5:30 PM: PID 101 - RAMOS, DANTE B.\n\n**Wednesday:**\n• 7:00 AM - 10:00 AM: STS 101 (BSB 1A) - CARPIO, ALFREDO\n• 10:00 AM - 1:00 PM: PAR 404 (BSB 4A) - TAN, JUDITH CLARISSE\n• 1:00 PM - 4:00 PM: PAR 404 (BSB 4B) - TAN, JUDITH CLARISSE\n• 4:00 PM - 8:00 PM: CHE 105/105L (BSFT 1B) - TUAZON, DEBBIE ANN S.\n\n**Thursday:**\n• 7:00 AM - 10:00 AM: EVO 303 (BSB 3A) - CLEMENTE, RICHARD FRANC\n• 10:00 AM - 1:00 PM: MIC 205L (BSB 2A) - VITUG, LAWRENCE V.\n• 1:00 PM - 4:00 PM: ECO 105L (BSB 1B) - CARPIO, ALFREDO\n• 5:00 PM - 8:00 PM: UTS 101 - CATACUTAN, PAULA ANGELICA H.\n\n**Friday:**\n• 7:00 AM - 10:00 AM: ECO 105L (BSB 1A) - CARPIO, ALFREDO\n• 10:00 AM - 1:00 PM: MIC 205 (BSB 2B) - DIZON, SARAH JOY\n• 1:00 PM - 4:00 PM: MIC 205L (BSB 2A) - VITUG, LAWRENCE V.\n• 5:00 PM - 8:00 PM: UTS 101 - CATACUTAN, PAULA ANGELICA H.\n\n**Saturday:**\n• 7:00 AM - 10:00 AM: MIC 205L (BSB 2B) - DIZON, SARAH JOY\n• 2:00 PM - 8:00 PM: GEN 301 L - DIZON, SARAH JOY\n• 4:00 PM - 8:00 PM: GEN 301L",
      keywords: [
        "fh110",
        "fh 110",
        "room 110",
        "federizo hall",
        "room schedule",
        "classroom",
        "fh",
      ],
      isPublished: true,
    },
  ];

  let created = 0;
  let updated = 0;

  for (const faq of roomScheduleFAQs) {
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });

    if (existing) {
      await prisma.fAQ.update({
        where: { id: existing.id },
        data: faq,
      });
      updated++;
    } else {
      await prisma.fAQ.create({
        data: faq,
      });
      created++;
    }
  }

  console.log(
    `✅ Seeded room schedule FAQs: ${created} created, ${updated} updated`,
  );
}

async function seedFacultySchedules() {
  console.log("🔄 Seeding Faculty Schedules...");

  // Store faculty schedules as FAQs
  const facultyScheduleFAQs = [
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Sir Arcel F. Galvez?",
      answer:
        "**Sir. GALVEZ, ARCEL F. - Schedule**\n\n**Monday:**\n• 9:00 AM - 11:00 AM: MCS 205 (BSM CS 2A G1) - FH 205\n• 11:00 AM - 1:00 PM: MCS 206 (BSM CS 2A G2) - FH 206\n• 2:00 PM - 4:00 PM: MCS 206 (BSM CS 2B G2) - FH 206\n• 4:00 PM - 6:00 PM: MCS 206 (BSM CS 2B G1) - FH 206\n\n**Tuesday:**\n• 9:00 AM - 11:00 AM: MCS 205 (BSM CS 2A G2) - FH 205\n• 1:00 PM - 3:00 PM: MAS 307 (BSM AS 3A) - FH 206\n• 5:00 PM - 8:00 PM: FEL 401 (BSM AS 4A) - FH 207\n\n**Wednesday:**\n• 9:00 AM - 11:00 AM: MCS 205 (BSM CS 2A G1) - FH 205\n• 2:00 PM - 5:00 PM: MAS 307 (BSM AS 3A) - FH 205\n• 5:00 PM - 8:00 PM: MAS 307 (BSM AS 3B) - FH 205\n\n**Thursday:**\n• 2:00 PM - 5:00 PM: MCS 206 (BSM CS 2B G1) - FH 205\n• 5:00 PM - 8:00 PM: MCS 206 (BSM CS 2B G2) - FH 207",
      keywords: [
        "What is the schedule of Sir arcel?",
        "What is the schedule of Sir Arcel?",
        "What is the schedule of Sir Arcel Galvez?",
        "Give me the schedule of Sir Arcel Galvez?",
        "what is the schedule of sir arcel galvez?",
        "give me the schedule of sir Arcel galvez?",
        "galvez",
        "arcel",
        "mcs205",
        "mcs206",
        "mas307",
        "fel401",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Reymond B. Duenas?",
      answer:
        "**Prof. DUENAS, REYMOND B. - Schedule**\n\n**Wednesday:**\n• 2:00 PM - 5:00 PM: MAT 305 (BSFT 2A) - Federizo Hall - FH AVR B\n• 5:00 PM - 8:00 PM: MAT 305 (BSFT 2B) - Federizo Hall - FH 307",
      keywords: ["duenas", "reymond", "mat305", "schedule", "faculty"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Luzviminda F. Dela Cruz?",
      answer:
        "**Prof. DELA CRUZ, LUZVIMINDA F. - Schedule**\n\n**Monday:**\n• 8:30 AM - 10:00 AM: SFT 313 (BIT 3PG1 / BIT 3PG2) - Online Class",
      keywords: ["dela cruz", "luzviminda", "sft313", "schedule", "faculty"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Harris R. Dela Cruz?",
      answer:
        "**Prof. DELA CRUZ, HARRIS R. - Schedule**\n\n**Wednesday:**\n• 8:30 AM - 10:00 AM: MAT 306 (BSM AS 3A) - FH 206\n\n**Thursday:**\n• 7:00 AM - 8:30 AM: BSM CS 3B - Federizo Hall\n• 8:30 AM - 11:30 AM: MAT 306 (BSM CS 3A G2) - Federizo Hall\n• 11:30 AM - 1:00 PM: MAT 306 (BSM AS 3B) - FH 206\n\n**Friday:**\n• 7:00 AM - 8:30 AM: BSM AS 3B - Federizo Hall\n• 8:30 AM - 10:00 AM: BSM AS 3A - FH 205\n• 10:00 AM - 11:30 AM: MAT 306 (BSM CS 3B G2) - AVR A\n\n**Saturday:**\n• 7:00 AM - 10:00 AM: MAT 306 (BSM BA 3A) - FH 206\n• 10:00 AM - 1:00 PM: MAT 206 (BSM BA 3B) - FH 206",
      keywords: [
        "dela cruz",
        "harris",
        "mat306",
        "mat206",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Ma'am Rainilyn L. Duque?",
      answer:
        "**Ma'am. DUQUE, RAINILYN L. - Schedule**\n\n**Monday:**\n• 1:00 PM - 2:00 PM: MAT 405 (BSM CS 4B G1) - FH 206\n• 2:00 PM - 3:00 PM: MAT 405 (BSM CS 4B G2) - Federizo Hall\n• 3:00 PM - 4:00 PM: MAT 405 (BSM CS 4B G1) - FH 207\n• 5:00 PM - 8:00 PM: MAT 405 (BSM CS 4A G1) - Federizo Hall - CS RESEARCH & EXTENS\n\n**Tuesday:**\n• 8:30 AM - 10:00 AM: ES 201 (BPA 2A) - Mendoza Hall - APP 211\n• 10:00 AM - 11:30 AM: ES 201 (BPA 2B) - Mendoza Hall - APP 110\n\n**Friday:**\n• 10:00 AM - 11:30 AM: ES 201 (BPA 2B) - Mendoza Hall - APP 211\n• 1:00 PM - 2:30 PM: ES 201 (BPA 2A) - Mendoza Hall - APP 211",
      keywords: [
        "What is the schedule of maam Rain?",
        "Give me the schedule of maam Rain?",
        "duque",
        "rain",
        "rainilyn",
        "mat405",
        "es201",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Mary Ann C. Magtulis?",
      answer:
        "**Prof. MAGTULIS, Mary Ann C. - Schedule**\n\n**Monday:**\n• 1:00 PM - 3:00 PM: MAS 203a (BSM AS 2B) - FH 207\n• 4:00 PM - 6:00 PM: MAS 203a (BSM AS 2A) - FH 207\n\n**Tuesday:**\n• 2:00 PM - 5:00 PM: MAS 203a (BSM AS 2A) - FH 207\n\n**Wednesday:**\n• 5:00 PM - 6:00 PM: MAS 103 (BSM AS 1A) - FH 207\n\n**Thursday:**\n• 5:00 PM - 6:00 PM: MAS 103 (BSM AS 1B) - FH 207\n\n**Friday:**\n• 5:00 PM - 6:00 PM: MAS 203a (BSM AS 2B) - FH 207",
      keywords: [
        "magtulis",
        "mary ann",
        "mas203a",
        "mas103",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Agape A. Eusebio?",
      answer: `**Sir. EUSEBIO, AGAPE A - Schedule**

      **Saturday:**
      • 10:00 AM - 1:00 PM: MST 101d (CPE 3C) - Federizo Hall - FH 206
      • 2:30 PM - 5:30 PM: MST 101d (BSN 2B - Main Campus) - Federizo Hall - FH 206`,
      keywords: ["eusebio", "agape", "schedule", "faculty", "mst"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Sir Marco C. Mandap?",
      answer: `**Sir. MANDAP, MARCO C - Schedule**

      **Monday:**
      • 4:30 PM - 6:30 PM: BST 305 (BSB 3B) - Federizo Hall - FH 107 (Physics Lab)

      **Friday:**
      • 2:00 PM - 5:00 PM: BST 305 (BSB 3B) - Federizo Hall - FH 205

      **Saturday:**
      • 10:00 AM - 1:00 PM: MBA 306 (BSM BA 3A) - Federizo Hall - FH 207
      • 1:00 PM - 4:00 PM: MBA 306 (BSM BA 3B) - Federizo Hall - FH 207`,
      keywords: [
        "What is the schedule of Sir Marco?",
        "What is the schedule of Sir marco?",
        "What is the schedule of Sir Marco C. Mandap",
        "Give me the schedule of Sir Marco C. Mandap",
        "what is the schedule of sir marco mandap?",
        "give me the schedule of sir Marco mandap?",
        "mandap",
        "marco",
        "schedule",
        "faculty",
        "bst",
        "mba",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Jerica D. Tolentino?",
      answer: `**Ma'am. TOLENTINO, JERICA D - Schedule**

**Wednesday:**
• 3:30 PM - 6:30 PM: MST 101d (CPE 3B) - Federizo Hall - FH 306`,
      keywords: ["tolentino", "jerica", "schedule", "faculty", "mst"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Judy Ann T. Sumala?",
      answer: `**Ma'am. SUMALA, JUDY ANN T - Schedule**

**Monday:**
• 7:00 AM - 8:30 AM: MMW 101 (BAJ 1A) - CAL Theater C
• 8:30 AM - 10:00 AM: MMW 101 (BAJ 1B) - CAL Theater C
• 10:00 AM - 11:30 AM: MST 101d (BSMT 1A) - FH 105
• 11:30 AM - 1:00 PM: MST 101d (BSMT 1B) - FH 105

**Tuesday:**
• 7:00 AM - 8:30 AM: MST 101 (BSMT 1B) - FH 104
• 10:00 AM - 11:30 AM: MMW 101 (BAJ 1B) - CAL Theater C

**Thursday:**
• 7:00 AM - 8:30 AM: MST 101d (BSMT 1A) - FH 105
• 2:30 PM - 4:00 PM: MMW 101 (BAJ 1A) - Old CAL Library`,
      keywords: ["sumala", "judy", "schedule", "faculty", "mmw", "mst"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Dr. Edgardo M. Santos?",
      answer: `**Dr. SANTOS, EDGARDO M - Schedule**

**Thursday:**
• 8:30 AM - 11:30 AM: MAT 307 (BSM BA 3A) - FH 206
• 11:30 AM - 1:00 PM: MAT 307 (BSM CS 3A G1/G2) - FH 206

**Friday:**
• 8:30 AM - 11:30 AM: MAT 307 (BSM BA 3B) - FH 307
• 11:30 AM - 1:00 PM: MAT 307 (BSM CS 3A G1/G2) - FH 206`,
      keywords: ["santos", "edgardo", "schedule", "faculty", "mat"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Leo Santiago?",
      answer: `**Sir. SANTIAGO, LEO - Schedule**

**Monday:**
• 6:00 PM - 7:00 PM: STS 101 (BFA 1A) - FH 302

**Tuesday:**
• 5:00 PM - 8:00 PM: STS 101 (BFA 1C) - FH Old AVR

**Wednesday:**
• 4:00 PM - 6:00 PM: STS 101 (BFA 1A) - FH 108

**Saturday:**
• 8:30 AM - 11:30 AM: STS 101 (BSN 2A) - Main Campus Pimentel Hall - CON Nutrition Room`,
      keywords: ["santiago", "leo", "schedule", "faculty", "sts"],
      isPublished: true,
    },

    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Mara M. Roxas?",
      answer: `**Ma'am. ROXAS, MARA M - Schedule**

**Monday:**
• 7:00 AM - 10:00 AM: CM 105 (BIT 1PG1/1PG2) - AH AR 318
• 10:00 AM - 12:00 PM: CM 105 (BIT 1QG1/1QG2) - AH AR 318

**Tuesday:**
• 2:00 PM - 3:30 PM: IT 104 (BSIT 1AG1/1AG2) - NSTP Building - CICT
• 3:30 PM - 5:00 PM: IT 104 (BSIT 1BG1/1BG2) - NSTP Building - CICT
• 5:00 PM - 7:00 PM: CM 105 (BIT 1PG1/1PG2) - AH AR 318/327

**Wednesday:**
• 7:00 AM - 10:00 AM: CM 105 (BIT 1CG1/1CG2) - AH AR 327
• 2:00 PM - 3:30 PM: IT 104 (BSIT 1CG1/1CG2) - NSTP Building - CICT
• 3:30 PM - 5:00 PM: IT 104 (BSIT 1EG1/1EG2) - NSTP Building - CICT

**Thursday:**
• 7:00 AM - 9:00 AM: CM 105 (BIT 1CG1/1CG2) - AH AR 314
• 2:00 PM - 3:30 PM: IT 104 (BSIT 1AG1/1AG2) - NSTP Building - CICT
• 3:30 PM - 5:00 PM: IT 104 (BSIT 1BG1/1BG2) - NSTP Building - CICT

**Friday:**
• 11:00 AM - 2:00 PM: CM 105 (BIT 1QG1/1QG2) - AH AR 314/316
• 2:00 PM - 3:30 PM: IT 104 (BSIT 1CG1/1CG2) - NSTP Building - CICT
• 3:30 PM - 5:00 PM: IT 104 (BSIT 1EG1/1EG2) - NSTP Building - CICT`,
      keywords: ["roxas", "mara", "schedule", "faculty", "cm105", "it104"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Gertrudes C. Reyes?",
      answer: `**Ma'am. REYES, GERTRUDES C - Schedule**

**Tuesday:**
• 2:00 PM - 4:30 PM: CM 105 (BIT 1FG1/1FG2) - AH AR 316
• 4:30 PM - 6:30 PM: CM 105 (BIT 1BG1/1BG2) - AH AR 316

**Wednesday:**
• 8:00 AM - 11:00 AM: SLIS 101 (BLIS 2B) - Law 302
• 1:00 PM - 3:00 PM: CM 105 (BIT 1LG1/1LG2) - AH AR 327
• 3:00 PM - 6:00 PM: CM 105 (BIT 1BG1/1BG2) - AH AR 313

**Thursday:**
• 7:00 AM - 10:00 AM: SLIS 101 (BLIS 2A) - CICT AVR
• 2:00 PM - 4:00 PM: CM 105 (BIT 1MG1/1MG2) - AH AR 327
• 4:00 PM - 6:30 PM: CM 105 (BIT 1FG1/1FG2) - AH AR 327

**Friday:**
• 10:00 AM - 1:00 PM: CM 105 (BIT 1LG1/1LG2) - AH AR 327
• 2:00 PM - 5:00 PM: CM 105 (BIT 1MG1/1MG2) - AH AR 327`,
      keywords: ["reyes", "gertrudes", "schedule", "faculty", "cm105", "slis"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Cherielyn C. Regalado?",
      answer: `**Ma'am. REGALADO, CHERIELYN C - Schedule**

**Monday:**
• 11:30 AM - 1:00 PM: IT 104 (BSIT 1FG1/1FG2) - CICT ACAD 6
• 3:30 PM - 5:00 PM: IT 104 (BSIT 1GG1/1GG2) - CICT ACAD 5
• 5:00 PM - 8:00 PM: IT 104 (BSIT 1A) - Online Class

**Tuesday:**
• 10:00 AM - 11:30 AM: IT 104 (BSIT 1HG1/1HG2) - CICT ACAD 2
• 2:00 PM - 5:00 PM: MAT 104 (BSM CS 1AG1/1AG2) - CS-AR

**Wednesday:**
• 8:30 AM - 10:00 AM: IT 104 (BSIT 1FG1/1FG2)
• 11:30 AM - 1:00 PM: IT 104 (BSIT 1GG1/1GG2)
• 2:00 PM - 5:00 PM: MAT 104 (BSM AS 1A/1B)

**Thursday:**
• 10:00 AM - 11:30 AM: IT 104 (BSIT 1HG1/1HG2)
• 2:00 PM - 5:00 PM: MAT 104 (BSM AS 1A/1B)

**Friday:**
• 2:00 PM - 5:00 PM: MAT 104 (BSM AS / CS)
• 5:00 PM - 6:30 PM: IT 104 (BSIT 1DG1)`,
      keywords: [
        "regalado",
        "cherielyn",
        "schedule",
        "faculty",
        "it104",
        "mat104",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Dan Lloyd B. Paulino?",
      answer:
        "**Prof. PAULINO, DAN LLOYD B. - Schedule**\n\n" +
        "**Monday:**\n" +
        "• 7:00 AM – 8:30 AM: STS 101 (BPED 1A) - Roxas Hall – RH\n" +
        "• 8:30 AM – 10:00 AM: STS 101 (BSE 1A) - NSTP Building (ACAD) – CICT ACAD 5\n" +
        "• 12:00 PM – 2:00 PM: CM 105 AUTOMOTIVE 1E BC (BUSTOS)\n" +
        "• 2:00 PM – 4:00 PM: (BIT 1OG1) - Online Class\n" +
        "• 2:00 PM – 4:00 PM: (BIT 1OG2) - Online Class\n\n" +
        "**Tuesday:**\n" +
        "• 2:30 PM – 5:30 PM: CM 105 AUTOMOTIVE 1E BC (BUSTOS)\n\n" +
        "**Wednesday:**\n" +
        "• 7:00 AM – 8:30 AM: STS 101 (BPED 1A) - Roxas Hall – RH 411\n" +
        "• 11:30 AM – 1:00 PM: STS 101 (BSE 1A) - Federizo Hall – Cal Theater B\n" +
        "• 2:00 PM – 4:00 PM: AUTOMOTIVE 1E (BIT 1EG1) - Alvarado Hall – AH AR 316\n" +
        "• 2:00 PM – 4:00 PM: AUTOMOTIVE 1E (BIT 1EG2) - Alvarado Hall – AH AR 316\n" +
        "• 5:00 PM – 8:00 PM: STS 101 (CE - 2C) - COE 2 – COE 2 503\n\n" +
        "**Thursday:**\n" +
        "• 1:00 PM – 4:00 PM: STS 101 (BECED 1A) - Roxas Hall – RH 303\n\n" +
        "**Friday:**\n" +
        "• 10:00 AM – 1:00 PM: AUTOMOTIVE 1E (BIT 1EG1) - Alvarado Hall – AH AR 316\n" +
        "• 10:00 AM – 1:00 PM: AUTOMOTIVE 1E (BIT 1EG2) - Alvarado Hall – AH AR 316\n" +
        "• 5:00 PM – 8:00 PM: AUTOMOTIVE 1E (BIT 1OG1) - Alvarado Hall – AH AR 318\n" +
        "• 5:00 PM – 8:00 PM: AUTOMOTIVE 1E (BIT 1OG2) - Alvarado Hall – AH AR 318",
      keywords: [
        "paulino",
        "dan lloyd",
        "automotive",
        "sts 101",
        "cm 105",
        "bit",
        "bped",
        "bse",
        "ce",
        "beced",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Armele J. Mangaran?",
      answer:
        "**Prof. MANGARAN, ARMELE J. - Schedule**\n\n" +
        "**Tuesday (SRC Campus):**\n" +
        "• 8:00 AM – 10:00 AM: BST 305 (BSB 3A) - RCS Building\n" +
        "• 11:00 AM – 2:00 PM: BST 305L (BSB 3A) - RCS Building Room 205\n\n" +
        "**Thursday (Main Campus):**\n" +
        "• 10:00 AM – 1:00 PM: MAS 305 (BSM AS 3A) - Federizo Hall – FH 207\n" +
        "• 2:00 PM – 5:00 PM: MAS 305 (BSM AS 3B) - Federizo Hall – FH 207",
      keywords: [
        "mangaran",
        "armele",
        "armele mangaran",
        "prof mangaran",
        "bst 305",
        "bst 305l",
        "mas 305",
        "rcs building",
        "fh 207",
        "src campus",
        "main campus",
        "faculty schedule",
        "teacher schedule",
        "schedule mangaran",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Paul Andrei P. Geronimo?",
      answer: `**Sir. GERONIMO, PAUL ANDREI P - Schedule**

**Monday:**
• 7:00 AM - 10:00 AM: CM 105 (BIT 1DG1/1DG2) - Online
• 11:30 AM - 2:30 PM: MMW 101 (BSP 1D/1E)
• 3:30 PM - 5:00 PM: MST 101d (CPE 3A)

**Tuesday:**
• 7:00 AM - 11:00 AM: CM 105 (BIT 1DG1/1DG2/1NG1)
• 1:00 PM - 2:30 PM: MMW 101 (BSP 1D)

**Wednesday:**
• 7:00 AM - 10:00 AM: MAT 302 (Petitioned)
• 11:30 AM - 1:00 PM: MST 101d (CPE 3A)

**Thursday:**
• 11:30 AM - 1:00 PM: MMW 101 (BSP 1E)
• 2:00 PM - 5:00 PM: CM 105 (BIT 1NG1)`,
      keywords: ["geronimo", "paul", "schedule", "faculty", "cm105", "mmw"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Raevinor Gonzales?",
      answer: `**Sir. GONZALES, RAEVINOR - Schedule**

**Tuesday:**
• 2:00 PM - 5:00 PM: COE 104 (MEE 1A/1B) - COE 2`,
      keywords: ["gonzales", "raevinor", "schedule", "faculty", "coe"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Bernadette Dela Cruz?",
      answer:
        "**Prof. DELA CRUZ, BERNADETTE - Schedule**\n\n**Tuesday:**\n• 10:00 AM - 1:00 PM: MBA 305 (BSM BA 3B) - FH 201 A\n• 2:00 PM - 5:00 PM: FEL 401 (BSM BA 4B) - FH 201 A\n• 5:00 PM - 8:00 PM: FEL 401 (BSM BA 4A) - FH 201 A\n\n**Wednesday:**\n• 5:00 PM - 6:30 PM: MBA 207 (BSM BA 2A) - FH\n• 6:30 PM - 8:00 PM: MBA 207 - FH 201 A\n\n**Thursday:**\n• 1:00 PM - 4:00 PM: FEL 301 (BSM BA 3B) - FH AVR A\n• 5:00 PM - 6:30 PM: MBA 207 (BSM BA 2B)\n• 6:30 PM - 8:00 PM: MBA 207 (BSM BA 2A) - FH AVR A\n\n**Friday:**\n• 10:00 AM - 1:00 PM: MBA 305 (BSM BA 3A) - FH 201 A\n• 2:00 PM - 5:00 PM: FEL 301 (BSM BA 3A) - FH 201 A",
      keywords: [
        "dela cruz",
        "bernadette",
        "mba305",
        "fel401",
        "mba207",
        "fel301",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Sir. Benedict M. Estrella?",
      answer:
        "**Sir. ESTRELLA, BENEDICT M. - Schedule**\n\n**Monday:**\n• 10:00 AM - 11:30 AM: MAT 204a (BSM AS 2A) - FH 201 A\n• 11:30 AM - 1:00 PM: MAT 204a (BSM AS 2B) - FH 201 A\n• 2:00 PM - 3:30 PM: MAT 204a (BSM BA 2A) - FH 201 A\n• 3:30 PM - 5:00 PM: MAT 204a (BSM BA 2B) - FH 201 A\n• 5:00 PM - 6:30 PM: MAT 204a (BSM AS 2B) - FH 206\n\n**Tuesday:**\n• 5:00 PM - 6:30 PM: MAT 204a (BSM BA 2B) - FH 201 B\n\n**Wednesday:**\n• 5:00 PM - 6:30 PM: MAT 204a (BSM BA 2A) - FH 206\n\n**Thursday:**\n• 5:00 PM - 6:30 PM: MAT 204a (BSM AS 2A) - FH 206\n\n**Friday:**\n• 5:00 PM - 6:30 PM: MAT 204a (BSM AS 2A) - FH 206",
      keywords: [
        "What is the schedule of Sir ben",
        "What is the schedule of Sir Ben",
        "What is the schedule of Sir Benedict Estrella?",
        "Give me the schedule of Sir BenedictE strella?",
        "what is the schedule of sir benedict estrella?",
        "give me the schedule of sir benedict Estrella?",
        "estrella",
        "benedict",
        "mat204a",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Aarhus M. Dela Cruz?",
      answer:
        "**Prof. DELA CRUZ, AARHUS M. - Schedule**\n\n**Monday:**\n• 7:00 AM - 8:30 AM: MAT 305 (BSM AS 4A) - FH 201 B\n• 8:30 AM - 10:00 AM: MAT 305 (BSM AS 4A) - FH 201 B\n• 10:00 AM - 11:30 AM: MAT 305 (BSM AS 3B) - FH 201 B\n• 11:30 AM - 1:00 PM: MAT 403 (BSM CS 4B G2) - FH 201\n• 2:00 PM - 3:30 PM: MAT 305 (BSM CS 3B G2) - FH 201 B\n• 3:30 PM - 5:00 PM: MAT 305 (BSM CS 3A G2) - FH 201 B\n\n**Tuesday:**\n• 7:00 AM - 10:00 AM: BST 305 L (BSB 3A) - FH 205\n\n**Wednesday:**\n• 8:30 AM - 10:00 AM: MAT 403 (BSM AS 4A)\n• 10:00 AM - 11:30 AM: BST (BSB 3A) - FH / FH 315\n• 11:30 AM - 12:00 PM: BST (BSB 3A) - FH 315\n\n**Thursday:**\n• 7:00 AM - 8:30 AM: MAT 305 (BSM CS 3B G2) - FH 207\n• 8:30 AM - 10:00 AM: MAT 305 (BSM CS 3B G2) - FH 207\n\n**Friday:**\n• 7:00 AM - 8:30 AM: MAT 305 (BSM AS 3B) - FH 207\n• 8:30 AM - 10:00 AM: MAT 305 (BSM AS 3B) - FH 207",
      keywords: [
        "dela cruz",
        "aarhus",
        "mat305",
        "mat403",
        "bst305",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Carla M. Clemente?",
      answer:
        "**Prof. CLEMENTE, CARLA M. - Schedule**\n\n**Monday:**\n• 10:00 AM - 1:00 PM: MAT 405 (BSM AS 4B) - CS Research/Extension\n• 2:00 PM - 5:00 PM: MAT 405 (BSM AS 4A) - CS Research/Extension\n\n**Tuesday:**\n• 3:00 PM - 5:00 PM: MAS 204a (BSM AS 2B) - FH 206\n\n**Wednesday:**\n• 10:00 AM - 1:00 PM: MAS 204a (BSM AS 2B) - FH 207\n• 2:00 PM - 5:00 PM: MAS 204a (BSM AS 2A) - FH 207\n\n**Thursday:**\n• 1:00 PM - 3:00 PM: MAS 204a (BSM AS 2A) - FH 201 B\n\n**Friday:**\n• 10:00 AM - 1:00 PM: MAS 306 (BSM AS 3B) - FH 205\n• 2:00 PM - 5:00 PM: MAS 306 (BSM AS 3A) - FH 207",
      keywords: [
        "clemente",
        "carla",
        "mat405",
        "mas204a",
        "mas306",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Melda Cristina B. Carcosia?",
      answer:
        "**Prof. CARCOSIA, MELDA CRISTINA B. - Schedule**\n\n**Monday:**\n• 7:00 AM - 8:30 AM: BSM AS 3B - FH N202\n• 11:30 AM - 1:00 PM: FEL 301 (BSM AS 3A) - FH N202\n\n**Tuesday:**\n• 8:00 AM - 10:00 AM: MAT 105\n• 10:00 AM - 12:00 PM: MAT 105\n\n**Wednesday:**\n• 7:00 AM - 10:00 AM: ELEC II (BSB 4A) - FH N202\n• 10:00 AM - 1:00 PM: MAT 105\n\n**Thursday:**\n• 7:00 AM - 8:30 AM: FEL 301 (BSM AS 3A)\n• 8:30 AM - 10:00 AM: FEL 301 (BSM AS 3B)\n• 10:00 AM - 1:00 PM: MAT 105 (BSM AS 1A)\n\n**Friday:**\n• 7:00 AM - 10:00 AM: ELEC II (BSB 4B) - FH CS AR",
      keywords: [
        "carcosia",
        "melda cristina",
        "fel301",
        "mat105",
        "elec ii",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Evelyn Camara?",
      answer:
        "**Prof. CAMARA, EVELYN - Schedule**\n\n**Tuesday:**\n• 7:00 AM - 8:30 AM: MAT 206 - FH CS AR\n• 8:30 AM - 10:00 AM: MAT 206 (BSM AS 2A) - FH CS AR\n• 11:30 AM - 1:00 PM: MAT 206 (BSM AS 2B) - FH CS AR\n\n**Wednesday:**\n• 7:00 AM - 8:30 AM: MAT 206 - Federizo Hall\n• 8:30 AM - 10:00 AM: MAT 206 (BSM CS 2A G2) - FH AVR A\n• 10:00 AM - 11:30 AM: MAT 206 (BSM AS 2A) - FH CS Research Extension\n• 2:00 PM - 3:30 PM: MAT 206 (BSM CS 2A G2) - FH AVR A\n\n**Thursday:**\n• 7:00 AM - 8:30 AM: MAT 206 - FH 206\n• 10:00 AM - 11:30 AM: MAT 206 (BSM BA 2B) - CS Research/Extension\n\n**Friday:**\n• 10:00 AM - 11:30 AM: MAT 206 (BSM BA 2B) - FH Research/Extension\n• 11:30 AM - 1:00 PM: MAT 206 (BSM CS 2B G2) - FH AVR A\n• 2:00 PM - 3:30 PM: MAT 206 (BSM AS 2B) - FH CS AR",
      keywords: ["camara", "evelyn", "mat206", "schedule", "faculty"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Ma. Conception DC. Arellano?",
      answer:
        "**Prof. ARELLANO, MA C. - Schedule**\n\n**Monday:**\n• 8:00 AM - 10:00 AM: MAT 204 (BSFT 1A) - FH 108\n• 10:00 AM - 12:00 PM: MAT 204 (BSFT 1B) - FH 106\n\n**Tuesday:**\n• 2:00 PM - 4:00 PM: CM 105 (BIT IT G2 (AFW)) - AR 317\n\n**Wednesday:**\n• 1:00 PM - 4:00 PM: MAT 204 (BSFT 1A) - FH 108\n\n**Thursday:**\n• 7:00 AM - 10:00 AM: CM 105 (BIT IT G2 (AFWT)) - AR 320\n• 10:00 AM - 1:00 PM: MAT 204 (BSFT 1B) - FH 106\n• 2:00 PM - 4:00 PM: CM 105 (BIT 14G1 (AT)) - AR 313\n\n**Friday:**\n• 10:00 AM - 1:00 PM: CM 105 (BIT 1A G2 (AT)) - AR 313",
      keywords: ["arellano", "ma c", "mat204", "cm105", "schedule", "faculty"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Elyssa Grace A. Antonio?",
      answer:
        "**Prof. ANTONIO, ELYSSA GRACE A. - Schedule**\n\n**Monday:**\n• 7:00 AM - 8:30 AM: BAB 1C - FED HALL\n• 8:30 AM - 10:00 AM: BAB 1D - FH 4\n• 10:00 AM - 11:30 AM: BA MP 1A - FH\n• 11:30 AM - 1:00 PM: BPEA 1A - CAL Library 2\n• 2:00 PM - 3:30 PM: BPEA 1B - FH 210\n• 5:30 PM - 6:30 PM: STS 101 (BSBA 1C) - FH AR 4\n\n**Tuesday:**\n• 8:30 AM - 10:00 AM: MMW 101 (BPEA 1B) - Law Building\n• 10:00 AM - 1:00 PM: MAT 202 (Petitioned Class) - FED HALL\n• 3:00 PM - 5:00 PM: CM 105 (BIT 1KG2 (EXT)) - AR 327\n• 5:30 PM - 7:30 PM: STS 101 (BSBA 1C) - CBA Building CBA 402\n\n**Wednesday:**\n• 8:30 AM - 10:00 AM: MMW 101 (BAB 1B) - Law Building\n\n**Thursday:**\n• 10:00 AM - 1:00 PM: CM 105 (BIT 1KG2 (EXT)) - AR 327\n• 3:00 PM - 4:30 PM: MMW 101 - FH 201 B\n\n**Friday:**\n• 7:00 AM - 8:30 AM: BPEA 1A - Law Building\n• 8:30 AM - 10:00 AM: BA MP 1A - FH 209\n• 11:30 AM - 1:00 PM: BAB 1C - Old CAL Library",
      keywords: [
        "antonio",
        "elyssa grace",
        "bab",
        "mmw101",
        "cm105",
        "sts101",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Deo Stephanie Angeles?",
      answer:
        "**Prof. ANGELES, DEO STEPHANNE - Schedule**\n\n" +
        "**Monday:**\n" +
        "• 7:00 AM – 9:00 AM: BSM CS 1A G2 - FH 207\n" +
        "• 9:00 AM – 11:00 AM: BSM CS 1A G1 - FH 207\n" +
        "• 11:00 AM – 1:00 PM: BSM CS 1B G1 - FH 207\n" +
        "• 2:00 PM – 4:00 PM: BSM CS 1B G2 - N202\n\n" +
        "**Tuesday:**\n" +
        "• 7:00 AM – 10:00 AM: BSM CS 1B G1 - FH 207\n" +
        "• 10:00 AM – 1:00 PM: BSM CS 1B G2 - FH 207\n\n" +
        "**Wednesday:**\n" +
        "• 7:00 AM – 10:00 AM: BSM CS 1A G1 - FH 207\n\n" +
        "**Friday:**\n" +
        "• 7:00 AM – 10:00 AM: BSN 2A - CON Lecture Room 1\n" +
        "• 10:00 AM – 1:00 PM: BSM CS 1A G2 - FH 207",
      keywords: [
        "angeles",
        "deo stephanie",
        "deo stephanne",
        "bsm cs",
        "bsn",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Minerva R. Amores?",
      answer:
        "**Prof. AMORES, MINERVA R. - Schedule**\n\n" +
        "**Monday:**\n" +
        "• 9:00 AM – 10:00 AM: MMW 101 (BSHM 1D) - (location not specified)\n" +
        "• 10:00 AM – 1:00 PM: MMW 101 (BSHM 1A) - CHTM 208\n" +
        "• 2:00 PM – 3:00 PM: MMW 101 (BSHM 1C) - CHTM Building\n" +
        "• 3:30 PM – 5:00 PM: MMW 101 (BSHM 1G) - CHTM 406\n\n" +
        "**Tuesday:**\n" +
        "• 10:00 AM – 11:30 AM: MMW 101 (BSHM 1A) - CHTM 301\n" +
        "• 12:30 PM – 2:30 PM: MMW 101 (BSHM 1D) - CHTM 305\n" +
        "• 2:30 PM – 4:00 PM: MMW 101 - CHTM 305\n\n" +
        "**Wednesday:**\n" +
        "• 8:30 AM – 10:00 AM: MMW 101 (BSHM 1C) - CHTM Building / CHTM 301\n" +
        "• 10:00 AM – 1:00 PM: MMW 101 (BSHM 1H) - CHTM 408\n\n" +
        "**Thursday:**\n" +
        "• 11:30 AM – 1:00 PM: MMW 101 (BSHM 1G) - CHTM 403\n\n" +
        "**Friday:**\n" +
        "• 8:30 AM – 11:30 AM: MMW 101 (BSHM 1E) - CHTM 305\n" +
        "• 1:30 PM – 4:30 PM: MMW 101 (BSHM 1F) - CHTM 301",
      keywords: ["amores", "minerva", "mmw 101", "bshm", "schedule", "faculty"],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Joselito Viola?",
      answer:
        "**Prof. VIOLA, JOSELITO - Schedule**\n\n" +
        "**Tuesday:**\n" +
        "• 10:00 AM – 11:30 AM: MAT 205 (BSM BA 2A) - FH\n" +
        "• 11:30 AM – 1:00 PM: MAT 205 (BSM BA 2B) - FH AVR A\n" +
        "• 2:00 PM – 3:30 PM: MAT 205 (BSM BA 2B) - FH AVR A\n\n" +
        "**Wednesday:**\n" +
        "• 7:30 AM – 10:00 AM: MAT 105 (BSM CS 1B G2) - FH 201 A\n" +
        "• 10:00 AM – 11:30 AM: MAT 205 (BSM BA) - Federizo Hall\n" +
        "• 11:30 AM – 1:00 PM: MAT 206 (BSM CS 2B G2) - FH 201\n" +
        "• 2:00 PM – 3:30 PM: MAT 205 (BSM BA 2B) - FH 201\n\n" +
        "**Thursday:**\n" +
        "• 8:30 AM – 10:00 AM: MAT 205 (BSM CSA 2A) - FH\n" +
        "• 10:00 AM – 11:30 AM: MAT 205 (BSM AS 2B) - FH\n" +
        "• 11:30 AM – 1:00 PM: MAT 205 (BSM AS 2A) - FH AVR A\n\n" +
        "**Friday:**\n" +
        "• 7:00 AM – 9:00 AM: MAT 105 (BSM CS 1B G1) - AVR A\n" +
        "• 10:00 AM – 11:30 AM: MAT 205 (BSM AS 2A) - Federizo Hall\n" +
        "• 11:30 AM – 1:00 PM: MAT 205 (BSM AS 2B) - FH AR\n" +
        "• 1:00 PM – 2:30 PM: MAT 205 (BSM CS 2B G2) - AVR A",
      keywords: [
        "viola",
        "joselito",
        "mat 105",
        "mat 205",
        "mat 206",
        "bsm cs",
        "bsm ba",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Adolfo D. Victoria?",
      answer:
        "**Prof. VICTORIA, ADOLFO D. - Schedule**\n\n" +
        "**Monday:**\n" +
        "• 9:00 AM – 10:00 AM: SM 201 (BSAR 1A) - FH 302\n" +
        "• 11:30 AM – 1:00 PM: MMW 101 (FSC 1C) - NSTP Building ACAD 5\n" +
        "• 2:00 PM – 3:30 PM: MMW 101 (FSM 1C) - (location not specified)\n" +
        "• 3:30 PM – 5:00 PM: MMW 101 (FCS 1A) - AD 106\n\n" +
        "**Tuesday:**\n" +
        "• 9:00 AM – 10:30 AM: MMW 101 (FSM 1C) - Athlete Dorm AD\n" +
        "• 10:30 AM – 12:00 PM: MMW 101 (FSC 1B) - AD 104\n\n" +
        "**Wednesday:**\n" +
        "• 4:00 PM – 5:00 PM: SM 201 (BSAR 1A) - FH 311a\n\n" +
        "**Thursday:**\n" +
        "• 7:00 AM – 10:00 AM: MMW 101 (FSM 1B) - AD 101\n" +
        "• 11:30 AM – 1:00 PM: MMW 101 (FSC 1C) - AD Room\n" +
        "• 1:00 PM – 2:30 PM: MMW 101 (FSC 1B) - AD Room\n" +
        "• 2:30 PM – 4:00 PM: MMW 101 (FCS 1A) - AD 106\n\n" +
        "**Friday:**\n" +
        "• 1:00 PM – 4:00 PM: MMW 101 (FSM 1A) - AD 104",
      keywords: [
        "victoria",
        "adolfo",
        "mmw 101",
        "sm 201",
        "bsar",
        "fsm",
        "fsc",
        "fcs",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Joshua P. Valeroso?",
      answer:
        "**Prof. VALEROSO, JOSHUA P. - Schedule**\n\n" +
        "**Monday:**\n" +
        "• 7:00 AM – 8:30 AM: BSM AS 4B - FH\n" +
        "• 8:30 AM – 10:00 AM: MAT 404 (BSM CS 4B G2) - FH\n" +
        "• 10:00 AM – 11:30 AM: BSM AS 4A - FH\n" +
        "• 11:30 AM – 1:00 PM: MAT 404 (BSM CS 4A G1) - FH 206\n" +
        "• 2:00 PM – 3:30 PM: MAT 404 (BSM BA 4B) - (location not specified)\n" +
        "• 3:30 PM – 5:00 PM: MAT 404 (BSM BA 4A) - FH 206\n\n" +
        "**Tuesday:**\n" +
        "• 10:00 AM – 1:00 PM: MAT 107 (BSM AS 1B) - FH N202\n" +
        "• 2:00 PM – 5:00 PM: MAS 304 (BSM AS 3B) - FH 205\n" +
        "• 5:00 PM – 8:00 PM: MAS 304 (BSM AS 3A) - FH 206\n\n" +
        "**Wednesday:**\n" +
        "• 10:00 AM – 11:30 AM: MAT 404 (BSM CS 4B G2) - (location not specified)\n" +
        "• 11:30 AM – 1:00 PM: MAT 404 (BSM CS 4A G2) - FH 206\n" +
        "• 2:00 PM – 3:30 PM: MAT 404 (BSM BA 4B) - FH\n" +
        "• 5:00 PM – 6:30 PM: MAT 404 (BSM AS 4A) - (location not specified)\n" +
        "• 6:30 PM – 8:00 PM: MAT 404 (BSM AS 4B) - FH 206",
      keywords: [
        "valeroso",
        "joshua",
        "mat 404",
        "mas 304",
        "mat 107",
        "bsm cs",
        "bsm as",
        "bsm ba",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Yolanda C. Roberto?",
      answer:
        "**Prof. ROBERTO, YOLANDA C. - Schedule**\n\n" +
        "**Monday:**\n" +
        "• 8:30 AM – 10:00 AM: MAT 307 (BSM AS 3B) - FH\n" +
        "• 10:00 AM – 11:30 AM: (course not specified) (BSM BA 4A) - (location not specified)\n" +
        "• 11:30 AM – 1:00 PM: MAT 403 (BSM AS 4A) - FH AVR A\n" +
        "• 2:00 PM – 3:30 PM: MAT 403 (BSM AS 4B) - (location not specified)\n" +
        "• 3:30 PM – 5:00 PM: MAT 403 (BSM BA 4B) - FH AVR A\n\n" +
        "**Tuesday:**\n" +
        "• 10:00 AM – 1:00 PM: MAT 405 (BSM BA 4B) - CS Research/Extension\n" +
        "• 3:30 PM – 5:00 PM: MAT 307 (BSM AS 3A) - (location not specified)\n" +
        "• 5:00 PM – 6:30 PM: MAT 307 (BSM AS 3B) - FH AVR A\n\n" +
        "**Wednesday:**\n" +
        "• 10:00 AM – 11:30 AM: MAT 307 (BSM AS 3A) - FH\n" +
        "• 11:30 AM – 1:00 PM: MAT 403 (BSM BA 4A) - FH AVR A\n" +
        "• 2:00 PM – 3:30 PM: MAT 403 (BSM AS 4A) - FH\n" +
        "• 3:30 PM – 5:00 PM: (course not specified) (BSM AS 4B) - (location not specified)\n" +
        "• 5:00 PM – 6:30 PM: MAT 403 - FH CS AR\n\n" +
        "**Friday:**\n" +
        "• 2:00 PM – 5:00 PM: MAT 307 (BSM CS 3B G2) - FH 206",
      keywords: [
        "roberto",
        "yolanda",
        "mat 307",
        "mat 403",
        "mat 405",
        "bsm as",
        "bsm ba",
        "bsm cs",
        "schedule",
        "faculty",
      ],
      isPublished: true,
    },
    {
      category: "Faculty Schedules",
      question: "What is the schedule of Prof. Harris Dela Cruz?",
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
      keywords: ["dela cruz", "harris", "schedule", "faculty", "mat 306"],
      isPublished: true,
    },
  ];

  let created = 0;
  let updated = 0;

  for (const faq of facultyScheduleFAQs) {
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });

    if (existing) {
      await prisma.fAQ.update({
        where: { id: existing.id },
        data: faq,
      });
      updated++;
    } else {
      await prisma.fAQ.create({
        data: faq,
      });
      created++;
    }
  }

  console.log(
    `✅ Seeded faculty schedule FAQs: ${created} created, ${updated} updated`,
  );
}

async function main() {
  console.log("🚀 Starting knowledge seed...\n");

  try {
    await seedFAQs();
    await seedRoomSchedules();
    await seedFacultySchedules();

    console.log("\n✅ Knowledge seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding knowledge:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
