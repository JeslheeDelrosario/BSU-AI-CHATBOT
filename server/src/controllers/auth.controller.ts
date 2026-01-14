// server\src\controllers\auth.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  learningStyle?: string;
  gradeLevel?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

// USER SIGNUP
export const register = async (req: Request<object, object, RegisterBody>, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { email, password, firstName, lastName, role, learningStyle, gradeLevel } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || UserRole.STUDENT,
        learningStyle: learningStyle as any,
        gradeLevel,
      },
    });

    // Create default accessibility settings for new users
    await prisma.accessibilitySettings.create({
      data: {
        userId: user.id,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        learningStyle: user.learningStyle,
        gradeLevel: user.gradeLevel,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// USER LOGIN
export const login = async (req: Request<object, object, LoginBody>, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accessibilitySettings: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Account is inactive' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // ✅ CREATE NEW CHAT SESSION AUTOMATICALLY ON LOGIN
    await prisma.chatSession.create({
      data: {
        userId: user.id,
        title: "New Chat",
        messages: [],
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        learningStyle: user.learningStyle,
        gradeLevel: user.gradeLevel,
        accessibilitySettings: user.accessibilitySettings,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};


// USER LOGOUT - Clean up empty chats
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Delete all empty chat sessions (no messages)
    await prisma.chatSession.deleteMany({
      where: {
        userId,
        messages: { equals: [] },
      },
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
};

// UPDATE USER PROFILE
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { firstName, lastName } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

// UPDATE ACCESSIBILITY SETTINGS
export const updateAccessibilitySettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { fontSize, fontFamily, colorScheme, textToSpeechEnabled, captionsEnabled, ttsSpeed } = req.body;

    // Upsert accessibility settings (create if not exists, update if exists)
    const settings = await prisma.accessibilitySettings.upsert({
      where: { userId },
      update: {
        ...(fontSize !== undefined && { fontSize }),
        ...(fontFamily && { fontFamily }),
        ...(colorScheme && { colorScheme }),
        ...(textToSpeechEnabled !== undefined && { textToSpeechEnabled }),
        ...(captionsEnabled !== undefined && { captionsEnabled }),
        ...(ttsSpeed !== undefined && { ttsSpeed }),
      },
      create: {
        userId,
        fontSize: fontSize || 16,
        fontFamily: fontFamily || 'Inter',
        colorScheme: colorScheme || 'default',
        textToSpeechEnabled: textToSpeechEnabled || false,
        captionsEnabled: captionsEnabled || false,
        ttsSpeed: ttsSpeed || 1.0,
      },
    });

    res.json({ settings, message: 'Accessibility settings updated successfully' });
  } catch (error) {
    console.error('Update accessibility settings error:', error);
    res.status(500).json({ error: 'Server error updating accessibility settings' });
  }
};

// USER DATA
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      include: {
        accessibilitySettings: true,
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      learningStyle: user.learningStyle,
      gradeLevel: user.gradeLevel,
      accessibilitySettings: user.accessibilitySettings,
      enrollments: user.enrollments,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error fetching user' });
  }
};
