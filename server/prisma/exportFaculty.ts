// server\prisma\exportFaculty.ts
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("📦 Exporting Faculty with relations...");

  const faculty = await prisma.faculty.findMany({
    include: {
      FacultySchedule: true,
      FacultySubject: true,
      // ⚠️ skip ConsultationBookings (usually transactional)
      User: true,
    },
  });

  const cleaned = faculty.map((f: any) => {
    return {
      // ❗ Remove auto/unsafe fields
      firstName: f.firstName,
      middleName: f.middleName,
      lastName: f.lastName,
      email: f.email,
      position: f.position,
      college: f.college,
      officeHours: f.officeHours,
      consultationDays: f.consultationDays,
      consultationStart: f.consultationStart,
      consultationEnd: f.consultationEnd,
      vacantTime: f.vacantTime,

      // Relations (optional to include)
      FacultySchedule: f.FacultySchedule,
      FacultySubject: f.FacultySubject,
    };
  });

  const filePath = path.join(__dirname, "backups", "faculty.json");

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2));

  console.log(`✅ Exported ${cleaned.length} faculty records`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
