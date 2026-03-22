// server/prisma/exportCurriculum.ts
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("📦 Starting CurriculumEntry export...");

  try {
    const entries = await prisma.curriculumEntry.findMany({
      
      orderBy: [
        { programId: "asc" },
        { yearLevel: "asc" },
        { semester: "asc" },
        { courseCode: "asc" },
      ],
    });

    if (entries.length === 0) {
      console.log("No CurriculumEntry records found.");
      return;
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")[0];
    const backupDir = path.join(__dirname, "backups");

    fs.mkdirSync(backupDir, { recursive: true });

    // ────────────────────────────────────────────────
    // 1. JSON export (recommended for full fidelity)
    // ────────────────────────────────────────────────
    const jsonData = entries.map((e) => ({
      id: e.id,
      programId: e.programId,
      program: e.UniversityProgram
        ? {
            id: e.UniversityProgram.id,
            code: e.UniversityProgram.code || null,
            name: e.UniversityProgram.name || null,
          }
        : null,
      yearLevel: e.yearLevel,
      semester: e.semester,
      courseCode: e.courseCode,
      subjectName: e.subjectName,
      lec: e.lec,
      lab: e.lab,
      totalUnits: e.totalUnits,
      lecHours: e.lecHours,
      labHours: e.labHours,
      totalHours: e.totalHours,
      prerequisites: e.prerequisites,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));

    const jsonPath = path.join(
      backupDir,
      `curriculum-entries_${timestamp}.json`,
    );
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), "utf-8");
    console.log(`JSON exported: ${entries.length} entries → ${jsonPath}`);

    console.log("Export completed successfully.");
  } catch (err) {
    console.error("Export failed:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
