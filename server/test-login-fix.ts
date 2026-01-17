import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function testLoginCredentials() {
  console.log('\n🔍 Testing Login Credentials System...\n');

  try {
    console.log('[1/5] Testing database connection...');
    await prisma.$connect();
    console.log('✓ Database connected successfully\n');

    console.log('[2/5] Checking user records...');
    const userCount = await prisma.user.count();
    console.log(`✓ Found ${userCount} users in database\n`);

    if (userCount === 0) {
      console.log('⚠ No users found. Creating test user...');
      const hashedPassword = await bcrypt.hash('Test123!', 10);
      const testUser = await prisma.user.create({
        data: {
          email: 'test@bulsu.edu.ph',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'STUDENT',
          isActive: true,
          updatedAt: new Date(),
        },
      });
      console.log(`✓ Created test user: ${testUser.email}\n`);
    }

    console.log('[3/5] Testing bcrypt password hashing...');
    const testPassword = 'TestPassword123!';
    const hashedTest = await bcrypt.hash(testPassword, 10);
    const isMatch = await bcrypt.compare(testPassword, hashedTest);
    if (isMatch) {
      console.log('✓ Bcrypt hashing/comparison working correctly\n');
    } else {
      console.log('✗ Bcrypt comparison failed\n');
      process.exit(1);
    }

    console.log('[4/5] Testing JWT token generation...');
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    if (jwtSecret === 'secret' || jwtSecret.length < 32) {
      console.log('⚠ WARNING: JWT_SECRET is weak or default!\n');
    }
    const token = jwt.sign(
      { userId: 'test-id', email: 'test@bulsu.edu.ph', role: 'STUDENT' },
      jwtSecret,
      { expiresIn: '7d' }
    );
    jwt.verify(token, jwtSecret);
    console.log('✓ JWT token generation/verification working\n');

    console.log('[5/5] Checking for inactive user accounts...');
    const inactiveUsers = await prisma.user.findMany({
      where: { isActive: false },
      select: { email: true, id: true },
    });
    
    if (inactiveUsers.length > 0) {
      console.log(`⚠ Found ${inactiveUsers.length} inactive accounts:`);
      inactiveUsers.forEach(u => console.log(`  - ${u.email}`));
      console.log('\nTo activate, run: npx prisma studio\n');
    } else {
      console.log('✓ All user accounts are active\n');
    }

    console.log('✅ All login credential tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginCredentials();
