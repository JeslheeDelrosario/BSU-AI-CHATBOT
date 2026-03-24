// Seed FAQs from Frequent Asked Questions of Students document
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const faqData = [
  // Insurance Reimbursement FAQs
  {
    category: "Insurance Reimbursement FAQs",
    question: "How do I start the process for insurance reimbursement?",
    answer:
      "You must first secure and accomplish the checklist form from the Office of Student Welfare (OSW).",
    keywords: [
      "insurance reimbursement",
      "start process",
      "checklist form",
      "OSW",
      "student welfare",
    ],
    order: 1,
  },
  {
    category: "Insurance Reimbursement FAQs",
    question:
      "What legal or official documents are required to support my claim?",
    answer:
      "You need to provide the following:\n\n* The insurance policy.\n* The receipt of premium payment.\n* A Police or Accident Investigation Report.",
    keywords: [
      "insurance claim documents",
      "insurance policy",
      "premium receipt",
      "police report",
      "accident report",
      "legal documents",
    ],
    order: 2,
  },
  {
    category: "Insurance Reimbursement FAQs",
    question: "What medical documents do I need to attach?",
    answer:
      "To prove medical expenses and treatment, attach these documents:\n\n* Medical Certificate.\n* Statement of Account or Hospital Bills.\n* Official receipts for any medicines purchased.",
    keywords: [
      "medical documents",
      "medical certificate",
      "hospital bills",
      "statement of account",
      "medicine receipts",
      "reimbursement proof",
    ],
    order: 3,
  },

  // Medical and Dental Clinic Services FAQs
  {
    category: "Medical and Dental Clinic Services FAQs",
    question: "What is the first step when I visit the school clinic?",
    answer:
      "You should proceed to the clinic and approach the nurse for an initial assessment of your condition.",
    keywords: [
      "school clinic",
      "first step",
      "nurse assessment",
      "visit clinic",
      "medical services",
    ],
    order: 1,
  },
  {
    category: "Medical and Dental Clinic Services FAQs",
    question: "What identification do I need to show?",
    answer: "You are required to present your student ID to the clinic staff.",
    keywords: [
      "student ID",
      "identification",
      "clinic access",
      "ID requirement",
    ],
    order: 2,
  },
  {
    category: "Medical and Dental Clinic Services FAQs",
    question:
      "How do I get a medical certification for an absence (excuse letter)?",
    answer:
      "If you need a certification for an absence, you must present two things:\n\n* An excuse letter from your parent or guardian.\n* A copy of your parent/guardian's valid ID.",
    keywords: [
      "medical certificate",
      "excuse letter",
      "absence certification",
      "parent excuse",
      "guardian ID",
    ],
    order: 3,
  },

  // Completing "Incomplete" Grades FAQs
  {
    category: 'Completing "Incomplete" Grades FAQs',
    question: 'How long do I have to complete an "Inc." grade?',
    answer:
      'You have a grace period of one year. If you fail to complete the requirements within this time, the "Inc." automatically becomes a "5.00".',
    keywords: [
      "incomplete grade",
      "Inc.",
      "completion period",
      "one year",
      "grace period",
      "becomes 5.00",
    ],
    order: 1,
  },
  {
    category: 'Completing "Incomplete" Grades FAQs',
    question: "What is the first step to clearing my grade?",
    answer:
      "You must consult with the subject teacher concerned to identify the specific project or activity that you are lacking.",
    keywords: [
      "clear Inc.",
      "first step",
      "consult teacher",
      "missing requirements",
    ],
    order: 2,
  },
  {
    category: 'Completing "Incomplete" Grades FAQs',
    question: "What is the procedure for the Completion Form?",
    answer:
      "Follow these steps to process the paperwork:\n\n1. Get the form from the faculty office. You will need to sign for it because each form has a control number.\n2. Photocopy the form into two (2) copies.\n3. Fill out the necessary information on the form.\n4. Submit the filled-out form back to your instructor.",
    keywords: [
      "completion form",
      "procedure",
      "faculty office",
      "control number",
      "photocopy form",
    ],
    order: 3,
  },
  {
    category: 'Completing "Incomplete" Grades FAQs',
    question: "What happens after I submit the missing work and the form?",
    answer:
      "Once requirements are met, the instructor will follow the university's transparency and correction protocol to post your final grade.",
    keywords: [
      "submit completion",
      "final grade posting",
      "transparency protocol",
      "grade correction",
    ],
    order: 4,
  },
  {
    category: 'Completing "Incomplete" Grades FAQs',
    question:
      'Can I enroll in a higher subject if I have an "Inc." in its prerequisite?',
    answer:
      'No. If the subject with the "Inc." grade is a prerequisite for another course, you cannot enroll in the advanced subject until the "Inc." is officially cleared.',
    keywords: [
      "prerequisite Inc.",
      "enrollment restriction",
      "cannot enroll",
      "clear incomplete first",
    ],
    order: 5,
  },

  // Resolving a "4.00" Grade FAQs
  {
    category: 'Resolving a "4.00" Grade FAQs',
    question:
      'What should I do if I receive a grade of "4.00" (Conditional Passed)?',
    answer:
      "You must consult with your subject teacher immediately after receiving the grade to discuss the deficiency.",
    keywords: [
      "4.00 grade",
      "conditional passed",
      "consult teacher",
      "fix deficiency",
    ],
    order: 1,
  },
  {
    category: 'Resolving a "4.00" Grade FAQs',
    question: "Is there a deadline to fix the grade?",
    answer:
      "Yes. You must resolve the identified deficiency within two weeks of receiving the grade.",
    keywords: ["4.00 deadline", "two weeks", "resolution period"],
    order: 2,
  },
  {
    category: 'Resolving a "4.00" Grade FAQs',
    question: "What will be my final grade after the two-week period?",
    answer:
      'The grade changes based on your action:\n\n* If resolved: Your grade becomes a "3.00".\n* If NOT resolved: Your grade automatically becomes a "5.00".',
    keywords: [
      "4.00 final grade",
      "becomes 3.00",
      "becomes 5.00",
      "resolution outcome",
    ],
    order: 3,
  },

  // Grading System FAQs
  {
    category: "Grading System",
    question: "What is the grading scale used at Bulacan State University?",
    answer:
      "BulSU evaluates academic performance using a combination of numerical grades and letter equivalents. The grades range from 1.00 (Excellent, 97-100%) to 5.00 (Failed, ≤74%). The lowest passing grade is 3.00 (75%). Special grades include 4.00 (Conditional Passed), Inc. (Incomplete), D (Officially Dropped), and FDA/UD (Failure Due to Absences/Unofficially Dropped).",
    keywords: ["grading", "grades", "GPA", "scale", "percentage", "passing"],
    order: 1,
  },
  {
    category: "Grading System",
    question: "What does a 4.00 (Conditional Passed) grade mean?",
    answer:
      "A 4.00 grade is given when a student is slightly below the passing criteria but has the potential to pass. The student must consult with the subject teacher to address deficiencies within two (2) weeks. If not resolved within 2 weeks, the grade automatically changes to 5.00 (Failed). The 4.00 grade does not appear on the permanent record or transcript.",
    keywords: ["4.00", "conditional", "passed", "deficiency", "failed"],
    order: 2,
  },
  {
    category: "Grading System",
    question: 'What is an "Inc." (Incomplete) grade?',
    answer:
      "An Incomplete (Inc.) is assigned when a student is passing all grading criteria except for missing certain requirements such as projects, assignments, or activities. Students have a grace period of one (1) year to complete the missing requirements. If not completed within one year, the grade automatically becomes 5.00 (Failed). If the incomplete grade is in a prerequisite subject, the student cannot enroll in the subsequent subject.",
    keywords: ["incomplete", "inc", "requirements", "missing", "prerequisite"],
    order: 3,
  },
  {
    category: "Grading System",
    question: 'What does "D" (Officially Dropped) mean?',
    answer:
      '"D" indicates that a student has officially dropped a subject by submitting a formal dropping form, which must be signed by the instructor, dean, and university registrar. This grade ensures that the student\'s withdrawal is properly documented and does not affect other academic records adversely.',
    keywords: ["dropped", "officially dropped", "withdrawal", "D grade"],
    order: 4,
  },
  {
    category: "Grading System",
    question: "What does FDA or UD mean?",
    answer:
      "FDA (Failure Due to Absences) occurs when a student discontinues attending class without informing the instructor, resulting in failure. UD (Unofficially Dropped) occurs when a student stops attending class without filing a formal dropping form, which also counts as failure. These grades highlight the importance of regular attendance and proper communication with instructors.",
    keywords: [
      "FDA",
      "UD",
      "absences",
      "failure",
      "attendance",
      "unofficially dropped",
    ],
    order: 5,
  },

  // University History FAQs
  {
    category: "University History",
    question: "When and how was Bulacan State University established?",
    answer:
      "BulSU started in 1904 as an intermediate school during the early years of the American occupation in the Philippines. It was established under Act 74 of the Philippine Commission (1901), which aimed to set up schools in every town and reorganize existing ones. Early instruction included academic subjects and trade/industrial education.",
    keywords: ["history", "established", "1904", "founding", "origin"],
    order: 1,
  },
  {
    category: "University History",
    question: "How did BulSU become a university?",
    answer:
      "BulSU evolved from Bulacan Trade School (1909) to Bulacan National School of Arts and Trades (1957), then to Bulacan College of Arts and Trades (1965). The conversion into Bulacan State University (BSU) was formalized through R.A. 7665 in 1993, with Dr. Rosario Pimentel as the first university president.",
    keywords: ["university", "conversion", "R.A. 7665", "1993", "evolution"],
    order: 2,
  },

  // Vision and Mission FAQs
  {
    category: "Vision and Mission",
    question: "What is the vision of Bulacan State University?",
    answer:
      "The Bulacan State University is a progressive knowledge generating institution globally recognized for excellent instruction, pioneering research, and responsive community engagements.",
    keywords: ["vision", "mission", "goals", "excellence", "research"],
    order: 1,
  },
  {
    category: "Vision and Mission",
    question: "What is the mission of Bulacan State University?",
    answer:
      "The Bulacan State University exists to produce highly competent, ethical, and service-oriented professionals that contribute to the sustainable socio-economic growth and development of the nation.",
    keywords: [
      "mission",
      "competent",
      "ethical",
      "professionals",
      "development",
    ],
    order: 2,
  },

  // Student Classification FAQs
  {
    category: "Student Classification",
    question: "What is a regular student?",
    answer:
      "A regular student is one who registers for formal academic credits and carries the full load of subjects required for a given semester and curriculum.",
    keywords: ["regular student", "full load", "classification"],
    order: 1,
  },
  {
    category: "Student Classification",
    question: "What is an irregular student?",
    answer:
      "An irregular student is one who registers for formal credits but carries less than the full load in a given semester, usually to complete specific curriculum requirements.",
    keywords: ["irregular student", "partial load", "classification"],
    order: 2,
  },
  {
    category: "Student Classification",
    question: "What is a shifter student?",
    answer:
      "A shifter student is one who changes from one course to another, either within the same college/campus or in a different college/campus of the University.",
    keywords: ["shifter", "change course", "transfer program"],
    order: 3,
  },
  {
    category: "Student Classification",
    question: "What is a transfer student?",
    answer:
      "A transfer student is one who comes from another recognized higher education institution and is officially allowed to enroll in the same or another course at BulSU.",
    keywords: ["transfer student", "other school", "external transfer"],
    order: 4,
  },

  // Student Rights FAQs
  {
    category: "Student Rights",
    question: "What constitutional rights do BSU students have?",
    answer:
      "BSU students enjoy constitutional rights including: right to life, liberty, and property under due process; equal protection of the law; protection against unreasonable search and seizures; privacy of communication; freedom of speech and expression; right to peaceably assemble; free exercise of religion; right to public information; right to form organizations; access to courts and legal assistance; and right to quality education.",
    keywords: [
      "rights",
      "constitutional",
      "freedom",
      "due process",
      "education",
    ],
    order: 1,
  },
  {
    category: "Student Rights",
    question: "What rights do students have under the Education Act of 1982?",
    answer:
      "Students are entitled to: receive quality education through competent instruction; freely choose and continue their field of study; access school guidance and counseling services; view and re-evaluate class records; receive certificates and transcripts within 30 days; publish student newspapers; express opinions freely; form or join recognized organizations; and participate in policy-making through appropriate representation.",
    keywords: [
      "Education Act",
      "1982",
      "rights",
      "quality education",
      "organizations",
    ],
    order: 2,
  },

  // Admission Requirements FAQs
  {
    category: "Admission",
    question: "Where do I file my application for admission to BulSU?",
    answer:
      "All applications for admission must be filed with the Office of Admissions and Orientation of Bulacan State University. Applicants are required to submit the prescribed documents, pay the BSU Admission Test (BSUAT) fee, and comply with the admission procedures within the scheduled application period.",
    keywords: ["admission", "application", "BSUAT", "enrollment", "apply"],
    order: 1,
  },
  {
    category: "Admission",
    question: "Is admission to BulSU open to everyone?",
    answer:
      "Admission to BulSU is selective. The University receives more applicants than it can accommodate, so admission is based on academic performance (GPA), BSU Admission Test (BSUAT) scores, and interview results (if required by the program). Only qualified applicants are admitted, subject to available slots.",
    keywords: ["selective admission", "requirements", "GPA", "BSUAT", "slots"],
    order: 2,
  },
  {
    category: "Admission",
    question: "What are the requirements for college freshmen applicants?",
    answer:
      'College freshmen must: have a Senior High School diploma from a recognized school; submit a fully accomplished application form; provide two (2) 2"×2" ID pictures with white background; submit a photocopy of school ID; meet the GPA requirement of the chosen program; and pass the interview, if required.',
    keywords: ["freshmen", "requirements", "SHS", "diploma", "application"],
    order: 3,
  },

  {
    category: "Admission",
    question: "What are the requirements for transfer students?",
    answer:
      "Transfer students must: submit a completed application form with required ID pictures; have a GPA of 2.5 or better with no failing grade (5.0); have completed not more than 50% of the total units of the course; and submit Transcript of Records and Honorable Dismissal. Transfer credits are evaluated by the Office of the Registrar and approved by the Vice President for Academic Affairs.",
    keywords: [
      "transfer",
      "requirements",
      "TOR",
      "honorable dismissal",
      "GPA 2.5",
    ],
    order: 4,
  },

  {
    category: "Admission Application",
    question: "Who is eligible to apply for admission?",
    answer:
      "You are eligible if you are a graduate of Grade 12 or a passer of the PEPT/ALS A&E tests.",
    keywords: ["eligible", "admission", "Grade 12", "PEPT", "ALS", "qualify"],
    order: 5,
  },
  {
    category: "Admission Application",
    question: "What documents do I need to submit for the initial application?",
    answer:
      "Please submit the following to the Office of Admissions:\n\n- A fully filled-out application form.\n- Two (2) pieces of 2x2 color ID pictures with a white background.\n- A photocopy of your school ID.",
    keywords: [
      "documents",
      "initial application",
      "admission form",
      "ID pictures",
      "school ID",
    ],
    order: 6,
  },
  {
    category: "Admission Application",
    question: "Is there an examination fee?",
    answer:
      "Yes. There is a non-refundable admission examination fee of 300.00 Pesos, which must be paid at the Cashier’s Office.",
    keywords: ["examination fee", "BSUAT fee", "admission test fee", "payment"],
    order: 7,
  },
  {
    category: "Admission Application",
    question: "How much is the BSUAT fee?",
    answer: "The BSU Admission Test (BSUAT) fee is ₱300.00 (non-refundable).",
    keywords: ["BSUAT fee", "300", "cost", "price", "payment"],
    order: 7.1,
  },
  {
    category: "Admission Application",
    question: "Where do I pay the BSUAT fee?",
    answer: "The BSUAT fee must be paid at the Cashier's Office of Bulacan State University.",
    keywords: ["pay", "cashier", "payment location", "where to pay"],
    order: 7.2,
  },
  {
    category: "Admission Application",
    question: "How do I get my BSUAT (Examination) schedule?",
    answer:
      "Once you have paid the fee, submit your official receipt and your completed application form to the Office of Admissions. They will then issue your examination schedule.",
    keywords: ["BSUAT schedule", "exam schedule", "admission test", "receipt"],
    order: 8,
  },
  {
    category: "Admission Application",
    question: "When will I get my examination schedule?",
    answer: "Your examination schedule will be issued immediately after you submit your official receipt and completed application form to the Office of Admissions.",
    keywords: ["exam schedule", "when", "release", "schedule date"],
    order: 8.1,
  },
  {
    category: "Admission Application",
    question: "What requirements do I need to submit after passing the exam?",
    answer:
      "After passing the admission test, you must submit the following documents for verification:\n\n- Original High School Card (Form 138).\n- Original NSO/PSA Birth Certificate.\n- Medical permit from the BSU Clinic.",
    keywords: [
      "post-exam requirements",
      "Form 138",
      "birth certificate",
      "medical permit",
      "verification",
    ],
    order: 9,
  },
  {
  category: "Admission Application",
  question: "What is the complete admission process summary?",
  answer: `The BulSU admission process consists of:

  1. **Application**: Secure and accomplish application form from Office of Admissions
  2. **Payment**: Pay ₱300.00 BSUAT fee at Cashier's Office
  3. **Schedule**: Submit receipt to get your examination schedule
  4. **Take Exam**: Take the BSU Admission Test on your scheduled date
  5. **Check Results**: View posted results on the scheduled release date
  6. **Submit Documents**: Submit original documents if shortlisted
  7. **Enroll**: Complete reservation and enrollment requirements

  **Required Documents**:
  - Application form with 2x2 ID pictures
  - Form 138 (High School Card)
  - NSO/PSA Birth Certificate
  - Certificate of Good Moral Character
  - Medical Permit from BSU Clinic`,
    keywords: ["admission process", "steps", "summary", "overview", "how to apply"],
    order: 10,
  },

  // Managing Your Academic Load FAQs
  {
    category: "Managing Your Academic Load",
    question: "Can I change or add subjects after classes have started?",
    answer:
      "Yes. You may add or change subjects within the first two weeks of regular classes, provided you have approval from your academic unit head.",
    keywords: [
      "add subject",
      "change subject",
      "academic load",
      "first two weeks",
    ],
    order: 1,
  },
  {
    category: "Managing Your Academic Load",
    question: "What is the process and deadline for dropping a subject?",
    answer:
      "You must file an official dropping form at the Registrar’s Office. This must be done at least one week before midterm examinations.",
    keywords: ["drop subject", "dropping form", "deadline", "midterm"],
    order: 2,
  },
  {
    category: "Managing Your Academic Load",
    question:
      "I am a graduating senior and need only one subject to graduate, but it isn't being offered. What can I do?",
    answer:
      "You may request a tutorial class. To do this, follow these steps:\n\n1. Secure a certification from the Registrar verifying your status.\n2. Request the tutorial class through your Dean.",
    keywords: [
      "tutorial class",
      "graduating senior",
      "missing subject",
      "request tutorial",
    ],
    order: 3,
  },

  // Enrollment FAQs
  {
    category: "Enrollment",
    question: 'What does "change of academic load" mean?',
    answer:
      "Change of academic load refers to the adding or changing of subjects that a student is officially enrolled in for a given semester. Requests must be made within the first two (2) weeks of regular classes only and are subject to the approval of the concerned academic unit head.",
    keywords: ["change load", "add subject", "drop subject", "enrollment"],
    order: 1,
  },
  {
    category: "Enrollment",
    question: "What is subject substitution?",
    answer:
      "Subject substitution refers to the replacement of an old subject with a new one in a student's academic program. This is allowed when: the original subject belongs to an old curriculum that has been revised; the old and proposed substitute subjects are similar in content; and the substitute subject has equal or greater credit units than the original subject.",
    keywords: [
      "substitution",
      "replace subject",
      "curriculum change",
      "old curriculum",
    ],
    order: 2,
  },

  // Attendance FAQs
  {
    category: "Attendance",
    question: "Are students required to attend classes regularly?",
    answer:
      "Yes. All students are required to attend their classes promptly and regularly. Regular attendance is an important part of academic responsibility and contributes to effective learning and participation in class activities.",
    keywords: ["attendance", "regular", "classes", "required"],
    order: 1,
  },
  {
    category: "Attendance",
    question: "When is a student considered tardy or absent?",
    answer:
      "A student is considered tardy if they arrive 15 minutes after the scheduled start time. A student is marked absent if they arrive 20 minutes after the scheduled start time. However, even if marked absent, the student may still be allowed to attend the lesson.",
    keywords: ["tardy", "absent", "late", "15 minutes", "20 minutes"],
    order: 2,
  },
  {
    category: "Attendance",
    question: "What types of absences are considered excused?",
    answer:
      "Absences may be considered excused if incurred due to: official representation of the University in curricular, co-curricular, or extra-curricular activities; sickness (duly certified by attending physician or University physician); or force majeure (natural disasters or other unavoidable events). Excused absences must not exceed 30% of total required attendance per semester.",
    keywords: [
      "excused absence",
      "sick",
      "official representation",
      "force majeure",
    ],
    order: 3,
  },
  {
    category: "Attendance",
    question: "What happens if a student has too many unexcused absences?",
    answer:
      "Any student who accumulates more than twenty percent (20%) of unexcused absences in any subject before the midterm examinations shall be automatically dropped from that subject. The instructor will mark the student with either FDA (Failure Due to Absences) or UD (Unofficially Dropped).",
    keywords: ["unexcused absence", "dropped", "FDA", "UD", "20%"],
    order: 4,
  },

  // Leave of Absence FAQs
  {
    category: "Leave of Absence",
    question: "What is a Leave of Absence (LOA)?",
    answer:
      "A Leave of Absence (LOA) is an official permission granted by the University that allows a student to temporarily discontinue their studies for a valid reason, without losing student standing. The maximum allowable duration is one (1) year.",
    keywords: ["LOA", "leave of absence", "temporary stop", "discontinue"],
    order: 1,
  },
  {
    category: "Leave of Absence",
    question: "What are the procedures for filing a Leave of Absence?",
    answer:
      "To file LOA: (1) Request a Leave of Absence Form from the Office of the Registrar; (2) Fill out the form clearly and follow all instructions; (3) Return the completed LOA form to the Office of the Registrar. Students may photocopy the form and request the receiving officer to write their complete name and affix their signature as proof of receipt.",
    keywords: ["file LOA", "procedure", "registrar", "LOA form"],
    order: 2,
  },
  {
    category: "Leave of Absence",
    question: "What should a student do when returning from LOA?",
    answer:
      "When returning from LOA: (1) Personally appear at the Office of the Registrar and request readmission; (2) The Registrar will issue a Readmission Slip; (3) Submit this slip to the college dean or authorized representative. The dean shall not deny the readmitted student permission to enroll.",
    keywords: ["return from LOA", "readmission", "comeback", "registrar"],
    order: 3,
  },
  {
    category: "Leave of Absence",
    question: "How do I start the process for a Leave of Absence?",
    answer: "You must obtain an LOA form from the Office of the Registrar.",
    keywords: ["start LOA", "LOA form", "registrar"],
    order: 4, // continued from existing LOA orders (you had 1–3 before)
  },
  {
    category: "Leave of Absence",
    question: "What do I do with the form once I have it?",
    answer:
      "You need to fill out the form completely and ensure you follow all the specific instructions and requirements stated on the document.",
    keywords: ["fill LOA form", "instructions", "requirements"],
    order: 5,
  },
  {
    category: "Leave of Absence",
    question: "How do I finalize the application?",
    answer:
      "Submit the completed form to the Registrar. Be sure to keep a signed photocopy of the form as your personal proof of receipt.",
    keywords: ["submit LOA", "proof of receipt", "photocopy"],
    order: 6,
  },
  {
    category: "Leave of Absence",
    question: "Is there a time limit for a Leave of Absence?",
    answer:
      "Yes. An official leave must not exceed one year to avoid incurring academic penalties.",
    keywords: ["LOA duration", "one year", "time limit"],
    order: 7,
  },

  // Identification and Dress Code FAQs
  {
    category: "Identification and Dress Code",
    question: "What is the university policy regarding ID cards?",
    answer:
      "You are required to wear your University ID at all times while on campus.",
    keywords: ["ID card", "university ID", "wear ID", "campus policy"],
    order: 1,
  },
  {
    category: "Identification and Dress Code",
    question: "What should I do if I lose my ID?",
    answer:
      "If you lose your ID, follow these steps:\n\n1. Report it immediately to both the Office of Student Affairs and Services (OSAS) and the Registrar.\n2. Secure a notarized affidavit of loss.\n3. Submit the affidavit to apply for a new ID card.",
    keywords: ["lost ID", "affidavit of loss", "OSAS", "new ID"],
    order: 2,
  },
  {
    category: "Identification and Dress Code",
    question: "When am I required to wear the school uniform?",
    answer:
      "You must wear the prescribed daily uniform paired with black closed shoes on Mondays, Tuesdays, Thursdays, and Fridays.",
    keywords: ["uniform days", "daily uniform", "black shoes"],
    order: 3,
  },
  {
    category: "Identification and Dress Code",
    question: "Are there specific days for organization shirts?",
    answer: "Yes. Fridays are designated as optional Organization Shirt days.",
    keywords: ["organization shirt", "Friday", "optional attire"],
    order: 4,
  },
  {
    category: "Identification and Dress Code",
    question: 'When are "Free Days" (wash days) and what can I wear?',
    answer:
      "Wednesdays, Saturdays, and Sundays are considered Free Days. You may wear casual clothing provided it is not provocative.",
    keywords: [
      "free days",
      "wash days",
      "casual clothing",
      "Wednesday Saturday Sunday",
    ],
    order: 5,
  },

  // Disciplinary Grounds & Offenses
  {
    category: "Disciplinary Grounds & Offenses",
    question: "What acts are classified as Light Offenses?",
    answer:
      "Light offenses include minor violations such as littering or the unauthorized posting of materials.",
    keywords: [
      "light offenses",
      "minor violations",
      "littering",
      "unauthorized posting",
      "light offense",
    ],
    order: 1,
  },
  {
    category: "Disciplinary Grounds & Offenses",
    question: "What constitutes a Less Grave Offense?",
    answer:
      "Less grave offenses include behaviors such as smoking, gambling, or entering the campus under the influence of alcohol.",
    keywords: [
      "less grave offense",
      "less grave offenses",
      "smoking",
      "gambling",
      "alcohol",
      "under the influence",
    ],
    order: 2,
  },
  {
    category: "Disciplinary Grounds & Offenses",
    question: "What are considered Grave Offenses?",
    answer:
      "Grave offenses are serious violations including theft, physical abuse, possession of illegal drugs, or carrying weapons.",
    keywords: [
      "grave offense",
      "grave offenses",
      "theft",
      "physical abuse",
      "illegal drugs",
      "drugs",
      "weapons",
      "carrying weapons",
    ],
    order: 3,
  },
  {
    category: "Disciplinary Grounds & Offenses",
    question: "What are the penalties for Academic Dishonesty?",
    answer:
      "The penalties depend on the specific act:\n\n* Cheating: Results in a zero score for the first offense.\n* Plagiarism: Plagiarism in a thesis can lead to a failing grade or suspension.",
    keywords: [
      "academic dishonesty",
      "cheating",
      "plagiarism",
      "penalties",
      "zero score",
      "failing grade",
      "suspension",
      "thesis",
    ],
    order: 4,
  },

  // Scholarship Application FAQs
  {
    category: "Scholarship Application FAQs",
    question:
      "What are the academic requirements for institutional scholarships?",
    answer:
      "Most scholarships require a specific Grade Point Average (GPA):\n\n* Full Scholarship: A GPA of at least 1.50.\n* Partial Scholarship: A GPA of at least 1.75.\n* Grade Limit: You must have no grade lower than 2.0 in any subject.",
    keywords: [
      "scholarship requirements",
      "academic requirements",
      "GPA",
      "full scholarship",
      "partial scholarship",
      "grade limit",
      "1.50",
      "1.75",
      "2.0",
    ],
    order: 1,
  },
  {
    category: "Scholarship Application FAQs",
    question: "What documents are required to prove financial need?",
    answer:
      "You need to submit two main documents:\n\n* An Indigent Certificate from your Barangay.\n* A proof of billing (e.g., electricity or water bill).",
    keywords: [
      "financial need",
      "documents",
      "indigent certificate",
      "barangay",
      "proof of billing",
      "electricity bill",
      "water bill",
    ],
    order: 2,
  },
  {
    category: "Scholarship Application FAQs",
    question: "Are there entrance exams for the scholarship program?",
    answer:
      "Yes. You must complete and pass two types of tests:\n\n* An essay-type test.\n* An objective academic test.",
    keywords: [
      "entrance exams",
      "scholarship exams",
      "essay test",
      "objective test",
      "academic test",
    ],
    order: 3,
  },
  {
    category: "Scholarship Application FAQs",
    question: "Is there an interview involved?",
    answer:
      "Yes. You are required to attend a validation interview, which assesses both your personal values and your economic condition.",
    keywords: [
      "interview",
      "validation interview",
      "scholarship interview",
      "personal values",
      "economic condition",
    ],
    order: 4,
  },

  // Grievance Resolution FAQs
  {
    category: "Grievance Resolution FAQs",
    question: "What is the first step I should take if I have a grievance?",
    answer:
      "You should attempt an Informal Resolution by discussing the grievance directly with the person involved.",
    keywords: ["grievance", "first step", "informal resolution", "discussion"],
    order: 1,
  },
  {
    category: "Grievance Resolution FAQs",
    question:
      "What if I am unsatisfied with the outcome of the informal discussion?",
    answer:
      "You may proceed to Formal Filing. Bring your complaint to the Director for Student Welfare (DSW), who will study the validity of your claim.",
    keywords: [
      "formal filing",
      "DSW",
      "director for student welfare",
      "complaint",
      "unsatisfied",
    ],
    order: 2,
  },
  {
    category: "Grievance Resolution FAQs",
    question:
      "What action does the Director for Student Welfare (DSW) take regarding a complaint?",
    answer:
      "The DSW may either endorse the complaint to the concerned office or facilitate an amicable settlement between the parties (Mediation).",
    keywords: [
      "DSW action",
      "endorse complaint",
      "mediation",
      "amicable settlement",
      "student welfare",
    ],
    order: 3,
  },

  // Emergency Procedures FAQs
  {
    category: "Emergency Procedures FAQs",
    question: "What is the standard procedure during an earthquake?",
    answer:
      'You should immediately practice "Drop, Cover, and Hold-on." Make sure to stay away from windows.',
    keywords: ["earthquake", "drop cover hold on", "procedure", "windows"],
    order: 1,
  },
  {
    category: "Emergency Procedures FAQs",
    question: "When and how should I evacuate during an earthquake?",
    answer:
      "Wait for the shaking to stop completely before evacuating. Always use the stairs; do not use elevators.",
    keywords: [
      "earthquake evacuation",
      "shaking stop",
      "stairs",
      "no elevator",
    ],
    order: 2,
  },
  {
    category: "Emergency Procedures FAQs",
    question: "What should I do if a fire breaks out?",
    answer:
      "Do not panic. Immediately activate the fire alarm to alert others.",
    keywords: ["fire", "fire alarm", "do not panic"],
    order: 3,
  },
  {
    category: "Emergency Procedures FAQs",
    question: "What is the protocol for evacuating during a fire?",
    answer:
      "Evacuate calmly through the designated fire exits. Ensure that you do not lock any doors as you leave.",
    keywords: [
      "fire evacuation",
      "fire exits",
      "designated exits",
      "no locking doors",
    ],
    order: 4,
  },

  // Readmission (Returning Students) FAQs
  {
    category: "Readmission (Returning Students) FAQs",
    question: "How do I initiate the readmission process?",
    answer:
      "You must personally appear at the Office of the Registrar to request readmission.",
    keywords: [
      "readmission",
      "returning students",
      "office of the registrar",
      "initiate",
    ],
    order: 1,
  },
  {
    category: "Readmission (Returning Students) FAQs",
    question: "Is there any document I should bring to speed up the process?",
    answer:
      "Yes. Bringing your previous copy of your Leave of Absence (LOA) form will help speed up the verification process.",
    keywords: ["readmission document", "LOA", "leave of absence", "speed up"],
    order: 2,
  },
  {
    category: "Readmission (Returning Students) FAQs",
    question: "What document will I receive from the Registrar?",
    answer: "The Registrar will issue a Readmission Slip.",
    keywords: ["readmission slip", "registrar document"],
    order: 3,
  },
  {
    category: "Readmission (Returning Students) FAQs",
    question: "What do I need to do with the Readmission Slip?",
    answer:
      "You are required to secure all the necessary signatures indicated on the slip.",
    keywords: ["signatures", "readmission slip signatures"],
    order: 4,
  },
  {
    category: "Readmission (Returning Students) FAQs",
    question: "Where do I submit the completed slip?",
    answer:
      "Once signed, you must personally deliver the slip to your College Dean to obtain enrollment clearance.",
    keywords: ["submit slip", "college dean", "enrollment clearance"],
    order: 5,
  },
  {
    category: "Readmission (Returning Students) FAQs",
    question: "Who is considered a Returnee?",
    answer:
      "A Returnee is a student who previously enrolled at Bulacan State University (BulSU) but discontinued their studies for one semester or longer, with or without filing a Leave of Absence (LOA).",
    keywords: [
      "returnee",
      "readmission",
      "former student",
      "discontinued studies",
    ],
    order: 6,
  },
  {
    category: "Readmission (Returning Students) FAQs",
    question:
      "How can a student who filed a Leave of Absence (LOA) return to BulSU?",
    answer:
      "Students who discontinued their studies for not more than six (6) semesters may be re-admitted after submitting:\n\n1. Re-admission Application Form\n2. Approved Leave of Absence\n\nUpon readmission:\n* Incoming third-year or higher students may continue under their old curriculum.\n* Students may be advised to follow the current curriculum and apply for crediting of previously taken courses such as General Education (GE), Physical Education (PE), and National Service Training Program (NSTP).\n* The Program Chair, with approval from the Dean, will determine the most expedient way to complete the program.\n\nNote: Time spent on official leave does not count against the student’s allotted free tuition under UNIFAST.",
    keywords: [
      "LOA return",
      "readmission with LOA",
      "re-admission form",
      "old curriculum",
      "UNIFAST leave",
      "six semesters",
    ],
    order: 7,
  },
  {
    category: "Readmission (Returning Students) FAQs",
    question:
      "How can a student who did not file a Leave of Absence return to BulSU?",
    answer:
      "Students who did not file a LOA and discontinued studies for not more than six (6) semesters must:\n\n1. Submit a letter requesting readmission, explaining the reason for their absence.\n2. Be considered for readmission based on previous academic performance and program slot availability as determined by the Dean.\n\nIf a slot is available, the student must submit:\n* Re-admission Application Form\n* Medical Certificate (if absence was due to physical illness)\n* Psychological Evaluation (if absence was due to mental health reasons)\n* Clearance\n\nUpon readmission:\n* Incoming third-year or higher students may continue under the old curriculum.\n* Other students will continue under the current curriculum, or the most expedient way to finish the program as determined by the Program Chair and Dean.\n* Students will be advised to apply for credits of previously taken GE, PE, and NSTP subjects.\n\nNote: Students who did not file a LOA may still avail of free tuition under UNIFAST, but the semesters spent on unofficial leave will count against the total tuition-free period, based on the length of their program plus a one-year grace period.",
    keywords: [
      "no LOA return",
      "readmission without LOA",
      "letter request",
      "medical certificate",
      "psychological evaluation",
      "UNIFAST unofficial leave",
    ],
    order: 8,
  },

  // Disciplinary Proceedings FAQs
  {
    category: "Disciplinary Proceedings FAQs",
    question: "How does a Formal Hearing begin?",
    answer:
      "The process starts with Filing the Complaint. The complainant must submit written sworn statements and documentary evidence to the Student Discipline Committee.",
    keywords: [
      "formal hearing",
      "filing complaint",
      "student discipline committee",
      "sworn statement",
      "evidence",
    ],
    order: 1,
  },
  {
    category: "Disciplinary Proceedings FAQs",
    question: "What happens if the Committee finds that a valid case exists?",
    answer:
      "The Committee will notify the respondent in writing regarding the charges filed against them.",
    keywords: ["valid case", "notification", "charges", "respondent notice"],
    order: 2,
  },
  {
    category: "Disciplinary Proceedings FAQs",
    question: "How does the accused student (respondent) answer the charges?",
    answer:
      "The respondent has five (5) working days to submit a written answer under oath, accompanied by any supporting documents.",
    keywords: [
      "respondent answer",
      "written answer",
      "under oath",
      "five days",
      "supporting documents",
    ],
    order: 3,
  },
  {
    category: "Disciplinary Proceedings FAQs",
    question: "Who makes the final decision on the penalty?",
    answer:
      "First, the Committee deliberates and recommends a penalty. Then, the recommendation is submitted to the Board of Student Discipline, which renders a decision within five (5) working days.",
    keywords: [
      "penalty decision",
      "committee recommendation",
      "board of student discipline",
      "final decision",
    ],
    order: 4,
  },
  {
    category: "Disciplinary Proceedings FAQs",
    question: "Can I appeal the decision?",
    answer:
      "Yes. Any party may file a motion for reconsideration within ten (10) working days of receiving the decision.",
    keywords: ["appeal", "motion for reconsideration", "ten days"],
    order: 5,
  },
  {
    category: "Disciplinary Proceedings FAQs",
    question: 'What are "Summary Proceedings" and when are they used?',
    answer:
      'Summary proceedings are a "shortcut" process used when the offender is either caught in the act or admits guilt in writing.',
    keywords: [
      "summary proceedings",
      "caught in act",
      "admit guilt",
      "shortcut process",
    ],
    order: 6,
  },
  {
    category: "Disciplinary Proceedings FAQs",
    question: "How is the decision handled in Summary Proceedings?",
    answer:
      "The Committee recommends a penalty, which the Board reviews and approves. The final decision is communicated to the respondent in writing within five (5) working days.",
    keywords: [
      "summary decision",
      "board approval",
      "five days",
      "respondent communication",
    ],
    order: 7,
  },

  // Offenses and Penalties FAQs
  {
    category: "Offenses and Penalties FAQs",
    question: "How are penalties handled for repeated violations?",
    answer:
      "Offenses are progressive, meaning repeated violations of the same rule lead to harsher sanctions (e.g., from reprimand to suspension).",
    keywords: [
      "progressive penalties",
      "repeated violations",
      "harsher sanctions",
    ],
    order: 1,
  },
  {
    category: "Offenses and Penalties FAQs",
    question:
      "What are the penalties for Light Offenses (e.g., Littering, Vandalism)?",
    answer:
      "* 1st Offense: Verbal reprimand and/or restitution (cleaning or repairing damage).\n* 2nd Offense: Written reprimand with warning and 4 hours of Transformational Experience.\n* 3rd Offense: 10 hours of Transformational Experience and Guidance Intervention.",
    keywords: [
      "light offenses",
      "penalties",
      "verbal reprimand",
      "written reprimand",
      "transformational experience",
      "littering",
      "vandalism",
    ],
    order: 2,
  },
  {
    category: "Offenses and Penalties FAQs",
    question:
      "What are the penalties for Grave Offenses (e.g., Theft, Physical Abuse)?",
    answer:
      "* 1st Offense: Written reprimand, 16 hours of Transformational Experience, and potentially 2 weeks suspension (depending on the act).\n* 2nd Offense: 1 week to 1 month suspension and 32 hours of Transformational Experience.\n* 3rd Offense: Dismissal from the university.\n* Note: Acts resulting in serious physical injury or death can lead to Expulsion on the first violation.",
    keywords: [
      "grave offenses",
      "penalties",
      "suspension",
      "dismissal",
      "expulsion",
      "theft",
      "physical abuse",
    ],
    order: 3,
  },
  {
    category: "Offenses and Penalties FAQs",
    question:
      "What is the rule for students who commit multiple different types of violations?",
    answer:
      'The manual uses a "stacking" rule:\n* Three different violations: You receive the penalty equivalent to the 2nd Offense of your most grievous misconduct.\n* Four different violations: You receive the penalty equivalent to the 3rd Offense of your most grievous misconduct.',
    keywords: [
      "stacking rule",
      "multiple violations",
      "different offenses",
      "most grievous",
    ],
    order: 4,
  },
  {
    category: "Offenses and Penalties FAQs",
    question:
      "Does the university distinguish between online and face-to-face academic dishonesty?",
    answer:
      "The guidelines apply to both online and face-to-face settings. The penalties are enforced regardless of the mode of instruction.",
    keywords: [
      "academic dishonesty",
      "online cheating",
      "face-to-face",
      "same penalties",
    ],
    order: 5,
  },
  {
    category: "Offenses and Penalties FAQs",
    question:
      'What acts are considered "Cheating" under the enhanced guidelines?',
    answer:
      "Cheating includes:\n* Traditional cheating in face-to-face exams.\n* Online cheating in quizzes and major/minor exams.\n* Taking screenshots of quizzes/exams to distribute to others.",
    keywords: ["cheating", "screenshots", "online cheating", "exam cheating"],
    order: 6,
  },
  {
    category: "Offenses and Penalties FAQs",
    question: "What are the penalties for Cheating?",
    answer:
      "* 1st Offense: Two weeks suspension, zero score in the exam, and parent-dean dialogue.\n* 2nd Offense: One month suspension, failing grade in the subject, and forfeiture of awards.\n* 3rd Offense: Three months suspension, failing grade, and forfeiture of awards.\n* 4th Offense: Dismissal (minimum of one semester).",
    keywords: [
      "cheating penalties",
      "suspension",
      "zero score",
      "failing grade",
      "dismissal",
    ],
    order: 7,
  },
  {
    category: "Offenses and Penalties FAQs",
    question: "How is Plagiarism defined and penalized?",
    answer:
      "Plagiarism covers the misuse of theses, literary works, papers, and other creative works (online or face-to-face).\n* 1st Offense: One month suspension and zero score in the output.\n* 2nd Offense: Three months suspension and failing grade in the subject.\n* 3rd Offense: Dismissal (minimum of one semester).\n* 4th Offense: Dismissal (maximum of one academic year).",
    keywords: [
      "plagiarism",
      "penalties",
      "suspension",
      "zero score",
      "failing grade",
      "dismissal",
    ],
    order: 8,
  },
  {
    category: "Offenses and Penalties FAQs",
    question:
      "What is the penalty for Falsification of Documents (e.g., forging records)?",
    answer:
      "* 1st Offense: Three months suspension.\n* 2nd Offense: Dismissal (one semester).\n* 3rd Offense: Dismissal (one academic year).\n* 4th Offense: Expulsion (permanent severance from the University).",
    keywords: [
      "falsification",
      "forgery",
      "penalties",
      "suspension",
      "dismissal",
      "expulsion",
    ],
    order: 9,
  },
  {
    category: "Offenses and Penalties FAQs",
    question:
      "Is it a violation to take screenshots of lectures or exams without permission?",
    answer:
      "Yes. Unauthorized Recording/Screenshotting (including recording lectures or publishing PPTs without consent) is a punishable offense.\n* 1st Offense: Written reprimand and 16 hours of Transformational Experience.\n* 2nd Offense: Two weeks suspension.\n* 3rd Offense: One month suspension.\n* 4th Offense: Three months suspension.",
    keywords: [
      "unauthorized screenshot",
      "recording lectures",
      "without permission",
      "penalties",
    ],
    order: 10,
  },
  {
    category: "Offenses and Penalties FAQs",
    question: 'What is "Transformational Experience"?',
    answer:
      'This is a mandatory "redemptive sanction" (such as community service) performed during vacant periods to promote responsible decision-making.',
    keywords: [
      "transformational experience",
      "community service",
      "redemptive sanction",
    ],
    order: 11,
  },
  {
    category: "Offenses and Penalties FAQs",
    question: 'How does the "Stacking Rule" work for multiple violations?',
    answer:
      "* 3 Different Violations: Treated as a 2nd Offense of the most grievous misconduct.\n* 4 Different Violations: Treated as a 3rd Offense of the most grievous misconduct.",
    keywords: ["stacking rule", "multiple violations"],
    order: 12,
  },

  // Academic Honors & Awards FAQs
  {
    category: "Academic Honors & Awards FAQs",
    question: "What are the GPA requirements to graduate with Latin Honors?",
    answer:
      "* Summa Cum Laude: 1.00 – 1.20\n* Magna Cum Laude: 1.21 – 1.45\n* Cum Laude: 1.46 – 1.75",
    keywords: [
      "latin honors",
      "GPA requirements",
      "summa cum laude",
      "magna cum laude",
      "cum laude",
    ],
    order: 1,
  },
  {
    category: "Academic Honors & Awards FAQs",
    question: "Is there a minimum grade requirement for individual subjects?",
    answer:
      "Yes. To qualify, you must have earned at least a grade of 2.0 (or its equivalent) in all subjects taken.",
    keywords: ["minimum grade", "2.0", "honors eligibility"],
    order: 2,
  },
  {
    category: "Academic Honors & Awards FAQs",
    question: "What are the residency and unit load requirements for honors?",
    answer:
      "* Residency: You must have completed at least 75% of your total academic units at the University and have a residency of at least two years.\n* Academic Load: You must have been enrolled in at least 15 units (or the full load prescribed by your curriculum) during every semester.",
    keywords: ["residency", "unit load", "75%", "two years", "15 units"],
    order: 3,
  },
  {
    category: "Academic Honors & Awards FAQs",
    question: "Can I graduate with honors if I have a disciplinary record?",
    answer:
      "No. You must have no disciplinary record within the current academic year to be eligible.",
    keywords: ["disciplinary record", "honors eligibility", "clean record"],
    order: 4,
  },
  {
    category: "Academic Honors & Awards FAQs",
    question:
      "How can I get recognized for academic excellence if I am not yet graduating (Gold Gear Awards)?",
    answer:
      "Students are recognized annually based on their performance in the last two consecutive semesters:\n* President’s List: GPA of 1.00 – 1.20 (with no grade lower than 2.0).\n* Dean’s List: GPA of 1.21 – 1.75 (with no grade lower than 2.0).",
    keywords: [
      "gold gear awards",
      "president’s list",
      "dean’s list",
      "academic excellence",
    ],
    order: 5,
  },
  {
    category: "Academic Honors & Awards FAQs",
    question: "How are Gold Gear awards processed?",
    answer:
      "The Office of the Dean for Student Affairs and Services (OSAS) coordinates with the academic units to identify qualified awardees.",
    keywords: ["gold gear processing", "OSAS", "student affairs"],
    order: 6,
  },

  // Shifting Course/Campus FAQs
  {
    category: "Shifting Course/Campus FAQs",
    question: 'What is considered "Shifting"?',
    answer:
      "Shifting is defined as a student moving from one course to another, whether within the same college/campus or transferring to a different one within the University.",
    keywords: ["shifting", "course change", "program transfer"],
    order: 1,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "How do I begin the shifting process?",
    answer:
      "You must obtain and accomplish a shifting application form from the Admissions Office.",
    keywords: ["shifting application", "admissions office"],
    order: 2,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "Will my previous grades be evaluated?",
    answer:
      "Yes. The university requires a review of your current Certificate of Registration and class cards to ensure you have satisfactory grades.",
    keywords: [
      "grade evaluation",
      "certificate of registration",
      "class cards",
    ],
    order: 3,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "Do I need to take a Shifter’s Examination?",
    answer:
      "* Yes: If you are changing programs (e.g., Education to Engineering) or transferring from an external/satellite campus to the main campus.\n* No: If you are only changing majors within the same program.",
    keywords: ["shifter’s examination", "program change", "major change"],
    order: 4,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "Is an interview required?",
    answer:
      "Potentially. You must pass a formal interview if the specific college you are shifting into requires it.",
    keywords: ["interview", "shifting requirement"],
    order: 5,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "Who grants the final approval for a shift?",
    answer:
      "The shift is subject to the acceptance of the receiving Dean and the final approval of the Vice President for Academic Affairs.",
    keywords: [
      "final approval",
      "vice president academic affairs",
      "receiving dean",
    ],
    order: 6,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "What is a Shiftee?",
    answer:
      "A Shiftee is a student of Bulacan State University (BulSU) who intends to change their program or curriculum, such as from Education to Engineering or from Engineering to Architecture.",
    keywords: [
      "shiftee",
      "program change",
      "curriculum change",
      "BulSU student",
    ],
    order: 7,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "What is a Transferee?",
    answer:
      "A Transferee is a student from another recognized institution of higher learning who is officially allowed to enroll in the same or a different program in the University.",
    keywords: [
      "transferee",
      "transfer student",
      "other institution",
      "enrollment",
    ],
    order: 8,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "What is a Returnee?",
    answer:
      "A Returnee is a student who was previously enrolled in the University but discontinued their studies for one semester or longer due to valid reason(s), with or without filing a Leave of Absence (LOA).",
    keywords: [
      "returnee",
      "returning student",
      "discontinued studies",
      "LOA",
      "leave of absence",
    ],
    order: 9,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "What is a Second Undergraduate Degree Taker?",
    answer:
      "A Second Undergraduate Degree Taker is a person who has already completed an undergraduate degree from the University or an accredited higher education institution and is now enrolled in a different program in the University.",
    keywords: [
      "second degree",
      "undergraduate degree",
      "different program",
      "accredited institution",
    ],
    order: 10,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "How can a student apply for shifting?",
    answer:
      "Shiftees must open the application link posted online by the Admission and Orientation Services Office (AOSO) during the scheduled period and select programs with available slots.",
    keywords: [
      "shifting application",
      "AOSO",
      "admission link",
      "available slots",
      "online application",
    ],
    order: 11,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "When is shifting allowed?",
    answer:
      "Shifting is allowed only during the first semester of each academic year.",
    keywords: [
      "shifting period",
      "first semester",
      "academic year",
      "shifting schedule",
    ],
    order: 12,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "Who are eligible to shift programs?",
    answer:
      "Incoming second- and third-year students from the same campus, and incoming third-year students transferring between external campuses and the main campus (or vice versa).",
    keywords: [
      "shifting eligibility",
      "second year",
      "third year",
      "campus transfer",
      "main campus",
      "external campus",
    ],
    order: 13,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "Is there an exam required for shifting?",
    answer:
      "Yes, students shifting between colleges or changing their major/program within the same college/campus are required to take a college-based shiftee's examination.",
    keywords: [
      "shifter's examination",
      "college exam",
      "program change",
      "major change",
    ],
    order: 14,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "What should a student do before shifting?",
    answer:
      "The student must follow the prescribed shifting procedures and may consult their current Program Chair for guidance.",
    keywords: [
      "shifting procedures",
      "program chair",
      "consultation",
      "guidance",
    ],
    order: 15,
  },
  {
    category: "Shifting Course/Campus FAQs",
    question: "What is the complete procedure for shifting?",
    answer:
      "The procedure for shifting includes the following steps:\n\n1. The student opens the application link provided by AOSO during the scheduled period and may consult their current Program Chair for guidance.\n2. The student accomplishes the Shifter Application Form and submits a request letter addressed to the receiving dean through the program chair, stating the reasons for shifting.\n3. The student attaches the required documents, including:\n   - Copy of grades issued by the University Registrar's Office\n   - Clearance for the second semester of the preceding academic year\n4. Grade requirements:\n   - Board Programs: No grade lower than 2.0 and at least a GWA of 1.75\n   - Non-Board Programs: No grade lower than 2.5 and at least a GWA of 2.0\n   Note: A student with no failing marks in General Education courses and at most two failing marks in specialization subjects may shift to an allied non-board program, subject to approval.\n5. The student undergoes and must pass the interview and college-based examination.\n6. The Dean evaluates the application and either approves or disapproves it:\n   - If approved, the student proceeds with enrollment in the new program.\n   - If disapproved, the student may remain in their current program or transfer to another institution.\n7. The student attends an orientation conducted by the Program Chair or Department Head.\n8. The student may apply for crediting of previously taken General Education (GE), Physical Education (PE), and National Service Training Program (NSTP) subjects through the Office of the Registrar.",
    keywords: [
      "shifting procedure",
      "application form",
      "request letter",
      "grades",
      "clearance",
      "GWA",
      "board programs",
      "non-board programs",
      "interview",
      "examination",
      "dean approval",
      "orientation",
      "crediting subjects",
    ],
    order: 16,
  },

  // Transferees (Transfer Students) FAQs
  {
    category: "Transferees (Transfer Students) FAQs",
    question: 'Who is considered a "Transferee"?',
    answer:
      "A transferee is a student coming from another recognized institution of higher learning who wishes to enroll in the university.",
    keywords: ["transferee", "transfer student"],
    order: 1,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question: "What are the academic requirements to qualify as a transferee?",
    answer:
      "* GPA: Your Grade Point Average must be 2.5 or better.\n* No Failures: You must have no grade of 5.0 (or its equivalent) in any academic subject.\n* Unit Limit: You must have completed not more than 50% of the total units required for the course you intend to take.",
    keywords: [
      "transferee requirements",
      "GPA 2.5",
      "no failures",
      "50% units",
    ],
    order: 2,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question: "What documents do I need to submit to the Admissions Office?",
    answer:
      '* A fully filled-out application form.\n* Two (2) pieces of 2"x 2" color ID pictures with a white background.\n* Your Official Transcript of Records.\n* A certificate of Honorable Dismissal.',
    keywords: [
      "transferee documents",
      "transcript of records",
      "honorable dismissal",
      "ID pictures",
    ],
    order: 3,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question: "How do I get my previous subjects credited?",
    answer:
      "You must apply for transfer credits at the Office of the Registrar. The Registrar will evaluate your credentials and recommend valid credits to the Vice President for Academic Affairs for final approval.",
    keywords: ["transfer credits", "credit evaluation", "registrar"],
    order: 4,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question:
      "Who can apply as a transferee to Bulacan State University (BulSU)?",
    answer:
      "Transferees from recognized higher education institutions may apply provided that:\n\n1. The preferred program has available slots.\n2. Grade requirements are met:\n   * Board Programs: Overall general weighted average (GWA) of at least 1.75 with no grade lower than 2.0 in all courses.\n   * Non-Board Programs: No grade lower than 2.5 in all courses and an overall GWA of at least 2.0.\n     Note: Students with failing grades may transfer to a non-board program if accepted by the receiving dean, approved by the Chancellor, and able to meet non-board program grade requirements.\n3. The applicant has completed no more than 50% of the units required for the program.",
    keywords: [
      "transferee",
      "transfer student",
      "GWA",
      "board programs",
      "non-board programs",
      "grade requirements",
      "50% units",
    ],
    order: 5,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question: "How does a transferee apply to BulSU?",
    answer:
      "The application procedure includes:\n\n1. Follow the online procedures\n2. Accomplish the Transferee Application Form.\n3. Submit the following documents:\n   * Transferee Application Form with two (2) identical 2”x2” colored ID photos with white background and a name tag.\n   * Transcript of Records or Certification of Grades.\n   * Certificate of Good Moral Character from the former school.",
    keywords: [
      "transferee application",
      "application procedure",
      "documents",
      "transcript of records",
      "good moral character",
      "ID photos",
    ],
    order: 6,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question: "When is transfer admission allowed?",
    answer:
      "Transfer to any program is allowed only during the first semester of each academic year.",
    keywords: ["transfer admission", "first semester", "when to apply"],
    order: 7,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question: "Who cannot apply for transfer admission?",
    answer:
      "The following students are disqualified:\n\n1. Those permanently disqualified from any higher education institution (HEI).\n2. Those dismissed from any HEI for dishonorable cause.\n3. Those whose admission was withdrawn due to submission of fake or falsified documents.\n4. Those found guilty of dishonesty or any form of misconduct.",
    keywords: [
      "disqualified transferee",
      "permanent disqualification",
      "dishonorable dismissal",
      "falsified documents",
      "misconduct",
    ],
    order: 8,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question: "How does transfer affect UNIFAST tuition grants?",
    answer:
      "The number of semesters a transferee has availed of free tuition will be deducted from their UNIFAST grant, which covers the expected duration of the course plus a one-year grace period (UNIFAST, 2018).",
    keywords: [
      "UNIFAST",
      "free tuition",
      "transfer impact",
      "semesters deducted",
      "grace period",
    ],
    order: 9,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question:
      "Can transferees apply for crediting of previously taken subjects?",
    answer:
      "Yes, transferees may apply for credits of previously taken General Education (GE), Physical Education (PE), and National Service Training Program (NSTP) subjects through the Office of the Registrar, provided that:\n\n1. The former HEI has equal or higher AACCUP accreditation status or ISO certification compared to BulSU.\n2. The course descriptions match between the former HEI and BulSU; the transferee must submit certified course syllabi for each course.\n3. The transferee must pass a validation examination for each subject, answering at least 75% of the questions correctly.\n\nNote: The eight General Education subjects eligible for credit are:\n1. Understanding the Self\n2. Contemporary World\n3. Purposive Communication\n4. Art Appreciation\n5. Ethics\n6. Readings in Philippine History\n7. Mathematics in the Modern World\n8. Science, Technology, and Society",
    keywords: [
      "transfer credits",
      "crediting subjects",
      "GE subjects",
      "validation exam",
      "75% passing",
      "course syllabus",
      "AACCUP accreditation",
    ],
    order: 10,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question: "Who is considered a Second Undergraduate Degree Taker?",
    answer:
      "A Second Undergraduate Degree Taker is a student who has already completed an undergraduate degree from Bulacan State University (BulSU) or another accredited higher education institution and wishes to enroll in a different program at BulSU.",
    keywords: [
      "second degree",
      "second undergraduate",
      "another degree",
      "post-baccalaureate",
    ],
    order: 11, // Placed after transferee entries if merging into existing category
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question:
      "How can a student apply for a second undergraduate degree program?",
    answer:
      "Students may apply to their preferred degree program, subject to availability of slots, and must follow the procedures at iadmissions.bulsu.edu.ph. Required documents include:\n\n1. Application Form with two (2) identical 2”x2” colored ID photos with white background and name tag\n2. Transcript of Records\n3. Honorable Dismissal\n4. Marriage Certificate (for married females only, if surname changed)\n5. PSA Birth Certificate (Photocopy)\n6. Letter of Intent addressed to the Dean of the College, stating the reason for taking a second undergraduate degree",
    keywords: [
      "second degree application",
      "documents",
      "letter of intent",
      "honorable dismissal",
      "transcript",
      "iadmissions",
    ],
    order: 12,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question:
      "Can previously taken courses be credited for a second undergraduate degree?",
    answer:
      "Yes, under certain conditions:\n\n1. General Education (GE) courses from the first undergraduate degree may be credited, but credits cannot exceed 50% of the units required for the second program.\n2. Applicable GE subjects taken at BulSU, as well as GE, PE, and NSTP courses from another HEI with equal or higher accreditation, are automatically credited.\n3. Major subjects taken at BulSU are credited based on the Dean’s assessment and Registrar approval.\n4. Applicants who completed their first degree at another HEI must undergo validation exams for each subject they wish to credit, requiring at least 75% correct answers.\n\nNote: The ETEEAP (Expanded Tertiary Education Equivalency and Accreditation Program) may be used as an assessment method for recognizing prior learning, training, or work experience.",
    keywords: [
      "second degree credits",
      "GE crediting",
      "validation exam",
      "50% limit",
      "ETEEAP",
    ],
    order: 13,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question:
      "Can a Second Undergraduate Degree Taker shift to another program?",
    answer: "No, shifting to another program is not allowed.",
    keywords: [
      "second degree shift",
      "no shifting",
      "program change restriction",
    ],
    order: 14,
  },
  {
    category: "Transferees (Transfer Students) FAQs",
    question:
      "Are Second Undergraduate Degree Takers eligible for free tuition under UNIFAST?",
    answer:
      "No, they cannot avail of free higher education and must pay tuition and other fees as determined by the University’s Governing Boards (UNIFAST, 2018).",
    keywords: ["second degree UNIFAST", "no free tuition", "pay tuition"],
    order: 15,
  },

  // Student Organizations & Activities FAQs
  {
    category: "Student Organizations & Activities FAQs",
    question:
      "What is the minimum requirement to form a new student organization?",
    answer: "You must gather a group of at least fifteen (15) students.",
    keywords: ["new organization", "minimum members", "15 students"],
    order: 1,
  },
  {
    category: "Student Organizations & Activities FAQs",
    question: "Who can serve as an adviser for our organization?",
    answer:
      "You must invite a full-time faculty member or a non-teaching personnel to serve as your adviser.",
    keywords: ["organization adviser", "faculty adviser"],
    order: 2,
  },
  {
    category: "Student Organizations & Activities FAQs",
    question: "What documents are required to apply for recognition?",
    answer:
      "* An accomplished recognition application form.\n* A copy of your Constitution and By-Laws.\n* A list of interim officers and members with their signatures.\n* A written plan of proposed activities for the school year.",
    keywords: [
      "organization recognition",
      "constitution",
      "by-laws",
      "activity plan",
    ],
    order: 3,
  },
  {
    category: "Student Organizations & Activities FAQs",
    question: "When must existing organizations file for renewal?",
    answer: "Renewal must be filed annually during August or September.",
    keywords: ["organization renewal", "august september"],
    order: 4,
  },
  {
    category: "Student Organizations & Activities FAQs",
    question: "What reports are required for renewal?",
    answer:
      "* A Written Report of Accomplishment from the previous year.\n* An Audited Financial Statement signed by both the treasurer and the adviser.",
    keywords: [
      "renewal reports",
      "accomplishment report",
      "financial statement",
    ],
    order: 5,
  },

  // Off-Campus Activities FAQs
  {
    category: "Off-Campus Activities FAQs",
    question:
      "Who is covered by the off-campus activities procedure? Who does this policy apply to? What students are required to follow this process?",
    answer:
      "This procedure applies to students who are representing the University in contests, seminars, or workshops held outside the campus.",
    keywords: [
      "off-campus",
      "representing university",
      "who qualifies",
      "eligibility",
      "covered students",
      "policy applies to",
      "off campus activities",
      "student representatives",
      "contests",
      "seminars",
      "workshops",
      "outside campus",
      "university representation",
      "who is covered",
      "applicable students",
    ],
    order: 1,
  },
  {
    category: "Off-Campus Activities FAQs",
    question:
      "What is the first step? What document do I need to get first? Where do I start the off-campus activity process? What is the initial requirement?",
    answer:
      "You must obtain a Compliance Checklist from the Office of Student Development (OSD).",
    keywords: [
      "compliance checklist",
      "OSD",
      "student development",
      "first step",
      "initial requirement",
      "first document",
      "where to start",
      "what to get first",
      "office of student development",
      "begin process",
      "starting point",
      "primary requirement",
      "step one",
      "obtain checklist",
      "secure document",
    ],
    order: 2,
  },
  {
    category: "Off-Campus Activities FAQs",
    question: "How do I complete the checklist?",
    answer:
      "Fill in accurate information, specifically including the organization name and the president's contact details. Then, secure and attach all the requirements listed in that checklist.",
    keywords: ["complete checklist", "requirements attachment"],
    order: 3,
  },
  {
    category: "Off-Campus Activities FAQs",
    question: "Who verifies the documents?",
    answer:
      "Once completed, submit the package to the OSD Director for checking/verification.",
    keywords: ["document verification", "OSD director"],
    order: 4,
  },
  {
    category: "Off-Campus Activities FAQs",
    question: "Who grants the final approval for the activity?",
    answer:
      "You need to obtain two levels of approval:\n1. Recommending approval from the Dean of Student Affairs.\n2. Final approval from the University President.",
    keywords: [
      "final approval",
      "dean student affairs",
      "university president",
    ],
    order: 5,
  },

  // Facility Reservation FAQs
  {
    category: "Facility Reservation FAQs",
    question: "Who is allowed to reserve university facilities?",
    answer:
      "The use of facilities is a privilege granted only to recognized student organizations.",
    keywords: ["facility reservation", "recognized organizations"],
    order: 1,
  },
  {
    category: "Facility Reservation FAQs",
    question: "How do I ensure the facility is free to use?",
    answer:
      "You must consult with the academic or unit head in charge of that specific facility to check its availability.",
    keywords: ["check availability", "unit head"],
    order: 2,
  },
  {
    category: "Facility Reservation FAQs",
    question: "What is the deadline and procedure for filing a request?",
    answer:
      "You must file a written request to the Office of Student Organizations and Activities (OSOA) at least one week in advance.",
    keywords: ["reservation request", "one week advance", "OSOA"],
    order: 3,
  },
  {
    category: "Facility Reservation FAQs",
    question: "Can our organization reserve a room on behalf of another group?",
    answer:
      "No. You are strictly prohibited from reserving rooms in your organization's name for use by another group.",
    keywords: ["no proxy reservation", "prohibited"],
    order: 4,
  },

  // Publicity and Posting FAQs
  {
    category: "Publicity and Posting FAQs",
    question:
      "What is the first step to get approval for posting banners or flyers?",
    answer:
      "You must write a letter of intent addressed to the Head of the Office of Student Organizations and Activities (OSOA). This letter must be noted by your organization’s adviser.",
    keywords: ["posting approval", "letter of intent", "OSOA"],
    order: 1,
  },
  {
    category: "Publicity and Posting FAQs",
    question: "Who approves the actual design or content of the materials?",
    answer:
      "You need to submit the original copy of the material to the OSOA for approval and clearance.",
    keywords: ["design approval", "content clearance", "OSOA"],
    order: 2,
  },
  {
    category: "Publicity and Posting FAQs",
    question:
      "Do I need additional permission to post inside a specific college building?",
    answer:
      "Yes. If you intend to post inside a college building, you must also obtain permission from that specific College Dean.",
    keywords: ["college posting", "dean permission"],
    order: 3,
  },
  {
    category: "Publicity and Posting FAQs",
    question: "What materials are allowed for attaching posters to walls?",
    answer:
      "You may only use scotch tape, masking tape, or push pins. You are strictly prohibited from using permanent adhesives.",
    keywords: ["posting materials", "scotch tape", "no permanent adhesive"],
    order: 4,
  },
  {
    category: "Publicity and Posting FAQs",
    question:
      "How long can materials remain posted, and when must they be removed?",
    answer:
      "Materials are typically approved for a two-week duration. You must remove all materials the day after this period expires.",
    keywords: ["posting duration", "two weeks", "remove materials"],
    order: 5,
  },

  // Student Grievance Procedure FAQs
  {
    category: "Student Grievance Procedure FAQs",
    question:
      "What is the first step if I feel my rights have been violated by a member of the university community?",
    answer:
      "You are encouraged to attempt an Informal Resolution first by discussing the issue directly with the person involved.",
    keywords: ["grievance", "informal resolution", "first step"],
    order: 1,
  },
  {
    category: "Student Grievance Procedure FAQs",
    question:
      "Where do I go if the issue remains unresolved after discussing it with the person?",
    answer:
      "You should bring the formal complaint to the Director for Student Welfare (DSW).",
    keywords: ["formal complaint", "DSW", "student welfare"],
    order: 2,
  },
  {
    category: "Student Grievance Procedure FAQs",
    question:
      "What process does the Director for Student Welfare (DSW) follow?",
    answer:
      "The DSW will study the validity of the complaint and may initially attempt to facilitate mediation between the parties.",
    keywords: ["DSW process", "validity check", "mediation"],
    order: 3,
  },
  {
    category: "Student Grievance Procedure FAQs",
    question:
      "What happens if the complaint is valid but cannot be resolved through mediation?",
    answer:
      "If valid and unmediated, the DSW will endorse the complaint to the proper office for further official action.",
    keywords: ["endorsement", "proper office", "unresolved complaint"],
    order: 4,
  },

  // Examinations FAQs
  {
    category: "Examinations",
    question:
      "Do students need to present anything before taking an examination?",
    answer:
      "Yes. All students must present an examination permit before taking any scheduled midterm or final examinations. The instructor or professor administering the exam will sign the examination permit to confirm the student's eligibility to take the exam.",
    keywords: [
      "exam permit",
      "examination",
      "midterm",
      "finals",
      "requirement",
    ],
    order: 1,
  },
  {
    category: "Examinations",
    question: "Can a student be exempted from taking the final examination?",
    answer:
      "Yes. A student may be exempted from the final examination if they: (1) have a pre-final grade of at least 1.5; and (2) have completed all requirements of the subject (projects, quizzes, and assignments). This exemption allows students who have performed excellently to be relieved from taking the final exam.",
    keywords: [
      "exemption",
      "final exam",
      "pre-final grade",
      "1.5",
      "requirements",
    ],
    order: 2,
  },

  // Dropping Subjects FAQs
  {
    category: "Dropping Subjects",
    question: "Until when can a student officially drop a subject?",
    answer:
      "A student may officially drop one or more subjects up to one (1) week before the midterm examinations, based on the schedule indicated in the University calendar. To officially drop, the student must file the official dropping form at the Registrar's Office.",
    keywords: ["drop subject", "deadline", "midterm", "dropping form"],
    order: 1,
  },
  {
    category: "Dropping Subjects",
    question: "Is a student entitled to a refund when dropping a subject?",
    answer:
      "Yes. Refunds depend on timing: Before classes start = full refund except registration fee; Within 1st week = charged 30% of tuition; Within 2nd week = charged 50% of tuition; Within 3rd week = charged 70% of tuition; After 3rd week = no refund. Students officially advised by University physician to discontinue for health reasons get full tuition refund.",
    keywords: ["refund", "drop", "tuition", "health", "withdrawal"],
    order: 2,
  },

  // Academic Delinquency FAQs
  {
    category: "Academic Delinquency",
    question: "What happens if a student fails one subject?",
    answer:
      "If a student obtains a failing grade in one (1) subject, the Dean of the college/campus will issue a warning. This serves as a reminder to improve performance in the succeeding semesters.",
    keywords: ["fail", "failing grade", "warning", "one subject"],
    order: 1,
  },
  {
    category: "Academic Delinquency",
    question: "What happens if a student fails or drops two subjects?",
    answer:
      "A student who fails or drops two (2) subjects will not be allowed to enroll in the same subjects in the next semester. However, they may enroll in minor subjects in advance, subject to the Dean's approval, provided they do not exceed the total number of units prescribed in the curriculum.",
    keywords: ["two subjects", "fail", "drop", "not allowed", "minor subjects"],
    order: 2,
  },
  {
    category: "Academic Delinquency",
    question:
      "What happens if a student fails more than 75% of their enrolled subjects?",
    answer:
      "The student will be disqualified from continuing their studies at Bulacan State University. This is the strictest measure applied to protect academic standards.",
    keywords: ["75%", "disqualified", "failed", "dismissed"],
    order: 3,
  },

  // Graduation FAQs
  {
    category: "Graduation",
    question: "How do I apply for graduation at BulSU?",
    answer:
      "To apply for graduation, you must file the official Application for Graduation form at the Office of the Registrar. This step is mandatory for every student who has satisfied their course requirements. All candidates must be cleared of any property or monetary obligations, have completed at least one year of residence at BulSU, and have all disciplinary charges resolved.",
    keywords: [
      "graduation",
      "apply",
      "application form",
      "registrar",
      "requirements",
      "clearance",
    ],
    order: 1,
  },
  {
    category: "Graduation",
    question: "What happens after I file the Application for Graduation form?",
    answer:
      "Filing the form triggers the evaluation of your entire scholastic record by the Registrar’s Office. This evaluation determines your eligibility for graduation and, if applicable, academic honors.",
    keywords: [
      "graduation",
      "evaluation",
      "scholastic record",
      "eligibility",
      "after filing",
    ],
    order: 2,
  },
  {
    category: "Graduation",
    question: "What clearances are required to graduate?",
    answer:
      "You must secure a university-wide clearance, confirming you are cleared of all property and financial accountabilities. Additionally, all disciplinary charges must be resolved and any sanctions fully completed — this is especially important for eligibility to receive academic honors.",
    keywords: [
      "clearance",
      "university clearance",
      "financial clearance",
      "disciplinary clearance",
      "accountabilities",
    ],
    order: 3,
  },
  {
    category: "Graduation",
    question: "Who evaluates my records and what do they check?",
    answer:
      "The Registrar’s Office prepares the official list of candidates for graduation. They verify your residency requirement, unit loads per semester, and — for students being considered for honors — ensure no grade is below 2.0 in any subject.",
    keywords: [
      "evaluation",
      "registrar",
      "records",
      "residency",
      "unit load",
      "grade check",
      "honors eligibility",
    ],
    order: 4,
  },
  {
    category: "Graduation",
    question: "Who approves the final list of graduates?",
    answer:
      "The Academic Council reviews and gives final approval to the list of candidates for graduation and academic honors. They also determine the official dates for the commencement exercises.",
    keywords: [
      "approval",
      "academic council",
      "final list",
      "commencement dates",
      "graduates list",
    ],
    order: 5,
  },
  {
    category: "Graduation",
    question:
      "What types of academic honors are awarded to graduating students?",
    answer:
      "Academic honors are awarded based on GPA:\n• Summa Cum Laude (1.00–1.20)\n• Magna Cum Laude (1.21–1.45)\n• Cum Laude (1.46–1.75)\n\nRequirements include: no grade lower than 2.0 in any subject; completion of at least 75% of total academic units at BulSU; at least 2 years of residency at BulSU; and enrollment in at least 15 credit units per term/semester.",
    keywords: [
      "honors",
      "summa cum laude",
      "magna cum laude",
      "cum laude",
      "GPA",
      "latin honors",
      "graduation honors",
    ],
    order: 6,
  },
  {
    category: "Graduation",
    question: "What ceremonies am I required to attend?",
    answer:
      "All approved honor candidates (Summa Cum Laude, Magna Cum Laude, Cum Laude) are required to attend the traditional Baccalaureate Services and the Commencement Exercises.",
    keywords: [
      "ceremonies",
      "baccalaureate",
      "commencement",
      "honor candidates",
      "required attendance",
    ],
    order: 7,
  },
  {
    category: "Graduation",
    question: "Is there a specific dress code for graduation?",
    answer:
      "Yes. You must wear the specific academic costume (regalia) prescribed for your program during the Baccalaureate Services and Commencement Exercises.",
    keywords: [
      "dress code",
      "academic costume",
      "regalia",
      "graduation attire",
      "commencement dress",
    ],
    order: 8,
  },

  // Student Records FAQs
  {
    category: "Student Records",
    question: "How can I get my Official Transcript of Records (TOR)?",
    answer:
      "To secure your Official Transcript of Records: (1) Settle all financial obligations and accountabilities with the University; (2) File a clearance form together with the official receipt of payment at the Registrar's Office; (3) The Registrar's Office will process your request and issue the TOR.",
    keywords: ["TOR", "transcript", "records", "registrar", "clearance"],
    order: 1,
  },
  {
    category: "Student Records",
    question: "How can I get Transfer Credentials to move to another school?",
    answer:
      "To obtain transfer credentials: (1) Submit a duly accomplished and signed clearance form to the Registrar's Office; (2) Ensure all financial obligations and accountabilities are cleared; (3) Transfer credentials will be issued. Even students dismissed from the University may receive transfer credentials if financially cleared.",
    keywords: ["transfer credentials", "move school", "clearance", "dismissed"],
    order: 2,
  },

  // Student Conduct FAQs
  {
    category: "Student Conduct",
    question: "What are the general responsibilities of students at BulSU?",
    answer:
      "Every student is expected to: (1) Assume responsibility for their actions at all times; (2) Respect authority and comply with rules and regulations; (3) Be truthful and uphold honesty; (4) Respect the rights of others and private/public property; (5) Maintain high academic integrity.",
    keywords: [
      "responsibilities",
      "conduct",
      "behavior",
      "integrity",
      "respect",
    ],
    order: 1,
  },
  {
    category: "Student Conduct",
    question: "What is the dress code at BulSU?",
    answer:
      "Daily Uniform: Monday, Tuesday, Thursday, Friday as prescribed by college/campus. Organization Shirt Day: Friday (optional). Free Days: Wednesday, Saturday, Sunday (clothing must not offend community values). NSTP/PE Uniforms: Only during classes. Daily uniform paired with black closed shoes. Laboratory outfit must be worn for lab work.",
    keywords: ["dress code", "uniform", "clothing", "attire", "ID"],
    order: 2,
  },
  {
    category: "Student Conduct",
    question: "What are the penalties for cheating during an exam?",
    answer:
      "1st Offense: Verbal Reprimand + Guidance Program + Zero score in exam; 2nd Offense: Written Reprimand + Failing grade + 16 hours Transformational Experience + Guidance Program; 3rd Offense: 1 Month Suspension + Failing grade + Guidance Program.",
    keywords: [
      "cheating",
      "exam",
      "penalties",
      "academic dishonesty",
      "sanctions",
    ],
    order: 3,
  },
  {
    category: "Student Conduct",
    question: "What are the penalties for plagiarism?",
    answer:
      "1st Offense: Failing grade in output + Guidance Program + Parents/Guardians dialogue; 2nd Offense: Failing grade in subject + 2 weeks Suspension + 16 hours Transformational Experience + Guidance Program + Parents/Guardians dialogue; 3rd Offense: Failing grade in subject + 1 Semester Suspension + Guidance Program + Parents/Guardians dialogue.",
    keywords: [
      "plagiarism",
      "academic dishonesty",
      "copying",
      "penalties",
      "thesis",
    ],
    order: 4,
  },

  // Maximum Residency FAQs
  {
    category: "Maximum Residency",
    question: "What is the Maximum Residency Requirement at BulSU?",
    answer:
      "The Maximum Residency Requirement refers to the maximum period a student is allowed to complete a degree. Maximum periods: Two-year course = up to 4 years; Four-year course = up to 6 years; Five-year course = up to 7.5 years. Students on official LOA are exempted from this computation.",
    keywords: ["residency", "maximum", "completion period", "time limit"],
    order: 1,
  },
  {
    category: "Maximum Residency",
    question: "What happens if a student exceeds the maximum residency period?",
    answer:
      "Students who exceed the maximum residency period may still continue studying, but the government subsidy on tuition will be forfeited, and the student will be required to pay the appropriate tuition fees as prescribed by the University's finance office. Exceeding the period does not automatically result in dismissal.",
    keywords: ["exceed", "residency", "tuition", "subsidy", "payment"],
    order: 2,
  },

  // Gold Gear Awards FAQs
  {
    category: "Awards and Recognition",
    question: "What are the Gold Gear Awards?",
    answer:
      "The Gold Gear Awards is an annual recognition program at BulSU that formally honors students for their academic excellence, co-curricular, and extra-curricular achievements. Awards include Academic Excellence Awards (President's List and Dean's List) and Co-Curricular/Extra-Curricular Awards.",
    keywords: [
      "gold gear",
      "awards",
      "recognition",
      "excellence",
      "achievement",
    ],
    order: 1,
  },
  {
    category: "Awards and Recognition",
    question: "What is the President's List Award?",
    answer:
      "The President's List Award is given to students with a GPA of 1.00-1.20 and no grade lower than 2.0 in any subject for the last two consecutive semesters. Students must have been officially enrolled in a minimum of 15 academic units. Only 2nd year to senior year students are eligible.",
    keywords: [
      "presidents list",
      "GPA 1.00",
      "academic excellence",
      "dean's list",
    ],
    order: 2,
  },
];

async function seedFAQs() {
  console.log('🌱 Seeding FAQs...');

  try {
    // Delete existing FAQs
    await prisma.fAQ.deleteMany({});
    console.log('✓ Cleared existing FAQs');

    // Create new FAQs
    for (const faq of faqData) {
      await prisma.fAQ.create({
        data: faq
      });
    }

    console.log(`✓ Created ${faqData.length} FAQs`);
    console.log('✅ FAQ seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedFAQs()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedFAQs };