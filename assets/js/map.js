import { generarExpresionColor } from "./shading3d.js";
import { renderPieFugas, renderDoubleStackedBars } from "./charts.js";
console.log("map.js cargado");

let geojsonSectores = null;
let indicadorActual = "Submedición";

// (removed previous DEFAULT_VIEW and custom view controls)

// Crear mapa
// Start with a wide Colombia view so we can animate a cinematic zoom into Bogotá
const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {},
    layers: [],
  },
  // center on Colombia with a small zoom so whole country is visible
  center: [-74.0, 4.0],
  zoom: 4.0,
  pitch: 0,
  bearing: 0,
});

map.on("load", async () => {
  console.log("Mapa cargado");

    // Custom rotation handler: Alt + left-drag to rotate (bearing) and adjust pitch
    // This gives direct mouse control for rotating the map up to 180° from the current heading.
    (function enableAltDragRotation(){
      const canvas = map.getCanvas();
      let rotating = false;
      let startX = 0;
      let startY = 0;
      let startBearing = 0;
      let startPitch = 0;

      canvas.addEventListener('mousedown', (ev) => {
        // Only start when left button + Alt key pressed
        if (ev.button !== 0 || !ev.altKey) return;
        ev.preventDefault();
        rotating = true;
        startX = ev.clientX;
        startY = ev.clientY;
        startBearing = map.getBearing();
        startPitch = map.getPitch();
        canvas.style.cursor = 'grabbing';
        try { map.dragPan.disable(); } catch (e) {}
      });

      window.addEventListener('mousemove', (ev) => {
        if (!rotating) return;
        ev.preventDefault();
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        // sensitivity: degrees per pixel
        const bearingDelta = dx * 0.6; // ~0.6° per px -> 180° ~= 300px
        const pitchDelta = dy * 0.15;
        let newBearing = startBearing + bearingDelta;
        // normalize to -180..180
        newBearing = ((newBearing + 180) % 360) - 180;
        let newPitch = startPitch - pitchDelta;
        newPitch = Math.max(0, Math.min(60, newPitch));
        try { map.setBearing(newBearing); } catch (e) {}
        try { map.setPitch(newPitch); } catch (e) {}
      });

      window.addEventListener('mouseup', (ev) => {
        if (!rotating) return;
        rotating = false;
        canvas.style.cursor = '';
        try { map.dragPan.enable(); } catch (e) {}
      });
    })();

  // Log map errors to help diagnose tile load issues
  map.on('error', (e) => {
    try {
      console.warn('Map error event:', e.error || e);
    } catch (err) {}
  });

  // -----------------------------
  // Base map (OpenStreetMap raster tiles)
  // This adds a raster tile layer under the sectores layer so it doesn't
  // modify your existing vector/3D layers. For production consider a
  // vector tiles provider or MapTiler/TileServer with API key.
  // -----------------------------
  try {
    // Keep only reliable bases: OSM and OpenTopoMap, plus an explicit 'none' option
    const baseDefs = [
      {
        id: 'osm',
        label: 'OSM',
        source: 'osm-tiles',
        layer: 'osm-tiles-layer',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        attribution: '© OpenStreetMap contributors'
      },
      {
        id: 'opentopo',
        label: 'OpenTopoMap',
        source: 'opentopo-tiles',
        layer: 'opentopo-tiles-layer',
        tiles: [
          'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
          'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
          'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'
        ],
        attribution: '© OpenTopoMap contributors'
      },
      {
        id: 'none',
        label: 'Ninguna',
        source: null,
        layer: null,
        tiles: [],
        attribution: ''
      }
    ];

    // Add each source + layer except the 'none' virtual option; only OSM visible initially
    baseDefs.forEach((b, idx) => {
      if (!b.source) return; // skip 'none'
      map.addSource(b.source, {
        type: 'raster',
        tiles: b.tiles,
        tileSize: 256,
        attribution: b.attribution
      });

      map.addLayer({
        id: b.layer,
        type: 'raster',
        source: b.source,
        layout: { visibility: idx === 0 ? 'visible' : 'none' },
        paint: {}
      });
    });

    // Test availability of each base's tiles (try a sample tile)
    async function testTileURL(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        // add cache-buster to avoid cached failures
        img.src = url + '?_=' + Date.now();
      });
    }

    // Replace {z}/{x}/{y} with a small tile sample (z=2,x=2,y=1)
    const sample = { z: 2, x: 2, y: 1 };
    baseDefs.forEach(async (b) => {
      if (b.id === 'none') { b.available = true; return; }
      b.available = false; // default false until proven
      try {
        const tpl = Array.isArray(b.tiles) ? b.tiles[0] : b.tiles;
        const url = tpl.replace('{z}', sample.z).replace('{x}', sample.x).replace('{y}', sample.y);
        const ok = await testTileURL(url);
        b.available = ok;
        // mark list item if already rendered
        const li = document && document.querySelector && document.querySelector(`#base-list li[data-idx="${baseDefs.indexOf(b)}"]`);
        if (li) {
          if (!ok) li.classList.add('unavailable');
          else li.classList.remove('unavailable');
        }
      } catch (err) {
        b.available = false;
      }
    });

    // Create a control with an icon button + dropdown to select bases
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      const ctl = document.createElement('div');
      ctl.className = 'map-base-toggle';

      // button with stacked-layers icon
      const svgIcon = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">'
        + '<rect x="3" y="6" width="18" height="3" rx="1" fill="currentColor" />'
        + '<rect x="5" y="11" width="14" height="3" rx="1" fill="currentColor" />'
        + '<rect x="7" y="16" width="10" height="3" rx="1" fill="currentColor" />'
        + '</svg>';

      ctl.innerHTML = `
        <div class="map-base-control">
          <button id="base-toggle" aria-haspopup="true" aria-expanded="false" title="Base: ${baseDefs[0].label}">${svgIcon}</button>
          <ul id="base-list" class="base-list" role="menu" aria-label="Seleccionar base">
            ${baseDefs.map((b, i) => `<li role="menuitem" data-idx="${i}">${b.label}</li>`).join('')}
          </ul>
        </div>
      `;

      mapContainer.appendChild(ctl);

      const btn = document.getElementById('base-toggle');
      const list = document.getElementById('base-list');
      let current = 0;

      // fade transition between raster layers
      function fadeLayer(fromIdx, toIdx, duration = 300) {
        if (fromIdx === toIdx) return;
        const fromLayer = baseDefs[fromIdx].layer;
        const toLayer = baseDefs[toIdx].layer;
        const steps = Math.max(6, Math.round(duration / 16));
        let step = 0;
        // make sure target layer is visible and start with 0 opacity
        map.setLayoutProperty(toLayer, 'visibility', 'visible');
        map.setPaintProperty(toLayer, 'raster-opacity', 0);

        const timer = setInterval(() => {
          step++;
          const t = step / steps;
          map.setPaintProperty(toLayer, 'raster-opacity', t);
          map.setPaintProperty(fromLayer, 'raster-opacity', 1 - t);
          if (step >= steps) {
            clearInterval(timer);
            map.setPaintProperty(toLayer, 'raster-opacity', 1);
            map.setPaintProperty(fromLayer, 'raster-opacity', 0);
            map.setLayoutProperty(fromLayer, 'visibility', 'none');
          }
        }, duration / steps);
      }

      function setBase(i) {
        const target = ((i % baseDefs.length) + baseDefs.length) % baseDefs.length;

        // if 'none' selected -> hide all raster layers immediately
        if (baseDefs[target].id === 'none') {
          baseDefs.forEach((b) => {
            if (!b.layer) return;
            try { map.setLayoutProperty(b.layer, 'visibility', 'none'); } catch (e) {}
            try { map.setPaintProperty(b.layer, 'raster-opacity', 0); } catch (e) {}
          });
          current = target;
          btn.setAttribute('title', 'Base: ' + baseDefs[current].label);
          updateAttribution(current);
          btn.setAttribute('aria-expanded', 'false');
          list.classList.remove('open');
          return;
        }

        // if selected base is unavailable, pick first available (excluding 'none')
        let chosen = target;
        if (baseDefs[chosen].available === false) {
          const next = baseDefs.findIndex((b) => b.available === true && b.id !== 'none');
          if (next === -1) {
            console.warn('No base tiles available; keeping current base.');
            btn.setAttribute('title', 'Base: ' + baseDefs[current].label + ' (fallback)');
            updateAttribution(current);
            return;
          }
          chosen = next;
        }

        // if same, just ensure attribution updated
        if (chosen === current) {
          btn.setAttribute('title', 'Base: ' + baseDefs[chosen].label);
          updateAttribution(chosen);
          btn.setAttribute('aria-expanded', 'false');
          list.classList.remove('open');
          return;
        }

        // perform fade
        fadeLayer(current, chosen, 300);
        current = chosen;
        btn.setAttribute('title', 'Base: ' + baseDefs[current].label);
        updateAttribution(current);
        // close dropdown if open
        btn.setAttribute('aria-expanded', 'false');
        list.classList.remove('open');
      }

      // update attribution control
      const mapAttr = document.createElement('div');
      mapAttr.className = 'map-attribution';
      mapAttr.innerHTML = baseDefs[0].attribution;
      mapContainer.appendChild(mapAttr);

      function updateAttribution(idx) {
        const attr = baseDefs[idx]?.attribution || '';
        mapAttr.innerHTML = attr;
      }

      // toggle list
      btn.addEventListener('click', (ev) => {
        const open = list.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });

      // select from list
      list.addEventListener('click', (ev) => {
        const li = ev.target.closest('li');
        if (!li) return;
        const idx = Number(li.dataset.idx);
        setBase(idx);
      });

      // close on outside click
      document.addEventListener('click', (ev) => {
        if (!ctl.contains(ev.target)) {
          list.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });

      // initialize attribution and paint opacities (skip 'none')
      baseDefs.forEach((b, idx) => {
        if (!b.layer) return;
        map.setPaintProperty(b.layer, 'raster-opacity', idx === 0 ? 1 : 0);
      });
      updateAttribution(0);
    }
  } catch (e) {
    console.warn('No se pudo añadir capas base:', e);
  }

  // ---------------------------------------
  // Cargar GEOJSON REAL
  // ---------------------------------------
  const res = await fetch("data/sectores_3d.geojson");
  geojsonSectores = await res.json();

  // Crear SOURCE
  map.addSource("sectores", {
    type: "geojson",
    data: geojsonSectores,
  });

  // Crear LAYER 3D
  map.addLayer({
    id: "sectores-3d",
    type: "fill-extrusion",
    source: "sectores",
    paint: {
      "fill-extrusion-height": [
        "*",
        ["number", ["get", "Shape_Area"], 1],
        0.00001
      ],
      "fill-extrusion-color": "#aac",
      "fill-extrusion-opacity": 0.95
    }
  });

  // Añadir capa de contorno (inicialmente sin coincidencia)
  map.addLayer({
    id: 'sectores-outline',
    type: 'line',
    source: 'sectores',
    paint: {
      'line-color': '#000',
      'line-width': 2
    },
    filter: ['==', ['get', 'Sector_'], '___NONE___']
  });

  // Exponer función para resaltar sector desde otros scripts
  window.highlightSector = function(code) {
    if (!map.getLayer('sectores-outline')) return;
    // Primero intentar con propiedad 'Sector_'
    map.setFilter('sectores-outline', ['==', ['get', 'Sector_'], String(code)]);
    // Si no hay coincidencia, intentar con 'COD_SECTOR'
    const matched = geojsonSectores.features.some(f => String(f.properties.Sector_) === String(code));
    if (!matched) {
      map.setFilter('sectores-outline', ['==', ['get', 'COD_SECTOR'], String(code)]);
    }
  };

  // Aplicar primera vez
  aplicarSombreado(indicadorActual);

  // Click en sector
  map.on("click", "sectores-3d", (e) => {
    const props = e.features[0].properties;
    const sector = props.Sector_ || props.COD_SECTOR;

    document.getElementById("sector-actual").textContent = sector;

    if (window.sectorDataMap[sector]) {
      const sectorData = window.sectorDataMap[sector];
      actualizarKPIs(sectorData);
      // Actualizar pie y barras con datos del sector seleccionado
      try {
        renderPieFugas(sectorData);
        renderDoubleStackedBars(sectorData);
      } catch (err) {
        console.warn('No se pudo renderizar gráficos del sector:', err);
      }
      // Close sector dropdown if open
      try {
        const sd = document.getElementById('sector-dropdown');
        const st = document.getElementById('sector-toggle');
        if (sd && !sd.classList.contains('hidden')) sd.classList.add('hidden');
        if (st) st.setAttribute('aria-expanded','false');
      } catch (e) {}
      // Highlight on map
      try { window.highlightSector && window.highlightSector(sector); } catch(e) {}
    }
  });

  // Hover cursor
  map.on("mouseenter", "sectores-3d", () =>
    (map.getCanvas().style.cursor = "pointer")
  );
  map.on("mouseleave", "sectores-3d", () =>
    (map.getCanvas().style.cursor = "")
  );

  activarEventosCoropletico();

  // Cinematic: animate from whole-country view into Bogotá over 8 seconds
  // Target view for Bogotá (adjusted final zoom to 10.5 per user request)
  const targetView = { center: [-74.1, 4.65], zoom: 10.5, pitch: 60, bearing: -20 };

  // start cycling loader subtitles while the cinematic runs
  const subtitleEl = document.querySelector('.loader-subtext');
  const messages = ['Cargando datos...', 'Cargando capas...', 'Preparando visualización...'];
  let subtitleIdx = 0;
  let subtitleTimer = null;
  if (subtitleEl) {
    subtitleEl.textContent = messages[0];
    subtitleTimer = setInterval(() => {
      subtitleIdx = (subtitleIdx + 1) % messages.length;
      subtitleEl.textContent = messages[subtitleIdx];
    }, 2600);
  }

  // Start the easeTo animation and dispatch mapReady once the move finishes
  try {
    map.easeTo({ ...targetView, duration: 8000, easing: (t) => t });
    // When the camera stops moving, signal that the cinematic finished and map is ready
    const onMoveEnd = () => {
      // stop subtitle cycling
      try { if (subtitleTimer) clearInterval(subtitleTimer); } catch(e) {}
      try { window.dispatchEvent(new Event('mapReady')); } catch(e) {}
      map.off('moveend', onMoveEnd);
    };
    map.on('moveend', onMoveEnd);
    // safety: if moveend doesn't fire, ensure we dispatch after timeout
    const fallbackTimeout = setTimeout(() => {
      try { if (subtitleTimer) clearInterval(subtitleTimer); } catch(e) {}
      try { window.dispatchEvent(new Event('mapReady')); } catch(e) {}
    }, 8500);
  } catch (err) {
    // fallback: dispatch immediately
    try { window.dispatchEvent(new Event('mapReady')); } catch(e) {}
  }
});

// ---------------------------------------
// FUNCIONES
// ---------------------------------------

function aplicarSombreado(indicador) {
  if (!geojsonSectores) return;

  const expr = generarExpresionColor(indicador, geojsonSectores);
  map.setPaintProperty("sectores-3d", "fill-extrusion-color", expr);

  console.log("Indicador aplicado:", indicador);
}
// expose the richer updater for other scripts (so dropdowns use same formatter)
try { window.actualizarKPIs = actualizarKPIs; } catch (e) {}

function activarEventosCoropletico() {
  document.querySelectorAll(".legend-row").forEach((row) => {
    row.addEventListener("click", () => {
      indicadorActual = row.dataset.indicador;
      aplicarSombreado(indicadorActual);
    });
  });
}

function actualizarKPIs(data) {
  // Update numeric values (keep existing formatting)
  const safe = (v, digits = 2) => (v == null || Number.isNaN(Number(v))) ? "--" : (Number(v).toFixed(digits));
  const setText = (id, val, digits = 2) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = safe(val, digits);
  };

  setText('kpi-ve', data["VE (Mm³/año)"], 2);
  setText('kpi-pt', data["Pérdidas Totales (Mm³/año)"], 2);
  setText('kpi-pa', data["Pérdidas Aparentes (Mm³/año)"], 2);
  setText('kpi-pr', data["Pérdidas Técnicas (Mm³/año)"], 2);
  setText('kpi-amsi', data["AMSI"], 2);
  setText('kpi-uarl', data["UARL"], 2);
  setText('kpi-ili', data["ILI"], 2);
  setText('kpi-ipuf', data["IPUF"], 2);

  // Map KPI keys to fill element ids and reasonable maxima for normalization
  const kpiConfig = {
    'kpi-fill-ve': { key: 'VE (Mm³/año)', max: 100 },
    'kpi-fill-pt': { key: 'Pérdidas Totales (Mm³/año)', max: 100 },
    'kpi-fill-pa': { key: 'Pérdidas Aparentes (Mm³/año)', max: 50 },
    'kpi-fill-pr': { key: 'Pérdidas Técnicas (Mm³/año)', max: 50 },
    'kpi-fill-amsi': { key: 'AMSI', max: 10 },
    'kpi-fill-uarl': { key: 'UARL', max: 10 },
    'kpi-fill-ili': { key: 'ILI', max: 10 },
    'kpi-fill-ipuf': { key: 'IPUF', max: 100 }
  };

  Object.entries(kpiConfig).forEach(([fillId, conf]) => {
    const val = data[conf.key];
    const fillEl = document.getElementById(fillId);
    const barEl = fillEl && fillEl.parentElement;
    let pct = 0;
    if (val != null && !Number.isNaN(Number(val))) {
      pct = Math.round((Number(val) / conf.max) * 100);
      pct = Math.max(0, Math.min(100, pct));
    }
    if (fillEl) fillEl.style.width = pct + '%';
    if (barEl) barEl.setAttribute('aria-valuenow', String(pct));
  });
}
