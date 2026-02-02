import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { TaskStatus, TaskPriority, TaskCategory } from '@prisma/client';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status, priority, category, classroomId, sortBy = 'dueDate', order = 'asc' } = req.query;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (category) {
      where.category = category;
    }

    if (classroomId) {
      where.classroomId = classroomId;
    }

    const orderBy: any = {};
    if (sortBy === 'dueDate') {
      orderBy.dueDate = order;
    } else if (sortBy === 'priority') {
      orderBy.priority = order;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = order;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        Classroom: {
          select: {
            id: true,
            name: true,
            section: true
          }
        }
      },
      orderBy
    });

    return res.json({
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        Classroom: {
          select: {
            id: true,
            name: true,
            section: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json(task);
  } catch (error) {
    console.error('Get task by ID error:', error);
    return res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, description, priority, status, dueDate, category, tags, classroomId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (priority && !Object.values(TaskPriority).includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    if (status && !Object.values(TaskStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (category && !Object.values(TaskCategory).includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const task = await prisma.task.create({
      data: {
        userId,
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        category: category || 'PERSONAL',
        tags: tags || [],
        classroomId: classroomId || null
      },
      include: {
        Classroom: {
          select: {
            id: true,
            name: true,
            section: true
          }
        }
      }
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { title, description, priority, status, dueDate, category, tags, classroomId } = req.body;

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'COMPLETED' && !task.completedAt) {
        updateData.completedAt = new Date();
      } else if (status !== 'COMPLETED' && task.completedAt) {
        updateData.completedAt = null;
      }
    }
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (classroomId !== undefined) updateData.classroomId = classroomId;

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        Classroom: {
          select: {
            id: true,
            name: true,
            section: true
          }
        }
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.task.delete({
      where: { id }
    });

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
};

export const completeTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      },
      include: {
        Classroom: {
          select: {
            id: true,
            name: true,
            section: true
          }
        }
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error('Complete task error:', error);
    return res.status(500).json({ error: 'Failed to complete task' });
  }
};

export const bulkCreateTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }

    const createdTasks = await Promise.all(
      tasks.map(task =>
        prisma.task.create({
          data: {
            userId,
            title: task.title.trim(),
            description: task.description?.trim() || null,
            priority: task.priority || 'MEDIUM',
            status: task.status || 'TODO',
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            category: task.category || 'PERSONAL',
            tags: task.tags || [],
            classroomId: task.classroomId || null
          }
        })
      )
    );

    return res.status(201).json({
      tasks: createdTasks,
      count: createdTasks.length
    });
  } catch (error) {
    console.error('Bulk create tasks error:', error);
    return res.status(500).json({ error: 'Failed to create tasks' });
  }
};

export const getClassroomTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { classroomId } = req.params;

    const member = await prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId,
          userId
        }
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this classroom' });
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        classroomId
      },
      include: {
        Classroom: {
          select: {
            id: true,
            name: true,
            section: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    return res.json({
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Get classroom tasks error:', error);
    return res.status(500).json({ error: 'Failed to fetch classroom tasks' });
  }
};
