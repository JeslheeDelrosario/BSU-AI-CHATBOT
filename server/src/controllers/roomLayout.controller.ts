import { Request, Response } from 'express';
import { PrismaClient, FurnitureType } from '@prisma/client';

const prisma = new PrismaClient();

// Get room layout with furniture
export const getRoomLayout = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        Layout: {
          include: {
            Furniture: {
              orderBy: { zIndex: 'asc' }
            }
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // If no layout exists, create a default one
    if (!room.Layout) {
      const defaultLayout = await createDefaultLayout(roomId, room.type);
      return res.json(defaultLayout);
    }

    return res.json(room.Layout);
  } catch (error) {
    console.error('Error fetching room layout:', error);
    return res.status(500).json({ error: 'Failed to fetch room layout' });
  }
};

// Create default layout based on room type
async function createDefaultLayout(roomId: string, roomType: string) {
  const layout = await prisma.roomLayout.create({
    data: {
      roomId,
      width: 600,
      height: 400,
      wallColor: '#1e293b',
      floorColor: '#0f172a',
      floorPattern: 'grid',
      backgroundSound: 'ambient_classroom'
    }
  });

  // Add default furniture based on room type
  const defaultFurniture = getDefaultFurniture(roomType, layout.id);
  
  if (defaultFurniture.length > 0) {
    await prisma.roomFurniture.createMany({
      data: defaultFurniture
    });
  }

  return prisma.roomLayout.findUnique({
    where: { id: layout.id },
    include: {
      Furniture: {
        orderBy: { zIndex: 'asc' }
      }
    }
  });
}

function getDefaultFurniture(roomType: string, layoutId: string) {
  const furniture: Array<{
    layoutId: string;
    type: FurnitureType;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    color: string;
    zIndex: number;
    isLocked: boolean;
  }> = [];

  // Common items for all rooms
  furniture.push({
    layoutId,
    type: 'WHITEBOARD',
    name: 'Whiteboard',
    x: 200,
    y: 10,
    width: 200,
    height: 30,
    rotation: 0,
    color: '#f8fafc',
    zIndex: 1,
    isLocked: false
  });

  furniture.push({
    layoutId,
    type: 'DOOR',
    name: 'Exit Door',
    x: 550,
    y: 360,
    width: 40,
    height: 30,
    rotation: 0,
    color: '#78350f',
    zIndex: 1,
    isLocked: true
  });

  // Add desks based on room type
  if (roomType === 'CLASSROOM' || roomType === 'LECTURE_HALL') {
    // Teacher desk
    furniture.push({
      layoutId,
      type: 'DESK',
      name: 'Teacher Desk',
      x: 250,
      y: 50,
      width: 100,
      height: 40,
      rotation: 0,
      color: '#92400e',
      zIndex: 2,
      isLocked: false
    });

    // Student desks in grid
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        furniture.push({
          layoutId,
          type: 'DESK',
          name: `Desk ${row * 5 + col + 1}`,
          x: 40 + col * 110,
          y: 120 + row * 70,
          width: 50,
          height: 35,
          rotation: 0,
          color: '#374151',
          zIndex: 1,
          isLocked: false
        });

        // Chair for each desk
        furniture.push({
          layoutId,
          type: 'CHAIR',
          name: `Chair ${row * 5 + col + 1}`,
          x: 55 + col * 110,
          y: 155 + row * 70,
          width: 20,
          height: 20,
          rotation: 0,
          color: '#1f2937',
          zIndex: 2,
          isLocked: false
        });
      }
    }
  } else if (roomType === 'COMPUTER_LAB' || roomType === 'LABORATORY') {
    // Computer stations
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        furniture.push({
          layoutId,
          type: 'COMPUTER',
          name: `Computer ${row * 6 + col + 1}`,
          x: 30 + col * 95,
          y: 80 + row * 100,
          width: 45,
          height: 35,
          rotation: 0,
          color: '#1e3a5f',
          zIndex: 1,
          isLocked: false
        });

        furniture.push({
          layoutId,
          type: 'CHAIR',
          name: `Chair ${row * 6 + col + 1}`,
          x: 40 + col * 95,
          y: 120 + row * 100,
          width: 20,
          height: 20,
          rotation: 0,
          color: '#1f2937',
          zIndex: 2,
          isLocked: false
        });
      }
    }
  } else if (roomType === 'CONFERENCE') {
    // Conference table
    furniture.push({
      layoutId,
      type: 'TABLE',
      name: 'Conference Table',
      x: 150,
      y: 120,
      width: 300,
      height: 120,
      rotation: 0,
      color: '#78350f',
      zIndex: 1,
      isLocked: false
    });

    // Chairs around table
    for (let i = 0; i < 5; i++) {
      furniture.push({
        layoutId,
        type: 'CHAIR',
        name: `Chair ${i + 1}`,
        x: 170 + i * 55,
        y: 95,
        width: 25,
        height: 25,
        rotation: 180,
        color: '#1f2937',
        zIndex: 2,
        isLocked: false
      });

      furniture.push({
        layoutId,
        type: 'CHAIR',
        name: `Chair ${i + 6}`,
        x: 170 + i * 55,
        y: 245,
        width: 25,
        height: 25,
        rotation: 0,
        color: '#1f2937',
        zIndex: 2,
        isLocked: false
      });
    }
  } else if (roomType === 'LIBRARY' || roomType === 'STUDY_ROOM') {
    // Bookshelves
    for (let i = 0; i < 3; i++) {
      furniture.push({
        layoutId,
        type: 'BOOKSHELF',
        name: `Bookshelf ${i + 1}`,
        x: 20,
        y: 50 + i * 110,
        width: 30,
        height: 90,
        rotation: 0,
        color: '#78350f',
        zIndex: 1,
        isLocked: false
      });
    }

    // Study tables
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        furniture.push({
          layoutId,
          type: 'TABLE',
          name: `Study Table ${row * 3 + col + 1}`,
          x: 100 + col * 160,
          y: 80 + row * 150,
          width: 120,
          height: 60,
          rotation: 0,
          color: '#374151',
          zIndex: 1,
          isLocked: false
        });

        // 4 chairs per table
        furniture.push({
          layoutId,
          type: 'CHAIR',
          name: `Chair ${(row * 3 + col) * 4 + 1}`,
          x: 115 + col * 160,
          y: 55 + row * 150,
          width: 20,
          height: 20,
          rotation: 180,
          color: '#1f2937',
          zIndex: 2,
          isLocked: false
        });

        furniture.push({
          layoutId,
          type: 'CHAIR',
          name: `Chair ${(row * 3 + col) * 4 + 2}`,
          x: 175 + col * 160,
          y: 55 + row * 150,
          width: 20,
          height: 20,
          rotation: 180,
          color: '#1f2937',
          zIndex: 2,
          isLocked: false
        });

        furniture.push({
          layoutId,
          type: 'CHAIR',
          name: `Chair ${(row * 3 + col) * 4 + 3}`,
          x: 115 + col * 160,
          y: 145 + row * 150,
          width: 20,
          height: 20,
          rotation: 0,
          color: '#1f2937',
          zIndex: 2,
          isLocked: false
        });

        furniture.push({
          layoutId,
          type: 'CHAIR',
          name: `Chair ${(row * 3 + col) * 4 + 4}`,
          x: 175 + col * 160,
          y: 145 + row * 150,
          width: 20,
          height: 20,
          rotation: 0,
          color: '#1f2937',
          zIndex: 2,
          isLocked: false
        });
      }
    }
  }

  return furniture;
}

// Update room layout settings
export const updateRoomLayout = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { width, height, wallColor, floorColor, floorPattern, backgroundSound } = req.body;

    let layout = await prisma.roomLayout.findUnique({
      where: { roomId }
    });

    if (!layout) {
      layout = await prisma.roomLayout.create({
        data: {
          roomId,
          width: width || 600,
          height: height || 400,
          wallColor: wallColor || '#1e293b',
          floorColor: floorColor || '#0f172a',
          floorPattern: floorPattern || 'grid',
          backgroundSound
        }
      });
    } else {
      layout = await prisma.roomLayout.update({
        where: { roomId },
        data: {
          ...(width !== undefined && { width }),
          ...(height !== undefined && { height }),
          ...(wallColor !== undefined && { wallColor }),
          ...(floorColor !== undefined && { floorColor }),
          ...(floorPattern !== undefined && { floorPattern }),
          ...(backgroundSound !== undefined && { backgroundSound })
        }
      });
    }

    return res.json(layout);
  } catch (error) {
    console.error('Error updating room layout:', error);
    return res.status(500).json({ error: 'Failed to update room layout' });
  }
};

// Add furniture to room
export const addFurniture = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { type, name, x, y, width, height, rotation, color, zIndex, metadata } = req.body;

    let layout = await prisma.roomLayout.findUnique({
      where: { roomId }
    });

    if (!layout) {
      layout = await prisma.roomLayout.create({
        data: { roomId }
      });
    }

    const furniture = await prisma.roomFurniture.create({
      data: {
        layoutId: layout.id,
        type: type as FurnitureType,
        name: name || type,
        x: x || 100,
        y: y || 100,
        width: width || 50,
        height: height || 50,
        rotation: rotation || 0,
        color,
        zIndex: zIndex || 1,
        metadata
      }
    });

    return res.status(201).json(furniture);
  } catch (error) {
    console.error('Error adding furniture:', error);
    return res.status(500).json({ error: 'Failed to add furniture' });
  }
};

// Update furniture position/properties
export const updateFurniture = async (req: Request, res: Response) => {
  try {
    const { furnitureId } = req.params;
    const { x, y, width, height, rotation, color, zIndex, name, isLocked, metadata } = req.body;

    const furniture = await prisma.roomFurniture.update({
      where: { id: furnitureId },
      data: {
        ...(x !== undefined && { x }),
        ...(y !== undefined && { y }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        ...(rotation !== undefined && { rotation }),
        ...(color !== undefined && { color }),
        ...(zIndex !== undefined && { zIndex }),
        ...(name !== undefined && { name }),
        ...(isLocked !== undefined && { isLocked }),
        ...(metadata !== undefined && { metadata })
      }
    });

    return res.json(furniture);
  } catch (error) {
    console.error('Error updating furniture:', error);
    return res.status(500).json({ error: 'Failed to update furniture' });
  }
};

// Delete furniture
export const deleteFurniture = async (req: Request, res: Response) => {
  try {
    const { furnitureId } = req.params;

    await prisma.roomFurniture.delete({
      where: { id: furnitureId }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting furniture:', error);
    return res.status(500).json({ error: 'Failed to delete furniture' });
  }
};

// Bulk update furniture positions (for drag operations)
export const bulkUpdateFurniture = async (req: Request, res: Response) => {
  try {
    const { furniture } = req.body;

    if (!Array.isArray(furniture)) {
      return res.status(400).json({ error: 'Furniture must be an array' });
    }

    const updates = furniture.map((item: { id: string; x?: number; y?: number; rotation?: number; zIndex?: number }) =>
      prisma.roomFurniture.update({
        where: { id: item.id },
        data: {
          ...(item.x !== undefined && { x: item.x }),
          ...(item.y !== undefined && { y: item.y }),
          ...(item.rotation !== undefined && { rotation: item.rotation }),
          ...(item.zIndex !== undefined && { zIndex: item.zIndex })
        }
      })
    );

    await prisma.$transaction(updates);

    return res.json({ success: true, updated: furniture.length });
  } catch (error) {
    console.error('Error bulk updating furniture:', error);
    return res.status(500).json({ error: 'Failed to bulk update furniture' });
  }
};

// Get room chat messages
export const getRoomChatMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    const messages = await prisma.roomChatMessage.findMany({
      where: {
        roomId,
        ...(before && { createdAt: { lt: new Date(before as string) } })
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(parseInt(limit as string) || 50, 100),
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    return res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
};

// Send chat message
export const sendChatMessage = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { message, sender } = req.body;
    const userId = (req as any).user?.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const chatMessage = await prisma.roomChatMessage.create({
      data: {
        roomId,
        userId: userId || null,
        sender: sender || 'Anonymous',
        message: message.trim(),
        isSystem: false
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    return res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Error sending chat message:', error);
    return res.status(500).json({ error: 'Failed to send chat message' });
  }
};

// Clear room chat (admin only)
export const clearRoomChat = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    await prisma.roomChatMessage.deleteMany({
      where: { roomId }
    });

    // Add system message
    await prisma.roomChatMessage.create({
      data: {
        roomId,
        sender: 'System',
        message: 'Chat history has been cleared by an administrator.',
        isSystem: true
      }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error clearing chat:', error);
    return res.status(500).json({ error: 'Failed to clear chat' });
  }
};

// Get furniture templates (pre-built items)
export const getFurnitureTemplates = async (_req: Request, res: Response) => {
  const templates = [
    // Seating
    { type: 'CHAIR', name: 'Student Chair', width: 20, height: 20, color: '#1f2937', category: 'Seating' },
    { type: 'CHAIR', name: 'Office Chair', width: 25, height: 25, color: '#374151', category: 'Seating' },
    { type: 'CHAIR', name: 'Armchair', width: 30, height: 30, color: '#4b5563', category: 'Seating' },
    
    // Tables & Desks
    { type: 'DESK', name: 'Student Desk', width: 50, height: 35, color: '#374151', category: 'Tables' },
    { type: 'DESK', name: 'Teacher Desk', width: 100, height: 50, color: '#92400e', category: 'Tables' },
    { type: 'TABLE', name: 'Round Table', width: 80, height: 80, color: '#78350f', category: 'Tables' },
    { type: 'TABLE', name: 'Conference Table', width: 200, height: 80, color: '#78350f', category: 'Tables' },
    { type: 'TABLE', name: 'Lab Table', width: 120, height: 60, color: '#1e3a5f', category: 'Tables' },
    
    // Technology
    { type: 'COMPUTER', name: 'Desktop Computer', width: 45, height: 35, color: '#1e3a5f', category: 'Technology' },
    { type: 'PROJECTOR_SCREEN', name: 'Projector Screen', width: 200, height: 20, color: '#f8fafc', category: 'Technology' },
    { type: 'WHITEBOARD', name: 'Whiteboard', width: 200, height: 30, color: '#f8fafc', category: 'Technology' },
    { type: 'BOARD', name: 'Bulletin Board', width: 120, height: 80, color: '#92400e', category: 'Technology' },
    
    // Storage
    { type: 'BOOKSHELF', name: 'Bookshelf', width: 30, height: 90, color: '#78350f', category: 'Storage' },
    { type: 'CABINET', name: 'Filing Cabinet', width: 40, height: 50, color: '#6b7280', category: 'Storage' },
    
    // Room Elements
    { type: 'DOOR', name: 'Door', width: 40, height: 30, color: '#78350f', category: 'Room Elements' },
    { type: 'WINDOW', name: 'Window', width: 80, height: 15, color: '#60a5fa', category: 'Room Elements' },
    { type: 'PODIUM', name: 'Podium', width: 40, height: 40, color: '#78350f', category: 'Room Elements' },
    
    // Decorative
    { type: 'PLANT', name: 'Potted Plant', width: 25, height: 25, color: '#22c55e', category: 'Decorative' },
    { type: 'CLOCK', name: 'Wall Clock', width: 20, height: 20, color: '#f8fafc', category: 'Decorative' }
  ];

  return res.json(templates);
};

// Reset room layout to default
export const resetRoomLayout = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { Layout: true }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Delete existing layout and furniture
    if (room.Layout) {
      await prisma.roomLayout.delete({
        where: { id: room.Layout.id }
      });
    }

    // Create new default layout
    const newLayout = await createDefaultLayout(roomId, room.type);

    return res.json(newLayout);
  } catch (error) {
    console.error('Error resetting room layout:', error);
    return res.status(500).json({ error: 'Failed to reset room layout' });
  }
};
