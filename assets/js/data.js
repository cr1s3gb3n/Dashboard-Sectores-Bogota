console.log("📦 data.js cargado");

let dashboardData = [];

// Cargar JSON humanizado DEFINITIVO
function cargarJSON() {
  return fetch("data/dashboard_data_final.json")
    .then(res => res.json())
    .then(json => {
      dashboardData = json;
      console.log("📊 Datos del dashboard cargados:", dashboardData);
    });
}

// Buscar datos del sector
function buscarDatosSector(feature) {
  const codigo = feature.properties.Sector_;
  return dashboardData.find(r => r["Sector_"] === codigo) || null;
}
