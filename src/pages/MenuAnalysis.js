import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usaAnalysis from '../data/usa_analysis.json';
import ukAnalysis from '../data/uk_analysis.json';
import indiaAnalysis from '../data/india_analysis.json';
import './MenuAnalysis.css'; // We'll create this for styling
import Charts from '../components/Charts';

const analysisData = {
  usa: usaAnalysis,
  uk: ukAnalysis,
  india: indiaAnalysis,
};

function MenuAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalysis = () => {
      try {
        const data = analysisData[id.toLowerCase()];
        if (!data) throw new Error('Analysis data not found for this country');
        setAnalysis(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [id]);

  if (loading) return <div className="loading">Loading analysis...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!analysis) return <div className="error">No analysis data found</div>;

  const categoryCount = Object.keys(analysis.categories || {}).length;
  return (
    <div className="menu-analysis">
      <header className="analysis-header big">
        <button onClick={() => navigate('/')} className="back-button">← Back to Map</button>
        <h1>{id.toLowerCase() === 'usa' ? `USA - McDonald's Menu Analysis` : `${analysis.country} Menu Analysis`}</h1>
        <p className="total-items">Analyzing {analysis.totalItems} menu items across {categoryCount} categories</p>
      </header>

      <Charts analysis={analysis} />

      <div className="category-sections">
        {Object.entries(analysis.categories).map(([category, data]) => {
          const highest = (data.topItems && data.topItems[0]) || null;
          const lowest = (data.topItems && data.topItems[data.topItems.length - 1]) || null;
          return (
            <section key={category} className="category-section">
              <h2 className="section-title">{category}</h2>
              <div className="category-meta">{data.itemCount} items | Avg: {data.avgCalories.toFixed(2)} kcal</div>

              <div className="hl-grid">
                {highest && (
                  <div className="hl-card high">
                    <div className="hl-label">🔥 Highest Calorie</div>
                    <div className="hl-name">{highest.item}</div>
                    <div className="hl-kcal">{highest.calories} kcal</div>
                    <div className="hl-nutrients">
                      <div>Protein: {highest.protein}g</div>
                      <div>Carbs: {highest.carbs}g</div>
                      <div>Fat: {highest.fat}g</div>
                    </div>
                  </div>
                )}
                {lowest && (
                  <div className="hl-card low">
                    <div className="hl-label">💚 Lowest Calorie</div>
                    <div className="hl-name">{lowest.item}</div>
                    <div className="hl-kcal">{lowest.calories} kcal</div>
                    <div className="hl-nutrients">
                      <div>Protein: {lowest.protein}g</div>
                      <div>Carbs: {lowest.carbs}g</div>
                      <div>Fat: {lowest.fat}g</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="table-card">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Item Name</th>
                      <th>Calories</th>
                      <th>Protein (g)</th>
                      <th>Carbs (g)</th>
                      <th>Fat (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.topItems || []).slice(0, 10).map((it, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="item-cell">{it.item}</td>
                        <td className="kcal-cell">{it.calories}</td>
                        <td>{it.protein}</td>
                        <td>{it.carbs}</td>
                        <td>{it.fat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default MenuAnalysis;