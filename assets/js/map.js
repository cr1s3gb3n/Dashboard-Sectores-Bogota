import { generarExpresionColor } from "./shading3d.js";
import { renderPieFugas, renderDoubleStackedBars } from "./charts.js";
console.log("map.js cargado");

let geojsonSectores = null;
let indicadorActual = "Submedición";

// Crear mapa
const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {},
    layers: [],
  },
  center: [-74.1, 4.65],
  zoom: 9.7,
  pitch: 60,
  bearing: -20,
});

map.on("load", async () => {
  console.log("Mapa cargado");

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

function activarEventosCoropletico() {
  document.querySelectorAll(".legend-row").forEach((row) => {
    row.addEventListener("click", () => {
      indicadorActual = row.dataset.indicador;
      aplicarSombreado(indicadorActual);
    });
  });
}

function actualizarKPIs(data) {
  document.getElementById("kpi-ve").textContent =
    data["VE (Mm³/año)"]?.toFixed(2) ?? "--";

  document.getElementById("kpi-pt").textContent =
    data["Pérdidas Totales (Mm³/año)"]?.toFixed(2) ?? "--";

  document.getElementById("kpi-pa").textContent =
    data["Pérdidas Aparentes (Mm³/año)"]?.toFixed(2) ?? "--";

  document.getElementById("kpi-pr").textContent =
    data["Pérdidas Técnicas (Mm³/año)"]?.toFixed(2) ?? "--";

  document.getElementById("kpi-amsi").textContent =
    data["AMSI"]?.toFixed(2) ?? "--";

  document.getElementById("kpi-uarl").textContent =
    data["UARL"]?.toFixed(2) ?? "--";

  document.getElementById("kpi-ili").textContent =
    data["ILI"]?.toFixed(2) ?? "--";

  document.getElementById("kpi-ipuf").textContent =
    data["IPUF"]?.toFixed(2) ?? "--";
}
