import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// (No dynamic loaders needed — Leaflet is imported from npm)

export default function Map({ locations = [], selectedLocation = null }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

    useEffect(() => {
      let cancelled = false;
      let tries = 0;

      const initLeaflet = () => {
        if (cancelled) return;
        const container = mapContainer.current;
        if (!container) {
          if (tries++ < 20) return setTimeout(initLeaflet, 100);
          // eslint-disable-next-line no-console
          console.warn('Leaflet: map container not found after retries');
          return;
        }

        const { clientWidth, clientHeight } = container;
        if (!clientWidth || !clientHeight) {
          if (tries++ < 20) return setTimeout(initLeaflet, 100);
          // eslint-disable-next-line no-console
          console.warn('Leaflet: map container has zero size after retries', clientWidth, clientHeight);
          // we'll proceed anyway
        }

        try {
          const map = L.map(container, { scrollWheelZoom: true }).setView([20, 0], 2);
          // Use CartoDB Positron (light) tiles for a clean, soft basemap
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          }).addTo(map);

          mapRef.current = map;

          try { L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map); } catch (e) {}

            // Add country-fill GeoJSON overlay to highlight specific countries.
            // We fetch a public world countries GeoJSON and style matching features.
            let geoJsonLayer = null;
            const geoJsonUrl = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
            const highlightNames = new Set([
              'usa', 'united states', 'united states of america',
              'india',
              'mexico',
              'uk', 'united kingdom',
              'south africa'
            ]);

            fetch(geoJsonUrl)
              .then((res) => res.json())
              .then((geo) => {
                try {
                  geoJsonLayer = L.geoJSON(geo, {
                    style: (feature) => {
                      const name = (feature.properties && (feature.properties.ADMIN || feature.properties.NAME || feature.properties.name)) || '';
                      const n = String(name).toLowerCase().trim();
                      const isHighlighted = highlightNames.has(n);
                      return {
                        color: isHighlighted ? '#b30000' : '#666',
                        weight: isHighlighted ? 1.2 : 0.6,
                        fillColor: isHighlighted ? '#d9534f' : '#000000',
                        fillOpacity: isHighlighted ? 0.28 : 0,
                        interactive: false,
                      };
                    },
                  }).addTo(map);

                  // Place polygons behind markers but above tiles
                  try { geoJsonLayer.bringToBack && geoJsonLayer.bringToBack(); } catch (e) {}
                } catch (e) {
                  // ignore geojson errors
                }
              })
              .catch(() => {
                // ignore fetch errors (offline or CORS) - app still works without country fills
              });

          const ensureSize = () => { try { map.invalidateSize && map.invalidateSize(); } catch (e) {} };
          ensureSize();
          const _t1 = setTimeout(ensureSize, 100);
          const _t2 = setTimeout(ensureSize, 500);
          const _t3 = setTimeout(ensureSize, 1000);
          const _t4 = setTimeout(ensureSize, 2000);
          const _t5 = setTimeout(ensureSize, 4000);
          const onResize = () => ensureSize();
          window.addEventListener('resize', onResize);

          // eslint-disable-next-line no-console
          console.log('Leaflet initialized', { clientWidth, clientHeight });
          try { if (typeof window !== 'undefined') window.__LEAFLET_MAP__ = map; } catch(e){}

          return () => {
            try { window.removeEventListener('resize', onResize); } catch (e) {}
            clearTimeout(_t1); clearTimeout(_t2); clearTimeout(_t3); clearTimeout(_t4); clearTimeout(_t5);
            try { if (geoJsonLayer) map.removeLayer(geoJsonLayer); } catch (e) {}
            try { map.remove(); } catch (e) {}
            mapRef.current = null;
          };
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Leaflet init failed:', e);
        }
      };

      initLeaflet();

      return () => { cancelled = true; };
    }, []);

  // Note: markers and popups intentionally removed per user request.
  // The map will render tiles and the country-fill overlay only.

  return (
    // Render the map container as the direct child so flex sizing rules apply
    <div
      ref={mapContainer}
      id="map"
      className="map"
      style={{ flex: 1, height: '100%', minHeight: 320 }}
    />
  );
}
