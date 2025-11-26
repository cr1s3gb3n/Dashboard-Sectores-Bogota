console.log("📊 charts.js cargado correctamente");

let barChart = null;
let donutChart = null;

function renderCharts(data) {

    if (!data) return;

    const canvasBar = document.getElementById("stackedBars");
    const canvasDonut = document.getElementById("donutChart");

    if (!canvasBar || !canvasDonut) return;

    if (barChart) barChart.destroy();
    if (donutChart) donutChart.destroy();

    // Datos
    const perdidasTotales = Number(data["Pérdidas Totales (Mm³/año)"] || 0);
    const autorizado = Number(data["Consumo Autorizado (Mm³/año)"] || 0);

    const tecnicas = Number(data["Pérdidas Técnicas (Mm³/año)"] || 0);
    const aparentes = Number(data["Pérdidas Aparentes (Mm³/año)"] || 0);

    const visibles = Number(data["Fugas Visibles (Mm³/año)"] || 0);
    const noVisibles = Number(data["Fugas No Visibles (Mm³/año)"] || 0);
    const sub = Number(data["Submedición (Mm³/año)"] || 0);
    const cna = Number(data["Consumo No Autorizado (Mm³/año)"] || 0);
    const errores = Number(data["Errores en el Manejo de Datos (Mm³/año)"] || 0);

    /* ==========================================
       ⭐ BARRAS HORIZONTALES MEJORADAS
       ========================================== */
    barChart = new Chart(canvasBar, {
        type: "bar",
        data: {
            labels: [
                "Pérdidas / Autorizado",
                "Técnicas / Aparentes"
            ],
            datasets: [
                { label: "Pérdidas Totales", data: [perdidasTotales, 0], backgroundColor: "#b2182b", stack: "g1" },
                { label: "Consumo Autorizado", data: [autorizado, 0], backgroundColor: "#ef8a62", stack: "g1" },

                { label: "Pérdidas Técnicas", data: [0, tecnicas], backgroundColor: "#2b8cbe", stack: "g2" },
                { label: "Pérdidas Aparentes", data: [0, aparentes], backgroundColor: "#74add1", stack: "g2" }
            ]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                bar: { barThickness: 50 }
            },
            scales: {
                x: { 
                    stacked: true, 
                    beginAtZero: true,
                    ticks: {
                        font: { size: 13, weight: "600" }
                    }
                },
                y: { 
                    stacked: true,
                    ticks: {
                        font: { size: 14, weight: "700" },
                        padding: 8,
                        align: "center"
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    bodyFont: { size: 14, weight: "600" },
                    callbacks: {
                        label: (ctx) =>
                            `${ctx.dataset.label}: ${ctx.raw.toFixed(2)} Mm³/año`
                    }
                }
            }
        }
    });

    /* ==========================================
       ⭐ DONUT → LEYENDA DEBAJO Y FUENTE NÍTIDA
       ========================================== */
    donutChart = new Chart(canvasDonut, {
        type: "doughnut",
        data: {
            labels: ["Visibles", "No Visibles", "Submedición", "CNA", "Errores"],
            datasets: [{
                data: [visibles, noVisibles, sub, cna, errores],
                backgroundColor: ["#fee090", "#fdae61", "#91bfdb", "#1a9850", "#fc8d59"],
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: "bottom",   // ⭐ AQUÍ SE MUEVE DEBAJO
                    labels: {
                        font: { size: 13, weight: "600" },
                        padding: 15
                    }
                },
                tooltip: {
                    bodyFont: { size: 14, weight: "600" },
                    callbacks: {
                        label: (ctx) =>
                            `${ctx.label}: ${ctx.raw.toFixed(2)} Mm³/año`
                    }
                }
            }
        }
    });
}

window.renderCharts = renderCharts;
