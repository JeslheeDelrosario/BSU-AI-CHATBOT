// prisma/seed2.ts   (or wherever you keep seeds)
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CurriculumEntry seeding...");

  const backupDir = path.join(__dirname, "backups");
  const filename = "curriculum-entries_2026-03-21.json"; // ← UPDATE THIS
  const filePath = path.join(backupDir, filename);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.error("Make sure the export file exists in /backups/ folder");
    process.exit(1);
  }

  try {
    const rawData = fs.readFileSync(filePath, "utf-8");
    const entries: any[] = JSON.parse(rawData);

    if (!Array.isArray(entries) || entries.length === 0) {
      console.log("⚠️ No entries found in the JSON file.");
      return;
    }

    console.log(`→ Found ${entries.length} entries in ${filename}`);

    // ─────────────────────────────────────────────
    // Optional: Clear existing data (ONLY for dev/test!)
    const shouldClear = false; // ← CHANGE TO true ONLY when you really want to wipe
    if (shouldClear) {
      console.warn("⚠️ Deleting all existing CurriculumEntry records...");
      const deleted = await prisma.curriculumEntry.deleteMany({});
      console.log(`   → Deleted ${deleted.count} old records`);
    }

    // ─────────────────────────────────────────────
    // Prepare data (with safe date conversion)
    const dataToInsert = entries.map((e) => {
      // Basic validation / defaults
      return {
        id: e.id, // keep original ID (cuid) for continuity
        programId: String(e.programId),
        yearLevel: Number(e.yearLevel),
        semester: Number(e.semester),
        courseCode: String(e.courseCode),
        subjectName: String(e.subjectName),
        lec: Number(e.lec ?? 0),
        lab: Number(e.lab ?? 0),
        totalUnits: Number(e.totalUnits ?? 0),
        lecHours: Number(e.lecHours ?? 0),
        labHours: Number(e.labHours ?? 0),
        totalHours: Number(e.totalHours ?? 0),
        prerequisites: Array.isArray(e.prerequisites) ? e.prerequisites : [],
        // Optional: preserve exact timestamps
        // createdAt: e.createdAt ? new Date(e.createdAt) : undefined,
        // updatedAt: e.updatedAt ? new Date(e.updatedAt) : undefined,
      };
    });

    // ─────────────────────────────────────────────
    console.log("Inserting records...");
    const result = await prisma.curriculumEntry.createMany({
      data: dataToInsert,
      skipDuplicates: true, // skips if id already exists
    });

    console.log(`✅ Successfully seeded/upserted ${result.count} entries`);

    // Optional: verify count
    const finalCount = await prisma.curriculumEntry.count();
    console.log(`   Total CurriculumEntry records now: ${finalCount}`);
  } catch (err: any) {
    console.error("Seeding failed:");
    console.error(err.message || err);
    if (err.meta) console.error("Meta:", err.meta);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
