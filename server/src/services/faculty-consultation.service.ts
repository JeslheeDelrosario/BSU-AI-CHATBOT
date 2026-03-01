// server/src/services/faculty-consultation.service.ts
// Faculty Recognition and Consultation Booking Service for AI-Tutor
// Production-grade implementation with caching, validation, and analytics
// Principal Engineer Standards: SOLID, DRY, comprehensive error handling

import { prisma } from '../lib/prisma';
import { CacheService } from './cache.service';
import { ConsultationStatus } from '@prisma/client';

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  FACULTY_LIST: 3600,        // 1 hour for full faculty list
  FACULTY_DETAIL: 1800,      // 30 minutes for individual faculty
  CONSULTATION_SLOTS: 300,   // 5 minutes for available slots (more dynamic)
  BOOKINGS: 300,             // 5 minutes for bookings
};

// Cache key prefixes
const CACHE_KEYS = {
  FACULTY_ALL: 'faculty:all',
  FACULTY_BY_ID: 'faculty:id:',
  FACULTY_BY_NAME: 'faculty:name:',
  FACULTY_CONSULTATION: 'faculty:consultation:',
  AVAILABLE_SLOTS: 'slots:',
  BOOKINGS: 'bookings:',
  LOCKED_SLOTS: 'locked:',
  BOOKING_HISTORY: 'history:',
};

// Booking validation constants
const BOOKING_RULES = {
  MIN_ADVANCE_HOURS: 2,           // Minimum hours before booking
  MAX_ADVANCE_DAYS: 30,           // Maximum days in advance
  MAX_ACTIVE_BOOKINGS: 3,         // Max active bookings per student
  SLOT_DURATION_MINUTES: 30,      // Default slot duration
  CANCELLATION_WINDOW_HOURS: 24,  // Hours before booking to allow cancellation
};

export interface FacultyInfo {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  position: string;
  college: string;
  email?: string;
  officeHours?: string;
  consultationDays: string[];
  consultationStart?: string;
  consultationEnd?: string;
  vacantTime?: string;
}

export interface ConsultationSlot {
  date: string;
  dayName: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  existingBooking?: {
    id: string;
    topic: string;
    status: string;
  };
}

export interface BookingInfo {
  id: string;
  facultyId: string;
  facultyName: string;
  studentId?: string;
  studentName?: string;
  date: Date;
  startTime: string;
  endTime: string;
  topic: string;
  status: string;
  meetingLink?: string;
  location?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BookingHistoryEntry {
  id: string;
  facultyId: string;
  facultyName: string;
  studentId: string;
  studentName: string;
  date: Date;
  startTime: string;
  endTime: string;
  topic: string;
  status: string;
  createdAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
}

export interface LockedSlot {
  facultyId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  lockedBy: string;
  lockedAt: Date;
  expiresAt?: Date;
}

// Context for pronoun resolution
interface ConversationContext {
  lastMentionedFaculty?: FacultyInfo;
  lastMentionedFacultyId?: string;
  timestamp: number;
}

// In-memory context store (per user session)
const conversationContexts: Map<string, ConversationContext> = new Map();

/**
 * Get all faculty members with consultation availability (cached)
 */
export async function getAllFacultyWithConsultation(): Promise<FacultyInfo[]> {
  // Try cache first
  const cached = await CacheService.get<FacultyInfo[]>(CACHE_KEYS.FACULTY_ALL);
  if (cached) {
    console.log('[FacultyService] Cache hit: all faculty');
    return cached;
  }

  // Fetch from database
  const faculty = await prisma.faculty.findMany({
    where: {
      college: { contains: 'College of Science', mode: 'insensitive' },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  const result: FacultyInfo[] = faculty.map(f => ({
    id: f.id,
    fullName: `${f.firstName}${f.middleName ? ' ' + f.middleName : ''} ${f.lastName}`,
    firstName: f.firstName,
    lastName: f.lastName,
    middleName: f.middleName || undefined,
    position: f.position,
    college: f.college,
    email: f.email || undefined,
    officeHours: f.officeHours || undefined,
    consultationDays: f.consultationDays,
    consultationStart: f.consultationStart || undefined,
    consultationEnd: f.consultationEnd || undefined,
    vacantTime: f.vacantTime || undefined,
  }));

  // Cache the result
  await CacheService.set(CACHE_KEYS.FACULTY_ALL, result, CACHE_TTL.FACULTY_LIST);
  console.log(`[FacultyService] Cached ${result.length} faculty members`);

  return result;
}

/**
 * Search faculty by name with fuzzy matching
 */
export async function searchFacultyByName(searchName: string): Promise<FacultyInfo[]> {
  const cacheKey = `${CACHE_KEYS.FACULTY_BY_NAME}${searchName.toLowerCase().replace(/\s+/g, '_')}`;
  
  // Try cache first
  const cached = await CacheService.get<FacultyInfo[]>(cacheKey);
  if (cached) {
    console.log(`[FacultyService] Cache hit: faculty search "${searchName}"`);
    return cached;
  }

  // Split name into parts for multi-word names
  const nameParts = searchName.trim().split(/\s+/).filter(part => part.length > 0);
  
  let searchConditions: any[] = [];
  
  if (nameParts.length === 1) {
    // Single word - search in firstName, lastName, or middleName
    const singleName = nameParts[0];
    searchConditions = [
      { firstName: { contains: singleName, mode: 'insensitive' } },
      { lastName: { contains: singleName, mode: 'insensitive' } },
      { middleName: { contains: singleName, mode: 'insensitive' } },
    ];
  } else if (nameParts.length >= 2) {
    // Multiple words - try combinations
    searchConditions.push({
      AND: [
        { firstName: { contains: nameParts[0], mode: 'insensitive' } },
        { lastName: { contains: nameParts[nameParts.length - 1], mode: 'insensitive' } },
      ],
    });
    
    // Also try each part individually
    for (const part of nameParts) {
      searchConditions.push(
        { firstName: { contains: part, mode: 'insensitive' } },
        { lastName: { contains: part, mode: 'insensitive' } }
      );
    }
  }

  const faculty = await prisma.faculty.findMany({
    where: {
      college: { contains: 'College of Science', mode: 'insensitive' },
      OR: searchConditions,
    },
    orderBy: { lastName: 'asc' },
  });

  const result: FacultyInfo[] = faculty.map(f => ({
    id: f.id,
    fullName: `${f.firstName}${f.middleName ? ' ' + f.middleName : ''} ${f.lastName}`,
    firstName: f.firstName,
    lastName: f.lastName,
    middleName: f.middleName || undefined,
    position: f.position,
    college: f.college,
    email: f.email || undefined,
    officeHours: f.officeHours || undefined,
    consultationDays: f.consultationDays,
    consultationStart: f.consultationStart || undefined,
    consultationEnd: f.consultationEnd || undefined,
    vacantTime: f.vacantTime || undefined,
  }));

  // Cache for shorter duration (search results)
  await CacheService.set(cacheKey, result, CACHE_TTL.FACULTY_DETAIL);
  
  return result;
}

/**
 * Get faculty by ID (cached)
 */
export async function getFacultyById(facultyId: string): Promise<FacultyInfo | null> {
  const cacheKey = `${CACHE_KEYS.FACULTY_BY_ID}${facultyId}`;
  
  const cached = await CacheService.get<FacultyInfo>(cacheKey);
  if (cached) {
    return cached;
  }

  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId },
  });

  if (!faculty) return null;

  const result: FacultyInfo = {
    id: faculty.id,
    fullName: `${faculty.firstName}${faculty.middleName ? ' ' + faculty.middleName : ''} ${faculty.lastName}`,
    firstName: faculty.firstName,
    lastName: faculty.lastName,
    middleName: faculty.middleName || undefined,
    position: faculty.position,
    college: faculty.college,
    email: faculty.email || undefined,
    officeHours: faculty.officeHours || undefined,
    consultationDays: faculty.consultationDays,
    consultationStart: faculty.consultationStart || undefined,
    consultationEnd: faculty.consultationEnd || undefined,
    vacantTime: faculty.vacantTime || undefined,
  };

  await CacheService.set(cacheKey, result, CACHE_TTL.FACULTY_DETAIL);
  return result;
}

/**
 * Get available consultation slots for a faculty on a specific date
 */
export async function getAvailableSlots(
  facultyId: string,
  date: Date
): Promise<ConsultationSlot[]> {
  const dateStr = date.toISOString().split('T')[0];
  const cacheKey = `${CACHE_KEYS.AVAILABLE_SLOTS}${facultyId}:${dateStr}`;

  const cached = await CacheService.get<ConsultationSlot[]>(cacheKey);
  if (cached) {
    console.log(`[FacultyService] Cache hit: slots for ${facultyId} on ${dateStr}`);
    return cached;
  }

  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId },
  });

  if (!faculty) return [];

  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];

  // Check if faculty is available on this day
  if (!faculty.consultationDays.includes(dayName)) {
    return [];
  }

  // Get existing bookings for this date
  const existingBookings = await prisma.consultationBooking.findMany({
    where: {
      facultyId,
      date: {
        gte: new Date(dateStr),
        lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000),
      },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      topic: true,
      status: true,
    },
  });

  // Generate time slots based on consultation hours
  const slots: ConsultationSlot[] = [];
  const startTime = faculty.consultationStart || '08:00';
  const endTime = faculty.consultationEnd || '17:00';
  const slotDuration = 30; // 30-minute slots

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    
    // Calculate end time
    let nextMin = currentMin + slotDuration;
    let nextHour = currentHour;
    if (nextMin >= 60) {
      nextHour += Math.floor(nextMin / 60);
      nextMin = nextMin % 60;
    }
    const slotEnd = `${String(nextHour).padStart(2, '0')}:${String(nextMin).padStart(2, '0')}`;

    // Check if this slot conflicts with existing bookings
    const conflictingBooking = existingBookings.find(b => {
      return (
        (slotStart >= b.startTime && slotStart < b.endTime) ||
        (slotEnd > b.startTime && slotEnd <= b.endTime) ||
        (slotStart <= b.startTime && slotEnd >= b.endTime)
      );
    });

    slots.push({
      date: dateStr,
      dayName,
      startTime: slotStart,
      endTime: slotEnd,
      isAvailable: !conflictingBooking,
      existingBooking: conflictingBooking
        ? {
            id: conflictingBooking.id,
            topic: conflictingBooking.topic,
            status: conflictingBooking.status,
          }
        : undefined,
    });

    currentHour = nextHour;
    currentMin = nextMin;
  }

  await CacheService.set(cacheKey, slots, CACHE_TTL.CONSULTATION_SLOTS);
  return slots;
}

/**
 * Get upcoming bookings for a student
 */
export async function getStudentBookings(studentId: string): Promise<BookingInfo[]> {
  const cacheKey = `${CACHE_KEYS.BOOKINGS}student:${studentId}`;

  const cached = await CacheService.get<BookingInfo[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookings = await prisma.consultationBooking.findMany({
    where: {
      studentId,
      date: { gte: today },
    },
    include: {
      Faculty: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  const result: BookingInfo[] = bookings.map(b => ({
    id: b.id,
    facultyId: b.facultyId,
    facultyName: `${b.Faculty.firstName} ${b.Faculty.lastName}`,
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime,
    topic: b.topic,
    status: b.status,
    meetingLink: b.meetingLink || undefined,
    location: b.location || undefined,
  }));

  await CacheService.set(cacheKey, result, CACHE_TTL.BOOKINGS);
  return result;
}

/**
 * Store conversation context for pronoun resolution
 */
export function setConversationContext(userId: string, faculty: FacultyInfo): void {
  conversationContexts.set(userId, {
    lastMentionedFaculty: faculty,
    lastMentionedFacultyId: faculty.id,
    timestamp: Date.now(),
  });
  
  // Clean up old contexts (older than 30 minutes)
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  const entries = Array.from(conversationContexts.entries());
  for (const [key, ctx] of entries) {
    if (ctx.timestamp < thirtyMinutesAgo) {
      conversationContexts.delete(key);
    }
  }
}

/**
 * Get conversation context for pronoun resolution
 */
export function getConversationContext(userId: string): ConversationContext | null {
  const ctx = conversationContexts.get(userId);
  if (!ctx) return null;
  
  // Check if context is still valid (within 30 minutes)
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  if (ctx.timestamp < thirtyMinutesAgo) {
    conversationContexts.delete(userId);
    return null;
  }
  
  return ctx;
}

/**
 * Resolve pronouns to faculty reference
 */
export function resolvePronoun(userId: string, message: string): FacultyInfo | null {
  const pronounPatterns = [
    /\b(him|her|them|this person|that person|this faculty|that faculty)\b/i,
    /\b(book|schedule|consult|meet)\s+(him|her|them)\b/i,
    /\b(his|her|their)\s+(schedule|consultation|availability)\b/i,
  ];

  const hasPronoun = pronounPatterns.some(pattern => pattern.test(message));
  if (!hasPronoun) return null;

  const ctx = getConversationContext(userId);
  return ctx?.lastMentionedFaculty || null;
}

/**
 * Detect consultation-related intent in user message
 */
export function detectConsultationIntent(message: string): {
  isConsultationQuery: boolean;
  intentType: 'schedule' | 'book' | 'cancel' | 'view' | 'availability' | null;
  extractedDate?: string;
  extractedTime?: string;
} {
  const lowerMsg = message.toLowerCase();

  // Booking intent patterns
  const bookPatterns = [
    /book\s+(a\s+)?consultation/i,
    /schedule\s+(a\s+)?(meeting|consultation|appointment)/i,
    /set\s+(up\s+)?(a\s+)?(meeting|consultation|appointment)/i,
    /i\s+want\s+to\s+(book|schedule|meet)/i,
    /can\s+i\s+(book|schedule|meet)/i,
    /book\s+(him|her|them)/i,
  ];

  // View schedule patterns
  const viewPatterns = [
    /consultation\s+(schedule|hours|days|time)/i,
    /when\s+(is|are)\s+(he|she|they)\s+available/i,
    /availability/i,
    /office\s+hours/i,
    /vacant\s+time/i,
    /free\s+(time|slot)/i,
  ];

  // Cancel patterns
  const cancelPatterns = [
    /cancel\s+(my\s+)?(consultation|booking|appointment)/i,
    /reschedule/i,
  ];

  // View my bookings patterns
  const myBookingsPatterns = [
    /my\s+(consultations?|bookings?|appointments?)/i,
    /show\s+(my\s+)?(consultations?|bookings?)/i,
    /upcoming\s+(consultations?|meetings?)/i,
  ];

  // Date extraction
  const datePatterns = [
    /tomorrow/i,
    /today/i,
    /next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?/,
  ];

  // Time extraction
  const timePatterns = [
    /at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?/i,
    /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
  ];

  let intentType: 'schedule' | 'book' | 'cancel' | 'view' | 'availability' | null = null;
  let extractedDate: string | undefined;
  let extractedTime: string | undefined;

  // Check patterns
  if (bookPatterns.some(p => p.test(lowerMsg))) {
    intentType = 'book';
  } else if (cancelPatterns.some(p => p.test(lowerMsg))) {
    intentType = 'cancel';
  } else if (myBookingsPatterns.some(p => p.test(lowerMsg))) {
    intentType = 'view';
  } else if (viewPatterns.some(p => p.test(lowerMsg))) {
    intentType = 'availability';
  }

  // Extract date
  for (const pattern of datePatterns) {
    const match = lowerMsg.match(pattern);
    if (match) {
      if (match[0].includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        extractedDate = tomorrow.toISOString().split('T')[0];
      } else if (match[0].includes('today')) {
        extractedDate = new Date().toISOString().split('T')[0];
      } else if (match[1] && match[2]) {
        // Date format like 3/15 or 03-15-2024
        const month = match[1].padStart(2, '0');
        const day = match[2].padStart(2, '0');
        const year = match[3] || new Date().getFullYear().toString();
        extractedDate = `${year}-${month}-${day}`;
      }
      break;
    }
  }

  // Extract time
  for (const pattern of timePatterns) {
    const match = lowerMsg.match(pattern);
    if (match) {
      let hour = parseInt(match[1]);
      const min = match[2] ? match[2].padStart(2, '0') : '00';
      const ampm = match[3]?.toLowerCase();
      
      if (ampm === 'pm' && hour < 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      
      extractedTime = `${String(hour).padStart(2, '0')}:${min}`;
      break;
    }
  }

  return {
    isConsultationQuery: intentType !== null,
    intentType,
    extractedDate,
    extractedTime,
  };
}

/**
 * Format faculty info for AI response
 */
export function formatFacultyForAI(faculty: FacultyInfo, language: string = 'en'): string {
  const isFilipino = language === 'fil';
  
  let response = isFilipino
    ? `**${faculty.fullName}** ay ${faculty.position} sa ${faculty.college}.`
    : `**${faculty.fullName}** is a ${faculty.position} at the ${faculty.college}.`;

  if (faculty.email) {
    response += `\n📧 **Email**: ${faculty.email}`;
  }

  if (faculty.officeHours) {
    response += `\n🕐 **${isFilipino ? 'Oras ng Opisina' : 'Office Hours'}**: ${faculty.officeHours}`;
  }

  if (faculty.consultationDays && faculty.consultationDays.length > 0) {
    response += `\n📅 **${isFilipino ? 'Araw ng Konsultasyon' : 'Consultation Days'}**: ${faculty.consultationDays.join(', ')}`;
    
    if (faculty.consultationStart && faculty.consultationEnd) {
      response += ` (${faculty.consultationStart} - ${faculty.consultationEnd})`;
    }
  }

  if (faculty.vacantTime) {
    response += `\n⏰ **${isFilipino ? 'Bakanteng Oras' : 'Vacant Time'}**: ${faculty.vacantTime}`;
  }

  return response;
}

/**
 * Format consultation slots for AI response
 */
export function formatSlotsForAI(
  faculty: FacultyInfo,
  slots: ConsultationSlot[],
  language: string = 'en'
): string {
  const isFilipino = language === 'fil';
  const availableSlots = slots.filter(s => s.isAvailable);
  const bookedSlots = slots.filter(s => !s.isAvailable);

  let response = isFilipino
    ? `📅 **Mga Available na Slot para kay ${faculty.firstName} ${faculty.lastName}**\n\n`
    : `📅 **Available Slots for ${faculty.firstName} ${faculty.lastName}**\n\n`;

  if (availableSlots.length === 0) {
    response += isFilipino
      ? `❌ Walang available na slot sa araw na ito.`
      : `❌ No available slots on this day.`;
  } else {
    response += isFilipino ? `✅ **Available**:\n` : `✅ **Available**:\n`;
    for (const slot of availableSlots.slice(0, 6)) {
      response += `• ${slot.startTime} - ${slot.endTime}\n`;
    }
    if (availableSlots.length > 6) {
      response += isFilipino
        ? `...at ${availableSlots.length - 6} pang slot\n`
        : `...and ${availableSlots.length - 6} more slots\n`;
    }
  }

  if (bookedSlots.length > 0) {
    response += isFilipino ? `\n🔒 **Naka-book na**:\n` : `\n🔒 **Already Booked**:\n`;
    for (const slot of bookedSlots.slice(0, 3)) {
      response += `• ${slot.startTime} - ${slot.endTime}\n`;
    }
  }

  response += isFilipino
    ? `\n\n💡 Para mag-book, sabihin mo lang: "Book consultation with ${faculty.firstName} at [time]"`
    : `\n\n💡 To book, just say: "Book consultation with ${faculty.firstName} at [time]"`;

  return response;
}

/**
 * Validate a booking request before submission
 * Implements comprehensive business rules validation
 */
export async function validateBookingRequest(
  studentId: string,
  facultyId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<BookingValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check if faculty exists and has consultation hours
  const faculty = await getFacultyById(facultyId);
  if (!faculty) {
    errors.push('Faculty member not found');
    return { isValid: false, errors, warnings };
  }

  if (faculty.consultationDays.length === 0) {
    errors.push('Faculty member does not have consultation hours set up');
    return { isValid: false, errors, warnings };
  }

  // 2. Check if date is on a valid consultation day
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
  if (!faculty.consultationDays.includes(dayName)) {
    errors.push(`Faculty is not available on ${dayName}. Available days: ${faculty.consultationDays.join(', ')}`);
  }

  // 3. Check if time is within consultation hours
  if (faculty.consultationStart && faculty.consultationEnd) {
    if (startTime < faculty.consultationStart || endTime > faculty.consultationEnd) {
      errors.push(`Time must be within consultation hours: ${faculty.consultationStart} - ${faculty.consultationEnd}`);
    }
  }

  // 4. Check minimum advance booking time
  const now = new Date();
  const bookingDateTime = new Date(date);
  const [hours, mins] = startTime.split(':').map(Number);
  bookingDateTime.setHours(hours, mins, 0, 0);
  
  const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilBooking < BOOKING_RULES.MIN_ADVANCE_HOURS) {
    errors.push(`Bookings must be made at least ${BOOKING_RULES.MIN_ADVANCE_HOURS} hours in advance`);
  }

  // 5. Check maximum advance booking time
  const daysUntilBooking = hoursUntilBooking / 24;
  if (daysUntilBooking > BOOKING_RULES.MAX_ADVANCE_DAYS) {
    errors.push(`Bookings cannot be made more than ${BOOKING_RULES.MAX_ADVANCE_DAYS} days in advance`);
  }

  // 6. Check if student has too many active bookings
  const activeBookings = await prisma.consultationBooking.count({
    where: {
      studentId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      date: { gte: now },
    },
  });

  if (activeBookings >= BOOKING_RULES.MAX_ACTIVE_BOOKINGS) {
    errors.push(`You already have ${activeBookings} active bookings. Maximum allowed: ${BOOKING_RULES.MAX_ACTIVE_BOOKINGS}`);
  }

  // 7. Check for conflicting bookings (same faculty, same time)
  const dateStr = date.toISOString().split('T')[0];
  const conflictingBooking = await prisma.consultationBooking.findFirst({
    where: {
      facultyId,
      date: {
        gte: new Date(dateStr),
        lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000),
      },
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
        { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
        { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
      ],
    },
  });

  if (conflictingBooking) {
    errors.push('This time slot is already booked');
  }

  // 8. Check for locked slots
  const lockedSlot = await getLockedSlot(facultyId, dateStr, startTime, endTime);
  if (lockedSlot) {
    errors.push(`This slot is locked: ${lockedSlot.reason}`);
  }

  // 9. Check if student already has a booking with this faculty on this day
  const existingStudentBooking = await prisma.consultationBooking.findFirst({
    where: {
      studentId,
      facultyId,
      date: {
        gte: new Date(dateStr),
        lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000),
      },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
  });

  if (existingStudentBooking) {
    warnings.push('You already have a booking with this faculty member on this day');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Lock a consultation slot (admin/faculty only)
 */
export async function lockSlot(
  facultyId: string,
  date: string,
  startTime: string,
  endTime: string,
  reason: string,
  lockedBy: string,
  expiresAt?: Date
): Promise<LockedSlot> {
  const lockedSlot: LockedSlot = {
    facultyId,
    date,
    startTime,
    endTime,
    reason,
    lockedBy,
    lockedAt: new Date(),
    expiresAt,
  };

  const cacheKey = `${CACHE_KEYS.LOCKED_SLOTS}${facultyId}:${date}:${startTime}`;
  const ttl = expiresAt 
    ? Math.floor((expiresAt.getTime() - Date.now()) / 1000)
    : 86400 * 7; // Default 7 days

  await CacheService.set(cacheKey, lockedSlot, ttl);
  
  // Invalidate available slots cache
  await CacheService.deletePattern(`${CACHE_KEYS.AVAILABLE_SLOTS}${facultyId}:${date}`);
  
  console.log(`[FacultyService] Slot locked: ${facultyId} ${date} ${startTime}-${endTime}`);
  return lockedSlot;
}

/**
 * Unlock a consultation slot
 */
export async function unlockSlot(
  facultyId: string,
  date: string,
  startTime: string
): Promise<boolean> {
  const cacheKey = `${CACHE_KEYS.LOCKED_SLOTS}${facultyId}:${date}:${startTime}`;
  await CacheService.delete(cacheKey);
  await CacheService.deletePattern(`${CACHE_KEYS.AVAILABLE_SLOTS}${facultyId}:${date}`);
  console.log(`[FacultyService] Slot unlocked: ${facultyId} ${date} ${startTime}`);
  return true;
}

/**
 * Get locked slot information
 */
export async function getLockedSlot(
  facultyId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<LockedSlot | null> {
  // Check for exact match
  const cacheKey = `${CACHE_KEYS.LOCKED_SLOTS}${facultyId}:${date}:${startTime}`;
  const locked = await CacheService.get<LockedSlot>(cacheKey);
  
  if (locked) {
    // Check if expired
    if (locked.expiresAt && new Date(locked.expiresAt) < new Date()) {
      await CacheService.delete(cacheKey);
      return null;
    }
    return locked;
  }
  
  return null;
}

/**
 * Get booking history for analytics
 */
export async function getBookingHistory(
  filters: {
    facultyId?: string;
    studentId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string[];
  },
  pagination: { page: number; limit: number } = { page: 1, limit: 50 }
): Promise<{ bookings: BookingHistoryEntry[]; total: number; page: number; totalPages: number }> {
  const where: any = {};

  if (filters.facultyId) where.facultyId = filters.facultyId;
  if (filters.studentId) where.studentId = filters.studentId;
  if (filters.status) where.status = { in: filters.status };
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = filters.startDate;
    if (filters.endDate) where.date.lte = filters.endDate;
  }

  const [bookings, total] = await Promise.all([
    prisma.consultationBooking.findMany({
      where,
      include: {
        Faculty: { select: { firstName: true, lastName: true } },
        Student: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    }),
    prisma.consultationBooking.count({ where }),
  ]);

  const result: BookingHistoryEntry[] = bookings.map(b => ({
    id: b.id,
    facultyId: b.facultyId,
    facultyName: `${b.Faculty.firstName} ${b.Faculty.lastName}`,
    studentId: b.studentId,
    studentName: `${b.Student.firstName} ${b.Student.lastName}`,
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime,
    topic: b.topic,
    status: b.status,
    createdAt: b.createdAt,
  }));

  return {
    bookings: result,
    total,
    page: pagination.page,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

/**
 * Get consultation analytics for reporting
 */
export async function getConsultationAnalytics(
  startDate: Date,
  endDate: Date,
  facultyId?: string
): Promise<{
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  averageBookingsPerDay: number;
  topFaculty: { id: string; name: string; bookings: number }[];
  bookingsByDay: { date: string; count: number }[];
  bookingsByStatus: { status: string; count: number }[];
}> {
  const where: any = {
    date: { gte: startDate, lte: endDate },
  };
  if (facultyId) where.facultyId = facultyId;

  const [allBookings, statusCounts] = await Promise.all([
    prisma.consultationBooking.findMany({
      where,
      include: { Faculty: { select: { firstName: true, lastName: true } } },
      orderBy: { date: 'asc' },
    }),
    prisma.consultationBooking.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    }),
  ]);

  // Calculate metrics
  const totalBookings = allBookings.length;
  const completedBookings = allBookings.filter(b => b.status === 'COMPLETED').length;
  const cancelledBookings = allBookings.filter(b => b.status === 'CANCELLED').length;
  const pendingBookings = allBookings.filter(b => b.status === 'PENDING').length;

  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  const averageBookingsPerDay = totalBookings / daysDiff;

  // Top faculty by bookings
  const facultyBookings: Record<string, { name: string; count: number }> = {};
  allBookings.forEach(b => {
    const key = b.facultyId;
    if (!facultyBookings[key]) {
      facultyBookings[key] = { name: `${b.Faculty.firstName} ${b.Faculty.lastName}`, count: 0 };
    }
    facultyBookings[key].count++;
  });

  const topFaculty = Object.entries(facultyBookings)
    .map(([id, data]) => ({ id, name: data.name, bookings: data.count }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 10);

  // Bookings by day
  const bookingsByDayMap: Record<string, number> = {};
  allBookings.forEach(b => {
    const dateStr = b.date.toISOString().split('T')[0];
    bookingsByDayMap[dateStr] = (bookingsByDayMap[dateStr] || 0) + 1;
  });

  const bookingsByDay = Object.entries(bookingsByDayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const bookingsByStatus = statusCounts.map(s => ({
    status: s.status,
    count: s._count.status,
  }));

  return {
    totalBookings,
    completedBookings,
    cancelledBookings,
    pendingBookings,
    averageBookingsPerDay: Math.round(averageBookingsPerDay * 100) / 100,
    topFaculty,
    bookingsByDay,
    bookingsByStatus,
  };
}

/**
 * Invalidate faculty cache (call when faculty data is updated)
 */
export async function invalidateFacultyCache(facultyId?: string): Promise<void> {
  if (facultyId) {
    await CacheService.delete(`${CACHE_KEYS.FACULTY_BY_ID}${facultyId}`);
  }
  await CacheService.delete(CACHE_KEYS.FACULTY_ALL);
  await CacheService.deletePattern(`${CACHE_KEYS.FACULTY_BY_NAME}*`);
  console.log('[FacultyService] Cache invalidated');
}

/**
 * Invalidate booking cache (call when bookings change)
 */
export async function invalidateBookingCache(facultyId?: string, studentId?: string): Promise<void> {
  if (facultyId) {
    await CacheService.deletePattern(`${CACHE_KEYS.AVAILABLE_SLOTS}${facultyId}:*`);
  }
  if (studentId) {
    await CacheService.delete(`${CACHE_KEYS.BOOKINGS}student:${studentId}`);
  }
  console.log('[FacultyService] Booking cache invalidated');
}

/**
 * Get booking rules configuration
 */
export function getBookingRules() {
  return { ...BOOKING_RULES };
}

export default {
  getAllFacultyWithConsultation,
  searchFacultyByName,
  getFacultyById,
  getAvailableSlots,
  getStudentBookings,
  setConversationContext,
  getConversationContext,
  resolvePronoun,
  detectConsultationIntent,
  formatFacultyForAI,
  formatSlotsForAI,
  invalidateFacultyCache,
  invalidateBookingCache,
  validateBookingRequest,
  lockSlot,
  unlockSlot,
  getLockedSlot,
  getBookingHistory,
  getConsultationAnalytics,
  getBookingRules,
};
