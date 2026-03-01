// server/prisma/seed-career-paths.ts
// Seed script to add career paths and descriptions to University Programs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const programCareerData = [
  {
    title: 'Bachelor of Science in Biology',
    description: 'A comprehensive program that provides students with a strong foundation in biological sciences, including molecular biology, ecology, genetics, and physiology. Prepares students for careers in research, healthcare, and environmental conservation.',
    careerPaths: [
      'Biologist',
      'Research Scientist',
      'Laboratory Technician',
      'Wildlife Biologist',
      'Conservation Scientist',
      'Environmental Consultant',
      'Microbiologist',
      'Geneticist',
      'Biotechnologist',
      'Science Teacher',
      'Pharmaceutical Sales Representative',
      'Quality Control Analyst',
      'Forensic Scientist',
      'Marine Biologist',
      'Ecologist'
    ]
  },
  {
    title: 'Bachelor of Science in Mathematics With Specialization in Computer Science',
    description: 'An interdisciplinary program combining advanced mathematics with computer science fundamentals. Students learn programming, algorithms, data structures, and mathematical modeling for software development and data analysis.',
    careerPaths: [
      'Software Developer',
      'Web Developer',
      'Mobile App Developer',
      'Data Scientist',
      'Data Analyst',
      'Machine Learning Engineer',
      'Systems Analyst',
      'Database Administrator',
      'IT Consultant',
      'Cybersecurity Analyst',
      'Game Developer',
      'DevOps Engineer',
      'Full Stack Developer',
      'AI/ML Researcher',
      'Technical Project Manager'
    ]
  },
  {
    title: 'Bachelor of Science in Mathematics With Specialization in Applied Statistics',
    description: 'A program focused on statistical theory and its applications in various fields. Students learn data analysis, probability, statistical modeling, and research methodology for careers in analytics and research.',
    careerPaths: [
      'Statistician',
      'Data Analyst',
      'Business Analyst',
      'Market Research Analyst',
      'Actuarial Analyst',
      'Quality Assurance Analyst',
      'Research Analyst',
      'Financial Analyst',
      'Operations Research Analyst',
      'Survey Researcher',
      'Biostatistician',
      'Econometrician',
      'Risk Analyst',
      'Insurance Underwriter',
      'Data Scientist'
    ]
  },
  {
    title: 'Bachelor of Science in Mathematics With Specialization in Business Applications',
    description: 'A program that combines mathematical skills with business acumen. Students learn financial mathematics, operations research, and business analytics for careers in finance and business management.',
    careerPaths: [
      'Business Analyst',
      'Financial Analyst',
      'Management Consultant',
      'Operations Manager',
      'Investment Analyst',
      'Risk Manager',
      'Budget Analyst',
      'Cost Estimator',
      'Logistics Analyst',
      'Supply Chain Analyst',
      'Credit Analyst',
      'Pricing Analyst',
      'Business Intelligence Analyst',
      'Project Manager',
      'Entrepreneur'
    ]
  },
  {
    title: 'Bachelor of Science in Food Technology',
    description: 'A program that focuses on the science of food processing, preservation, and safety. Students learn about food chemistry, microbiology, and quality control for careers in the food industry.',
    careerPaths: [
      'Food Technologist',
      'Quality Assurance Manager',
      'Food Safety Specialist',
      'Product Development Scientist',
      'Food Production Manager',
      'Sensory Analyst',
      'Nutritionist',
      'Food Microbiologist',
      'Regulatory Affairs Specialist',
      'Food Process Engineer',
      'Research and Development Scientist',
      'Food Quality Control Inspector',
      'Flavor Chemist',
      'Packaging Specialist',
      'Food Service Manager'
    ]
  },
  {
    title: 'Bachelor of Science in Environmental Science',
    description: 'A multidisciplinary program that studies the environment and solutions to environmental problems. Students learn about ecology, pollution control, and sustainable development.',
    careerPaths: [
      'Environmental Scientist',
      'Environmental Consultant',
      'Conservation Officer',
      'Sustainability Coordinator',
      'Environmental Impact Assessor',
      'Pollution Control Specialist',
      'Wildlife Manager',
      'Natural Resource Manager',
      'Climate Change Analyst',
      'Environmental Educator',
      'Waste Management Specialist',
      'Water Quality Analyst',
      'GIS Specialist',
      'Environmental Health Officer',
      'Renewable Energy Consultant'
    ]
  },
  {
    title: 'Bachelor of Science in Medical Technology',
    description: 'A program that prepares students for careers in clinical laboratory science. Students learn diagnostic procedures, laboratory techniques, and medical analysis for healthcare settings.',
    careerPaths: [
      'Medical Technologist',
      'Clinical Laboratory Scientist',
      'Laboratory Supervisor',
      'Pathology Technician',
      'Blood Bank Technologist',
      'Histotechnologist',
      'Cytotechnologist',
      'Microbiologist',
      'Clinical Research Coordinator',
      'Quality Assurance Specialist',
      'Laboratory Manager',
      'Phlebotomist',
      'Immunology Technologist',
      'Molecular Diagnostics Specialist',
      'Healthcare Administrator'
    ]
  },
  {
    title: 'Bachelor of Science in Medical Laboratory Science',
    description: 'An advanced program in clinical laboratory science focusing on diagnostic testing and analysis. Prepares students for licensure as medical laboratory scientists in hospitals and diagnostic centers.',
    careerPaths: [
      'Medical Laboratory Scientist',
      'Clinical Laboratory Technologist',
      'Pathology Laboratory Manager',
      'Research Laboratory Scientist',
      'Blood Bank Specialist',
      'Microbiology Technologist',
      'Chemistry Technologist',
      'Hematology Technologist',
      'Immunohematology Specialist',
      'Laboratory Quality Manager',
      'Clinical Trials Coordinator',
      'Diagnostic Product Specialist',
      'Laboratory Information Systems Analyst',
      'Public Health Laboratory Scientist',
      'Forensic Laboratory Analyst'
    ]
  }
];

async function seedCareerPaths() {
  console.log('🔄 Seeding career paths for University Programs...\n');

  for (const program of programCareerData) {
    try {
      const updated = await prisma.universityProgram.updateMany({
        where: {
          title: { contains: program.title.split(' ').slice(0, 5).join(' '), mode: 'insensitive' }
        },
        data: {
          description: program.description,
          careerPaths: program.careerPaths
        }
      });

      if (updated.count > 0) {
        console.log(`✅ Updated: ${program.title} (${program.careerPaths.length} career paths)`);
      } else {
        // Try exact match
        const exactUpdate = await prisma.universityProgram.updateMany({
          where: { title: program.title },
          data: {
            description: program.description,
            careerPaths: program.careerPaths
          }
        });
        
        if (exactUpdate.count > 0) {
          console.log(`✅ Updated (exact): ${program.title}`);
        } else {
          console.log(`⚠️ Not found: ${program.title}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error updating ${program.title}:`, error);
    }
  }

  // Verify the updates
  console.log('\n📊 Verification:');
  const programs = await prisma.universityProgram.findMany({
    where: { college: 'College of Science' },
    select: { title: true, careerPaths: true, description: true }
  });

  for (const p of programs) {
    console.log(`- ${p.title}: ${p.careerPaths.length} careers, description: ${p.description ? 'Yes' : 'No'}`);
  }
}

async function main() {
  console.log('🚀 Starting career paths seed...\n');
  
  try {
    await seedCareerPaths();
    console.log('\n✅ Career paths seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding career paths:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
