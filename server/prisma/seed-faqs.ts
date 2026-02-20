// Seed FAQs from Frequent Asked Questions of Students document
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const faqData = [
  // Grading System FAQs
  {
    category: 'Grading System',
    question: 'What is the grading scale used at Bulacan State University?',
    answer: 'BulSU evaluates academic performance using a combination of numerical grades and letter equivalents. The grades range from 1.00 (Excellent, 97-100%) to 5.00 (Failed, ≤74%). The lowest passing grade is 3.00 (75%). Special grades include 4.00 (Conditional Passed), Inc. (Incomplete), D (Officially Dropped), and FDA/UD (Failure Due to Absences/Unofficially Dropped).',
    keywords: ['grading', 'grades', 'GPA', 'scale', 'percentage', 'passing'],
    order: 1
  },
  {
    category: 'Grading System',
    question: 'What does a 4.00 (Conditional Passed) grade mean?',
    answer: 'A 4.00 grade is given when a student is slightly below the passing criteria but has the potential to pass. The student must consult with the subject teacher to address deficiencies within two (2) weeks. If not resolved within 2 weeks, the grade automatically changes to 5.00 (Failed). The 4.00 grade does not appear on the permanent record or transcript.',
    keywords: ['4.00', 'conditional', 'passed', 'deficiency', 'failed'],
    order: 2
  },
  {
    category: 'Grading System',
    question: 'What is an "Inc." (Incomplete) grade?',
    answer: 'An Incomplete (Inc.) is assigned when a student is passing all grading criteria except for missing certain requirements such as projects, assignments, or activities. Students have a grace period of one (1) year to complete the missing requirements. If not completed within one year, the grade automatically becomes 5.00 (Failed). If the incomplete grade is in a prerequisite subject, the student cannot enroll in the subsequent subject.',
    keywords: ['incomplete', 'inc', 'requirements', 'missing', 'prerequisite'],
    order: 3
  },
  {
    category: 'Grading System',
    question: 'What does "D" (Officially Dropped) mean?',
    answer: '"D" indicates that a student has officially dropped a subject by submitting a formal dropping form, which must be signed by the instructor, dean, and university registrar. This grade ensures that the student\'s withdrawal is properly documented and does not affect other academic records adversely.',
    keywords: ['dropped', 'officially dropped', 'withdrawal', 'D grade'],
    order: 4
  },
  {
    category: 'Grading System',
    question: 'What does FDA or UD mean?',
    answer: 'FDA (Failure Due to Absences) occurs when a student discontinues attending class without informing the instructor, resulting in failure. UD (Unofficially Dropped) occurs when a student stops attending class without filing a formal dropping form, which also counts as failure. These grades highlight the importance of regular attendance and proper communication with instructors.',
    keywords: ['FDA', 'UD', 'absences', 'failure', 'attendance', 'unofficially dropped'],
    order: 5
  },

  // University History FAQs
  {
    category: 'University History',
    question: 'When and how was Bulacan State University established?',
    answer: 'BulSU started in 1904 as an intermediate school during the early years of the American occupation in the Philippines. It was established under Act 74 of the Philippine Commission (1901), which aimed to set up schools in every town and reorganize existing ones. Early instruction included academic subjects and trade/industrial education.',
    keywords: ['history', 'established', '1904', 'founding', 'origin'],
    order: 1
  },
  {
    category: 'University History',
    question: 'How did BulSU become a university?',
    answer: 'BulSU evolved from Bulacan Trade School (1909) to Bulacan National School of Arts and Trades (1957), then to Bulacan College of Arts and Trades (1965). The conversion into Bulacan State University (BSU) was formalized through R.A. 7665 in 1993, with Dr. Rosario Pimentel as the first university president.',
    keywords: ['university', 'conversion', 'R.A. 7665', '1993', 'evolution'],
    order: 2
  },

  // Vision and Mission FAQs
  {
    category: 'Vision and Mission',
    question: 'What is the vision of Bulacan State University?',
    answer: 'The Bulacan State University is a progressive knowledge generating institution globally recognized for excellent instruction, pioneering research, and responsive community engagements.',
    keywords: ['vision', 'mission', 'goals', 'excellence', 'research'],
    order: 1
  },
  {
    category: 'Vision and Mission',
    question: 'What is the mission of Bulacan State University?',
    answer: 'The Bulacan State University exists to produce highly competent, ethical, and service-oriented professionals that contribute to the sustainable socio-economic growth and development of the nation.',
    keywords: ['mission', 'competent', 'ethical', 'professionals', 'development'],
    order: 2
  },

  // Student Classification FAQs
  {
    category: 'Student Classification',
    question: 'What is a regular student?',
    answer: 'A regular student is one who registers for formal academic credits and carries the full load of subjects required for a given semester and curriculum.',
    keywords: ['regular student', 'full load', 'classification'],
    order: 1
  },
  {
    category: 'Student Classification',
    question: 'What is an irregular student?',
    answer: 'An irregular student is one who registers for formal credits but carries less than the full load in a given semester, usually to complete specific curriculum requirements.',
    keywords: ['irregular student', 'partial load', 'classification'],
    order: 2
  },
  {
    category: 'Student Classification',
    question: 'What is a shifter student?',
    answer: 'A shifter student is one who changes from one course to another, either within the same college/campus or in a different college/campus of the University.',
    keywords: ['shifter', 'change course', 'transfer program'],
    order: 3
  },
  {
    category: 'Student Classification',
    question: 'What is a transfer student?',
    answer: 'A transfer student is one who comes from another recognized higher education institution and is officially allowed to enroll in the same or another course at BulSU.',
    keywords: ['transfer student', 'other school', 'external transfer'],
    order: 4
  },

  // Student Rights FAQs
  {
    category: 'Student Rights',
    question: 'What constitutional rights do BSU students have?',
    answer: 'BSU students enjoy constitutional rights including: right to life, liberty, and property under due process; equal protection of the law; protection against unreasonable search and seizures; privacy of communication; freedom of speech and expression; right to peaceably assemble; free exercise of religion; right to public information; right to form organizations; access to courts and legal assistance; and right to quality education.',
    keywords: ['rights', 'constitutional', 'freedom', 'due process', 'education'],
    order: 1
  },
  {
    category: 'Student Rights',
    question: 'What rights do students have under the Education Act of 1982?',
    answer: 'Students are entitled to: receive quality education through competent instruction; freely choose and continue their field of study; access school guidance and counseling services; view and re-evaluate class records; receive certificates and transcripts within 30 days; publish student newspapers; express opinions freely; form or join recognized organizations; and participate in policy-making through appropriate representation.',
    keywords: ['Education Act', '1982', 'rights', 'quality education', 'organizations'],
    order: 2
  },

  // Admission Requirements FAQs
  {
    category: 'Admission',
    question: 'Where do I file my application for admission to BulSU?',
    answer: 'All applications for admission must be filed with the Office of Admissions and Orientation of Bulacan State University. Applicants are required to submit the prescribed documents, pay the BSU Admission Test (BSUAT) fee, and comply with the admission procedures within the scheduled application period.',
    keywords: ['admission', 'application', 'BSUAT', 'enrollment', 'apply'],
    order: 1
  },
  {
    category: 'Admission',
    question: 'Is admission to BulSU open to everyone?',
    answer: 'Admission to BulSU is selective. The University receives more applicants than it can accommodate, so admission is based on academic performance (GPA), BSU Admission Test (BSUAT) scores, and interview results (if required by the program). Only qualified applicants are admitted, subject to available slots.',
    keywords: ['selective admission', 'requirements', 'GPA', 'BSUAT', 'slots'],
    order: 2
  },
  {
    category: 'Admission',
    question: 'What are the requirements for college freshmen applicants?',
    answer: 'College freshmen must: have a Senior High School diploma from a recognized school; submit a fully accomplished application form; provide two (2) 2"×2" ID pictures with white background; submit a photocopy of school ID; meet the GPA requirement of the chosen program; and pass the interview, if required.',
    keywords: ['freshmen', 'requirements', 'SHS', 'diploma', 'application'],
    order: 3
  },
  {
    category: 'Admission',
    question: 'What are the requirements for transfer students?',
    answer: 'Transfer students must: submit a completed application form with required ID pictures; have a GPA of 2.5 or better with no failing grade (5.0); have completed not more than 50% of the total units of the course; and submit Transcript of Records and Honorable Dismissal. Transfer credits are evaluated by the Office of the Registrar and approved by the Vice President for Academic Affairs.',
    keywords: ['transfer', 'requirements', 'TOR', 'honorable dismissal', 'GPA 2.5'],
    order: 4
  },

  // Enrollment FAQs
  {
    category: 'Enrollment',
    question: 'What does "change of academic load" mean?',
    answer: 'Change of academic load refers to the adding or changing of subjects that a student is officially enrolled in for a given semester. Requests must be made within the first two (2) weeks of regular classes only and are subject to the approval of the concerned academic unit head.',
    keywords: ['change load', 'add subject', 'drop subject', 'enrollment'],
    order: 1
  },
  {
    category: 'Enrollment',
    question: 'What is subject substitution?',
    answer: 'Subject substitution refers to the replacement of an old subject with a new one in a student\'s academic program. This is allowed when: the original subject belongs to an old curriculum that has been revised; the old and proposed substitute subjects are similar in content; and the substitute subject has equal or greater credit units than the original subject.',
    keywords: ['substitution', 'replace subject', 'curriculum change', 'old curriculum'],
    order: 2
  },

  // Attendance FAQs
  {
    category: 'Attendance',
    question: 'Are students required to attend classes regularly?',
    answer: 'Yes. All students are required to attend their classes promptly and regularly. Regular attendance is an important part of academic responsibility and contributes to effective learning and participation in class activities.',
    keywords: ['attendance', 'regular', 'classes', 'required'],
    order: 1
  },
  {
    category: 'Attendance',
    question: 'When is a student considered tardy or absent?',
    answer: 'A student is considered tardy if they arrive 15 minutes after the scheduled start time. A student is marked absent if they arrive 20 minutes after the scheduled start time. However, even if marked absent, the student may still be allowed to attend the lesson.',
    keywords: ['tardy', 'absent', 'late', '15 minutes', '20 minutes'],
    order: 2
  },
  {
    category: 'Attendance',
    question: 'What types of absences are considered excused?',
    answer: 'Absences may be considered excused if incurred due to: official representation of the University in curricular, co-curricular, or extra-curricular activities; sickness (duly certified by attending physician or University physician); or force majeure (natural disasters or other unavoidable events). Excused absences must not exceed 30% of total required attendance per semester.',
    keywords: ['excused absence', 'sick', 'official representation', 'force majeure'],
    order: 3
  },
  {
    category: 'Attendance',
    question: 'What happens if a student has too many unexcused absences?',
    answer: 'Any student who accumulates more than twenty percent (20%) of unexcused absences in any subject before the midterm examinations shall be automatically dropped from that subject. The instructor will mark the student with either FDA (Failure Due to Absences) or UD (Unofficially Dropped).',
    keywords: ['unexcused absence', 'dropped', 'FDA', 'UD', '20%'],
    order: 4
  },

  // Leave of Absence FAQs
  {
    category: 'Leave of Absence',
    question: 'What is a Leave of Absence (LOA)?',
    answer: 'A Leave of Absence (LOA) is an official permission granted by the University that allows a student to temporarily discontinue their studies for a valid reason, without losing student standing. The maximum allowable duration is one (1) year.',
    keywords: ['LOA', 'leave of absence', 'temporary stop', 'discontinue'],
    order: 1
  },
  {
    category: 'Leave of Absence',
    question: 'What are the procedures for filing a Leave of Absence?',
    answer: 'To file LOA: (1) Request a Leave of Absence Form from the Office of the Registrar; (2) Fill out the form clearly and follow all instructions; (3) Return the completed LOA form to the Office of the Registrar. Students may photocopy the form and request the receiving officer to write their complete name and affix their signature as proof of receipt.',
    keywords: ['file LOA', 'procedure', 'registrar', 'LOA form'],
    order: 2
  },
  {
    category: 'Leave of Absence',
    question: 'What should a student do when returning from LOA?',
    answer: 'When returning from LOA: (1) Personally appear at the Office of the Registrar and request readmission; (2) The Registrar will issue a Readmission Slip; (3) Submit this slip to the college dean or authorized representative. The dean shall not deny the readmitted student permission to enroll.',
    keywords: ['return from LOA', 'readmission', 'comeback', 'registrar'],
    order: 3
  },

  // Examinations FAQs
  {
    category: 'Examinations',
    question: 'Do students need to present anything before taking an examination?',
    answer: 'Yes. All students must present an examination permit before taking any scheduled midterm or final examinations. The instructor or professor administering the exam will sign the examination permit to confirm the student\'s eligibility to take the exam.',
    keywords: ['exam permit', 'examination', 'midterm', 'finals', 'requirement'],
    order: 1
  },
  {
    category: 'Examinations',
    question: 'Can a student be exempted from taking the final examination?',
    answer: 'Yes. A student may be exempted from the final examination if they: (1) have a pre-final grade of at least 1.5; and (2) have completed all requirements of the subject (projects, quizzes, and assignments). This exemption allows students who have performed excellently to be relieved from taking the final exam.',
    keywords: ['exemption', 'final exam', 'pre-final grade', '1.5', 'requirements'],
    order: 2
  },

  // Dropping Subjects FAQs
  {
    category: 'Dropping Subjects',
    question: 'Until when can a student officially drop a subject?',
    answer: 'A student may officially drop one or more subjects up to one (1) week before the midterm examinations, based on the schedule indicated in the University calendar. To officially drop, the student must file the official dropping form at the Registrar\'s Office.',
    keywords: ['drop subject', 'deadline', 'midterm', 'dropping form'],
    order: 1
  },
  {
    category: 'Dropping Subjects',
    question: 'Is a student entitled to a refund when dropping a subject?',
    answer: 'Yes. Refunds depend on timing: Before classes start = full refund except registration fee; Within 1st week = charged 30% of tuition; Within 2nd week = charged 50% of tuition; Within 3rd week = charged 70% of tuition; After 3rd week = no refund. Students officially advised by University physician to discontinue for health reasons get full tuition refund.',
    keywords: ['refund', 'drop', 'tuition', 'health', 'withdrawal'],
    order: 2
  },

  // Academic Delinquency FAQs
  {
    category: 'Academic Delinquency',
    question: 'What happens if a student fails one subject?',
    answer: 'If a student obtains a failing grade in one (1) subject, the Dean of the college/campus will issue a warning. This serves as a reminder to improve performance in the succeeding semesters.',
    keywords: ['fail', 'failing grade', 'warning', 'one subject'],
    order: 1
  },
  {
    category: 'Academic Delinquency',
    question: 'What happens if a student fails or drops two subjects?',
    answer: 'A student who fails or drops two (2) subjects will not be allowed to enroll in the same subjects in the next semester. However, they may enroll in minor subjects in advance, subject to the Dean\'s approval, provided they do not exceed the total number of units prescribed in the curriculum.',
    keywords: ['two subjects', 'fail', 'drop', 'not allowed', 'minor subjects'],
    order: 2
  },
  {
    category: 'Academic Delinquency',
    question: 'What happens if a student fails more than 75% of their enrolled subjects?',
    answer: 'The student will be disqualified from continuing their studies at Bulacan State University. This is the strictest measure applied to protect academic standards.',
    keywords: ['75%', 'disqualified', 'failed', 'dismissed'],
    order: 3
  },

  // Graduation FAQs
  {
    category: 'Graduation',
    question: 'How do I apply for graduation at BulSU?',
    answer: 'To apply for graduation, a student must file an official Application for Graduation form at the Office of the Registrar. All candidates must be cleared of any property or monetary obligations, have completed at least one year of residence at BulSU, and have all disciplinary charges resolved.',
    keywords: ['graduation', 'apply', 'requirements', 'clearance', 'registrar'],
    order: 1
  },
  {
    category: 'Graduation',
    question: 'What types of academic honors are awarded to graduating students?',
    answer: 'Academic honors based on GPA: Summa Cum Laude (1.00-1.20), Magna Cum Laude (1.21-1.45), Cum Laude (1.46-1.75). Requirements: earned at least 2.0 in all subjects; completed at least 75% of total academic units and residency of at least 2 years at BulSU; enrolled in at least 15 credit units per term/semester.',
    keywords: ['honors', 'summa', 'magna', 'cum laude', 'GPA', 'graduation'],
    order: 2
  },

  // Student Records FAQs
  {
    category: 'Student Records',
    question: 'How can I get my Official Transcript of Records (TOR)?',
    answer: 'To secure your Official Transcript of Records: (1) Settle all financial obligations and accountabilities with the University; (2) File a clearance form together with the official receipt of payment at the Registrar\'s Office; (3) The Registrar\'s Office will process your request and issue the TOR.',
    keywords: ['TOR', 'transcript', 'records', 'registrar', 'clearance'],
    order: 1
  },
  {
    category: 'Student Records',
    question: 'How can I get Transfer Credentials to move to another school?',
    answer: 'To obtain transfer credentials: (1) Submit a duly accomplished and signed clearance form to the Registrar\'s Office; (2) Ensure all financial obligations and accountabilities are cleared; (3) Transfer credentials will be issued. Even students dismissed from the University may receive transfer credentials if financially cleared.',
    keywords: ['transfer credentials', 'move school', 'clearance', 'dismissed'],
    order: 2
  },

  // Student Conduct FAQs
  {
    category: 'Student Conduct',
    question: 'What are the general responsibilities of students at BulSU?',
    answer: 'Every student is expected to: (1) Assume responsibility for their actions at all times; (2) Respect authority and comply with rules and regulations; (3) Be truthful and uphold honesty; (4) Respect the rights of others and private/public property; (5) Maintain high academic integrity.',
    keywords: ['responsibilities', 'conduct', 'behavior', 'integrity', 'respect'],
    order: 1
  },
  {
    category: 'Student Conduct',
    question: 'What is the dress code at BulSU?',
    answer: 'Daily Uniform: Monday, Tuesday, Thursday, Friday as prescribed by college/campus. Organization Shirt Day: Friday (optional). Free Days: Wednesday, Saturday, Sunday (clothing must not offend community values). NSTP/PE Uniforms: Only during classes. Daily uniform paired with black closed shoes. Laboratory outfit must be worn for lab work.',
    keywords: ['dress code', 'uniform', 'clothing', 'attire', 'ID'],
    order: 2
  },
  {
    category: 'Student Conduct',
    question: 'What are the penalties for cheating during an exam?',
    answer: '1st Offense: Verbal Reprimand + Guidance Program + Zero score in exam; 2nd Offense: Written Reprimand + Failing grade + 16 hours Transformational Experience + Guidance Program; 3rd Offense: 1 Month Suspension + Failing grade + Guidance Program.',
    keywords: ['cheating', 'exam', 'penalties', 'academic dishonesty', 'sanctions'],
    order: 3
  },
  {
    category: 'Student Conduct',
    question: 'What are the penalties for plagiarism?',
    answer: '1st Offense: Failing grade in output + Guidance Program + Parents/Guardians dialogue; 2nd Offense: Failing grade in subject + 2 weeks Suspension + 16 hours Transformational Experience + Guidance Program + Parents/Guardians dialogue; 3rd Offense: Failing grade in subject + 1 Semester Suspension + Guidance Program + Parents/Guardians dialogue.',
    keywords: ['plagiarism', 'academic dishonesty', 'copying', 'penalties', 'thesis'],
    order: 4
  },

  // Maximum Residency FAQs
  {
    category: 'Maximum Residency',
    question: 'What is the Maximum Residency Requirement at BulSU?',
    answer: 'The Maximum Residency Requirement refers to the maximum period a student is allowed to complete a degree. Maximum periods: Two-year course = up to 4 years; Four-year course = up to 6 years; Five-year course = up to 7.5 years. Students on official LOA are exempted from this computation.',
    keywords: ['residency', 'maximum', 'completion period', 'time limit'],
    order: 1
  },
  {
    category: 'Maximum Residency',
    question: 'What happens if a student exceeds the maximum residency period?',
    answer: 'Students who exceed the maximum residency period may still continue studying, but the government subsidy on tuition will be forfeited, and the student will be required to pay the appropriate tuition fees as prescribed by the University\'s finance office. Exceeding the period does not automatically result in dismissal.',
    keywords: ['exceed', 'residency', 'tuition', 'subsidy', 'payment'],
    order: 2
  },

  // Gold Gear Awards FAQs
  {
    category: 'Awards and Recognition',
    question: 'What are the Gold Gear Awards?',
    answer: 'The Gold Gear Awards is an annual recognition program at BulSU that formally honors students for their academic excellence, co-curricular, and extra-curricular achievements. Awards include Academic Excellence Awards (President\'s List and Dean\'s List) and Co-Curricular/Extra-Curricular Awards.',
    keywords: ['gold gear', 'awards', 'recognition', 'excellence', 'achievement'],
    order: 1
  },
  {
    category: 'Awards and Recognition',
    question: 'What is the President\'s List Award?',
    answer: 'The President\'s List Award is given to students with a GPA of 1.00-1.20 and no grade lower than 2.0 in any subject for the last two consecutive semesters. Students must have been officially enrolled in a minimum of 15 academic units. Only 2nd year to senior year students are eligible.',
    keywords: ['presidents list', 'GPA 1.00', 'academic excellence', 'dean\'s list'],
    order: 2
  }
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
