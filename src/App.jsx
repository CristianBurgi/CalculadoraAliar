import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MenuSelector from './components/MenuSelector';
import PortionsForm from './components/PortionsForm';
import WarningsBanner from './components/WarningsBanner';
import ResultsView from './components/ResultsView';
import { calculateMenuFromDate, formatDateISO } from './utils/dateUtils';
import { calculateAllIngredients } from './services/calculatorService';
import { CATEGORIES } from './data/menuRepository';
import './App.css';

const DEFAULT_PORTIONS = {
  PERSONAL: { almuerzo: 0, cena: 0 },
  REGIMEN_NORMAL: { almuerzo: 0, cena: 0 },
  REGIMEN_DIABETICO: { almuerzo: 0, cena: 0 },
  REGIMEN_HEPATICO: { almuerzo: 0, cena: 0 },
};

export default function App() {
  // Date and Menu State
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today or anchor date 2026-09-17
    const today = new Date();
    return formatDateISO(today);
  });
  const [overrideMenuNum, setOverrideMenuNum] = useState(null);
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Portions State
  const [portionsState, setPortionsState] = useState(DEFAULT_PORTIONS);

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPwa = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setInstallPrompt(null);
      });
    }
  };

  // Active calculated menu
  const autoCalculatedMenu = calculateMenuFromDate(selectedDate);
  const activeMenuNum = isManualOverride ? overrideMenuNum : autoCalculatedMenu;

  // Handlers
  const handleDateChange = (newDateIso) => {
    setSelectedDate(newDateIso);
    if (isManualOverride) {
      setIsManualOverride(false);
      setOverrideMenuNum(null);
    }
  };

  const handleMenuOverride = (menuNum) => {
    setOverrideMenuNum(menuNum);
    setIsManualOverride(true);
  };

  const handleResetToAuto = () => {
    setIsManualOverride(false);
    setOverrideMenuNum(null);
  };

  const handlePortionChange = (categoryKey, shiftKey, newQty) => {
    setPortionsState((prev) => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [shiftKey]: newQty,
      },
    }));
  };

  const handleClearPortions = () => {
    setPortionsState(DEFAULT_PORTIONS);
  };

  // Preset Handler: Load Test Case (Section 7 from brief)
  const handleLoadTestCase = () => {
    setSelectedDate('2026-09-17');
    setIsManualOverride(false);
    setOverrideMenuNum(null);
    setPortionsState({
      PERSONAL: { almuerzo: 160, cena: 0 },
      REGIMEN_NORMAL: { almuerzo: 200, cena: 0 },
      REGIMEN_DIABETICO: { almuerzo: 50, cena: 0 },
      REGIMEN_HEPATICO: { almuerzo: 50, cena: 0 },
    });
  };

  // Calculate ingredients engine output
  const categoryResults = calculateAllIngredients(activeMenuNum, portionsState);

  return (
    <div className="app-wrapper">
      <Header
        installPrompt={installPrompt}
        onInstallPwa={handleInstallPwa}
        isInstalled={isInstalled}
      />

      <main className="main-container">
        <div className="control-panel-grid">
          <MenuSelector
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            menuNumber={activeMenuNum}
            onMenuOverride={handleMenuOverride}
            isManualOverride={isManualOverride}
            onResetToAuto={handleResetToAuto}
            onLoadTestCase={handleLoadTestCase}
          />

          <PortionsForm
            portionsState={portionsState}
            onPortionChange={handlePortionChange}
            onClearPortions={handleClearPortions}
          />
        </div>

        <WarningsBanner menuNumber={activeMenuNum} />

        <ResultsView
          categoryResults={categoryResults}
          menuNumber={activeMenuNum}
        />
      </main>
    </div>
  );
}
