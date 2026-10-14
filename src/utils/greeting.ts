import { LanguageType } from '../types';

/**
 * Generates dynamic time-of-day greeting based on device local time.
 * Automatically updates between Morning, Afternoon, and Evening.
 *
 * Requirements:
 * - If user logged in: "Good Morning! [Name]" (or Afternoon/Evening)
 * - If not logged in: "Good Morning!" (or Afternoon/Evening)
 * - No "Bulawayo & Zimbabwe Hub" appended to greeting.
 */
export function getTimeGreeting(lang: LanguageType = 'en', userName?: string | null): string {
  const hour = new Date().getHours();
  let base = '';

  // Time boundaries based on local clock:
  // Morning: 04:00 - 11:59
  // Afternoon: 12:00 - 16:59
  // Evening: 17:00 - 03:59
  if (hour >= 4 && hour < 12) {
    if (lang === 'nd') base = 'Livukile njani';
    else if (lang === 'sn') base = 'Mangwanani';
    else base = 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    if (lang === 'nd') base = 'Litshonile njani';
    else if (lang === 'sn') base = 'Masikati';
    else base = 'Good Afternoon';
  } else {
    if (lang === 'nd') base = 'Kunjani kusihlwa';
    else if (lang === 'sn') base = 'Manheru';
    else base = 'Good Evening';
  }

  const cleanName = userName?.trim();
  if (cleanName) {
    return `${base}! ${cleanName}`;
  }
  return `${base}!`;
}
