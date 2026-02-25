import { PrismaClient, AchievementType } from '@prisma/client';

const prisma = new PrismaClient();

const RANK_ACHIEVEMENTS = [
  {
    type: 'RANK_NEWCOMER' as AchievementType,
    title: 'Newcomer',
    description: 'Welcome to TISA! Account created and first login completed.',
    icon: '🌱',
    points: 10,
    requirementType: 'FIRST_LOGIN',
    requirementValue: 1,
  },
  {
    type: 'RANK_LEARNER' as AchievementType,
    title: 'Learner',
    description: 'Spent at least 1 hour learning in the system.',
    icon: '📖',
    points: 25,
    requirementType: 'TIME_SPENT',
    requirementValue: 1, // 1 hour
  },
  {
    type: 'RANK_EXPLORER' as AchievementType,
    title: 'Explorer',
    description: 'Completed 3 lessons or browsed 5 different courses.',
    icon: '🔍',
    points: 50,
    requirementType: 'LESSON_COMPLETION',
    requirementValue: 3,
  },
  {
    type: 'RANK_ACHIEVER' as AchievementType,
    title: 'Achiever',
    description: 'Completed 1 full course and accumulated 5 hours of learning time.',
    icon: '🏅',
    points: 100,
    requirementType: 'RANK_COMPOSITE',
    requirementValue: 105, // 1 course * 100 + 5 hours = 105
  },
  {
    type: 'RANK_SCHOLAR' as AchievementType,
    title: 'Scholar',
    description: 'Completed 3 courses and accumulated 10 hours of learning time.',
    icon: '🎓',
    points: 200,
    requirementType: 'RANK_COMPOSITE',
    requirementValue: 310, // 3 courses * 100 + 10 hours = 310
  },
  {
    type: 'RANK_EXPERT' as AchievementType,
    title: 'Expert',
    description: 'Completed 5 courses and accumulated 15 hours of learning time.',
    icon: '⭐',
    points: 350,
    requirementType: 'RANK_COMPOSITE',
    requirementValue: 515, // 5 courses * 100 + 15 hours = 515
  },
  {
    type: 'RANK_MASTER_SCHOLAR' as AchievementType,
    title: 'Master Scholar',
    description: 'Completed all courses offered by the system and accumulated 24+ hours of learning time.',
    icon: '👑',
    points: 500,
    requirementType: 'ALL_COURSES',
    requirementValue: 24, // 24 hours minimum
  },
];

export async function seedRankAchievements() {
  console.log('🎖️ Seeding Rank Achievement Definitions...');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const rank of RANK_ACHIEVEMENTS) {
    try {
      const existing = await prisma.achievementDefinition.findUnique({
        where: { type: rank.type },
      });

      if (existing) {
        // Update existing definition
        await prisma.achievementDefinition.update({
          where: { type: rank.type },
          data: {
            title: rank.title,
            description: rank.description,
            icon: rank.icon,
            points: rank.points,
            requirementType: rank.requirementType,
            requirementValue: rank.requirementValue,
            isActive: true,
          },
        });
        updated++;
        console.log(`  🔄 Updated rank: ${rank.title}`);
      } else {
        // Create new definition
        await prisma.achievementDefinition.create({
          data: {
            type: rank.type,
            title: rank.title,
            description: rank.description,
            icon: rank.icon,
            points: rank.points,
            requirementType: rank.requirementType,
            requirementValue: rank.requirementValue,
            isActive: true,
          },
        });
        created++;
        console.log(`  ✅ Created rank: ${rank.title}`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to seed rank: ${rank.title}`, error);
      skipped++;
    }
  }

  console.log(`✅ Rank Achievements: Created ${created}, Updated ${updated}, Skipped ${skipped}`);
}

export default seedRankAchievements;

// Run directly if executed as script
if (require.main === module) {
  seedRankAchievements()
    .then(() => {
      console.log('✅ Rank achievements seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
