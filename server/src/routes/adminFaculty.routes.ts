import { Router, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

// Middleware: only ADMIN can access
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ error: "Access denied - Admin only" });
    return; // <-- IMPORTANT
  }

  return next(); // <-- ALSO IMPORTANT
};


// GET all faculty
router.get("/faculty", isAdmin, async (_, res) => {
  try {
    const faculty = await prisma.faculty.findMany({
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    res.json(
      faculty.map((f) => ({
        ...f,
        subjects: f.subjects.map((s) => s.subject),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch faculty" });
  }
});

// GET subjects
router.get("/subjects", isAdmin, async (_, res) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// ADD faculty
router.post("/faculty", isAdmin, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, email, position, subjectIds } = req.body;

    const faculty = await prisma.faculty.create({
      data: {
        firstName,
        lastName,
        email,
        position,
        subjects: {
          create: subjectIds.map((id: string) => ({
            subjectId: id,
          })),
        },
      },
      include: {
        subjects: {
          include: { subject: true },
        },
      },
    });

    res.json(faculty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add faculty" });
  }
});

// UPDATE faculty
router.put("/faculty/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, position, subjectIds } = req.body;

    // Update main fields
    await prisma.faculty.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        position,
      },
    });

    // Reset subjects
    await prisma.facultySubject.deleteMany({
      where: { facultyId: id },
    });

    // Add new ones
    await prisma.facultySubject.createMany({
      data: subjectIds.map((sId: string) => ({
        facultyId: id,
        subjectId: sId,
      })),
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update faculty" });
  }
});

// DELETE faculty
router.delete("/faculty/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.facultySubject.deleteMany({
      where: { facultyId: id },
    });

    await prisma.faculty.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete faculty" });
  }
});

export default router;
