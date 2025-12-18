import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usaAnalysis from '../data/usa_analysis.json';
import ukAnalysis from '../data/uk_analysis.json';
import indiaAnalysis from '../data/india_analysis.json';
import mapLocations from '../data/processed/map_locations.json';
import './MenuAnalysis.css'; // We'll create this for styling

const analysisData = {
  usa: usaAnalysis,
  uk: ukAnalysis,
  india: indiaAnalysis,
};

// Simple pie chart component for category distribution
function PieChart({ categories }) {
  const radius = 60;
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];

  const total = Object.values(categories).reduce((sum, count) => sum + count, 0);
  if (total === 0) return null;

  let cumulative = 0;
  const slices = Object.entries(categories).map(([category, count], index) => {
    const percentage = count / total;
    const startAngle = cumulative * 2 * Math.PI;
    cumulative += percentage;
    const endAngle = cumulative * 2 * Math.PI;

    const x1 = Math.cos(startAngle - Math.PI / 2) * radius;
    const y1 = Math.sin(startAngle - Math.PI / 2) * radius;
    const x2 = Math.cos(endAngle - Math.PI / 2) * radius;
    const y2 = Math.sin(endAngle - Math.PI / 2) * radius;

    const largeArcFlag = percentage > 0.5 ? 1 : 0;

    const pathData = [
      `M 0 0`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ');

    return {
      path: pathData,
      color: colors[index % colors.length],
      label: category,
      count: count,
      percentage: Math.round(percentage * 100)
    };
  });

  return (
    <div className="pie-chart-container">
      <svg width="140" height="140" viewBox="-70 -70 140 140" className="pie-chart">
        {slices.map((slice, index) => (
          <path
            key={index}
            d={slice.path}
            fill={slice.color}
            stroke="#fff"
            strokeWidth="1"
          />
        ))}
      </svg>
      <div className="pie-legend">
        {slices.map((slice, index) => (
          <div key={index} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: slice.color }}></div>
            <span className="legend-text">{slice.label}: {slice.count} ({slice.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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

  const getCategories = () => {
    const loc = mapLocations.locations.find(l => l.id === id.toLowerCase());
    return loc ? loc.categories : {};
  };

  if (loading) return <div className="loading">Loading analysis...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!analysis) return <div className="error">No analysis data found</div>;

  return (
    <div className="menu-analysis">
      <header className="analysis-header">
        <button onClick={() => navigate('/')} className="back-button">← Back to Map</button>
        <h1>{analysis.country} Menu Analysis</h1>
        <p className="total-items">Total Items Analyzed: {analysis.totalItems}</p>
        <div className="category-overview">
          <h2>Category Distribution</h2>
          <PieChart categories={getCategories()} />
        </div>
      </header>

      <div className="categories">
        {Object.entries(analysis.categories).map(([category, data]) => (
          <div key={category} className="category-card">
            <h2>{category}</h2>
            <div className="stats">
              <div className="stat">
                <span className="label">Items:</span>
                <span className="value">{data.itemCount}</span>
              </div>
              <div className="stat">
                <span className="label">Avg Calories:</span>
                <span className="value">{data.avgCalories.toFixed(1)}</span>
              </div>
              <div className="stat">
                <span className="label">Range:</span>
                <span className="value">{data.minCalories} - {data.maxCalories}</span>
              </div>
              <div className="stat">
                <span className="label">Avg Protein:</span>
                <span className="value">{data.avgProtein.toFixed(1)}g</span>
              </div>
              <div className="stat">
                <span className="label">Avg Carbs:</span>
                <span className="value">{data.avgCarbs.toFixed(1)}g</span>
              </div>
              <div className="stat">
                <span className="label">Avg Fat:</span>
                <span className="value">{data.avgFat.toFixed(1)}g</span>
              </div>
            </div>

            <h3>Top 5 Items by Calories</h3>
            <div className="top-items-chart">
              <BarChart items={data.topItems} maxCalories={Math.max(...data.topItems.map(item => item.calories))} />
            </div>
            <div className="top-items">
              {data.topItems.map((item, index) => (
                <div key={index} className="top-item">
                  <div className="item-name">{item.item}</div>
                  <div className="item-nutrition">
                    <span>{item.calories} cal</span>
                    <span>{item.protein}g protein</span>
                    <span>{item.carbs}g carbs</span>
                    <span>{item.fat}g fat</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuAnalysis;