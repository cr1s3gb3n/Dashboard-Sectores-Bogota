// =====================================================
// CONFIRMAR CARGA DE ARCHIVO
// =====================================================
console.log("✅ app.js cargado correctamente Uniandes...");
console.log("📌 Preparando carga del dashboard_data.json...");


// =====================================================
// CARGA DEL JSON
// =====================================================
let dashboardData = [];
let capaSectores = null;

fetch("data/dashboard_data.json")
  .then(res => res.json())
  .then(json => {
    dashboardData = json;
    console.log("📊 Datos cargados:", dashboardData);
    inicializarMapaConDatos();
  })
  .catch(err => console.error("❌ Error cargando JSON:", err));


// =====================================================
// INICIALIZAR MAPA CON DATOS
// =====================================================
function inicializarMapaConDatos() {
  console.log("🚀 Iniciando mapa con datos reales...");

  // Cargar GeoJSON
  fetch("data/sectores.geojson")
    .then(res => res.json())
    .then(geojson => {
      console.log("🗂️ GeoJSON cargado.");

      capaSectores = L.geoJSON(geojson, {
        style: feature => estiloBase(feature),
        onEachFeature: (feature, layer) => {
          const data = buscarDatosSector(feature);
          const codigo = feature.properties.Sector_ || "Sin código";

          let html = `<strong>Sector ${codigo}</strong>`;
          if (data) {
            html += `
              <br>VE (Mm³/año): ${data["VE (Mm³/año)"] ?? "-"}
              <br>Pérdidas totales (%): ${data["Pérdidas totales (%)"] ?? "-"}
              <br>Pérdidas técnicas: ${data["Pérdidas técnicas (Mm³/año)"] ?? "-"}
              <br>Pérdidas aparentes: ${data["Pérdidas aparentes (Mm³/año)"] ?? "-"}
            `;
          }
          layer.bindPopup(html);
        }
      }).addTo(map);

      animacionInicial();
    });
}


// =====================================================
// MAPA BASE
// =====================================================
const map = L.map("map", { zoomControl: true })
.setView([4.5, -74.1], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);


// Animación suave planeta → Bogotá
function animacionInicial() {
  document.getElementById("intro-text").style.opacity = 1;

  setTimeout(() => {
    document.getElementById("intro-text").style.opacity = 0;
    document.getElementById("logos-container").style.opacity = 1;
    document.getElementById("panel").style.opacity = 1;
  }, 1800);

  setTimeout(() => {
    map.flyTo([4.65, -74.1], 12.4, {
      duration: 7.5,
      easeLinearity: 0.2,
    });
  }, 1200);
}


// =====================================================
// BÚSQUEDA DE DATOS POR SECTOR
// =====================================================
function buscarDatosSector(feature) {
  const codigo = feature.properties.Sector_;
  return dashboardData.find(r => r["Sector_"] === codigo) || null;
}


// =====================================================
// ESTILO BASE DEL MAPA
// =====================================================
function estiloBase(feature) {
  const data = buscarDatosSector(feature);
  const perdida = data ? Number(data["Pérdidas totales (%)"] || 0) : 0;
  return {
    color: "#0b7285",
    weight: 1,
    fillColor: getColorPerdida(perdida),
    fillOpacity: 0.45
  };
}

function getColorPerdida(p) {
  if (p >= 40) return "#b2182b";
  if (p >= 30) return "#ef8a62";
  if (p >= 20) return "#fddbc7";
  if (p > 0) return "#d1e5f0";
  return "#f7f7f7";
}


// =====================================================
// PANEL "SOMBREAR POR"
// =====================================================
let indicadorActual = null;

const coloresIndicadores = {
  "Submedición (Mm³/año)": "#2b8cbe",
  "Errores en el manejo de datos (Mm³/año)": "#fdae61",
  "Consumo no autorizado (Mm³/año)": "#1a9850",
  "Pérdidas técnicas (Mm³/año)": "#d73027"
};

// Activar eventos del panel
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".legend-row").forEach(row => {
    row.addEventListener("click", () => {
      indicadorActual = row.dataset.indicador;
      actualizarSombreado();
    });
  });
});

// Repintar capa según indicador
function actualizarSombreado() {
  if (!capaSectores || !indicadorActual) return;

  capaSectores.setStyle(feature => {
    const datos = buscarDatosSector(feature);
    if (!datos) {
      return { color:"#0b7285", weight:1, fillColor:"#eeeeee", fillOpacity:0.3 };
    }

    const valor = Number(datos[indicadorActual] || 0);
    const color = coloresIndicadores[indicadorActual];
    const op = Math.min(0.8, valor / 10);

    return {
      color: "#0b7285",
      weight: 1,
      fillColor: color,
      fillOpacity: op
    };
  });
}
