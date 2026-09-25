import React from 'react';
import { ClipboardList, PieChart } from 'lucide-react';
import CategoryCard from './CategoryCard';
import GeneralTotalTable from './GeneralTotalTable';
import { calculateGeneralTotal } from '../services/normalizerService';

export default function ResultsView({ categoryResults, menuNumber, portionsState }) {
  const categoriesList = Object.values(categoryResults);
  const generalTotals = calculateGeneralTotal(categoryResults);

  const totalPortionsAcrossAll = categoriesList.reduce(
    (acc, cat) => acc + cat.totalRaciones,
    0
  );

  return (
    <div className="results-section">
      <div className="results-header-bar">
        <h2 className="results-title">
          <ClipboardList size={24} color="var(--primary-700)" />
          <span>Detalle de Ingredientes — Menú {menuNumber}</span>
        </h2>

        <div className="quick-stats-pills">
          <span className="stat-pill">
            <PieChart size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Total Raciones: <strong>{totalPortionsAcrossAll}</strong>
          </span>
          <span className="stat-pill">
            Ingredientes Únicos: <strong>{generalTotals.length}</strong>
          </span>
        </div>
      </div>

      <div className="category-results-grid">
        {categoriesList.map((catData) => (
          <CategoryCard key={catData.categoryKey} categoryData={catData} />
        ))}
      </div>

      <GeneralTotalTable totalsList={generalTotals} menuNumber={menuNumber} portionsState={portionsState} />
    </div>
  );
}

