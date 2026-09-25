import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, Settings, Copy, Printer, Check, AlertTriangle, Layers, Info } from 'lucide-react';
import {
  calculatePedidoRango,
  getSavedAverages,
  saveAverages,
  getSavedFactors,
  buildPedidoWhatsAppText,
} from '../services/pedidoService';
import FactoresCorreccionModal from './FactoresCorreccionModal';

export default function DespenseroView({ selectedDate }) {
  // Start date ISO
  const [startDateIso, setStartDateIso] = useState(selectedDate || '2026-09-17');
  const [daysCount, setDaysCount] = useState(7);

  // Portion averages state (weekday & weekend)
  const [averages, setAverages] = useState(() => getSavedAverages());

  // Factors modal state
  const [isFactorsModalOpen, setIsFactorsModalOpen] = useState(false);
  const [currentFactors, setCurrentFactors] = useState(() => getSavedFactors());

  // Copy notification state
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Sync start date if prop changes
  useEffect(() => {
    if (selectedDate) setStartDateIso(selectedDate);
  }, [selectedDate]);

  // Handler for portion averages edit
  const handleAverageChange = (dayType, catKey, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = {
      ...averages,
      [dayType]: {
        ...averages[dayType],
        [catKey]: num,
      },
    };
    setAverages(updated);
    saveAverages(updated);
  };

  // Calculate order data
  const pedidoData = calculatePedidoRango(startDateIso, daysCount, averages, currentFactors);

  const handleCopyWhatsApp = () => {
    const text = buildPedidoWhatsAppText(pedidoData);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const specialDaysCount = pedidoData.rangeDays.filter((d) => d.isSpecialDay).length;
  const weekdaysCount = pedidoData.daysCount - specialDaysCount;

  return (
    <div className="despensero-container animate-fade-in">
      {/* Modales */}
      <FactoresCorreccionModal
        isOpen={isFactorsModalOpen}
        onClose={() => setIsFactorsModalOpen(false)}
        onFactorsUpdated={(newFactors) => setCurrentFactors(newFactors)}
      />

      {/* Card Header & Global Controls */}
      <div className="despensero-header-card">
        <div className="despensero-top-bar">
          <div>
            <div className="despensero-badge-tag">
              <ShoppingCart size={13} />
              <span>Módulo 2 — Proveedores</span>
            </div>
            <h2 className="despensero-title">
              Pedido de Compra Consolidadas (Verdura/Fruta y Carnes)
            </h2>
            <p className="despensero-subtitle">
              Cálculo acumulado en peso bruto con factores de corrección y calendario de feriados nacionales.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn-action btn-secondary no-print"
              onClick={() => setIsFactorsModalOpen(true)}
            >
              <Settings size={16} />
              <span>Factores de Corrección</span>
            </button>

            <button
              className="btn-action btn-whatsapp no-print"
              onClick={handleCopyWhatsApp}
            >
              {copiedNotification ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedNotification ? '¡Copiado!' : 'Copiar para WhatsApp'}</span>
            </button>

            <button className="btn-action btn-secondary no-print" onClick={handlePrint}>
              <Printer size={16} />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Panel de Controles de Rango & Fechas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
              📅 Fecha Inicio del Pedido:
            </label>
            <input
              type="date"
              value={startDateIso}
              onChange={(e) => setStartDateIso(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-300)', fontSize: '0.88rem', fontWeight: '600' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
              ⏱️ Días a Calcular (Rango Futuro):
            </label>
            <select
              value={daysCount}
              onChange={(e) => setDaysCount(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-300)', fontSize: '0.88rem', fontWeight: '700' }}
            >
              <option value={3}>Próximos 3 días</option>
              <option value={5}>Próximos 5 días</option>
              <option value={7}>Próximos 7 días (1 semana)</option>
              <option value={10}>Próximos 10 días (1 ciclo)</option>
              <option value={14}>Próximos 14 días (2 semanas)</option>
              <option value={30}>Próximos 30 días (1 mes)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
            <div>Dias hábiles (semana): <strong>{weekdaysCount} días</strong></div>
            <div>Fin de semana / feriados: <strong>{specialDaysCount} días</strong></div>
          </div>
        </div>

        {/* Tabla Editable de Promedios de Raciones */}
        <div style={{ borderTop: '1px dashed var(--slate-200)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={16} color="var(--primary-700)" />
            <span>Promedios de raciones por categoría (Editables por el usuario):</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* Días de semana */}
            <div style={{ background: 'white', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary-800)', marginBottom: '0.5rem' }}>
                📆 Día de semana (Lun a Vie)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--slate-600)' }}>Personal</label>
                  <input
                    type="number"
                    value={averages.weekday.PERSONAL}
                    onChange={(e) => handleAverageChange('weekday', 'PERSONAL', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center', border: '1px solid var(--slate-300)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--slate-600)' }}>R. Normal</label>
                  <input
                    type="number"
                    value={averages.weekday.REGIMEN_NORMAL}
                    onChange={(e) => handleAverageChange('weekday', 'REGIMEN_NORMAL', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center', border: '1px solid var(--slate-300)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--slate-600)' }}>R. Diabético</label>
                  <input
                    type="number"
                    value={averages.weekday.REGIMEN_DIABETICO}
                    onChange={(e) => handleAverageChange('weekday', 'REGIMEN_DIABETICO', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center', border: '1px solid var(--slate-300)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--slate-600)' }}>R. Hepático</label>
                  <input
                    type="number"
                    value={averages.weekday.REGIMEN_HEPATICO}
                    onChange={(e) => handleAverageChange('weekday', 'REGIMEN_HEPATICO', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center', border: '1px solid var(--slate-300)', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>

            {/* Sáb / Dom / Feriados */}
            <div style={{ background: '#fffbeb', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #fef3c7' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#b45309', marginBottom: '0.5rem' }}>
                🎉 Sábado / Domingo / Feriado
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--slate-600)' }}>Personal</label>
                  <input
                    type="number"
                    value={averages.weekend.PERSONAL}
                    onChange={(e) => handleAverageChange('weekend', 'PERSONAL', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center', border: '1px solid #fcd34d', borderRadius: '4px', background: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--slate-600)' }}>R. Normal</label>
                  <input
                    type="number"
                    value={averages.weekend.REGIMEN_NORMAL}
                    onChange={(e) => handleAverageChange('weekend', 'REGIMEN_NORMAL', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center', border: '1px solid #fcd34d', borderRadius: '4px', background: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--slate-600)' }}>R. Diabético</label>
                  <input
                    type="number"
                    value={averages.weekend.REGIMEN_DIABETICO}
                    onChange={(e) => handleAverageChange('weekend', 'REGIMEN_DIABETICO', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center', border: '1px solid #fcd34d', borderRadius: '4px', background: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--slate-600)' }}>R. Hepático</label>
                  <input
                    type="number"
                    value={averages.weekend.REGIMEN_HEPATICO}
                    onChange={(e) => handleAverageChange('weekend', 'REGIMEN_HEPATICO', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center', border: '1px solid #fcd34d', borderRadius: '4px', background: 'white' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listados de Pedidos de Proveedores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* 1. Verdura y Fruta */}
        <div className="general-total-card" style={{ marginTop: 0 }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--emerald-800)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span>🥬 Pedido de Verdura y Fruta</span>
            <span style={{ fontSize: '0.75rem', background: 'var(--emerald-100)', color: 'var(--emerald-700)', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
              {pedidoData.verduraYFrutaList.length} ítems
            </span>
          </h3>

          <div className="total-table-container">
            <table className="total-table">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th style={{ textAlign: 'right' }}>Peso Bruto (Pedido)</th>
                  <th style={{ textAlign: 'center' }}>Factor</th>
                  <th style={{ textAlign: 'right' }}>Neto equiv.</th>
                </tr>
              </thead>
              <tbody>
                {pedidoData.verduraYFrutaList.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', color: 'var(--slate-900)' }}>
                      {item.name}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="total-qty-badge" style={{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-900)', fontSize: '0.95rem' }}>
                        {item.grossQuantityStr}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                      × {item.factor}
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {item.netQuantityStr}
                    </td>
                  </tr>
                ))}
                {pedidoData.verduraYFrutaList.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-400)' }}>
                      No hay ingredientes de verdura/fruta en este rango.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Carne, Pollo y Cerdo */}
        <div className="general-total-card" style={{ marginTop: 0 }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--red-800, #991b1b)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span>🥩 Pedido de Carne, Pollo y Cerdo</span>
            <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
              {pedidoData.carnePolloCerdoList.length} ítems
            </span>
          </h3>

          <div className="total-table-container">
            <table className="total-table">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th style={{ textAlign: 'right' }}>Peso Bruto (Pedido)</th>
                  <th style={{ textAlign: 'center' }}>Factor</th>
                  <th style={{ textAlign: 'right' }}>Neto equiv.</th>
                </tr>
              </thead>
              <tbody>
                {pedidoData.carnePolloCerdoList.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', color: 'var(--slate-900)' }}>
                      {item.name}
                      {item.isWholeChicken && (
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--amber-700)', fontWeight: 'normal' }}>
                          (Presa entera: sin factor)
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="total-qty-badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.95rem' }}>
                        {item.grossQuantityStr}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                      {item.isWholeChicken ? '1.0 (s/f)' : `× ${item.factor}`}
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {item.netQuantityStr}
                    </td>
                  </tr>
                ))}
                {pedidoData.carnePolloCerdoList.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-400)' }}>
                      No hay ingredientes de carne/pollo/cerdo en este rango.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Ingredientes Sin Clasificar (si existen) */}
      {pedidoData.unclassifiedList.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1.5rem' }}>
          <h4 style={{ margin: 0, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <AlertTriangle size={18} />
            <span>Ingredientes sin clasificar (Almacén / Lácteos / Huevos)</span>
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#b45309', margin: '0.25rem 0 0.75rem 0' }}>
            Estos ingredientes tienen cantidades calculadas pero no están categorizados ni como verdura ni como carne.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {pedidoData.unclassifiedList.map((item, idx) => (
              <span key={idx} style={{ background: 'white', border: '1px solid #fef3c7', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: '600', color: '#78350f' }}>
                {item.name}: <strong>{item.grossQuantityStr}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Desglose de Días del Rango */}
      <div className="general-total-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <Calendar size={18} color="var(--primary-700)" />
          <span>Detalle del Ciclo de Menús en el Rango Calculado</span>
        </h3>

        <div className="total-table-container">
          <table className="total-table">
            <thead>
              <tr>
                <th>Día & Fecha</th>
                <th>Menú Asignado</th>
                <th>Tipo de Día</th>
              </tr>
            </thead>
            <tbody>
              {pedidoData.rangeDays.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '600', color: 'var(--slate-900)' }}>
                    {d.label}
                  </td>
                  <td>
                    <span style={{ fontWeight: '800', color: 'var(--primary-800)' }}>
                      Menú {d.menuNum}
                    </span>
                  </td>
                  <td>
                    {d.isSpecialDay ? (
                      <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#b45309', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontWeight: '700' }}>
                        🎉 Sábado / Domingo / Feriado
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', background: 'var(--slate-100)', color: 'var(--slate-700)', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontWeight: '600' }}>
                        📆 Día de Semana
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
