// server/src/utils/schedule-formatter.ts

interface TeachingSchedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
  section?: string;
  courseCode?: string;
}

interface FacultySchedule {
  fullName: string;
  position: string;
  schedules: TeachingSchedule[];
}

/**
 * Format faculty schedule in a consistent, readable way
 */
export function formatFacultySchedule(faculty: FacultySchedule): string {
  const { fullName, position, schedules } = faculty;

  const groupedByDay: Record<string, TeachingSchedule[]> = {};
  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  for (const schedule of schedules) {
    if (!groupedByDay[schedule.dayOfWeek]) {
      groupedByDay[schedule.dayOfWeek] = [];
    }
    groupedByDay[schedule.dayOfWeek].push(schedule);
  }

  for (const day in groupedByDay) {
    groupedByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  let formatted = `${fullName} — ${position}\n\n`;

  for (const day of dayOrder) {
    if (groupedByDay[day]) {
      formatted += `${day}\n`;

      for (const schedule of groupedByDay[day]) {
        formatted += `${schedule.startTime} - ${schedule.endTime}\n`;
        formatted += `${schedule.courseCode} (${schedule.section})\n`;
        formatted += `Room: ${schedule.room}\n\n`;
      }
    }
  }

  return formatted.trim();
}

/**
 * Format multiple faculty schedules
 */
export function formatMultipleFacultySchedules(
  faculties: FacultySchedule[],
): string {
  let formatted = "";
  for (const faculty of faculties) {
    formatted += formatFacultySchedule(faculty);
    formatted += "\n\n---\n\n";
  }
  return formatted.trim();
}

/**
 * Parse a time string (e.g., "4:30 PM - 6:30 PM") into start and end times
 */
export function parseTimeRange(timeRange: string): {
  startTime: string;
  endTime: string;
} {
  const match = timeRange.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
  );
  if (match) {
    return { startTime: match[1], endTime: match[2] };
  }
  return { startTime: "TBA", endTime: "TBA" };
}
