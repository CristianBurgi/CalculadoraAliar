/**
 * Date utilities for ALIAR Menu rotation.
 * Anchor date: 17/09/2026 -> Menu 5
 * Cycle advances 1 menu per day, wrapping from 10 to 1.
 */

export const ANCHOR_DATE_STR = '2026-09-17';
export const ANCHOR_MENU = 5;

/**
 * Normalizes a Date object to midnight UTC/Local date string (YYYY-MM-DD)
 */
export function formatDateISO(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Calculates menu number (1-10) for a given Date or ISO date string (YYYY-MM-DD).
 */
export function calculateMenuFromDate(dateOrIsoStr) {
  let targetDate;
  if (typeof dateOrIsoStr === 'string') {
    const [year, month, day] = dateOrIsoStr.split('-').map(Number);
    targetDate = new Date(year, month - 1, day);
  } else {
    targetDate = new Date(dateOrIsoStr.getFullYear(), dateOrIsoStr.getMonth(), dateOrIsoStr.getDate());
  }

  const anchorDate = new Date(2026, 8, 17); // Month 8 is September (0-indexed)

  const diffTime = targetDate.getTime() - anchorDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  // Formula: menu = ((diasDesdeAncla + 4) % 10) + 1 (with floorMod for negative numbers)
  let menu = ((diffDays + (ANCHOR_MENU - 1)) % 10);
  if (menu < 0) {
    menu += 10;
  }
  return menu + 1;
}

/**
 * Format date for user display in Spanish (e.g. "Jueves 17 de Septiembre de 2026")
 */
export function formatDateHumanReadable(dateOrIsoStr) {
  let targetDate;
  if (typeof dateOrIsoStr === 'string') {
    const [year, month, day] = dateOrIsoStr.split('-').map(Number);
    targetDate = new Date(year, month - 1, day);
  } else {
    targetDate = dateOrIsoStr;
  }

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const str = targetDate.toLocaleDateString('es-AR', options);
  return str.charAt(0).toUpperCase() + str.slice(1);
}
