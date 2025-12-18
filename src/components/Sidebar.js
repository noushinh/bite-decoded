import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mcdNutrition from '../data/mcd_nutrition';
import bkNutrition from '../data/bk_nutrition';
import wendysNutrition from '../data/wendys_nutrition';
import kfcNutrition from '../data/kfc_nutrition';

export default function Sidebar({ locations = [], onSelect }) {
  const [active, setActive] = useState('all');
  const navigate = useNavigate();

  // Official brand icons served via SimpleIcons CDN (SVG). We show the
  // white icon on a brand-coloured circular background for each button.
  const brands = [
    // Use white backgrounds for BK, Wendy's, KFC and McDonald's so their PNG art stands out.
    { id: 'mcd', label: "McDonald's", local: '/images/mcd.png', src: 'https://cdn.simpleicons.org/mcdonalds/ffffff', initial: 'McD', bg: '#ffffff' },
    { id: 'bk', label: 'Burger King', local: '/images/bk.png', src: 'https://cdn.simpleicons.org/burger-king/ffffff', initial: 'BK', bg: '#ffffff' },
    { id: 'wendys', label: "Wendy's", local: '/images/wendys.png', src: 'https://cdn.simpleicons.org/wendys/ffffff', initial: "W", bg: '#ffffff' },
    { id: 'kfc', label: 'KFC', local: '/images/kfc.png', src: 'https://cdn.simpleicons.org/kfc/ffffff', initial: 'KFC', bg: '#ffffff' },
  ];

  const handleBrandClick = (id) => {
    setActive(id);
    // notify parent of brand selection
    if (typeof onSelect === 'function') onSelect(id);
  };

  

  // Helper to build per-country map from dataset
  const buildCountryMap = (dataset) => {
    const map = {};
    try {
      const entries = Array.isArray(dataset) ? dataset : [];
      entries.forEach((e) => {
        const country = e.country || e.country_code || 'Unknown';
        map[country] = {
          calories: e.calories,
          fat: e.totalFat_g != null ? `${e.totalFat_g}g` : undefined,
          carbs: e.totalCarbs_g != null ? `${e.totalCarbs_g}g` : undefined,
          protein: e.protein_g != null ? `${e.protein_g}g` : undefined,
          sodium: e.sodium_mg != null ? `${e.sodium_mg}mg` : undefined,
        };
      });
    } catch (err) {
      // ignore
    }
    return map;
  };

  const nutritionByCountry = {
    mcd: buildCountryMap(mcdNutrition),
    bk: buildCountryMap(bkNutrition),
    wendys: buildCountryMap(wendysNutrition),
    kfc: buildCountryMap(kfcNutrition),
  };

  // Populate single-brand overview values (fall back to static values if dataset missing)
  const deriveOverview = (dataset, fallback) => {
    try {
      const entries = Array.isArray(dataset) ? dataset : [];
      const fries = entries.find(e => /fries|fry|chips|papas|potato/i.test(e.item) && e.country && /USA|United States/i.test(e.country))
        || entries.find(e => /fries|fry|chips|papas|potato/i.test(e.item))
        || entries[0];
      if (fries) {
        return {
          name: `${fries.restaurant} — ${fries.item}`,
          calories: fries.calories,
          fat: fries.totalFat_g != null ? `${fries.totalFat_g}g` : undefined,
          carbs: fries.totalCarbs_g != null ? `${fries.totalCarbs_g}g` : undefined,
          protein: fries.protein_g != null ? `${fries.protein_g}g` : undefined,
          sodium: fries.sodium_mg != null ? `${fries.sodium_mg}mg` : undefined,
        };
      }
    } catch (err) {
      // ignore
    }
    return fallback;
  };

  const nutrition = {
    mcd: deriveOverview(mcdNutrition, { name: "McDonald's Fries (Medium)", calories: 340, fat: '16g', carbs: '44g', protein: '4g', sodium: '230mg' }),
    bk: deriveOverview(bkNutrition, { name: 'Burger King Fries (Medium)', calories: 380, fat: '18g', carbs: '48g', protein: '5g', sodium: '300mg' }),
    wendys: deriveOverview(wendysNutrition, { name: "Wendy's Fries (Medium)", calories: 420, fat: '19g', carbs: '54g', protein: '5g', sodium: '520mg' }),
    kfc: deriveOverview(kfcNutrition, { name: 'KFC Fries (Medium)', calories: 299, fat: '14g', carbs: '37g', protein: '7g', sodium: '200mg' }),
  };

  // Small inline visualization component. Renders donut ring charts (macronutrient breakdown) for each country.
  function NutritionViz({ byCountry, vertical = false }) {
    if (!byCountry) return null;
    const countries = Object.keys(byCountry);

    const parseValue = (v) => {
      if (v == null) return 0;
      if (typeof v === 'number') return v;
      const cleaned = ('' + v).replace(/[^0-9.]/g, '');
      const n = parseFloat(cleaned);
      return Number.isFinite(n) ? n : 0;
    };

    function DonutCard({ country, vals }) {
      const [hover, setHover] = React.useState(null);

      const carbs = parseValue(vals.carbs);
      const fat = parseValue(vals.fat);
      const protein = parseValue(vals.protein);
      const total = Math.max(carbs + fat + protein, 1);
      const kcal = vals.calories || 0;

      const segments = [
        { key: 'carbs', value: carbs, color: '#1f77b4', label: 'Carbs' },
        { key: 'protein', value: protein, color: '#9467bd', label: 'Protein' },
        { key: 'fat', value: fat, color: '#ff7f0e', label: 'Fat' },
      ].filter(s => s.value > 0);

      const radius = 48;
      const stroke = 12;
      const circumference = 2 * Math.PI * radius;

      let cumulative = 0;

      return (
        <div className="donut-card metric-card" key={country}>
          <div className="donut-svg-wrapper" aria-hidden>
            <svg className="donut-svg" width="120" height="120" viewBox="0 0 120 120">
              <g transform="translate(60,60) rotate(-90)">
                {/* base ring background */}
                <circle r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
                {segments.map((s, i) => {
                  const segLen = (s.value / total) * circumference;
                  // small visible gap (in px) to avoid visual overlap/antialiasing between segments
                  const gap = 1.5;
                  const visibleLen = Math.max(0, segLen - gap);
                  const dashArray = `${visibleLen} ${circumference - visibleLen}`;
                  const dashOffset = -cumulative;
                  // advance cumulative by the true segment length so subsequent segments keep correct positions
                  cumulative += segLen;
                  return (
                    <circle
                      key={s.key}
                      r={radius}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={stroke}
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="butt"
                      onMouseEnter={() => setHover(s.key)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(s.key)}
                      onBlur={() => setHover(null)}
                      tabIndex={0}
                      style={{ transition: 'stroke-width .12s ease' }}
                    />
                  );
                })}
              </g>
            </svg>

            <div className="donut-center">
              {hover ? (
                (() => {
                  const s = segments.find(x => x.key === hover);
                  if (!s) return <div className="donut-main">{kcal} kcal</div>;
                  return (
                    <div>
                      <div className="donut-main">{s.value}{'g'}</div>
                      <div className="donut-sub">{s.label}</div>
                    </div>
                  );
                })()
              ) : (
                <div>
                  <div className="donut-main">{kcal}</div>
                  <div className="donut-sub">kcal</div>
                </div>
              )}
            </div>
          </div>

          <div className="metric-card-header" style={{ marginTop: 8 }}>
            <div className="metric-label">{country}</div>
            <div className="metric-unit">{Math.round(total)} g</div>
          </div>
        </div>
      );
    }

    const containerClass = `nutrition-viz-row donut-row ${vertical ? 'donut-column' : ''}`.trim();
    return (
      <div className={containerClass} aria-hidden>
        {countries.map((country) => (
          <DonutCard key={country} country={country} vals={byCountry[country]} />
        ))}
      </div>
    );
  }

  return (
    <aside className={`sidebar ${active && active !== 'all' ? `brand-${active}` : ''}`}>
      <header className="heading">
        <div className="brand-header-container">
          {/* The Title */}
          <h1 className="brand-title">
            <span className="brand-line1">🌱 The Balanced</span>
            <span className="brand-line2">Bite</span>
          </h1>
        </div>
      </header>

      <main style={{ paddingTop: 12 }}>
        <section style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            className="nutri-help"
            onClick={() => navigate('/whats-in-your-food')}
            title="Deconstruct It"
          >Decode Your Dish 🔍</button>
          <span className="nutri-label">Nutritional Breakdown</span>
        </section>

        <div style={{ height: 12 }} />

        <section aria-label="Brand filters">
          <div className="brand-buttons">
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`brand-btn ${active === b.id ? 'active' : ''}`}
                onClick={() => handleBrandClick(b.id)}
                aria-pressed={active === b.id}
                title={b.label}
                style={{ background: b.bg }}
              >
                <img
                  className="brand-icon"
                  src={b.local || b.src}
                  alt={`${b.label} logo`}
                  onError={(e) => {
                    try {
                      if (!e || !e.target) return;
                      const img = e.target;

                      // If we tried the local .svg first, try the .png equivalent next
                      if (!img.dataset.triedLocalAlt && img.src && img.src.endsWith('.svg')) {
                        img.dataset.triedLocalAlt = '1';
                        const pngLocal = img.src.replace(/\.svg(\?.*)?$/, '.png');
                        img.src = pngLocal;
                        return;
                      }

                      // If we tried the local .png first and it failed, try the .svg equivalent
                      if (!img.dataset.triedLocalAlt && img.src && img.src.endsWith('.png')) {
                        img.dataset.triedLocalAlt = '1';
                        const svgLocal = img.src.replace(/\.png(\?.*)?$/, '.svg');
                        img.src = svgLocal;
                        return;
                      }

                      // If we haven't tried the CDN slug yet, try it now
                      if (!img.dataset.triedCdn && b.src) {
                        img.dataset.triedCdn = '1';
                        img.src = b.src;
                        return;
                      }

                      // Already tried CDN and local alternatives: fall back to generated initials SVG
                      if (img.dataset.fallback) return; // already applied fallback
                      img.dataset.fallback = '1';
                      const text = b.initial || (b.label || '').split(' ').map(s => s[0]).join('').slice(0,3);
                      const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'>\n  <rect width='100%' height='100%' rx='12' fill='${b.bg || '#cccccc'}'/>\n  <text x='50%' y='54%' font-family='Arial, Helvetica, sans-serif' font-size='20' fill='#fff' text-anchor='middle' alignment-baseline='middle'>${text}</text>\n</svg>`;
                      const uri = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
                      img.src = uri;
                    } catch (err) {
                      // swallow fallback errors
                    }
                  }}
                />
              </button>
            ))}
          </div>
        </section>
        <div style={{ height: 12 }} />

        {/* Receipt-like nutrition panel. Show donuts + receipt for any selected brand with data. */}
        {(active && active !== 'all' && nutritionByCountry[active] && Object.keys(nutritionByCountry[active]).length > 0) ? (
          <section aria-label="Nutrition receipt and visualizations" className="receipt-with-donuts">
            <div className="donut-column-wrapper">
              <NutritionViz
                byCountry={(() => {
                  const map = { ...(nutritionByCountry[active] || {}) };
                  if (active === 'wendys') {
                    // remove India and South Africa from the donuts only (existing behaviour)
                    Object.keys(map).forEach((k) => {
                      if (k && (k.toLowerCase() === 'india' || k.toLowerCase() === 'south africa')) {
                        delete map[k];
                      }
                    });
                  } else if (active === 'kfc') {
                    // remove South Africa from KFC donuts/visualizations
                    Object.keys(map).forEach((k) => {
                      if (k && k.toLowerCase() === 'south africa') {
                        delete map[k];
                      }
                    });
                  }
                  return map;
                })()}
                vertical
              />
            </div>

            <div className="receipt">
              <div key={active ? active : 'idle'} className={`receipt-sheet ${active && active !== 'all' ? 'printing' : ''}`}>
                {(() => {
                  const brandLabel = (brands.find(b => b.id === active) || {}).label || active;
                  return (
                    <div>
                      <div className="rcpt-store">FOODIES & CO.</div>
                      <div className="rcpt-title">{brandLabel} Fries — Medium</div>
                      {(() => {
                        let entries = Object.entries(nutritionByCountry[active] || {});
                        // For KFC, remove South Africa from the printed receipt list as well
                        if (active === 'kfc') {
                          entries = entries.filter(([country]) => !(country && country.toLowerCase() === 'south africa'));
                        }
                        const filtered = entries.filter(([country, vals]) => {
                          if (!vals) return false;
                          // keep entry if any of the main metrics is present
                          const any = [vals.calories, vals.fat, vals.carbs, vals.protein, vals.sodium].some(x => x != null && x !== '');
                          return any;
                        });
                        return filtered.map(([country, vals]) => (
                          <div className="country-block" key={country}>
                            <div className="country-name">{country}</div>
                            <div className="rcpt-line"><span>Calories</span><strong>{vals.calories ? `${vals.calories} kcal` : '—'}</strong></div>
                            <div className="rcpt-line"><span>Fat</span><strong>{vals.fat || '—'}</strong></div>
                            <div className="rcpt-line"><span>Carbs</span><strong>{vals.carbs || '—'}</strong></div>
                            <div className="rcpt-line"><span>Protein</span><strong>{vals.protein || '—'}</strong></div>
                            <div className="rcpt-line"><span>Sodium</span><strong>{vals.sodium || '—'}</strong></div>
                          </div>
                        ));
                      })()}
                      <div className="rcpt-note">* Values are taken from brand nutrition entries when available.</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </section>
        ) : (
          <section aria-label="Nutrition receipt">
            <div className="receipt">
              <div key={active ? active : 'idle'} className={`receipt-sheet ${active && active !== 'all' ? 'printing' : ''}`}>
                {!active && (
                  <div>
                    <div className="rcpt-store">FOODIES & CO.</div>
                    <div className="rcpt-title">Select a brand</div>
                    <div className="rcpt-line"><span>Click a logo</span><strong>to view fries</strong></div>
                  </div>
                )}

                {active && (
                  (() => {
                    const data = nutrition[active];
                    if (!data) return <div className="receipt-empty">No nutrition data available.</div>;
                    return (
                      <div>
                        <div className="rcpt-store">FOODIES & CO.</div>
                        <div className="rcpt-title">Nutrition — {data.name}</div>
                        <div className="rcpt-line"><span>Serving</span><strong>Medium</strong></div>
                        <div className="rcpt-line"><span>Calories</span><strong>{data.calories} kcal</strong></div>
                        <div className="rcpt-line"><span>Fat</span><strong>{data.fat}</strong></div>
                        <div className="rcpt-line"><span>Carbs</span><strong>{data.carbs}</strong></div>
                        <div className="rcpt-line"><span>Protein</span><strong>{data.protein}</strong></div>
                        <div className="rcpt-line"><span>Sodium</span><strong>{data.sodium}</strong></div>
                        <div className="rcpt-total">kcal / serving: <strong>{data.calories}</strong></div>
                        <div className="rcpt-note">* Values are approximate per serving.</div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </aside>
  );
}
