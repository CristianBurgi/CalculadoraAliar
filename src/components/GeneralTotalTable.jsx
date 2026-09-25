import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Printer, Edit2, Trash2, PlusCircle, RotateCcw, Check, X } from 'lucide-react';
import { getAllKnownIngredientNames } from '../data/menuRepository';

export default function GeneralTotalTable({ totalsList, menuNumber, portionsState }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Manual Adjustments State
  const [customOverrides, setCustomOverrides] = useState({}); // { [key]: '15 kg' }
  const [deletedKeys, setDeletedKeys] = useState(new Set()); // Set of deleted keys
  const [addedItems, setAddedItems] = useState([]); // [{ key, displayName, displayValue, originalNamesList, isAdded: true }]

  // Inline Editing State
  const [editingKey, setEditingKey] = useState(null);
  const [editInputValue, setEditInputValue] = useState('');

  // Add Item State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngQty, setNewIngQty] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // All known ingredients for autocomplete
  const allKnownNames = getAllKnownIngredientNames();

  // Reset manual adjustments when menu number or portions change
  const portionsHash = JSON.stringify(portionsState || {});
  useEffect(() => {
    setCustomOverrides({});
    setDeletedKeys(new Set());
    setAddedItems([]);
    setEditingKey(null);
    setShowAddForm(false);
  }, [menuNumber, portionsHash]);

  // Autocomplete filtering for new ingredient name
  const handleNameInputChange = (val) => {
    setNewIngName(val);
    if (val.trim().length > 0) {
      const filtered = allKnownNames.filter((name) =>
        name.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (name) => {
    setNewIngName(name);
    setShowSuggestions(false);
  };

  // Mermar / Editar quantity handler
  const handleStartEditing = (item) => {
    setEditingKey(item.key);
    setEditInputValue(item.displayValue);
  };

  const handleSaveEdit = (key) => {
    if (editInputValue.trim()) {
      // Check if item was newly added
      const addedIdx = addedItems.findIndex((it) => it.key === key);
      if (addedIdx !== -1) {
        setAddedItems((prev) =>
          prev.map((it) => (it.key === key ? { ...it, displayValue: editInputValue.trim() } : it))
        );
      } else {
        setCustomOverrides((prev) => ({
          ...prev,
          [key]: editInputValue.trim(),
        }));
      }
    }
    setEditingKey(null);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
  };

  // Borrar item handler
  const handleDeleteItem = (item) => {
    if (item.isAdded) {
      setAddedItems((prev) => prev.filter((it) => it.key !== item.key));
    } else {
      setDeletedKeys((prev) => {
        const next = new Set(prev);
        next.add(item.key);
        return next;
      });
    }
  };

  // Agregar ingrediente manual handler
  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (!newIngName.trim() || !newIngQty.trim()) return;

    const trimmedName = newIngName.trim();
    const trimmedQty = newIngQty.trim();
    const customKey = `custom_${Date.now()}_${trimmedName.toLowerCase().replace(/\s+/g, '_')}`;

    const newItem = {
      key: customKey,
      displayName: trimmedName,
      displayValue: trimmedQty,
      originalNamesList: 'Agregado manualmente',
      isAdded: true,
    };

    setAddedItems((prev) => [...prev, newItem]);
    setNewIngName('');
    setNewIngQty('');
    setShowAddForm(false);
    setShowSuggestions(false);
  };

  // Restablecer ajustes
  const handleResetAdjustments = () => {
    setCustomOverrides({});
    setDeletedKeys(new Set());
    setAddedItems([]);
    setEditingKey(null);
  };

  // Construct current displayed totals list
  const mergedTotals = [
    ...totalsList
      .filter((item) => !deletedKeys.has(item.key))
      .map((item) => {
        const isEdited = customOverrides.hasOwnProperty(item.key);
        return {
          ...item,
          displayValue: isEdited ? customOverrides[item.key] : item.displayValue,
          isEdited,
        };
      }),
    ...addedItems,
  ];

  // Filter by search term
  const finalFilteredTotals = mergedTotals.filter(
    (item) =>
      item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.originalNamesList.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasAdjustments =
    Object.keys(customOverrides).length > 0 || deletedKeys.size > 0 || addedItems.length > 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="general-total-card animate-fade-in">
      <div className="general-total-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <ShoppingBag size={22} color="var(--primary-700)" />
            <span>Total General de Depósito</span>
            {hasAdjustments && (
              <span style={{ fontSize: '0.72rem', background: 'var(--amber-100)', color: 'var(--amber-700)', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontWeight: '700' }}>
                Ajustes manuales activos
              </span>
            )}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>
            Suma consolidada de raciones (editable en vivo: agregar, mermar o borrar)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              placeholder="Buscar ingrediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.45rem 0.5rem 0.45rem 2rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--slate-300)',
                fontSize: '0.82rem',
                width: '180px',
              }}
            />
          </div>

          <button
            className="btn-action btn-primary no-print"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ backgroundColor: 'var(--emerald-600)' }}
          >
            <PlusCircle size={16} />
            <span>Agregar</span>
          </button>

          {hasAdjustments && (
            <button className="btn-action btn-secondary no-print" onClick={handleResetAdjustments} title="Restablecer cálculos de raciones originales">
              <RotateCcw size={15} />
              <span>Restablecer</span>
            </button>
          )}

          <button className="btn-action btn-secondary no-print" onClick={handlePrint}>
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Formulario Agregar Ingrediente Manual */}
      {showAddForm && (
        <form onSubmit={handleAddIngredient} className="add-ingredient-form animate-fade-in no-print" style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--slate-700)', marginBottom: '0.75rem' }}>
            ➕ Agregar ingrediente extra al Total General
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Nombre del ingrediente (ej. Manteca, Zanahoria)..."
                value={newIngName}
                onChange={(e) => handleNameInputChange(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
                autoFocus
              />

              {showSuggestions && filteredSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--slate-300)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)', zIndex: 50, maxHeight: '180px', overflowY: 'auto', marginTop: '2px' }}>
                  {filteredSuggestions.map((name, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(name)}
                      style={{ padding: '0.45rem 0.75rem', cursor: 'pointer', fontSize: '0.82rem', borderBottom: '1px solid var(--slate-100)' }}
                      className="suggestion-item"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Cantidad (ej. 5 kg, 10 U)"
              value={newIngQty}
              onChange={(e) => setNewIngQty(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-action btn-primary" style={{ padding: '0.5rem 0.85rem' }}>
                <Check size={16} />
                <span>Guardar</span>
              </button>
              <button type="button" className="btn-action btn-secondary" onClick={() => setShowAddForm(false)} style={{ padding: '0.5rem 0.65rem' }}>
                <X size={16} />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tabla de Total General */}
      <div className="total-table-container">
        {finalFilteredTotals.length > 0 ? (
          <table className="total-table">
            <thead>
              <tr>
                <th>Ingrediente (Consolidado)</th>
                <th>Cantidad Total a Retirar</th>
                <th>Variantes Incluidas</th>
                <th className="no-print" style={{ width: '100px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {finalFilteredTotals.map((item) => {
                const isEditing = editingKey === item.key;

                return (
                  <tr key={item.key} style={{ backgroundColor: item.isAdded ? '#f0fdf4' : item.isEdited ? '#fffbeb' : undefined }}>
                    <td style={{ fontWeight: '600', color: 'var(--slate-900)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {item.displayName}
                        {item.isEdited && (
                          <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#b45309', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                            Mermado
                          </span>
                        )}
                        {item.isAdded && (
                          <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                            Agregado
                          </span>
                        )}
                      </span>
                    </td>

                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <input
                            type="text"
                            value={editInputValue}
                            onChange={(e) => setEditInputValue(e.target.value)}
                            style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-600)', fontSize: '0.85rem', width: '120px', fontWeight: '700' }}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(item.key);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <button onClick={() => handleSaveEdit(item.key)} className="btn-action btn-primary" style={{ padding: '0.25rem 0.4rem' }} title="Guardar">
                            <Check size={14} />
                          </button>
                          <button onClick={handleCancelEdit} className="btn-action btn-secondary" style={{ padding: '0.25rem 0.4rem' }} title="Cancelar">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="total-qty-badge" style={{ backgroundColor: item.isEdited ? '#fef3c7' : item.isAdded ? '#dcfce7' : undefined, color: item.isEdited ? '#92400e' : item.isAdded ? '#166534' : undefined }}>
                          {item.displayValue}
                        </span>
                      )}
                    </td>

                    <td style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                      {item.originalNamesList}
                    </td>

                    <td className="no-print" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEditing(item)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--slate-600)', cursor: 'pointer', padding: '0.3rem', borderRadius: '4px' }}
                            title="Mermar / Editar cantidad"
                            className="icon-hover-btn"
                          >
                            <Edit2 size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteItem(item)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem', borderRadius: '4px' }}
                          title="Borrar ingrediente del total"
                          className="icon-hover-btn"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
            {totalsList.length === 0 ? 'No hay raciones ingresadas o ingredientes a calcular.' : 'No se encontraron ingredientes con el filtro buscado.'}
          </div>
        )}
      </div>
    </div>
  );
}
