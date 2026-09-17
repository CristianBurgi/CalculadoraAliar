import menusData from './menusData.json' with { type: 'json' };
import platosData from './platosData.json' with { type: 'json' };
import polloTagsData from './polloTagsData.json' with { type: 'json' };

/**
 * Repository module for accessing hospital menu data.
 * Designed to decouple the data layer from the UI and business logic,
 * allowing straightforward migration to a backend API (e.g. Spring Boot) in future versions.
 */

export const CATEGORIES = {
  PERSONAL: 'PERSONAL',
  REGIMEN_NORMAL: 'REGIMEN_NORMAL',
  REGIMEN_DIABETICO: 'REGIMEN_DIABETICO',
  REGIMEN_HEPATICO: 'REGIMEN_HEPATICO',
};

export const CATEGORY_LABELS = {
  PERSONAL: 'Personal Autorizado',
  REGIMEN_NORMAL: 'Régimen Normal',
  REGIMEN_DIABETICO: 'Régimen Diabético',
  REGIMEN_HEPATICO: 'Régimen Hepático',
};

export const SHIFTS = {
  ALMUERZO: 'almuerzo',
  CENA: 'cena',
};

export const SHIFT_LABELS = {
  almuerzo: 'Almuerzo',
  cena: 'Cena',
};

/**
 * Returns sub-sections and ingredients for a given category, menu number, and shift.
 * Handle Menú 10 missing data for PERSONAL gracefully.
 */
export function getSubsectionsForCategory(categoryKey, menuNum, shiftKey) {
  const menuStr = String(menuNum);
  const categoryData = menusData[categoryKey];

  if (!categoryData || !categoryData[menuStr]) {
    return { available: false, reason: 'Falta planilla original', subs: [], entrada: null };
  }

  const shiftData = categoryData[menuStr][shiftKey];

  if (!shiftData) {
    return { available: false, reason: 'Turno no disponible', subs: [], entrada: null };
  }

  // PERSONAL has format: [ [subseccionName, [[ing, qty], ...]], ... ]
  // REGIMEN_* has format: { entrada: "...", subs: [ [subseccionName, [[ing, qty], ...]], ... ] }
  if (Array.isArray(shiftData)) {
    return { available: true, subs: shiftData, entrada: null };
  } else {
    return { available: true, subs: shiftData.subs || [], entrada: shiftData.entrada || null };
  }
}

/**
 * Gets the title of the dish for category, menu number, and shift.
 */
export function getPlatoTitle(categoryKey, menuNum, shiftKey) {
  const menuStr = String(menuNum);
  const mapKey = `PLATOS_${categoryKey.replace('REGIMEN_', '')}`;
  const platosMap = platosData[mapKey];

  if (platosMap && platosMap[menuStr] && platosMap[menuStr][shiftKey]) {
    return platosMap[menuStr][shiftKey];
  }
  return null;
}

/**
 * Looks up chicken tag classification for a given occurrence.
 * Standardizes category name matching.
 */
export function getPolloTagInfo(categoryKey, menuNum, shiftKey, subseccionName) {
  const menuNumber = Number(menuNum);
  const normSub = (subseccionName || '').toLowerCase().trim();

  const match = polloTagsData.find((tag) => {
    const matchCat = tag.categoria === categoryKey ||
      (tag.categoria === 'NORMAL' && categoryKey === 'REGIMEN_NORMAL') ||
      (tag.categoria === 'DIABETICO' && categoryKey === 'REGIMEN_DIABETICO') ||
      (tag.categoria === 'HEPATICO' && categoryKey === 'REGIMEN_HEPATICO');

    const matchSub = (tag.subseccion || '').toLowerCase().trim() === normSub;

    return matchCat && tag.menu === menuNumber && tag.turno === shiftKey && matchSub;
  });

  return match || null;
}

/**
 * Returns list of all chicken tags marked as "inferido - revisar"
 */
export function getInferidoPolloTags() {
  return polloTagsData.filter((tag) => tag.confianza === 'inferido - revisar');
}
