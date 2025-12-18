import React, { useRef, useState } from 'react';
import foodies from '../data/foodies_parsed';

const EXTRA_FIELDS = [
  { aliases: ['saturatedFat_g', 'saturated_fat_g', 'saturated_fat', 'satFat_g'], label: 'Saturated Fat (g)' },
  { aliases: ['transFat_g', 'trans_fat_g', 'trans_fat'], label: 'Trans Fat (g)' },
  { aliases: ['cholesterol_mg', 'cholesterol'], label: 'Cholesterol (mg)' },
  { aliases: ['dietaryFiber_g', 'dietary_fiber_g', 'fiber_g', 'dietary_fiber'], label: 'Dietary Fiber (g)' },
  { aliases: ['sugars_g', 'sugars', 'sugar_g'], label: 'Sugars (g)' },
  { aliases: ['addedSugars_g', 'added_sugars_g', 'added_sugars'], label: 'Added Sugars (g)' },
  { aliases: ['potassium_mg', 'potassium'], label: 'Potassium (mg)' },
  { aliases: ['vitaminA_percent', 'vitamin_a_pct', 'vitamin_a', 'vitaminA'], label: 'Vitamin A (%DV)' },
  { aliases: ['vitaminC_percent', 'vitamin_c_pct', 'vitamin_c', 'vitaminC'], label: 'Vitamin C (%DV)' },
  { aliases: ['vitaminD_percent', 'vitamin_d_pct', 'vitamin_d', 'vitaminD'], label: 'Vitamin D (%DV)' },
  { aliases: ['calcium_mg', 'calcium'], label: 'Calcium (mg)' },
];

function getFirst(item, aliases) {
  for (const a of aliases) {
    if (Object.prototype.hasOwnProperty.call(item, a) && item[a] != null) return item[a];
    const lowerKey = Object.keys(item).find(k => k.toLowerCase() === a.toLowerCase());
    if (lowerKey && item[lowerKey] != null) return item[lowerKey];
  }
  return null;
}

function NutritionTable({ items, horizontal = false, containerRef = null, stacked = false, activeIndex = 0 }) {
  if (!items || items.length === 0) return null;

  const presentExtras = EXTRA_FIELDS.filter(f => items.some(it => getFirst(it, f.aliases) != null));

  const containerClass = stacked ? 'card-stack' : (horizontal ? 'scroller' : 'cards-grid');

  return (
    <div ref={containerRef} className={containerClass}>
      {items.map((it, idx) => (
        <div key={idx} className={"nutri-card" + (stacked && idx === activeIndex ? ' active' : '')}>
          <div className="card-title">{it.item || '—'}</div>

          <div className="card-inner">
            <div className="nutr-col">
              <div className="nutr-row"><div className="nutr-label">Calories</div><div className="nutr-value">{it.calories ?? '—'}</div></div>
              <div className="nutr-row"><div className="nutr-label">Total Fat (g)</div><div className="nutr-value">{it.totalFat_g ?? '—'}</div></div>
              <div className="nutr-row"><div className="nutr-label">Total Carbs (g)</div><div className="nutr-value">{it.totalCarbs_g ?? '—'}</div></div>
              <div className="nutr-row"><div className="nutr-label">Protein (g)</div><div className="nutr-value">{it.protein_g ?? '—'}</div></div>
              <div className="nutr-row"><div className="nutr-label">Sodium (mg)</div><div className="nutr-value">{it.sodium_mg ?? '—'}</div></div>
            </div>

            <div className="nutr-divider" />

            <div className="nutr-col">
              {presentExtras.map((e, j) => {
                const val = getFirst(it, e.aliases);
                return (
                  <div key={j} className="nutr-row"><div className="nutr-label">{e.label}</div><div className="nutr-value">{val != null ? String(val) : '—'}</div></div>
                );
              })}
            </div>
          </div>

          <div className="card-source">{it.url ? <a href={it.url} target="_blank" rel="noreferrer">Source</a> : '—'}</div>
        </div>
      ))}
    </div>
  );
}

function NutritionTableView({ items }) {
  if (!items || items.length === 0) return null;

  const baseCols = [
    { key: 'item', label: 'Item', get: i => i.item || '—' },
    { key: 'calories', label: 'Calories', get: i => i.calories ?? '—' },
    { key: 'totalFat_g', label: 'Total Fat (g)', get: i => i.totalFat_g ?? '—' },
    { key: 'totalCarbs_g', label: 'Total Carbs (g)', get: i => i.totalCarbs_g ?? '—' },
    { key: 'protein_g', label: 'Protein (g)', get: i => i.protein_g ?? '—' },
    { key: 'sodium_mg', label: 'Sodium (mg)', get: i => i.sodium_mg ?? '—' },
  ];

  const presentExtras = EXTRA_FIELDS.filter(f => items.some(it => getFirst(it, f.aliases) != null));

  const wrapperClass = 'table-wrapper';

  return (
    <div className={wrapperClass}>
      <table className="nutri-table">
      <thead>
        <tr>
          {baseCols.map(c => <th key={c.key}>{c.label}</th>)}
          {presentExtras.map((e, idx) => <th key={'ex-'+idx}>{e.label}</th>)}
          <th>Source</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it, idx) => (
          <tr key={idx}>
            {baseCols.map(c => <td key={c.key}>{String(c.get(it))}</td>)}
            {presentExtras.map((e, j) => {
              const val = getFirst(it, e.aliases);
              return <td key={'val-'+j}>{val != null ? String(val) : '—'}</td>;
            })}
            <td>{it.url ? <a href={it.url} target="_blank" rel="noreferrer">link</a> : '—'}</td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
}

function CountryRow({ brand, country, items, useTable, countryHeaderStyle }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex(i => (i - 1 + items.length) % items.length);
  const next = () => setActiveIndex(i => (i + 1) % items.length);

  return (
    <div className="country-row">
      <div className="country-header"><strong>{country}</strong></div>
      <div className="stacked-wrapper">
        <div className="stack-controls">
          {!useTable && items.length > 1 ? (
            <button aria-label="prev-card" className="scroller-btn" onClick={prev}>◀</button>
          ) : null}
        </div>

        <div>
          {useTable ? (
            <NutritionTableView items={items} />
          ) : (
            <NutritionTable items={items} horizontal={false} stacked={true} activeIndex={activeIndex} />
          )}
        </div>

        <div className="stack-controls">
          {!useTable && items.length > 1 ? (
            <button aria-label="next-card" className="scroller-btn" onClick={next}>▶</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function WhatsInYourFood() {
  // Build grouping from parsed CSV data: restaurant -> country -> items
  const grouped = foodies.reduce((acc, item) => {
    const brand = item.restaurant || 'Unknown';
    const country = item.country || 'Unknown';
    if (!acc[brand]) acc[brand] = {};
    if (!acc[brand][country]) acc[brand][country] = [];
    acc[brand][country].push(item);
    return acc;
  }, {});

  return (
    <div className="decode-container">
      <h1 className="decode-title">Nutritional Breakdown</h1>
      <p className="decode-desc">For each chain below, some country's items are shown as per-item cards — extra nutrient columns appear only if present in the data</p>

      {Object.keys(grouped).map(brand => (
        <section key={brand}>
          <h2 className="brand-section">{brand}</h2>
          {(() => {
            // case-insensitive matching for KFC countries that previously used the table view.
            // We'll keep this set empty so KFC countries (including UK, India, Mexico)
            // render using the per-item card layout (like McDonald's).
            const kfcTableSet = new Set([]);
            return Object.keys(grouped[brand]).map(country => {
              const countryKey = (country || '').toString().trim().toLowerCase();
              const useTable = brand === 'KFC' && kfcTableSet.has(countryKey);
              return (
                <CountryRow
                  key={brand+"-"+country}
                  brand={brand}
                  country={country}
                  items={grouped[brand][country]}
                  useTable={useTable}
                />
              );
            });
          })()}
        </section>
      ))}
      <p style={{marginTop: 24}}><a href="/">Back to app</a></p>
    </div>
  );
}
