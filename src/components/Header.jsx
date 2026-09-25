import React from 'react';
import { ChefHat, Smartphone, HardDriveDownload, CheckCircle2, Calculator, ClipboardCheck } from 'lucide-react';

export default function Header({ installPrompt, onInstallPwa, isInstalled, activeTab, onTabChange }) {
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

        {/* Module Navigation Tabs */}
        <nav className="header-nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'modulo1' ? 'active' : ''}`}
            onClick={() => onTabChange('modulo1')}
          >
            <Calculator size={18} />
            <span>Módulo 1: Cálculo Teórico</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'modulo2' ? 'active' : ''}`}
            onClick={() => onTabChange('modulo2')}
          >
            <ClipboardCheck size={18} />
            <span>Módulo 2: Pedidos Mercaderías</span>
          </button>
        </nav>

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
