import seedCatalog from '../data/catalogo_ingredientes_seed.json' with { type: 'json' };
import { CATEGORY_LABELS, SHIFT_LABELS } from '../data/menuRepository.js';

const STORAGE_CATALOG_KEY = 'aliar_catalogo_ingredientes';
const STORAGE_DRAFT_PREFIX = 'aliar_despensa_draft_';

/**
 * Gets the expanded ingredient catalog from localStorage or seed fallback.
 */
export function getExpandedCatalog() {
  try {
    const stored = localStorage.getItem(STORAGE_CATALOG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading catalog from localStorage:', err);
  }

  // Initialize with seed
  try {
    localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(seedCatalog));
  } catch (e) {
    // ignore quota/storage issues
  }
  return [...seedCatalog];
}

/**
 * Adds a new custom ingredient to the expanded catalog in localStorage.
 */
export function addIngredientToCatalog(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return getExpandedCatalog();

  const currentCatalog = getExpandedCatalog();
  const exists = currentCatalog.some(
    (item) => item.toLowerCase() === trimmed.toLowerCase()
  );

  if (!exists) {
    const updated = [...currentCatalog, trimmed].sort((a, b) =>
      a.localeCompare(b, 'es')
    );
    try {
      localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Error saving catalog to localStorage:', err);
    }
    return updated;
  }

  return currentCatalog;
}

/**
 * Formats ISO date (YYYY-MM-DD) to DD/MM/YYYY
 */
export function formatDateDisplay(isoDateStr) {
  if (!isoDateStr) return '';
  const parts = isoDateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDateStr;
}

/**
 * Builds unique draft key for localStorage.
 */
export function getDraftStorageKey(dateIso, menuNum, shiftKey) {
  return `${STORAGE_DRAFT_PREFIX}${dateIso}_m${menuNum}_${shiftKey}`;
}

/**
 * Retrieves saved draft from localStorage.
 */
export function getDraftRecord(dateIso, menuNum, shiftKey) {
  try {
    const key = getDraftStorageKey(dateIso, menuNum, shiftKey);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.warn('Error reading despensero draft:', err);
  }
  return null;
}

/**
 * Saves despensero draft to localStorage.
 */
export function saveDraftRecord(dateIso, menuNum, shiftKey, draftData) {
  try {
    const key = getDraftStorageKey(dateIso, menuNum, shiftKey);
    localStorage.setItem(key, JSON.stringify(draftData));
  } catch (err) {
    console.warn('Error saving despensero draft:', err);
  }
}

/**
 * Constructs initial despensero items from Module 1 calculated results for a specific shift.
 * Flattens/aggregates ingredients per category.
 */
export function buildInitialDespenseroItems(categoryResults, shiftKey) {
  const initialCategories = {
    PERSONAL: [],
    REGIMEN_NORMAL: [],
    REGIMEN_DIABETICO: [],
    REGIMEN_HEPATICO: [],
  };

  if (!categoryResults) return initialCategories;

  Object.keys(initialCategories).forEach((categoryKey) => {
    const catData = categoryResults[categoryKey];
    if (!catData) return;

    const shiftData = catData[shiftKey];
    if (!shiftData || !shiftData.available || !shiftData.subsections) return;

    // Aggregate by item name within the category for clean presentation
    const itemMap = new Map();

    shiftData.subsections.forEach((sub) => {
      sub.items.forEach((item) => {
        const key = item.name.trim();

        if (!itemMap.has(key)) {
          itemMap.set(key, {
            name: item.name,
            totalQuantity: 0,
            unitLabel: item.unitLabel,
            conversionType: item.conversionType,
            displayValue: item.displayValue,
            isSpecialConversion: item.isSpecialConversion,
            rawValues: [],
          });
        }

        const existing = itemMap.get(key);
        if (item.totalGramsEquivalent) {
          existing.totalQuantity += item.totalGramsEquivalent;
        } else {
          existing.totalQuantity += item.totalQuantity || 0;
        }
        existing.rawValues.push(item.displayValue);
      });
    });

    const categoryItemList = Array.from(itemMap.values()).map((entry, idx) => {
      let finalDisplayQty = entry.displayValue;

      // Re-format if aggregated
      if (entry.rawValues.length > 1) {
        if (entry.unitLabel === 'kg' || entry.unitLabel === 'g') {
          if (entry.totalQuantity >= 1000) {
            const kg = Number((entry.totalQuantity / 1000).toFixed(2));
            finalDisplayQty = `${kg} kg`;
          } else {
            finalDisplayQty = `${entry.totalQuantity} g`;
          }
        } else {
          finalDisplayQty = `${entry.totalQuantity} ${entry.unitLabel}`;
        }
      }

      return {
        id: `${categoryKey}_${shiftKey}_${idx}_${Date.now()}`,
        name: entry.name,
        quantityStr: finalDisplayQty,
        calculatedQtyStr: finalDisplayQty,
        isCustom: false,
      };
    });

    initialCategories[categoryKey] = categoryItemList;
  });

  return initialCategories;
}

/**
 * Builds plain text formatted for WhatsApp sharing.
 */
export function buildWhatsAppMessage(menuNum, shiftKey, dateIso, categoryItemsMap) {
  const shiftTitle = (SHIFT_LABELS[shiftKey] || shiftKey).toUpperCase();
  const dateFormatted = formatDateDisplay(dateIso);

  const lines = [`MENÚ ${menuNum} — ${shiftTitle} — ${dateFormatted}`, ''];

  const categoryOrder = ['PERSONAL', 'REGIMEN_NORMAL', 'REGIMEN_DIABETICO', 'REGIMEN_HEPATICO'];

  categoryOrder.forEach((catKey) => {
    const items = categoryItemsMap[catKey] || [];
    const validItems = items.filter((item) => (item.quantityStr || '').trim() !== '');

    if (validItems.length > 0) {
      const catLabel = (CATEGORY_LABELS[catKey] || catKey).toUpperCase();
      lines.push(catLabel);

      validItems.forEach((item) => {
        const name = item.name.trim();
        const qty = item.quantityStr.trim();
        lines.push(`${name} ${qty}`);
      });

      lines.push('');
    }
  });

  return lines.join('\n').trim();
}
