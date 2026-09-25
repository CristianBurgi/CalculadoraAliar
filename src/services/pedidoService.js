import { calculateAllIngredients } from './calculatorService.js';
import { getDateRangeInfo } from '../utils/dateUtils.js';

// Section 8.2: Categorización de ingredientes
export const INGREDIENT_CATEGORIES = {
  VERDURA_Y_FRUTA: [
    'Acelga', 'Ajo', 'Apio', 'Arveja', 'Berenjena', 'Cebolla',
    'Cebolla verde', 'Chaucha', 'Coreanito', 'Lechuga', 'Limón', 'Papa', 'Perejil',
    'Pimiento', 'Remolacha', 'Tomate', 'Verdeo', 'Zanahoria',
    'Zapallito', 'Zapallo'
  ],
  CARNE_POLLO_CERDO: [
    'Carne', 'Carne molida', 'Cerdo', 'Filet de pollo', 'Pollo', 'Pollo desmenuzado'
  ]
};

// Section 8.3: Alias de nombres
export const ALIAS_MAP = {
  'Arvejas': 'Arveja',
  'Berenjenas': 'Berenjena',
  'Cebolla (fugazzeta)': 'Cebolla',
  'Coreano': 'Coreanito',
  'Remolacha rallada': 'Remolacha',
  'Zanahoria rallada': 'Zanahoria',
  'Zapallitos': 'Zapallito',
  'Zapallito verde': 'Zapallito',
  'Papas al horno': 'Papa',
  'Rodaja de tomate': 'Tomate',
  'Carne molida 1ª calidad': 'Carne molida',
  'Carne molida de 1ª calidad': 'Carne molida',
  'Molida de 1ª calidad': 'Carne molida'
};

// Section 8.4: Tabla inicial de factores de corrección (neto -> bruto)
export const DEFAULT_FACTORS = {
  'Acelga': 1.6,
  'Ajo': 1.15,
  'Apio': 1.4,
  'Arveja': 1.0,
  'Berenjena': 1.2,
  'Cebolla': 1.15,
  'Cebolla (fugazzeta)': 1.15,
  'Cebolla verde': 1.3,
  'Chaucha': 1.15,
  'Coreanito': 1.3,
  'Lechuga': 1.4,
  'Limón': 1.0,
  'Papa': 1.25,
  'Perejil': 1.3,
  'Pimiento': 1.25,
  'Remolacha': 1.3,
  'Remolacha rallada': 1.3,
  'Tomate': 1.1,
  'Verdeo': 1.3,
  'Zanahoria': 1.2,
  'Zanahoria rallada': 1.2,
  'Zapallito': 1.1,
  'Zapallo': 1.4,
  'Carne': 1.15,
  'Carne molida': 1.0,
  'Cerdo': 1.15,
  'Filet de pollo': 1.05,
  'Pollo': 1.05,
  'Pollo desmenuzado': 1.05
};

// Promedios iniciales por defecto (por turno/categoría)
export const DEFAULT_PORTION_AVERAGES = {
  weekday: {
    PERSONAL: 150,
    REGIMEN_NORMAL: 180,
    REGIMEN_DIABETICO: 45,
    REGIMEN_HEPATICO: 45
  },
  weekend: {
    PERSONAL: 80,
    REGIMEN_NORMAL: 130,
    REGIMEN_DIABETICO: 35,
    REGIMEN_HEPATICO: 35
  }
};

const STORAGE_FACTORS_KEY = 'aliar_factores_correccion';
const STORAGE_AVERAGES_KEY = 'aliar_promedios_raciones';

/**
 * Normalizes raw ingredient name using ALIAS_MAP
 */
export function getMappedIngredientName(rawName) {
  const trimmed = (rawName || '').trim();
  return ALIAS_MAP[trimmed] || trimmed;
}

/**
 * Reads saved factors from localStorage or fallback to defaults
 */
export function getSavedFactors() {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_FACTORS };
  try {
    const stored = localStorage.getItem(STORAGE_FACTORS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_FACTORS, ...parsed };
    }
  } catch (err) {
    console.warn('Error reading factors from localStorage:', err);
  }
  return { ...DEFAULT_FACTORS };
}

/**
 * Saves factors to localStorage
 */
export function saveFactors(factors) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_FACTORS_KEY, JSON.stringify(factors));
  } catch (err) {
    console.warn('Error saving factors to localStorage:', err);
  }
}

/**
 * Resets factors to defaults
 */
export function resetFactorsToDefault() {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_FACTORS_KEY);
    } catch (e) {}
  }
  return { ...DEFAULT_FACTORS };
}

/**
 * Reads saved averages from localStorage or fallback to defaults
 */
export function getSavedAverages() {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_PORTION_AVERAGES };
  try {
    const stored = localStorage.getItem(STORAGE_AVERAGES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.warn('Error reading portion averages from localStorage:', err);
  }
  return { ...DEFAULT_PORTION_AVERAGES };
}

/**
 * Saves averages to localStorage
 */
export function saveAverages(averages) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_AVERAGES_KEY, JSON.stringify(averages));
  } catch (err) {
    console.warn('Error saving portion averages to localStorage:', err);
  }
}

/**
 * Helper to build portion state object for a single day from average raciones.
 */
function buildPortionsForDay(categoryAverages) {
  return {
    PERSONAL: { almuerzo: categoryAverages.PERSONAL || 0, cena: categoryAverages.PERSONAL || 0 },
    REGIMEN_NORMAL: { almuerzo: categoryAverages.REGIMEN_NORMAL || 0, cena: categoryAverages.REGIMEN_NORMAL || 0 },
    REGIMEN_DIABETICO: { almuerzo: categoryAverages.REGIMEN_DIABETICO || 0, cena: categoryAverages.REGIMEN_DIABETICO || 0 },
    REGIMEN_HEPATICO: { almuerzo: categoryAverages.REGIMEN_HEPATICO || 0, cena: categoryAverages.REGIMEN_HEPATICO || 0 },
  };
}

/**
 * Main calculation function for Module 2 Supplier Order (Pedido de Compra).
 */
export function calculatePedidoRango(startDateIso, daysCount, customAverages = null, customFactors = null) {
  const averages = customAverages || getSavedAverages();
  const factors = customFactors || getSavedFactors();

  const rangeDays = getDateRangeInfo(startDateIso, daysCount);
  const netAggregatedMap = new Map(); // key -> { name, mappedName, totalNetGrams, totalUnits, unitType, isWholeChicken }

  // 1. Iterate each day in the date range
  rangeDays.forEach((dayInfo) => {
    const categoryAverages = dayInfo.isSpecialDay ? averages.weekend : averages.weekday;
    const portionsState = buildPortionsForDay(categoryAverages);

    const dayResults = calculateAllIngredients(dayInfo.menuNum, portionsState);

    // Aggregate ingredient net quantities across categories & shifts
    Object.values(dayResults).forEach((catRes) => {
      ['almuerzo', 'cena'].forEach((shiftKey) => {
        const shiftData = catRes[shiftKey];
        if (!shiftData || !shiftData.available || !shiftData.subsections) return;

        shiftData.subsections.forEach((sub) => {
          sub.items.forEach((item) => {
            const mappedName = getMappedIngredientName(item.name);
            const key = mappedName.toLowerCase();

            if (!netAggregatedMap.has(key)) {
              netAggregatedMap.set(key, {
                mappedName,
                originalName: item.name,
                totalNetGrams: 0,
                totalUnits: 0,
                unitType: item.unitLabel,
                isWholeChicken: item.conversionType === 'pollo_entera',
              });
            }

            const entry = netAggregatedMap.get(key);
            if (item.conversionType === 'pollo_entera') {
              entry.isWholeChicken = true;
              entry.totalUnits += item.totalQuantity;
              entry.unitType = 'pollos enteros';
            } else if (item.unitLabel === 'U' || item.unitLabel === 'hoja' || item.conversionType === 'huevo') {
              entry.totalUnits += item.totalQuantity;
            } else {
              entry.totalNetGrams += item.totalGramsEquivalent || item.totalQuantity || 0;
            }
          });
        });
      });
    });
  });

  // 2. Classify & apply correction factors for supplier orders
  const verduraYFrutaList = [];
  const carnePolloCerdoList = [];
  const unclassifiedList = [];

  const verduraSet = new Set(INGREDIENT_CATEGORIES.VERDURA_Y_FRUTA.map((s) => s.toLowerCase()));
  const carneSet = new Set(INGREDIENT_CATEGORIES.CARNE_POLLO_CERDO.map((s) => s.toLowerCase()));

  netAggregatedMap.forEach((entry) => {
    const keyLower = entry.mappedName.toLowerCase();
    const isVerdura = verduraSet.has(keyLower);
    const isCarne = carneSet.has(keyLower);

    // Factor lookup
    const factor = factors[entry.mappedName] ?? factors[entry.originalName] ?? 1.0;
    const hasCustomFactor = factors.hasOwnProperty(entry.mappedName) || factors.hasOwnProperty(entry.originalName);

    let grossDisplay = '';
    let netDisplay = '';
    let grossValue = 0;

    if (entry.isWholeChicken) {
      // Rule 8.4: Pollo presa entera does NOT use correction factor (already in units)
      grossDisplay = `${entry.totalUnits} pollos enteros`;
      netDisplay = `${entry.totalUnits} pollos enteros`;
      grossValue = entry.totalUnits;
    } else if (entry.totalUnits > 0 && entry.totalNetGrams === 0) {
      grossDisplay = `${entry.totalUnits} ${entry.unitType}`;
      netDisplay = grossDisplay;
      grossValue = entry.totalUnits;
    } else {
      // Grams calculation: apply factor (gross = net * factor)
      const netKg = entry.totalNetGrams / 1000;
      const grossKg = netKg * factor;
      grossValue = Number(grossKg.toFixed(1));

      grossDisplay = `${grossValue} kg`;
      netDisplay = `${Number(netKg.toFixed(2))} kg`;
    }

    const reportItem = {
      name: entry.mappedName,
      originalName: entry.originalName,
      netQuantityStr: netDisplay,
      grossQuantityStr: grossDisplay,
      grossValue,
      factor: entry.isWholeChicken ? 1.0 : factor,
      hasCustomFactor,
      isWholeChicken: entry.isWholeChicken,
    };

    if (isVerdura) {
      verduraYFrutaList.push(reportItem);
    } else if (isCarne) {
      carnePolloCerdoList.push(reportItem);
    } else {
      // Check if it should be shown as unclassified
      if (entry.totalNetGrams > 0 || entry.totalUnits > 0) {
        unclassifiedList.push(reportItem);
      }
    }
  });

  // Sort lists alphabetically by name
  const sortFn = (a, b) => a.name.localeCompare(b.name, 'es');
  verduraYFrutaList.sort(sortFn);
  carnePolloCerdoList.sort(sortFn);
  unclassifiedList.sort(sortFn);

  return {
    startDateIso,
    daysCount,
    rangeDays,
    verduraYFrutaList,
    carnePolloCerdoList,
    unclassifiedList,
  };
}

/**
 * Builds plain text formatted for WhatsApp sharing of Module 2 supplier order.
 */
export function buildPedidoWhatsAppText(pedidoData) {
  const { rangeDays, verduraYFrutaList, carnePolloCerdoList } = pedidoData;
  const startLabel = rangeDays[0]?.label || '';
  const endLabel = rangeDays[rangeDays.length - 1]?.label || '';

  const lines = [
    `📦 *PEDIDO DE COMPRA A PROVEEDORES*`,
    `🗓️ *Rango:* ${startLabel} al ${endLabel} (${rangeDays.length} días)`,
    ''
  ];

  lines.push(`🥬 *VERDURA Y FRUTA (PESO BRUTO)*`);
  if (verduraYFrutaList.length > 0) {
    verduraYFrutaList.forEach((item) => {
      lines.push(`• ${item.name}: *${item.grossQuantityStr}*`);
    });
  } else {
    lines.push(`(Sin ítems)`);
  }

  lines.push('');
  lines.push(`🥩 *CARNE, POLLO Y CERDO (PESO BRUTO)*`);
  if (carnePolloCerdoList.length > 0) {
    carnePolloCerdoList.forEach((item) => {
      lines.push(`• ${item.name}: *${item.grossQuantityStr}*`);
    });
  } else {
    lines.push(`(Sin ítems)`);
  }

  return lines.join('\n').trim();
}
