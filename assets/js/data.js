console.log("📦 data.js cargado");

let dashboardData = [];

// Carga del JSON
function cargarJSON() {
  return fetch("data/dashboard_data_limpio.json")
    .then(res => res.json())
    .then(json => {
      dashboardData = json;
      console.log("📊 Datos del dashboard cargados:", dashboardData);
    });
}

// Buscar datos según Sector_
function buscarDatosSector(feature) {
  const codigo = feature.properties.Sector_;
  return dashboardData.find(r => r["Sector_"] === codigo) || null;
}
