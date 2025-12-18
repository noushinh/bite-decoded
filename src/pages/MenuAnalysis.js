import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usaAnalysis from '../data/usa_analysis.json';
import ukAnalysis from '../data/uk_analysis.json';
import indiaAnalysis from '../data/india_analysis.json';
import './MenuAnalysis.css'; // We'll create this for styling

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

  return (
    <div className="menu-analysis">
      <header className="analysis-header">
        <button onClick={() => navigate('/')} className="back-button">← Back to Map</button>
        <h1>{analysis.country} Menu Analysis</h1>
        <p className="total-items">Total Items Analyzed: {analysis.totalItems}</p>
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