console.log("data.js cargado");

// Variable global para KPIs
window.sectorDataMap = {};

// Cargar datos de KPIs
fetch("data/dashboard_data_final.json")
  .then((r) => {
    if (!r.ok) throw new Error("No existe el JSON");
    return r.json();
  })
  .then((json) => {
    json.forEach((item) => {
      const codigo =
        item["Sector_"] ||
        item["Sector"] ||
        item["SECTOR"] ||
        item["COD_SECTOR"];

      if (codigo) window.sectorDataMap[codigo] = item;
    });

    console.log("KPIs listos:", window.sectorDataMap);
    // notify other scripts that sector data is ready
    try { window.dispatchEvent(new CustomEvent('sectorDataReady')); } catch(e) {}
  })
  .catch((err) => console.error("Error cargando datos:", err));
