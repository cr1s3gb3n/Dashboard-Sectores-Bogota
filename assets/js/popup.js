console.log("🧁 popup.js cargado");

// Aquí luego agregamos las tortas
function crearTorta(feature) {
  // pendiente (lo hacemos cuando tú quieras)
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "--";

  let num = Number(value);
  if (isNaN(num)) return value;

  if (num >= 100) return num.toFixed(0);
  if (num >= 10) return num.toFixed(1);
  return num.toFixed(2);
}

function actualizarKPIs(data) {
  if (!data) return;

  const map = {
    "kpi-ve": "VE (Mm³/año)",
    "kpi-pt": "Pérdidas totales (%)",
    "kpi-pa": "Pérdidas aparentes (Mm³/año)",
    "kpi-pr": "Pérdidas técnicas (Mm³/año)",
    "kpi-amsi": "AMSI",
    "kpi-uarl": "UARL",
    "kpi-ili": "ILI",
    "kpi-ipuf": "IPUF",
  };

  for (const kpiId in map) {
    const col = map[kpiId];
    const elem = document.getElementById(kpiId);
    elem.textContent = formatNumber(data[col]);
  }
}

function actualizarSectorSeleccionado(sector) {
  document.getElementById("sector-actual").textContent = sector;
}

console.log("📊 popup.js KPIs listo");
