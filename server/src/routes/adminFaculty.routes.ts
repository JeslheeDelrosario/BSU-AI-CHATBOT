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

// ADD faculty - Complete with all fields
router.post("/faculty", isAdmin, async (req: AuthRequest, res) => {
  try {
    const { 
      firstName, 
      middleName,
      lastName, 
      email, 
      position,
      college,
      officeHours,
      consultationDays,
      consultationStart,
      consultationEnd,
      vacantTime,
      subjectIds 
    } = req.body;

    const faculty = await prisma.faculty.create({
      data: {
        firstName,
        middleName: middleName?.trim() || null,
        lastName,
        email: email?.toLowerCase().trim() || null,
        position: position || 'Faculty',
        college: college || 'College of Science',
        officeHours: officeHours?.trim() || null,
        consultationDays: consultationDays || [],
        consultationStart: consultationStart || null,
        consultationEnd: consultationEnd || null,
        vacantTime: vacantTime?.trim() || null,
        subjects: {
          create: (subjectIds || []).map((id: string) => ({
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

    res.status(201).json(faculty);
  } catch (err) {
    console.error("Error creating faculty:", err);
    res.status(500).json({ error: "Failed to add faculty" });
  }
});

// UPDATE faculty - Complete with all fields
router.put("/faculty/:id", isAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { 
      firstName, 
      middleName,
      lastName, 
      email, 
      position,
      college,
      officeHours,
      consultationDays,
      consultationStart,
      consultationEnd,
      vacantTime,
      subjectIds 
    } = req.body;

    // Update main fields (only send fields that were provided)
    await prisma.faculty.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }),
        middleName: middleName !== undefined ? (middleName?.trim() || null) : undefined,
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email: email?.toLowerCase().trim() || null }),
        ...(position !== undefined && { position }),
        ...(college !== undefined && { college }),
        ...(officeHours !== undefined && { officeHours: officeHours?.trim() || null }),
        ...(consultationDays !== undefined && { consultationDays }),
        ...(consultationStart !== undefined && { consultationStart: consultationStart || null }),
        ...(consultationEnd !== undefined && { consultationEnd: consultationEnd || null }),
        ...(vacantTime !== undefined && { vacantTime: vacantTime?.trim() || null }),
      },
    });

    // Handle subjects update (reset + recreate)
    if (subjectIds !== undefined) {
      await prisma.facultySubject.deleteMany({
        where: { facultyId: id },
      });

      if (subjectIds.length > 0) {
        await prisma.facultySubject.createMany({
          data: subjectIds.map((sId: string) => ({
            facultyId: id,
            subjectId: sId,
          })),
        });
      }
    }

    // Return updated faculty with relations
    const updatedFaculty = await prisma.faculty.findUnique({
      where: { id },
      include: {
        subjects: {
          include: { subject: true },
        },
      },
    });

    res.json(updatedFaculty);
  } catch (err) {
    console.error("Error updating faculty:", err);
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
