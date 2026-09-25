import React, { useState } from 'react';
import { X, Save, RotateCcw, Plus, Check } from 'lucide-react';
import { getSavedFactors, saveFactors, resetFactorsToDefault } from '../services/pedidoService';

export default function FactoresCorreccionModal({ isOpen, onClose, onFactorsUpdated }) {
  const [factorsMap, setFactorsMap] = useState(() => getSavedFactors());
  const [editingKey, setEditingKey] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [newIngName, setNewIngName] = useState('');
  const [newIngFactor, setNewIngFactor] = useState('1.2');

  if (!isOpen) return null;

  const handleStartEdit = (key, val) => {
    setEditingKey(key);
    setEditVal(String(val));
  };

  const handleSaveEdit = (key) => {
    const parsed = parseFloat(editVal.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      const updated = { ...factorsMap, [key]: parsed };
      setFactorsMap(updated);
      saveFactors(updated);
      if (onFactorsUpdated) onFactorsUpdated(updated);
    }
    setEditingKey(null);
  };

  const handleAddFactor = (e) => {
    e.preventDefault();
    if (!newIngName.trim()) return;

    const parsed = parseFloat(newIngFactor.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;

    const trimmedName = newIngName.trim();
    const updated = { ...factorsMap, [trimmedName]: parsed };
    setFactorsMap(updated);
    saveFactors(updated);
    if (onFactorsUpdated) onFactorsUpdated(updated);

    setNewIngName('');
    setNewIngFactor('1.2');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('¿Restablecer todos los factores de corrección a los valores predeterminados de la tabla inicial?')) {
      const resetMap = resetFactorsToDefault();
      setFactorsMap(resetMap);
      if (onFactorsUpdated) onFactorsUpdated(resetMap);
    }
  };

  const sortedKeys = Object.keys(factorsMap).sort((a, b) => a.localeCompare(b, 'es'));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} className="animate-fade-in">
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, var(--slate-900) 0%, var(--slate-800) 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'white', fontWeight: '700' }}>
              ⚙️ Factores de Corrección (Peso Neto → Bruto)
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--slate-400)' }}>
              Bruto = Neto × Factor. Editables por el usuario (se guardan en este dispositivo).
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Formulario Agregar Nuevo Factor */}
        <form onSubmit={handleAddFactor} style={{ padding: '1rem 1.5rem', background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', display: 'grid', gridTemplateColumns: '1fr 100px auto', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Nombre de ingrediente (ej. Calabaza)..."
            value={newIngName}
            onChange={(e) => setNewIngName(e.target.value)}
            style={{ padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
          />
          <input
            type="number"
            step="0.05"
            min="1.0"
            max="5.0"
            placeholder="Factor"
            value={newIngFactor}
            onChange={(e) => setNewIngFactor(e.target.value)}
            style={{ padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-300)', fontSize: '0.85rem', fontWeight: '700' }}
          />
          <button type="submit" className="btn-action btn-primary" style={{ padding: '0.45rem 0.75rem' }}>
            <Plus size={16} />
            <span>Agregar</span>
          </button>
        </form>

        {/* Tabla scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--slate-200)', background: 'var(--slate-100)', color: 'var(--slate-700)', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.8rem' }}>Ingrediente</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Factor</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {sortedKeys.map((key) => {
                const val = factorsMap[key];
                const isEditing = editingKey === key;

                return (
                  <tr key={key} style={{ borderBottom: '1px solid var(--slate-200)' }}>
                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: '600', color: 'var(--slate-900)' }}>
                      {key}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.05"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          style={{ width: '80px', padding: '0.2rem 0.4rem', textAlign: 'center', border: '1px solid var(--primary-600)', borderRadius: '4px', fontWeight: '700' }}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(key);
                          }}
                        />
                      ) : (
                        <span style={{ fontWeight: '800', background: 'var(--primary-50)', color: 'var(--primary-900)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                          × {val}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>
                      {isEditing ? (
                        <button onClick={() => handleSaveEdit(key)} className="btn-action btn-primary" style={{ padding: '0.25rem 0.5rem' }}>
                          <Check size={14} />
                        </button>
                      ) : (
                        <button onClick={() => handleStartEdit(key, val)} className="btn-action btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}>
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', background: 'var(--slate-50)', borderTop: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handleResetToDefaults} className="btn-action btn-secondary" style={{ fontSize: '0.8rem' }}>
            <RotateCcw size={15} />
            <span>Restablecer Valores Iniciales</span>
          </button>
          <button onClick={onClose} className="btn-action btn-primary">
            <span>Listo</span>
          </button>
        </div>

      </div>
    </div>
  );
}
