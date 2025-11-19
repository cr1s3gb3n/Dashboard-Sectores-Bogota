// ==== Config ====
const CENTER = [4.65, -74.09];
const BASE = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';

// Colores/etiquetas (igual que tu mapa anterior)
const COLORS  = ['#4e79a7','#f28e2b','#59a14f','#e15759']; // azul, naranja, verde, rojo
const LABELS  = ['Submedición','Errores/Fallas de catastro','Consumo no autorizado','Fugas técnicas'];

// Mapea los nombres EXACTOS de tus campos en el GeoJSON:
const FIELD_NAMES = {
  sector: 'Sector_', // id/etiqueta de sector
  // posibles variantes de los 4 campos (se intentan en orden)
  sub:  ['SUBMEDICIÓN','SUBMEDICION','Submedición','Submedicion'],
  err:  ['ERRORES_EN_EL_MANEJO_DE_DATOS_Y_FALLAS_DE_CATASTRO','Errores/Fallas de catastro','ERRORES…', 'ERRORES EN EL MANEJO DE DATOS Y FALLAS DE CATASTRO'],
  con:  ['CONSUMO_NO_AUTORIZADO','Consumo no autorizado'],
  fug:  ['FUGAS_TÉCNICAS','FUGAS TECNICAS','Fugas técnicas']
};
function pick(p, list){ for (const k of list){ if (k in p) return p[k]; } return 0; }

// ==== Mapa ====
const map = L.map('map', { zoomSnap: .5, preferCanvas: true }).setView(CENTER, 10);
L.tileLayer(BASE, { attribution: '©OpenStreetMap, ©Carto' }).addTo(map);

// ==== Cargar datos ====
let layerPopups = null;   // capa de popups
let layerShade  = null;   // capa para sombrear por campo
let currentIdx  = null;   // índice de categoría activa (0..3)

fetch('data/sectores.geojson')
  .then(r => r.json())
  .then(geo => {
    // Capa de popups
    layerPopups = L.geoJSON(geo, {
      style: f => ({
        color: '#2b8cbe',
        weight: 1.2,
        fillColor: '#86c5a6',
        fillOpacity: 0.35
      }),
      onEachFeature: (f, l) => bindPopupWithPie(f, l)
    }).addTo(map);

    map.fitBounds(layerPopups.getBounds(), { padding: [20,20] });

    // Panel de sombreado
    buildPanel(geo);

  }).catch(err => console.error('No se pudo cargar data/sectores.geojson', err));


// ==== Popup con Chart.js ====
function bindPopupWithPie(feature, layer){
  const p = feature.properties || {};
  const sec = p[FIELD_NAMES.sector] || 'Sector';

  // valores (con 1 decimal)
  const vals = [
    Number(pick(p, FIELD_NAMES.sub)) || 0,
    Number(pick(p, FIELD_NAMES.err)) || 0,
    Number(pick(p, FIELD_NAMES.con)) || 0,
    Number(pick(p, FIELD_NAMES.fug)) || 0
  ];
  const vals1 = vals.map(v => Number.isFinite(v) ? Number(v.toFixed(1)) : 0);

  // id único para el canvas del gráfico
  const cid = 'c_' + Math.random().toString(36).slice(2,9);

  const html = `
    <div class="popup-title">${sec}</div>
    <div class="popup-sub">Sector ${sec}</div>
    <div style="width:360px;height:220px;display:flex;justify-content:center;">
      <canvas id="${cid}" width="340" height="200"></canvas>
    </div>
  `;

  layer.bindPopup(html, { maxWidth: 420, className: 'nice-popup' });

  layer.on('popupopen', () => {
    const ctx = document.getElementById(cid);
    if (!ctx) return;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: LABELS,
        datasets: [{ data: vals1, backgroundColor: COLORS }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 12, usePointStyle: true } },
          tooltip: { callbacks: { label: (it) => `${it.label}: ${Number(it.raw).toFixed(1)}%` } }
        }
      }
    });
  });
}

// ==== Panel y sombreado ====
function buildPanel(geojson){
  const panel = document.getElementById('panel');
  panel.innerHTML = `
    <h4>Sombrear por</h4>
    ${LABELS.map((t, i) => `
      <div class="legend-row" data-idx="${i}">
        <div class="legend-dot" style="background:${COLORS[i]}"></div>${t}
      </div>
    `).join('')}
    <div style="margin-top:10px;text-align:right;">
      <button id="clearBtn" class="btn">Limpiar</button>
    </div>
  `;

  // click en categorías
  panel.querySelectorAll('.legend-row').forEach(row => {
    row.addEventListener('click', () => {
      const idx = Number(row.dataset.idx);
      shadeBy(idx);
    });
  });

  // limpiar
  document.getElementById('clearBtn').addEventListener('click', () => {
    currentIdx = null;
    if (layerShade) { map.removeLayer(layerShade); layerShade = null; }
  });
}

function shadeBy(idx){
  currentIdx = idx;
  const fieldList = [FIELD_NAMES.sub, FIELD_NAMES.err, FIELD_NAMES.con, FIELD_NAMES.fug][idx];
  const baseColor = COLORS[idx];

  // quitar capa previa
  if (layerShade) { map.removeLayer(layerShade); layerShade = null; }

  // crear nueva capa sombreada reutilizando la geojson del mapa (para evitar otra carga,
  // leemos de la capa de popups)
  const feats = [];
  layerPopups.eachLayer(l => { if (l.feature) feats.push(l.feature); });

  layerShade = L.geoJSON({type:'FeatureCollection', features:feats}, {
    style: f => {
      const p = f.properties || {};
      const v = Number(pick(p, fieldList)) || 0;     // 0..100
      // intensidad basada en porcentaje (0.15–0.85)
      const alpha = Math.min(0.85, Math.max(0.15, v/100*0.8 + 0.05));
      return { color: '#2b8cbe', weight: 1.2, fillColor: baseColor, fillOpacity: alpha };
    }
  }).addTo(map);
}
