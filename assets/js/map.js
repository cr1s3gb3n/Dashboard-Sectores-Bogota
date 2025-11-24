console.log("🗺️ map.js cargado");

let map = null;
let capaSectores = null;

function crearMapaBase() {
  map = L.map("map", { zoomControl: true })
    .setView([4.5, -74.1], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(map);
}

// Cargar GeoJSON
function cargarGeoJSON() {
  return fetch("data/sectores.geojson")
    .then(res => res.json())
    .then(geojson => {
      capaSectores = L.geoJSON(geojson, {
        style: estiloBase,   // la que ya usas para el estilo base
        onEachFeature: (feature, layer) => {
          const data = buscarDatosSector(feature); // viene de data.js
          const codigo = feature.properties.Sector_ || "Sin código";

          // Popup sencillo sobre el mapa
          const popupHtml = `<strong>Sector ${codigo}</strong>`;
          layer.bindPopup(popupHtml);

          // Lo que pasa al hacer clic en un sector
          layer.on("click", () => {
            // 1) Actualizar panel de Información (KPIs)
            actualizarKPIs(data || null);
            actualizarSectorSeleccionado(codigo);

            // 2) Preparar objeto para las gráficas
            const props = {
              codigo: codigo,
              ...(data || {})
            };

            // Guardar el último sector seleccionado (lo usa tabs.js)
            window.datosSectorSeleccionado = props;

            // 3) Llamar al módulo de gráficas si existe
            if (typeof window.dibujarGraficas === "function") {
              window.dibujarGraficas(props);
            }

            // 4) Zoom suave al sector (si ya lo tenías antes, lo mantiene)
            if (map && layer.getBounds) {

            }
          });
        }
      }).addTo(map);

      console.log("🟩 GeoJSON cargado");
    });
}



// Colores de pérdidas totales
function estiloBase(feature) {
  const data = buscarDatosSector(feature);
  const p = data ? Number(data["Pérdidas totales (%)"] || 0) : 0;

  return {
    color: "#0b7285",
    weight: 1,
    fillColor: getColorPerdida(p),
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
