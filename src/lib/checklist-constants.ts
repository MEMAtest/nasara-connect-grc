/**
 * Shared constants for checklist and timeline components
 */

// Phase color configuration - shared between TimelineProgress and ChecklistCards
export const PHASE_COLORS: Record<
  string,
  {
    bg: string;
    bgSolid: string;
    border: string;
    text: string;
    progressBg: string;
    iconBg: string;
  }
> = {
  teal: {
    bg: "bg-teal-50",
    bgSolid: "bg-teal-500",
    border: "border-teal-200",
    text: "text-teal-700",
    progressBg: "bg-teal-500",
    iconBg: "bg-teal-100",
  },
  blue: {
    bg: "bg-blue-50",
    bgSolid: "bg-blue-500",
    border: "border-blue-200",
    text: "text-blue-700",
    progressBg: "bg-blue-500",
    iconBg: "bg-blue-100",
  },
  purple: {
    bg: "bg-purple-50",
    bgSolid: "bg-purple-500",
    border: "border-purple-200",
    text: "text-purple-700",
    progressBg: "bg-purple-500",
    iconBg: "bg-purple-100",
  },
  amber: {
    bg: "bg-amber-50",
    bgSolid: "bg-amber-500",
    border: "border-amber-200",
    text: "text-amber-700",
    progressBg: "bg-amber-500",
    iconBg: "bg-amber-100",
  },
  green: {
    bg: "bg-green-50",
    bgSolid: "bg-green-500",
    border: "border-green-200",
    text: "text-green-700",
    progressBg: "bg-green-500",
    iconBg: "bg-green-100",
  },
};

// Timeline layout constants
export const TIMELINE_LAYOUT = {
  // Offset for centering week markers (0.5 = center of week column)
  WEEK_CENTER_OFFSET: 0.5,
  // Week markers to show on the timeline scale
  generateWeekMarkers: (totalWeeks: number): number[] => {
    const markers: number[] = [1];
    for (let i = 10; i < totalWeeks; i += 10) {
      markers.push(i);
    }
    if (!markers.includes(totalWeeks)) {
      markers.push(totalWeeks);
    }
    return markers;
  },
} as const;

/**
 * Parse a date string consistently to UTC midnight
 * Prevents timezone-related parsing inconsistencies
 */
export function parseToUTCDate(dateString: string): Date {
  // If the date string doesn't include time, parse as UTC midnight
  if (dateString && !dateString.includes('T')) {
    return new Date(dateString + 'T00:00:00.000Z');
  }
  return new Date(dateString);
}

/**
 * Calculate current week number from a start date
 * Uses UTC dates consistently to avoid timezone issues
 */
export function getCurrentWeekFromStart(startDate?: string): number {
  if (!startDate) return 1;

  const start = parseToUTCDate(startDate);
  if (isNaN(start.getTime())) return 1;

  const today = new Date();
  // Normalize to UTC midnight for accurate day calculation
  const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  const daysSinceStart = Math.floor((todayUTC - startUTC) / (1000 * 60 * 60 * 24));
  if (daysSinceStart < 0) return 0; // Project hasn't started yet

  return Math.max(1, Math.ceil((daysSinceStart + 1) / 7));
}

/**
 * Basic runtime type guard for API responses
 */
export function isValidChecklistResponse(data: unknown): data is { checklist: Record<string, string> } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'checklist' in data &&
    (typeof (data as { checklist: unknown }).checklist === 'object' ||
     (data as { checklist: unknown }).checklist === null)
  );
}

export function isValidProjectResponse(data: unknown): data is { project: { id: string; name: string } | null } {
  if (typeof data !== 'object' || data === null) return false;
  if (!('project' in data)) return false;
  const project = (data as { project: unknown }).project;
  if (project === null) return true;
  return (
    typeof project === 'object' &&
    project !== null &&
    'id' in project &&
    typeof (project as { id: unknown }).id === 'string'
  );
}

export function isValidReadinessResponse(data: unknown): data is { readiness: { overall: number; narrative: number; review: number } } {
  if (typeof data !== 'object' || data === null) return false;
  if (!('readiness' in data)) return false;
  const readiness = (data as { readiness: unknown }).readiness;
  return (
    typeof readiness === 'object' &&
    readiness !== null &&
    'overall' in readiness &&
    typeof (readiness as { overall: unknown }).overall === 'number'
  );
}
