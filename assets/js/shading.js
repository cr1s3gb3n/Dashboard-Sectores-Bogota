console.log("🎨 shading.js cargado");

let indicadorActual = null;

const coloresIndicadores = {
  "Submedición (Mm³/año)": "#2b8cbe",
  "Errores en el manejo de datos (Mm³/año)": "#fdae61",
  "Consumo no autorizado (Mm³/año)": "#1a9850",
  "Pérdidas técnicas (Mm³/año)": "#d73027"
};

function inicializarPanel() {
  document.querySelectorAll(".legend-row").forEach(row => {
    row.addEventListener("click", () => {
      indicadorActual = row.dataset.indicador;
      actualizarSombreado();
    });
  });
}

function actualizarSombreado() {
  if (!capaSectores || !indicadorActual) return;

  capaSectores.setStyle(feature => {
    const data = buscarDatosSector(feature);
    if (!data) return { color:"#0b7285", weight:1, fillColor:"#ddd", fillOpacity:0.3 };

    const valor = Number(data[indicadorActual] || 0);
    const op = Math.min(0.8, valor / 10);

    return {
      color: "#0b7285",
      weight: 1,
      fillColor: coloresIndicadores[indicadorActual],
      fillOpacity: op
    };
  });
}
