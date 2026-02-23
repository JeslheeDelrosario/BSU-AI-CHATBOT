// server/src/scripts/seed-leaderboards.ts
// Run: npx ts-node -r tsconfig-paths/register src/scripts/seed-leaderboards.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎮 Seeding mock leaderboard configs and data...\n');

  // ── 1. Seed LeaderboardConfig entries ────────────────────────────────────
  const configs = [
    { name: 'Top Course Completers', metric: 'COURSE_COMPLETION', topN: 10 },
    { name: 'Quiz Champions', metric: 'QUIZ_SCORE', topN: 10 },
    { name: 'Answer Masters', metric: 'CORRECT_ANSWERS', topN: 10 },
    { name: 'Achievement Leaders', metric: 'ACHIEVEMENT_POINTS', topN: 10 },
  ];

  for (const cfg of configs) {
    const existing = await prisma.leaderboardConfig.findFirst({ where: { name: cfg.name } });
    if (!existing) {
      await prisma.leaderboardConfig.create({ data: cfg });
      console.log(`✅ Created leaderboard config: ${cfg.name}`);
    } else {
      console.log(`⏭️  Skipped (exists): ${cfg.name}`);
    }
  }

  // ── 2. Fetch existing users to attach mock data ───────────────────────────
  const users = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, firstName: true, lastName: true },
    take: 20,
  });

  if (users.length === 0) {
    console.log('\n⚠️  No STUDENT users found. Skipping mock progress/achievement data.');
    return;
  }

  console.log(`\n👥 Found ${users.length} student(s). Seeding mock data...\n`);

  // ── 3. Seed mock Achievements (points-based) ──────────────────────────────
  // Ensure at least one AchievementDefinition exists for MILESTONE type
  let milestoneType = await prisma.achievementDefinition.findFirst({
    where: { isActive: true },
  });

  if (!milestoneType) {
    milestoneType = await prisma.achievementDefinition.create({
      data: {
        type: 'MILESTONE',
        title: 'Milestone Achiever',
        description: 'Completed 10 lessons',
        icon: '🌟',
        points: 30,
        requirementType: 'LESSON_COMPLETION',
        requirementValue: 10,
      },
    });
    console.log('✅ Created fallback AchievementDefinition (MILESTONE)');
  }

  const pointsPool = [300, 250, 200, 175, 150, 120, 100, 80, 60, 40, 30, 20, 15, 10, 5];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const points = pointsPool[i] ?? Math.floor(Math.random() * 50) + 5;

    // Check if user already has any achievement
    const existingAch = await prisma.achievement.findFirst({ where: { userId: user.id } });
    if (!existingAch) {
      await prisma.achievement.create({
        data: {
          userId: user.id,
          type: milestoneType.type,
          title: milestoneType.title,
          description: milestoneType.description,
          icon: milestoneType.icon,
          points,
          definitionId: milestoneType.id,
        },
      });
      console.log(`  🏆 Achievement (${points} pts) → ${user.firstName} ${user.lastName}`);
    } else {
      console.log(`  ⏭️  Achievement exists for ${user.firstName} ${user.lastName}`);
    }
  }

  // ── 4. Seed mock Enrollments (COMPLETED) for course completion metric ─────
  const courses = await prisma.course.findMany({ select: { id: true }, take: 5 });

  if (courses.length > 0) {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const completedCount = Math.max(1, pointsPool.length - i); // top users complete more
      const coursesToComplete = courses.slice(0, Math.min(completedCount, courses.length));

      for (const course of coursesToComplete) {
        const existing = await prisma.enrollment.findFirst({
          where: { userId: user.id, courseId: course.id },
        });
        if (!existing) {
          await prisma.enrollment.create({
            data: {
              userId: user.id,
              courseId: course.id,
              status: 'COMPLETED',
            },
          });
        } else if (existing.status !== 'COMPLETED') {
          await prisma.enrollment.update({
            where: { id: existing.id },
            data: { status: 'COMPLETED' },
          });
        }
      }
      console.log(`  📚 Enrollments (${coursesToComplete.length} completed) → ${user.firstName} ${user.lastName}`);
    }
  } else {
    console.log('  ⚠️  No courses found — skipping enrollment mock data.');
  }

  // ── 5. Seed mock AssessmentResults (quiz scores + correct answers) ────────
  const assessments = await prisma.assessment.findMany({ select: { id: true }, take: 5 });

  if (assessments.length > 0) {
    const scorePool = [98, 95, 92, 88, 85, 82, 78, 75, 70, 65, 60, 55, 50, 45, 40];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const score = scorePool[i] ?? Math.floor(Math.random() * 60) + 30;
      const correctCount = Math.floor((score / 100) * 20); // 20 questions total
      const answers = Array.from({ length: 20 }, (_, idx) => ({
        questionId: `mock-q-${idx}`,
        correct: idx < correctCount,
      }));

      const assessment = assessments[i % assessments.length];
      const existing = await prisma.assessmentResult.findFirst({
        where: { userId: user.id, assessmentId: assessment.id },
      });

      if (!existing) {
        await prisma.assessmentResult.create({
          data: {
            userId: user.id,
            assessmentId: assessment.id,
            score,
            passed: score >= 75,
            timeSpent: Math.floor(Math.random() * 1800) + 300, // 5-35 min in seconds
            answers: JSON.stringify(answers),
          },
        });
        console.log(`  📝 AssessmentResult (score: ${score}%) → ${user.firstName} ${user.lastName}`);
      } else {
        console.log(`  ⏭️  AssessmentResult exists for ${user.firstName} ${user.lastName}`);
      }
    }
  } else {
    console.log('  ⚠️  No assessments found — skipping assessment result mock data.');
  }

  console.log('\n✅ Mock leaderboard seeding complete!');
  console.log('👉 Visit /leaderboard in the app to see the results.');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
