import React from 'react';

// Simple SVG charts to avoid extra dependencies and to match PDF styling closely
export function DonutChart({ data = {}, size = 220, colors = [] }) {
  const total = Object.values(data).reduce((s, v) => s + v, 0) || 1;
  const center = size / 2;
  const radius = center - 10;
  let angle = -90;

  const arcs = Object.entries(data).map(([k, v], i) => {
    const portion = v / total;
    const sweep = portion * 360;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    const large = sweep > 180 ? 1 : 0;
    const startRad = (Math.PI / 180) * start;
    const endRad = (Math.PI / 180) * end;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
    return { key: k, d, color: colors[i % colors.length] || '#2a9df4', value: v };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-chart">
      {arcs.map((a) => (
        <path key={a.key} d={a.d} fill={a.color} stroke="#fff" strokeWidth="1" opacity="0.95" />
      ))}
      <circle cx={center} cy={center} r={radius * 0.45} fill="#fff" />
      <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" style={{fontSize:14,fontWeight:700}}>{total}</text>
    </svg>
  );
}

export function BarChart({ items = [], width = 520, height = 220, color = '#DA291C' }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const barH = Math.max(18, Math.floor(height / Math.max(1, items.length)) - 6);

  return (
    <div className="bar-chart" style={{ width }}>
      {items.map((it, idx) => {
        const pct = (it.value / max) * 100;
        return (
          <div className="bar-row" key={idx}>
            <div className="bar-label">{it.label}</div>
            <div className="bar-track" style={{ height: barH }}>
              <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <div className="bar-value">{it.value}</div>
          </div>
        );
      })}
    </div>
  );
}

// Grouped bar chart for macronutrients (Carbs, Fat, Protein)
export function GroupedMacroChart({ categories = {}, height = 220 }) {
  const labels = Object.keys(categories);
  const carbs = labels.map((k) => ({ label: k, value: Math.round((categories[k].avgCarbs || categories[k].avgCarbs === 0) ? categories[k].avgCarbs : 0) }));
  const fat = labels.map((k) => ({ label: k, value: Math.round((categories[k].avgFat || categories[k].avgFat === 0) ? categories[k].avgFat : 0) }));
  const protein = labels.map((k) => ({ label: k, value: Math.round((categories[k].avgProtein || categories[k].avgProtein === 0) ? categories[k].avgProtein : 0) }));

  const max = Math.max(...[...carbs, ...fat, ...protein].map((i) => i.value), 1);

  return (
    <div className="grouped-macro" style={{ height }}>
      {labels.map((lbl, i) => (
        <div className="group-row" key={lbl}>
          <div className="group-label">{lbl}</div>
          <div className="group-bars">
            <div className="group-bar" title={`Carbs ${carbs[i].value}g`}>
              <div className="fill carbs" style={{ height: `${(carbs[i].value / max) * 100}%` }} />
              <div className="group-caption">Carbs</div>
            </div>
            <div className="group-bar" title={`Fat ${fat[i].value}g`}>
              <div className="fill fat" style={{ height: `${(fat[i].value / max) * 100}%` }} />
              <div className="group-caption">Fat</div>
            </div>
            <div className="group-bar" title={`Protein ${protein[i].value}g`}>
              <div className="fill protein" style={{ height: `${(protein[i].value / max) * 100}%` }} />
              <div className="group-caption">Protein</div>
            </div>
          </div>
        </div>
      ))}
      <div style={{ clear: 'both' }} />
    </div>
  );
}

export default function Charts({ analysis }) {
  if (!analysis) return null;
  const categories = analysis.categories || {};
  const categoryCounts = {};
  const avgCalories = [];

  Object.entries(categories).forEach(([k, v]) => {
    categoryCounts[k] = v.itemCount || 0;
    avgCalories.push({ label: k, value: Math.round(v.avgCalories || 0) });
  });

  const topItems = [];
  Object.values(categories).forEach((c) => {
    (c.topItems || []).forEach((t) => topItems.push({ label: t.item, value: t.calories }));
  });
  topItems.sort((a, b) => b.value - a.value);
  const top5 = topItems.slice(0, 5);

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>Items by Category</h3>
        <DonutChart data={categoryCounts} size={220} colors={["#2a9df4","#DA291C","#FFC72C","#6cc070"]} />
      </div>

      <div className="chart-card">
        <h3>Avg Calories by Category</h3>
        <BarChart items={avgCalories} color="#FFC72C" />
      </div>

      <div className="chart-card">
        <h3>Top Items (Calories)</h3>
        <BarChart items={top5.map(t=>({label:t.label,value:t.value}))} color="#2a9df4" />
      </div>
      
      <div className="chart-card full-width">
        <h3>Average Macronutrients by Category</h3>
        <GroupedMacroChart categories={categories} />
      </div>
    </div>
  );
}
