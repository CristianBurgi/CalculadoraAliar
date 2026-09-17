import React from 'react';
import { Calendar, RefreshCw, PlayCircle, Edit2, Check } from 'lucide-react';
import { calculateMenuFromDate, formatDateHumanReadable, formatDateISO } from '../utils/dateUtils';

export default function MenuSelector({
  selectedDate,
  onDateChange,
  menuNumber,
  onMenuOverride,
  isManualOverride,
  onResetToAuto,
  onLoadTestCase,
}) {
  const autoCalculatedMenu = calculateMenuFromDate(selectedDate);

  return (
    <div className="menu-selector-card animate-fade-in">
      <div className="section-title-sm">
        <Calendar size={18} color="var(--primary-600)" />
        <span>Ciclo de Rotación (1–10)</span>
      </div>

      <div className="menu-picker-box">
        <div className="menu-number-display">
          Menú {menuNumber}
        </div>
        <div className="menu-anchor-date">
          {formatDateHumanReadable(selectedDate)}
        </div>
        {isManualOverride && (
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', fontWeight: '700', marginTop: '4px' }}>
            ⚠️ Selección manual activada
          </div>
        )}
      </div>

      {/* Date Picker & Manual Override Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--slate-600)' }}>
          Fecha de Operación:
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--slate-300)',
            fontSize: '0.85rem',
            fontWeight: '600',
            width: '100%',
          }}
        />

        {isManualOverride ? (
          <button className="override-toggle-btn" onClick={onResetToAuto}>
            <RefreshCw size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Volver a cálculo automático por fecha (Menú {autoCalculatedMenu})
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>¿Sobreescribir menú?</span>
            <select
              value={menuNumber}
              onChange={(e) => onMenuOverride(Number(e.target.value))}
              style={{
                padding: '0.3rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--slate-300)',
                fontSize: '0.8rem',
                fontWeight: '700',
                background: 'white',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  Menú {num} {num === autoCalculatedMenu ? '(Sugerido)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <button className="preset-test-btn" onClick={onLoadTestCase}>
        <PlayCircle size={18} />
        <span>Cargar Caso de Prueba (Menú 5)</span>
      </button>
    </div>
  );
}
