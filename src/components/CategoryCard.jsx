import React from 'react';
import { Utensils, AlertCircle } from 'lucide-react';

export default function CategoryCard({ categoryData }) {
  const { categoryLabel, almuerzo, cena, totalRaciones } = categoryData;

  const renderShiftBlock = (shiftData, shiftTitle) => {
    if (!shiftData.available) {
      return (
        <div className="shift-block">
          <div className="shift-block-title">{shiftTitle}</div>
          <div className="notice-box">
            <AlertCircle size={16} />
            <span>{shiftData.reason || 'Sin datos'}</span>
          </div>
        </div>
      );
    }

    if (shiftData.raciones <= 0) {
      return (
        <div className="shift-block">
          <div className="shift-block-title">
            <span>{shiftTitle}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: '500' }}>0 raciones</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontStyle: 'italic', padding: '0.25rem 0' }}>
            No se ingresaron raciones para este turno.
          </div>
        </div>
      );
    }

    return (
      <div className="shift-block">
        <div className="shift-block-title">
          <span>{shiftTitle}</span>
          <span style={{ color: 'var(--primary-700)', fontWeight: '800' }}>{shiftData.raciones} raciones</span>
        </div>

        {shiftData.platoTitle && (
          <div className="plato-title-display">
            Plato: {shiftData.platoTitle}
          </div>
        )}

        {shiftData.subsections && shiftData.subsections.length > 0 ? (
          shiftData.subsections.map((sub, idx) => (
            <div key={idx} className="subsection-group">
              <div className="subsection-label">• {sub.subseccionName}</div>
              <ul className="ingredients-list">
                {sub.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="ingredient-item-row">
                    <span className="ingredient-name">{item.name}</span>
                    <span className={`ingredient-qty ${item.isSpecialConversion ? 'special-conversion' : ''}`}>
                      {item.displayValue}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Sin ingredientes a calcular</div>
        )}
      </div>
    );
  };

  return (
    <div className="category-card animate-fade-in">
      <div className="category-card-header">
        <h3 className="category-name">{categoryLabel}</h3>
        <span className="category-portions-badge">
          {totalRaciones} raciones totales
        </span>
      </div>

      <div className="category-card-body">
        {renderShiftBlock(almuerzo, '☀️ Almuerzo')}
        {renderShiftBlock(cena, '🌙 Cena')}
      </div>
    </div>
  );
}
