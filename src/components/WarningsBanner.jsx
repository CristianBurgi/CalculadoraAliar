import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { getInferidoPolloTags } from '../data/menuRepository';

export default function WarningsBanner({ menuNumber }) {
  const isMenu10 = Number(menuNumber) === 10;
  const inferidoTags = getInferidoPolloTags();

  if (!isMenu10 && inferidoTags.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
      {isMenu10 && (
        <div className="warnings-banner animate-fade-in">
          <AlertTriangle size={20} className="warnings-banner-icon" />
          <div>
            <strong>Menú 10 – Personal Autorizado:</strong> No disponible — falta la planilla física original de este menú. Las otras 3 categorías (Régimen Normal, Diabético y Hepático) se calculan normalmente.
          </div>
        </div>
      )}

      {inferidoTags.length > 0 && (
        <div className="warnings-banner animate-fade-in" style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1' }}>
          <Info size={20} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Aviso de Clasificación de Pollo:</strong> Existen 5 entradas marcadas como <em>"inferido - revisar"</em> en la clasificación de pollo entero vs. trozado. (Ej. Menú 1 Almuerzo Personal, Menú 4 Cena Personal, Menú 8 Cena Normal, Diabético y Hepático). Recomendado validar con Cristian.
          </div>
        </div>
      )}
    </div>
  );
}
