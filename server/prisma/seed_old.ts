import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tisalabs.com' },
    update: {},
    create: {
      email: 'admin@tisalabs.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  const testTemplates = [
    {
      name: 'Complete Blood Count',
      code: 'CBC',
      category: 'Hematology',
      description: 'Comprehensive blood cell analysis',
      methodology: 'Automated cell counter',
      normalRange: '4.5-11.0 x10^9/L',
      unit: 'x10^9/L',
      turnaroundTime: 24,
      price: 50.0,
      createdById: admin.id,
    },
    {
      name: 'Blood Glucose',
      code: 'GLU',
      category: 'Chemistry',
      description: 'Fasting blood glucose test',
      methodology: 'Enzymatic colorimetric',
      normalRange: '70-100 mg/dL',
      unit: 'mg/dL',
      turnaroundTime: 12,
      price: 25.0,
      createdById: admin.id,
    },
    {
      name: 'Lipid Profile',
      code: 'LIPID',
      category: 'Chemistry',
      description: 'Cholesterol and triglycerides',
      methodology: 'Enzymatic colorimetric',
      normalRange: 'Total: <200 mg/dL',
      unit: 'mg/dL',
      turnaroundTime: 24,
      price: 75.0,
      createdById: admin.id,
    },
    {
      name: 'Urinalysis',
      code: 'UA',
      category: 'Urinalysis',
      description: 'Complete urine analysis',
      methodology: 'Dipstick and microscopy',
      normalRange: 'Normal',
      unit: 'Various',
      turnaroundTime: 12,
      price: 30.0,
      createdById: admin.id,
    },
  ];

  for (const template of testTemplates) {
    await prisma.testTemplate.upsert({
      where: { code: template.code },
      update: {},
      create: template,
    });
  }

  console.log('Created test templates');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
