import { formatGramQuantity } from './calculatorService.js';

/**
 * Maps ingredient names to standard base keys and display names for Total General.
 */
export function getNormalizedIngredientKey(rawName) {
  const name = rawName.trim();
  const lower = name.toLowerCase();

  // Special Whole Chicken
  if (lower.includes('pollo') && lower.includes('entero')) {
    return { key: 'pollo_entero', displayName: 'Pollo entero', groupType: 'unit', unit: 'pollos enteros' };
  }

  // Filet de pollo & Pollo desmenuzado
  if (lower.includes('filet de pollo') || lower.includes('pollo desmenuzado')) {
    return { key: 'filet_pollo', displayName: 'Filet de pollo', groupType: 'gram' };
  }

  // Carne normalization (Carne, Carne molida, Molida 1ª calidad, etc.)
  if (lower === 'carne' || lower.includes('carne molida') || lower.includes('molida de 1ª') || lower.includes('molida 1ª')) {
    return { key: 'carne_base', displayName: 'Carne', groupType: 'gram' };
  }

  // Aceituna
  if (lower.startsWith('aceituna')) {
    return { key: 'aceituna_base', displayName: 'Aceituna', groupType: 'unit', unit: 'U' };
  }

  // Default fallback: strip 'rallada', 'rallado', 'picada', 'picado'
  const cleaned = name
    .replace(/\s+(rallada|rallado|picada|picado|desmenuzado|para ligar)$/i, '')
    .trim();

  return { key: cleaned.toLowerCase(), displayName: cleaned, groupType: 'gram' };

}

/**
 * Calculates the Total General across all calculated categories.
 */
export function calculateGeneralTotal(categoryResults) {
  const map = new Map();

  Object.values(categoryResults).forEach((catRes) => {
    ['almuerzo', 'cena'].forEach((shiftKey) => {
      const shiftData = catRes[shiftKey];
      if (!shiftData || !shiftData.available || !shiftData.subsections) return;

      shiftData.subsections.forEach((sub) => {
        sub.items.forEach((item) => {
          const normInfo = getNormalizedIngredientKey(item.name);
          const key = normInfo.key;

          if (!map.has(key)) {
            map.set(key, {
              key,
              displayName: normInfo.displayName,
              groupType: normInfo.groupType,
              totalQuantity: 0,
              unitLabel: item.unitLabel,
              originalNames: new Set([item.name]),
            });
          }

          const existing = map.get(key);
          existing.originalNames.add(item.name);

          if (item.conversionType === 'pollo_entera') {
            existing.groupType = 'unit';
            existing.unitLabel = 'pollos enteros';
            existing.totalQuantity += item.totalQuantity;
          } else if (item.conversionType === 'huevo' || normInfo.groupType === 'egg_unit') {
            existing.groupType = 'egg_unit';
            existing.unitLabel = 'huevos';
            existing.totalQuantity += item.totalQuantity;
          } else if (item.unitLabel === 'U' || item.unitLabel === 'hoja' || normInfo.groupType === 'unit') {
            existing.groupType = 'unit';
            existing.totalQuantity += item.totalQuantity;
          } else {
            // Grams
            existing.totalQuantity += item.totalGramsEquivalent || item.totalQuantity;
          }
        });
      });
    });
  });

  const totals = Array.from(map.values()).map((entry) => {
    let displayValue = '';

    if (entry.groupType === 'unit' || entry.groupType === 'egg_unit') {
      displayValue = `${entry.totalQuantity} ${entry.unitLabel || 'unidades'}`;
    } else {
      displayValue = formatGramQuantity(entry.totalQuantity);
    }

    return {
      ...entry,
      originalNamesList: Array.from(entry.originalNames).join(', '),
      displayValue,
    };
  });

  // Sort alphabetically by display name
  totals.sort((a, b) => a.displayName.localeCompare(b.displayName, 'es'));

  return totals;
}
