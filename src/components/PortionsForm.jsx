import React from 'react';
import { Users, Utensils, Moon, Trash2 } from 'lucide-react';
import { CATEGORIES, CATEGORY_LABELS } from '../data/menuRepository';

export default function PortionsForm({ portionsState, onPortionChange, onClearPortions }) {
  const handleInputChange = (categoryKey, shiftKey, rawValue) => {
    // Sanitize non-negative integer input
    const val = rawValue.replace(/\D/g, '');
    const numVal = val === '' ? 0 : parseInt(val, 10);
    onPortionChange(categoryKey, shiftKey, Math.max(0, numVal));
  };

  return (
    <div className="portions-form-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="section-title-sm">
          <Users size={18} color="var(--primary-600)" />
          <span>Formulario de Raciones por Categoría y Turno</span>
        </div>

        <button
          className="btn-action btn-secondary"
          onClick={onClearPortions}
          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
          title="Restablecer todas las raciones a 0"
        >
          <Trash2 size={14} />
          <span>Limpiar</span>
        </button>
      </div>

      <div className="portions-grid">
        {Object.keys(CATEGORIES).map((catKey) => {
          const catLabel = CATEGORY_LABELS[catKey];
          const almuerzoQty = portionsState[catKey]?.almuerzo || 0;
          const cenaQty = portionsState[catKey]?.cena || 0;

          return (
            <div key={catKey} className="category-portion-box">
              <div className="category-box-header">
                <Utensils size={14} color="var(--primary-700)" />
                <span>{catLabel}</span>
              </div>

              <div className="shift-input-group">
                <div className="shift-input-row">
                  <span className="shift-label">☀️ Almuerzo</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="portion-number-input"
                    value={almuerzoQty === 0 ? '' : almuerzoQty}
                    placeholder="0"
                    onChange={(e) => handleInputChange(catKey, 'almuerzo', e.target.value)}
                  />
                </div>

                <div className="shift-input-row">
                  <span className="shift-label">🌙 Cena</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="portion-number-input"
                    value={cenaQty === 0 ? '' : cenaQty}
                    placeholder="0"
                    onChange={(e) => handleInputChange(catKey, 'cena', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
