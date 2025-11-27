console.log("popup.js cargado");

window.actualizarSectorSeleccionado = function (sector) {
  document.getElementById("sector-actual").textContent = sector;
};

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
    document.getElementById(id).textContent = data[map[id]] ?? "--";
  }
};
