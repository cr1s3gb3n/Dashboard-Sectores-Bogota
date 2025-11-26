console.log("🗺️ map.js cargado");

let map = null;
let capaSectores = null;

function crearMapaBase() {
  map = L.map("map", { zoomControl: true })
    .setView([4.6, -74.1], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);
}

function cargarGeoJSON() {
  return fetch("data/sectores.geojson")
    .then(res => res.json())
    .then(geojson => {
      capaSectores = L.geoJSON(geojson, {
        style: estiloBase,
        onEachFeature: (feature, layer) => {
          const codigo = feature.properties.Sector_ || "Sin código";
          const data = buscarDatosSector(feature);

          layer.bindPopup(`<strong>Sector ${codigo}</strong>`);

          layer.on("click", () => {
            actualizarSectorSeleccionado(codigo);
            actualizarKPIs(data || {});

            window.datosSectorSeleccionado = {
              codigo,
              ...(data || {})
            };

            if (typeof window.renderCharts === "function") {
              window.renderCharts(window.datosSectorSeleccionado);
            }

            if (typeof shadingByIndicator === "function") {
              shadingByIndicator(codigo);
            }
          });
        }
      }).addTo(map);

      console.log("🟩 GeoJSON cargado");
    });
}

function estiloBase(feature) {
  const data = buscarDatosSector(feature);
  const p = data ? Number(data["Pérdidas Totales (Mm³/año)"] || 0) : 0;

  return {
    color: "#0b7285",
    weight: 1,
    fillColor: getColorPerdida(p),
    fillOpacity: 0.45,
  };
}

function getColorPerdida(p) {
  if (p >= 40) return "#b2182b";
  if (p >= 30) return "#ef8a62";
  if (p >= 20) return "#fddbc7";
  if (p > 0) return "#d1e5f0";
  return "#ffffff00";
}

console.log("🗺️ map.js listo");
