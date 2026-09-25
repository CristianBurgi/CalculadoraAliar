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

/**
 * List of fixed and moveable Argentine national holidays (YYYY-MM-DD) for 2026 and 2027.
 */
export const ARGENTINA_HOLIDAYS = new Set([
  // 2026 Holidays
  '2026-01-01', // Año Nuevo
  '2026-02-16', // Carnaval
  '2026-02-17', // Carnaval
  '2026-03-24', // Memoria por la Verdad y la Justicia
  '2026-04-02', // Malvinas / Viernes Santo
  '2026-04-03', // Viernes Santo
  '2026-05-01', // Día del Trabajador
  '2026-05-25', // Revolución de Mayo
  '2026-06-17', // Paso a la Inmortalidad de Güemes
  '2026-06-20', // Paso a la Inmortalidad de Manuel Belgrano
  '2026-07-09', // Día de la Independencia
  '2026-08-17', // Paso a la Inmortalidad del Gral. José de San Martín
  '2026-10-12', // Día del Respeto a la Diversidad Cultural
  '2026-11-20', // Día de la Soberanía Nacional
  '2026-12-08', // Inmaculada Concepción de María
  '2026-12-25', // Navidad
  // 2027 Holidays
  '2027-01-01', '2027-02-08', '2027-02-09', '2027-03-24', '2027-03-26',
  '2027-04-02', '2027-05-01', '2027-05-25', '2027-06-17', '2027-06-20',
  '2027-07-09', '2027-08-16', '2027-10-11', '2027-11-20', '2027-12-08', '2027-12-25'
]);

/**
 * Checks if a given date string (YYYY-MM-DD) is Saturday, Sunday, or an Argentine national holiday.
 */
export function isWeekendOrHoliday(dateIsoStr) {
  const [year, month, day] = dateIsoStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true;
  }

  return ARGENTINA_HOLIDAYS.has(dateIsoStr);
}

/**
 * Adds N days to an ISO date string (YYYY-MM-DD) and returns the resulting ISO date string.
 */
export function addDaysToIso(dateIsoStr, numDays) {
  const [year, month, day] = dateIsoStr.split('-').map(Number);
  const d = new Date(year, month - 1, day + numDays);
  return formatDateISO(d);
}

/**
 * Generates an array of date objects/strings for a range of N days starting from startDateIso.
 */
export function getDateRangeInfo(startDateIso, daysCount) {
  const range = [];
  for (let i = 0; i < daysCount; i++) {
    const currentIso = addDaysToIso(startDateIso, i);
    const menuNum = calculateMenuFromDate(currentIso);
    const isSpecialDay = isWeekendOrHoliday(currentIso);
    const label = formatDateHumanReadable(currentIso);

    range.push({
      dateIso: currentIso,
      menuNum,
      isSpecialDay, // true for weekend/holiday, false for weekday
      label,
    });
  }
  return range;
}
