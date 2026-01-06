// server/src/controllers/chat-session.controller.ts

import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

type Message = { role: 'user' | 'ai'; content: string };

// ===============================
// Helper: enforce max 20 sessions
// ===============================
const enforceChatLimit = async (userId: string) => {
  const sessions = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' }
  });

  if (sessions.length > 20) {
    const excess = sessions.slice(20); // delete the oldest
    await prisma.chatSession.deleteMany({
      where: { id: { in: excess.map(s => s.id) } }
    });
  }
};

// ===============================
// GET all chat sessions
// ===============================
export const listChatSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json(sessions);
  } catch (err) {
    console.error('listChatSessions error', err);
    return res.status(500).json({ error: 'Unable to fetch chat sessions' });
  }
};



// ===============================
// CREATE a chat session
// ===============================
export const createChatSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title = 'New Chat', messages = [] } = req.body;

    const session = await prisma.chatSession.create({
      data: {
        userId,
        title,
        messages,
      },
    });

    // Enforce 20-chat limit
    await enforceChatLimit(userId);

    return res.status(201).json(session);
  } catch (err) {
    console.error('createChatSession error', err);
    return res.status(500).json({ error: 'Unable to create chat session' });
  }
};

// ===============================
// GET single chat
// ===============================
export const getChatSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const session = await prisma.chatSession.findUnique({ where: { id } });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    return res.json(session);
  } catch (err) {
    console.error('getChatSession error', err);
    return res.status(500).json({ error: 'Unable to fetch chat session' });
  }
};

// ===============================
// UPDATE chat (messages or title)
// Auto-delete if 0 messages
// ===============================
export const updateChatSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, messages } = req.body;

    const existing = await prisma.chatSession.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Auto-delete empty chat
    if (messages?.length === 0) {
      await prisma.chatSession.delete({ where: { id } });
      return res.json({ deleted: true });
    }

    const updated = await prisma.chatSession.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        messages: messages ?? existing.messages,
      },
    });

    // Enforce 20-chat limit
    await enforceChatLimit(userId);

    return res.json(updated);
  } catch (err) {
    console.error('updateChatSession error', err);
    return res.status(500).json({ error: 'Unable to update chat session' });
  }
};

// ===============================
// RENAME chat only
// ===============================
export const renameChatSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title } = req.body;

    if (!title || title.trim().length === 0)
      return res.status(400).json({ error: "Title required" });

    const existing = await prisma.chatSession.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId)
      return res.status(404).json({ error: "Chat not found" });

    const updated = await prisma.chatSession.update({
      where: { id },
      data: { title }
    });

    return res.json(updated);
  } catch (err) {
    console.error("renameChatSession error", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// DELETE chat
// ===============================
export const deleteChatSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.chatSession.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    await prisma.chatSession.delete({ where: { id } });

    return res.json({ success: true });
  } catch (err) {
    console.error('deleteChatSession error', err);
    return res.status(500).json({ error: 'Unable to delete chat session' });
  }
};
