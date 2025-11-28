console.log("popup.js cargado");

window.actualizarSectorSeleccionado = function (sector) {
  document.getElementById("sector-actual").textContent = sector;
};
// Provide a lightweight fallback only if a richer updater hasn't been set by the map module.
if (!window.actualizarKPIs) {
  window.actualizarKPIs = function (data) {
    if (!data) return;
    const map = {
      "kpi-ve": "VE (Mm³/año)",
      "kpi-pt": "Pérdidas Totales (%)",
      "kpi-pa": "Pérdidas Aparentes (Mm³/año)",
      "kpi-pr": "Pérdidas Técnicas (Mm³/año)",
      "kpi-amsi": "AMSI",
      "kpi-uarl": "UARL",
      "kpi-ili": "ILI",
      "kpi-ipuf": "IPUF",
    };
    for (const id in map) {
      const el = document.getElementById(id);
      if (!el) continue;
      const v = data[map[id]];
      el.textContent = v == null ? "--" : (typeof v === 'number' ? v.toFixed(2) : v);
    }
  };
}
