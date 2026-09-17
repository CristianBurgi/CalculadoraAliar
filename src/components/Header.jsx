import React from 'react';
import { ChefHat, Smartphone, HardDriveDownload, CheckCircle2 } from 'lucide-react';

export default function Header({ installPrompt, onInstallPwa, isInstalled }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand-section">
          <div className="brand-logo-icon">
            <ChefHat size={28} />
          </div>
          <div>
            <h1 className="brand-title">Calculadora ALIAR</h1>
            <span className="brand-subtitle">Depósito y Cocina Hospitalaria</span>
          </div>
        </div>

        <div className="header-badges">
          {installPrompt && !isInstalled && (
            <button className="badge-pwa btn-action" onClick={onInstallPwa} title="Instalar aplicación en dispositivo">
              <HardDriveDownload size={14} />
              <span>Instalar App</span>
            </button>
          )}

          {isInstalled && (
            <span className="badge-pwa" title="App instalada">
              <CheckCircle2 size={14} color="#2dd4bf" />
              <span>Modo App</span>
            </span>
          )}

          <span className="badge-pwa">
            <Smartphone size={14} />
            <span>PWA v1.0</span>
          </span>
        </div>
      </div>
    </header>
  );
}
