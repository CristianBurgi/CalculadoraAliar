import { getSubsectionsForCategory, getPlatoTitle, getPolloTagInfo, CATEGORIES, CATEGORY_LABELS, SHIFT_LABELS } from '../data/menuRepository.js';

/**
 * Parses raw ingredient quantity string (e.g. "150", "2.5", "1U", "4U", "10 / 10", "C/S", "(s/c)")
 * Returns an array of parsed items: [{ name, qty, type: 'gram'|'unit'|'cs'|'slash' }]
 */
export function parseIngredientQuantity(rawName, rawQtyStr) {
  const qtyStr = (rawQtyStr || '').toString().trim();
  const name = rawName.trim();

  if (!qtyStr || qtyStr.toUpperCase() === 'C/S' || qtyStr.toLowerCase().includes('(s/c)') || qtyStr.toLowerCase().includes('(s/d)')) {
    return [{ name, qty: 0, type: 'cs' }];
  }

  // Handle slash combined names & values like "Jamón / Queso" and "10 / 10"
  if (name.includes('/') && qtyStr.includes('/')) {
    const nameParts = name.split('/').map((s) => s.trim());
    const qtyParts = qtyStr.split('/').map((s) => s.trim());

    const result = [];
    for (let i = 0; i < nameParts.length; i++) {
      const partName = nameParts[i];
      const partQtyStr = qtyParts[i] || qtyParts[0];
      const parsed = parseIngredientQuantity(partName, partQtyStr);
      result.push(...parsed);
    }
    return result;
  }

  // Handle unit quantities like "1U", "2U", "4U", "1 hoja"
  const unitMatch = qtyStr.match(/^(\d+(?:\.\d+)?)\s*([Uu]|hoja|hojas)?$/);
  if (unitMatch && (unitMatch[2] || qtyStr.toUpperCase().endsWith('U'))) {
    const val = parseFloat(unitMatch[1]);
    const unitLabel = unitMatch[2] ? unitMatch[2] : 'U';
    return [{ name, qty: val, type: 'unit', unit: unitLabel }];
  }

  // Handle standard numeric values (grams)
  const numVal = parseFloat(qtyStr.replace(',', '.'));
  if (!isNaN(numVal)) {
    return [{ name, qty: numVal, type: 'gram' }];
  }

  return [{ name, qty: 0, type: 'cs' }];
}

/**
 * Formats gram quantities to kg or g string.
 */
export function formatGramQuantity(totalGrams) {
  if (totalGrams >= 1000) {
    const kg = totalGrams / 1000;
    // Keep up to 2 decimal places, remove trailing zeros
    const formatted = Number(kg.toFixed(2));
    return `${formatted} kg`;
  }
  return `${totalGrams} g`;
}

/**
 * Calculates ingredients for a specific category, menu number, shift, and portion count.
 */
export function calculateCategoryShiftIngredients(categoryKey, menuNum, shiftKey, raciones) {
  const platoTitle = getPlatoTitle(categoryKey, menuNum, shiftKey);
  const subData = getSubsectionsForCategory(categoryKey, menuNum, shiftKey);

  if (!subData.available) {
    return {
      categoryKey,
      shiftKey,
      raciones,
      platoTitle,
      available: false,
      reason: subData.reason,
      subsections: [],
    };
  }

  if (raciones <= 0) {
    return {
      categoryKey,
      shiftKey,
      raciones: 0,
      platoTitle,
      available: true,
      subsections: [],
    };
  }

  const calculatedSubsections = [];

  for (const [subseccionName, rawIngredients] of subData.subs) {
    const items = [];

    // Check chicken tag for whole chicken conversion
    const chickenTag = getPolloTagInfo(categoryKey, menuNum, shiftKey, subseccionName);

    for (const [rawName, rawQty] of rawIngredients) {
      const parsedList = parseIngredientQuantity(rawName, rawQty);

      for (const parsed of parsedList) {
        if (parsed.type === 'cs') {
          // Rule 3.3 #2: Ignore C/S items
          continue;
        }

        const isPolloItem = (parsed.name.toLowerCase() === 'pollo' || parsed.name.toLowerCase() === 'pollo al horno');
        const isPresaEntera = isPolloItem && chickenTag && chickenTag.presa_entera === true;
        const isEggItem = parsed.name.toLowerCase().includes('huevo');

        if (isPresaEntera) {
          // Rule 4.1: Pollo en presa entera => ceil(raciones / 5) pollos enteros
          const pollosEnteros = Math.ceil(raciones / 5);
          items.push({
            name: parsed.name,
            totalQuantity: pollosEnteros,
            unitLabel: pollosEnteros === 1 ? 'pollo entero' : 'pollos enteros',
            displayValue: `${pollosEnteros} pollos enteros`,
            isSpecialConversion: true,
            conversionType: 'pollo_entera',
            rawQuantityPerPortion: rawQty,
          });
        } else if (isEggItem) {
          // Rule 4.2: Huevo => ceil((cantidad_por_porcion_g * raciones) / 50) huevos
          const totalGrams = parsed.qty * raciones;
          const huevosCount = Math.ceil(totalGrams / 50);
          items.push({
            name: parsed.name,
            totalQuantity: huevosCount,
            unitLabel: huevosCount === 1 ? 'huevo' : 'huevos',
            displayValue: `${huevosCount} huevos`,
            isSpecialConversion: true,
            conversionType: 'huevo',
            rawQuantityPerPortion: rawQty,
            totalGramsEquivalent: totalGrams,
          });
        } else if (parsed.type === 'unit') {
          // Rule 3.3 #6: Unit items => qty * raciones U
          const totalUnits = Math.round(parsed.qty * raciones);
          const unit = parsed.unit || 'U';
          items.push({
            name: parsed.name,
            totalQuantity: totalUnits,
            unitLabel: unit,
            displayValue: `${totalUnits} ${unit}`,
            isSpecialConversion: false,
            rawQuantityPerPortion: rawQty,
          });
        } else {
          // Rule 3.3 #3 & #5: Standard gram calculation
          const totalGrams = parsed.qty * raciones;
          items.push({
            name: parsed.name,
            totalQuantity: totalGrams,
            unitLabel: totalGrams >= 1000 ? 'kg' : 'g',
            displayValue: formatGramQuantity(totalGrams),
            isSpecialConversion: false,
            rawQuantityPerPortion: rawQty,
            totalGramsEquivalent: totalGrams,
          });
        }
      }
    }

    calculatedSubsections.push({
      subseccionName,
      items,
    });
  }

  return {
    categoryKey,
    shiftKey,
    raciones,
    platoTitle,
    available: true,
    subsections: calculatedSubsections,
  };
}

/**
 * Primary function to calculate all categories and shifts for given portion selections.
 */
export function calculateAllIngredients(menuNum, portionsState) {
  const categoryResults = {};

  Object.keys(CATEGORIES).forEach((categoryKey) => {
    const categoryPortions = portionsState[categoryKey] || { almuerzo: 0, cena: 0 };
    const almuerzoRaciones = Number(categoryPortions.almuerzo) || 0;
    const cenaRaciones = Number(categoryPortions.cena) || 0;

    const almuerzoResult = calculateCategoryShiftIngredients(categoryKey, menuNum, 'almuerzo', almuerzoRaciones);
    const cenaResult = calculateCategoryShiftIngredients(categoryKey, menuNum, 'cena', cenaRaciones);

    categoryResults[categoryKey] = {
      categoryKey,
      categoryLabel: CATEGORY_LABELS[categoryKey],
      almuerzo: almuerzoResult,
      cena: cenaResult,
      totalRaciones: almuerzoRaciones + cenaRaciones,
    };
  });

  return categoryResults;
}
