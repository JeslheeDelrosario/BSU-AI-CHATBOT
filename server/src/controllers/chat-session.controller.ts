// server/src/controllers/chat-session.controller.ts
/**
 * ChatSession controller
 * - Uses ChatSession Prisma model (see server/prisma/schema.prisma)
 * - Auth middleware attaches user to req.user (req.user.id)
 *
 * Endpoints provided:
 * GET    /api/chat-sessions         -> list user's chat sessions (newest first)
 * POST   /api/chat-sessions         -> create new chat session
 * GET    /api/chat-sessions/:id     -> get single chat session (ownership enforced)
 * PUT    /api/chat-sessions/:id     -> update chat session (title/messages)
 * DELETE /api/chat-sessions/:id     -> delete chat session (ownership enforced)
 */

import { Response } from 'express';

import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

type Message = { role: 'user' | 'ai'; content: string };

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

export const createChatSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title = 'New Chat', messages = [] } = req.body;
    // messages should be an array; we trust client but sanitize minimally
    const session = await prisma.chatSession.create({
      data: {
        userId,
        title,
        messages,
      },
    });
    return res.status(201).json(session);
  } catch (err) {
    console.error('createChatSession error', err);
    return res.status(500).json({ error: 'Unable to create chat session' });
  }
};

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

export const updateChatSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, messages } = req.body;

    const existing = await prisma.chatSession.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    const updated = await prisma.chatSession.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        messages: messages ?? existing.messages,
      },
    });

    return res.json(updated);
  } catch (err) {
    console.error('updateChatSession error', err);
    return res.status(500).json({ error: 'Unable to update chat session' });
  }
};

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
