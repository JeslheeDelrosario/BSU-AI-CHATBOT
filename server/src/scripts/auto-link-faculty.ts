// server/src/scripts/auto-link-faculty.ts
// Run this script to auto-link all faculty to users by email matching
// Usage: npx ts-node src/scripts/auto-link-faculty.ts

import { prisma } from '../lib/prisma';

async function autoLinkFaculty() {
  try {
    console.log('🔗 Starting auto-link process...\n');

    // Get all faculty without userId
    const facultyWithoutUser = await prisma.faculty.findMany({
      where: { userId: null },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    console.log(`📊 Found ${facultyWithoutUser.length} faculty without user links\n`);

    if (facultyWithoutUser.length === 0) {
      console.log('✅ All faculty are already linked to users!');
      await prisma.$disconnect();
      return;
    }

    let linked = 0;
    let failed = 0;
    const results: any[] = [];

    // Try to link each faculty by email
    for (const faculty of facultyWithoutUser) {
      if (!faculty.email) {
        failed++;
        results.push({
          facultyId: faculty.id,
          name: `${faculty.firstName} ${faculty.lastName}`,
          status: 'FAILED',
          reason: 'No email on faculty record'
        });
        console.log(`❌ ${faculty.firstName} ${faculty.lastName} - No email`);
        continue;
      }

      const user = await prisma.user.findUnique({
        where: { email: faculty.email }
      });

      if (!user) {
        failed++;
        results.push({
          facultyId: faculty.id,
          name: `${faculty.firstName} ${faculty.lastName}`,
          email: faculty.email,
          status: 'FAILED',
          reason: 'No matching user with this email'
        });
        console.log(`❌ ${faculty.firstName} ${faculty.lastName} (${faculty.email}) - No matching user`);
        continue;
      }

      // Link faculty to user
      await prisma.faculty.update({
        where: { id: faculty.id },
        data: { userId: user.id }
      });

      linked++;
      results.push({
        facultyId: faculty.id,
        name: `${faculty.firstName} ${faculty.lastName}`,
        email: faculty.email,
        userId: user.id,
        status: 'SUCCESS'
      });
      console.log(`✅ ${faculty.firstName} ${faculty.lastName} (${faculty.email}) → ${user.email}`);
    }

    console.log(`\n📈 Results:`);
    console.log(`   ✅ Linked: ${linked}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Total: ${linked + failed}\n`);

    if (failed > 0) {
      console.log('⚠️  Failed faculty:');
      results.filter(r => r.status === 'FAILED').forEach(r => {
        console.log(`   - ${r.name} (${r.reason})`);
      });
    }

    console.log('\n✅ Auto-link process complete!');
    console.log('🔔 Notifications should now work for consultations.\n');

  } catch (error) {
    console.error('❌ Error during auto-link:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
autoLinkFaculty();
