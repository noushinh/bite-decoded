import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

// (No dynamic loaders needed — Leaflet is imported from npm)

export default function Map({ locations = [], selectedLocation = null }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const navigate = useNavigate();

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

          // layer group to hold markers so we can clear/recreate easily
          markersRef.current = L.layerGroup().addTo(map);

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

  // Marker & popup effect: recreate markers whenever `locations` changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    const layer = markersRef.current || L.layerGroup().addTo(map);
    markersRef.current = layer;

    // clear existing markers
    layer.clearLayers();

    const createdMarkers = [];

    locations.forEach((loc) => {
      try {
        const coords = loc.coordinates || loc.coord || loc.latlng || loc.latLng || [];
        // support [lng, lat] or {lat, lng} objects
        let lat, lng;
        if (Array.isArray(coords) && coords.length >= 2) {
          lng = coords[0];
          lat = coords[1];
        } else if (coords && typeof coords === 'object') {
          lat = coords.lat || coords.latitude || coords[1];
          lng = coords.lng || coords.longitude || coords[0];
        }
        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        const marker = L.marker([lat, lng]);

        const popupId = `nav-btn-${loc.id}`;
        const popupHtml = `
          <div class="map-popup">
            <strong>${loc.title || (loc.country || loc.id)}</strong>
            <div style="margin-top:6px;font-size:0.9rem">${loc.description || ''}</div>
            <div style="margin-top:8px">
              <button id="${popupId}" style="background:#FFC72C;border:none;padding:8px 10px;cursor:pointer;border-radius:6px">\ud83d\udcca Menu Analysis</button>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, { maxWidth: 320 });

        marker.on('popupopen', () => {
          // attach click handler to navigate when the popup button is clicked
          try {
            const btn = document.getElementById(popupId);
            if (btn) {
              const handler = () => {
                try { navigate(`/menu-analysis/${loc.id}`); } catch (e) { /* ignore */ }
              };
              btn.addEventListener('click', handler, { once: true });
            }
          } catch (e) {}
        });

        marker.addTo(layer);
        createdMarkers.push({ loc, marker });
      } catch (e) {
        // ignore marker creation errors per-location
      }
    });

    // If a selectedLocation is present, open its popup and pan to it.
    if (selectedLocation) {
      const match = createdMarkers.find((m) => m.loc.id === selectedLocation.id || m.loc.id === selectedLocation);
      if (match) {
        try {
          match.marker.openPopup();
          map.panTo(match.marker.getLatLng(), { animate: true });
        } catch (e) {}
      }
    }

    // ensure size after adding markers
    try { map.invalidateSize && map.invalidateSize(); } catch (e) {}

    return () => {
      try { layer.clearLayers(); } catch (e) {}
    };
  }, [locations, selectedLocation, navigate]);

  // Note: previously markers and popups were intentionally removed per user request.
  // The map will render tiles and the country-fill overlay; this effect re-adds markers/popups.

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
