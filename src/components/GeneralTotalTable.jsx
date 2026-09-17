import React, { useState } from 'react';
import { ShoppingBag, Search, Printer, Layers } from 'lucide-react';

export default function GeneralTotalTable({ totalsList }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTotals = totalsList.filter((item) =>
    item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.originalNamesList.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="general-total-card animate-fade-in">
      <div className="general-total-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={22} color="var(--primary-700)" />
            <span>Total General de Depósito</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>
            Suma consolidada de ingredientes de las 4 categorías combinadas
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

          <button className="btn-action btn-secondary no-print" onClick={handlePrint}>
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      <div className="total-table-container">
        {filteredTotals.length > 0 ? (
          <table className="total-table">
            <thead>
              <tr>
                <th>Ingrediente (Consolidado)</th>
                <th>Cantidad Total a Retirar</th>
                <th>Variantes Incluidas</th>
              </tr>
            </thead>
            <tbody>
              {filteredTotals.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '600', color: 'var(--slate-900)' }}>
                    {item.displayName}
                  </td>
                  <td>
                    <span className="total-qty-badge">
                      {item.displayValue}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                    {item.originalNamesList}
                  </td>
                </tr>
              ))}
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
