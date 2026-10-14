import { LanguageType } from '../types';

export function getTimeGreeting(lang: LanguageType = 'en', userName?: string | null): string {
  const hour = new Date().getHours();
  let base = '';

  if (hour >= 5 && hour < 12) {
    if (lang === 'nd') base = 'Livukile njani';
    else if (lang === 'sn') base = 'Mangwanani';
    else base = 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    if (lang === 'nd') base = 'Litshonile njani';
    else if (lang === 'sn') base = 'Masikati';
    else base = 'Good afternoon';
  } else {
    if (lang === 'nd') base = 'Kunjani kusihlwa';
    else if (lang === 'sn') base = 'Manheru';
    else base = 'Good evening';
  }

  const cleanName = userName?.trim();
  if (cleanName) {
    return `${base}, ${cleanName}!`;
  }
  return `${base}!`;
}
