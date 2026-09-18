import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Sun,
  Moon,
  Save,
  Trash2,
  Sparkles,
  PackagePlus,
  X,
} from 'lucide-react';
import {
  getExpandedCatalog,
  addIngredientToCatalog,
  getDraftRecord,
  saveDraftRecord,
  buildInitialDespenseroItems,
  buildWhatsAppMessage,
  formatDateDisplay,
} from '../services/despensaService.js';
import { CATEGORIES, CATEGORY_LABELS } from '../data/menuRepository.js';

export default function DespenseroView({
  selectedDate,
  menuNumber,
  categoryResults,
}) {
  // Shift selection: 'almuerzo' (Mañana) or 'cena' (Tarde)
  const [activeShift, setActiveShift] = useState('almuerzo');

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Main Category Items map: { PERSONAL: [], REGIMEN_NORMAL: [], ... }
  const [itemsMap, setItemsMap] = useState({
    PERSONAL: [],
    REGIMEN_NORMAL: [],
    REGIMEN_DIABETICO: [],
    REGIMEN_HEPATICO: [],
  });

  // Expanded Catalog state
  const [catalog, setCatalog] = useState(() => getExpandedCatalog());

  // Add Item Modal/Form State
  const [addItemCategory, setAddItemCategory] = useState(null); // category key or null
  const [catalogSearchText, setCatalogSearchText] = useState('');
  const [selectedIngredientName, setSelectedIngredientName] = useState('');
  const [newIngredientQty, setNewIngredientQty] = useState('');

  // UI Toast / Feedback states
  const [copySuccess, setCopySuccess] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // Load initial or saved draft state on date/menu/shift change
  useEffect(() => {
    const savedDraft = getDraftRecord(selectedDate, menuNumber, activeShift);

    if (savedDraft && savedDraft.itemsMap) {
      setItemsMap(savedDraft.itemsMap);
      setLastSavedTime(savedDraft.timestamp || Date.now());
    } else {
      const initialMap = buildInitialDespenseroItems(categoryResults, activeShift);
      setItemsMap(initialMap);
      setLastSavedTime(null);
    }
  }, [selectedDate, menuNumber, activeShift, categoryResults]);

  // Save to localStorage automatically on itemsMap change
  const autoSave = (newItemsMap) => {
    setItemsMap(newItemsMap);
    const timestamp = Date.now();
    saveDraftRecord(selectedDate, menuNumber, activeShift, {
      itemsMap: newItemsMap,
      timestamp,
    });
    setLastSavedTime(timestamp);
  };

  // Handler: Change Quantity for an Item
  const handleQuantityChange = (categoryKey, itemId, newQty) => {
    const updated = {
      ...itemsMap,
      [categoryKey]: itemsMap[categoryKey].map((item) =>
        item.id === itemId ? { ...item, quantityStr: newQty } : item
      ),
    };
    autoSave(updated);
  };

  // Handler: Remove Item
  const handleRemoveItem = (categoryKey, itemId) => {
    const updated = {
      ...itemsMap,
      [categoryKey]: itemsMap[categoryKey].filter((item) => item.id !== itemId),
    };
    autoSave(updated);
  };

  // Handler: Reset Draft to Module 1 Initial Calculation
  const handleResetDraft = () => {
    if (
      window.confirm(
        '¿Restablecer el registro a los valores calculados teóricamente para este turno?'
      )
    ) {
      const initialMap = buildInitialDespenseroItems(categoryResults, activeShift);
      autoSave(initialMap);
    }
  };

  // Handler: Add Item to Category
  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!addItemCategory) return;

    const ingName = (selectedIngredientName || catalogSearchText).trim();
    if (!ingName) return;

    // Check if ingredient should be added to expanded catalog
    const updatedCatalog = addIngredientToCatalog(ingName);
    setCatalog(updatedCatalog);

    const newItem = {
      id: `custom_${addItemCategory}_${Date.now()}`,
      name: ingName,
      quantityStr: newIngredientQty.trim() || '1',
      calculatedQtyStr: '',
      isCustom: true,
    };

    const updated = {
      ...itemsMap,
      [addItemCategory]: [...(itemsMap[addItemCategory] || []), newItem],
    };

    autoSave(updated);

    // Reset Modal
    setAddItemCategory(null);
    setCatalogSearchText('');
    setSelectedIngredientName('');
    setNewIngredientQty('');
  };

  // WhatsApp Share Handler
  const handleShareWhatsApp = () => {
    const msg = buildWhatsAppMessage(menuNumber, activeShift, selectedDate, itemsMap);
    const encoded = encodeURIComponent(msg);

    // Try native share API on mobile browsers first
    if (navigator.share) {
      navigator
        .share({
          title: `Despensa - Menú ${menuNumber}`,
          text: msg,
        })
        .catch(() => {
          window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
        });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }
  };

  // Copy to Clipboard Handler
  const handleCopyClipboard = () => {
    const msg = buildWhatsAppMessage(menuNumber, activeShift, selectedDate, itemsMap);
    navigator.clipboard.writeText(msg).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  // Filter Catalog Suggestions
  const catalogSuggestions = useMemo(() => {
    if (!catalogSearchText.trim()) return catalog.slice(0, 8);
    const query = catalogSearchText.toLowerCase();
    return catalog.filter((item) => item.toLowerCase().includes(query)).slice(0, 10);
  }, [catalogSearchText, catalog]);

  // Filtered Category Items based on search bar
  const filteredCategoryItems = useMemo(() => {
    if (!searchQuery.trim()) return itemsMap;
    const q = searchQuery.toLowerCase().trim();

    const filtered = {};
    Object.keys(itemsMap).forEach((catKey) => {
      filtered[catKey] = (itemsMap[catKey] || []).filter((item) =>
        item.name.toLowerCase().includes(q)
      );
    });
    return filtered;
  }, [searchQuery, itemsMap]);

  return (
    <div className="despensero-container">
      {/* Header & Controls Panel */}
      <div className="despensero-header-card">
        <div className="despensero-top-bar">
          <div>
            <div className="despensero-badge-tag">
              <Save size={14} /> Módulo 2 — Depósito & Despensa
            </div>
            <h2 className="despensero-title">Registro Real del Despensero</h2>
            <p className="despensero-subtitle">
              Menú {menuNumber} • Fecha: {formatDateDisplay(selectedDate)}
            </p>
          </div>

          {/* Shift Selection Switcher */}
          <div className="shift-toggle-group">
            <button
              className={`shift-toggle-btn ${activeShift === 'almuerzo' ? 'active' : ''}`}
              onClick={() => setActiveShift('almuerzo')}
            >
              <Sun size={16} />
              <span>Almuerzo (Mañana)</span>
            </button>
            <button
              className={`shift-toggle-btn ${activeShift === 'cena' ? 'active' : ''}`}
              onClick={() => setActiveShift('cena')}
            >
              <Moon size={16} />
              <span>Cena (Tarde)</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Actions Toolbar */}
        <div className="despensero-toolbar">
          <div className="quick-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar ingrediente en la lista..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="quick-search-input"
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="action-buttons-group">
            <button
              className="btn-action btn-whatsapp"
              onClick={handleShareWhatsApp}
              title="Compartir por WhatsApp"
            >
              <Share2 size={16} />
              <span>Compartir por WhatsApp</span>
            </button>

            <button
              className="btn-action btn-secondary"
              onClick={handleCopyClipboard}
              title="Copiar texto al portapapeles"
            >
              {copySuccess ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              <span>{copySuccess ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              className="btn-action btn-outline-danger"
              onClick={handleResetDraft}
              title="Restablecer a valores calculados"
            >
              <RotateCcw size={15} />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Auto-save status feedback */}
        <div className="autosave-status-bar">
          <span className="status-indicator-dot"></span>
          <span>
            {lastSavedTime
              ? `Autoguardado en este dispositivo (${new Date(lastSavedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
              : 'Cambios listos para autoguardar en este dispositivo'}
          </span>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="despensero-categories-grid">
        {Object.keys(CATEGORIES).map((catKey) => {
          const catLabel = CATEGORY_LABELS[catKey];
          const items = filteredCategoryItems[catKey] || [];
          const totalItemsCount = (itemsMap[catKey] || []).length;

          return (
            <div key={catKey} className="despensero-category-card">
              <div className="despensero-category-header">
                <div>
                  <h3 className="despensero-category-title">{catLabel}</h3>
                  <span className="category-count-badge">
                    {totalItemsCount} {totalItemsCount === 1 ? 'ingrediente' : 'ingredientes'}
                  </span>
                </div>

                <button
                  className="btn-add-ingredient"
                  onClick={() => {
                    setAddItemCategory(catKey);
                    setCatalogSearchText('');
                    setSelectedIngredientName('');
                    setNewIngredientQty('');
                  }}
                  title="Agregar ingrediente o postre"
                >
                  <Plus size={16} />
                  <span>Agregar extra</span>
                </button>
              </div>

              <div className="despensero-category-body">
                {items.length === 0 ? (
                  <div className="empty-category-notice">
                    {searchQuery
                      ? 'No hay ingredientes coincidiendo con la búsqueda'
                      : 'No hay ingredientes registrados para este turno en esta categoría'}
                  </div>
                ) : (
                  <div className="despensero-items-list">
                    {items.map((item) => (
                      <div key={item.id} className="despensero-item-row">
                        <div className="despensero-item-info">
                          <span className="despensero-item-name">{item.name}</span>
                          {item.isCustom && (
                            <span className="badge-custom-extra" title="Agregado a mano / Postre">
                              <Sparkles size={11} /> Extra
                            </span>
                          )}
                          {item.calculatedQtyStr && item.calculatedQtyStr !== item.quantityStr && (
                            <span className="badge-edited" title={`Teórico: ${item.calculatedQtyStr}`}>
                              Modificado
                            </span>
                          )}
                        </div>

                        <div className="despensero-item-actions">
                          <input
                            type="text"
                            value={item.quantityStr}
                            onChange={(e) =>
                              handleQuantityChange(catKey, item.id, e.target.value)
                            }
                            placeholder="Cant. real"
                            className="despensero-qty-input"
                          />

                          <button
                            className="btn-remove-item"
                            onClick={() => handleRemoveItem(catKey, item.id)}
                            title="Eliminar de la lista"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Extra Ingredient Modal / Dialog */}
      {addItemCategory && (
        <div className="modal-backdrop" onClick={() => setAddItemCategory(null)}>
          <div
            className="modal-content-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-box">
                <PackagePlus size={20} className="modal-icon" />
                <div>
                  <h3 className="modal-title">Agregar ingrediente / postre</h3>
                  <span className="modal-subtitle">
                    {CATEGORY_LABELS[addItemCategory]}
                  </span>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setAddItemCategory(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Buscar o escribir ingrediente</label>
                <input
                  type="text"
                  placeholder="Ej. Zanahoria, Gelatina, Queso..."
                  value={catalogSearchText}
                  onChange={(e) => {
                    setCatalogSearchText(e.target.value);
                    setSelectedIngredientName(e.target.value);
                  }}
                  className="form-control"
                  autoFocus
                  required
                />

                {/* Catalog Suggestions List */}
                <div className="catalog-suggestions-box">
                  {catalogSuggestions.map((catItem) => (
                    <button
                      key={catItem}
                      type="button"
                      className={`catalog-chip ${
                        selectedIngredientName.toLowerCase() === catItem.toLowerCase()
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedIngredientName(catItem);
                        setCatalogSearchText(catItem);
                      }}
                    >
                      {catItem}
                    </button>
                  ))}
                </div>

                {catalogSearchText.trim() &&
                  !catalog.some(
                    (c) => c.toLowerCase() === catalogSearchText.trim().toLowerCase()
                  ) && (
                    <div className="new-catalog-notice">
                      <Sparkles size={14} /> Se agregará &quot;
                      {catalogSearchText.trim()}&quot; al catálogo local para futuras búsquedas.
                    </div>
                  )}
              </div>

              <div className="form-group">
                <label className="form-label">Cantidad real entregada</label>
                <input
                  type="text"
                  placeholder="Ej. 15 kg, 40, 2 U..."
                  value={newIngredientQty}
                  onChange={(e) => setNewIngredientQty(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-action btn-secondary"
                  onClick={() => setAddItemCategory(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-action btn-primary">
                  <Plus size={16} /> Agregar al Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
