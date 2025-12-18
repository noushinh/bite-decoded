import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// (No dynamic loaders needed — Leaflet is imported from npm)

export default function Map({ locations = [], selectedLocation = null }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(null);

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

          // Use runtime Mapbox tiles when a token is injected (window.__MAPBOX_TOKEN__),
          // otherwise fall back to CartoDB Positron tiles for development/offline.
          const token = (typeof window !== 'undefined' && window.__MAPBOX_TOKEN__) ? String(window.__MAPBOX_TOKEN__).trim() : '';
          const useMapbox = token && token !== 'REPLACE_WITH_MAPBOX_TOKEN';

          if (useMapbox) {
            // Mapbox Styles API raster tiles (light style)
            const styleId = 'mapbox/light-v10';
            L.tileLayer(`https://api.mapbox.com/styles/v1/${styleId}/tiles/{z}/{x}/{y}?access_token=${token}`, {
              maxZoom: 19,
              tileSize: 512,
              zoomOffset: -1,
              attribution: '© <a href="https://www.mapbox.com/about/maps">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);
          } else {
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
              maxZoom: 19,
              subdomains: 'abcd',
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            }).addTo(map);
          }

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

          // markers layer group for dynamic markers from `locations`
          try { markersRef.current = L.layerGroup().addTo(map); } catch (e) { markersRef.current = null; }

          return () => {
            try { window.removeEventListener('resize', onResize); } catch (e) {}
            clearTimeout(_t1); clearTimeout(_t2); clearTimeout(_t3); clearTimeout(_t4); clearTimeout(_t5);
            try { if (geoJsonLayer) map.removeLayer(geoJsonLayer); } catch (e) {}
            try { if (markersRef.current) map.removeLayer(markersRef.current); } catch (e) {}
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

    // Render markers from the `locations` prop and open popup for `selectedLocation` (id).
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      try {
        if (!markersRef.current) markersRef.current = L.layerGroup().addTo(map);
        markersRef.current.clearLayers();

        (locations || []).forEach((loc) => {
          try {
            const coords = loc.coordinates || loc.latlng || [];
            let lat = null; let lng = null;
            if (Array.isArray(coords) && coords.length >= 2) {
              lng = Number(coords[0]);
              lat = Number(coords[1]);
            } else if (coords && typeof coords === 'object') {
              lat = Number(coords.lat || coords.latitude || coords.y);
              lng = Number(coords.lng || coords.lon || coords.longitude || coords.x);
            }
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

            const marker = L.marker([lat, lng]);
            const title = loc.title || loc.name || '';
            const desc = loc.description || '';
            marker.bindPopup(`<div style="font-weight:700;margin-bottom:4px">${String(title)}</div><div style="font-size:12px;color:#333">${String(desc)}</div>`, { maxWidth: 320 });
            marker.addTo(markersRef.current);
            marker._locId = loc.id || loc.key || null;
          } catch (err) {}
        });

        if (selectedLocation && markersRef.current) {
          let found = null;
          markersRef.current.eachLayer((layer) => {
            if (!found && layer._locId && String(layer._locId) === String(selectedLocation)) found = layer;
          });
          if (found) { try { found.openPopup(); map.panTo(found.getLatLng()); } catch (e) {} }
        }
      } catch (err) {}
    }, [locations, selectedLocation]);

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
