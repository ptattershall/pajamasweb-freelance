/**
 * Timezone utilities for consistent display of booking times.
 * Uses Intl.DateTimeFormat with timeZone; falls back to browser locale if invalid.
 */

const STORAGE_KEY = 'pajamasweb_preferred_timezone';

export function getStoredTimezone(): string {
  if (typeof window === 'undefined') return Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  } catch {
    // ignore
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function setStoredTimezone(timeZone: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, timeZone);
    }
  } catch {
    // ignore
  }
}

/**
 * Format a date string (ISO) in the given timezone for date only.
 */
export function formatDateInTimezone(
  dateString: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  try {
    return new Intl.DateTimeFormat('en-US', { ...options, timeZone }).format(
      new Date(dateString)
    );
  } catch {
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
}

/**
 * Format a date string (ISO) in the given timezone for time only.
 */
export function formatTimeInTimezone(
  dateString: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  try {
    return new Intl.DateTimeFormat('en-US', { ...options, timeZone }).format(
      new Date(dateString)
    );
  } catch {
    return new Date(dateString).toLocaleTimeString('en-US', options);
  }
}

/**
 * Common timezones for dropdown. User can also use "Use my location" to set browser timezone.
 */
export const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'UTC', label: 'UTC' },
];
