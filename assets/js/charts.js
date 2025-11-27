console.log("charts.js cargado correctamente");

let barrasChart = null;
let donutChart = null;

// Color base para gráficos
const colorBase = "#4a90e2";

// -----------------------------
// Función global para renderizar gráficos
// -----------------------------
window.renderCharts = function (data) {
  if (!data) return;

  // Datos para el gráfico de barras
  const labels = [
    "Pérdidas Totales",
    "Pérdidas Aparentes",
    "Pérdidas Técnicas"
  ];

  const valores = [
    data["Pérdidas Totales (Mm³/año)"],
    data["Pérdidas Aparentes (Mm³/año)"],
    data["Pérdidas Técnicas (Mm³/año)"]
  ];

  // -----------------------------
  // BARRAS
  // -----------------------------
  const ctx1 = document.getElementById("chart-barras").getContext("2d");

  if (barrasChart) barrasChart.destroy();

  barrasChart = new Chart(ctx1, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Mm³/año",
        data: valores,
        backgroundColor: ["#4575b4", "#91bfdb", "#e0f3f8"]
      }]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { font: { size: 11 } } },
        y: { ticks: { font: { size: 11 } } }
      }
    }
  });

  // -----------------------------
  // DONUT
  // -----------------------------
  const ctx2 = document.getElementById("chart-donut").getContext("2d");

  if (donutChart) donutChart.destroy();

  donutChart = new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: ["#4575b4", "#91bfdb", "#e0f3f8"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
};
