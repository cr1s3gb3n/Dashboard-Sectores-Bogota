console.log("📊 charts.js cargado correctamente");

let chartInstance = null;

function renderCharts(data) {

    if (!data) return;

    const canvas = document.getElementById("stackedBars");
    if (!canvas) return;

    // destruir gráfica previa
    if (chartInstance) chartInstance.destroy();

    // extraer valores
    const perdidasTotales = Number(data["Pérdidas Totales (Mm³/año)"] || 0);
    const autorizado = Number(data["Consumo Autorizado (Mm³/año)"] || 0);

    const tecnicas = Number(data["Pérdidas Técnicas (Mm³/año)"] || 0);
    const aparentes = Number(data["Pérdidas Aparentes (Mm³/año)"] || 0);

    const visibles = Number(data["Fugas Visibles (Mm³/año)"] || 0);
    const noVisibles = Number(data["Fugas No Visibles (Mm³/año)"] || 0);
    const sub = Number(data["Submedición (Mm³/año)"] || 0);
    const cna = Number(data["Consumo No Autorizado (Mm³/año)"] || 0);
    const errores = Number(data["Errores en el Manejo de Datos (Mm³/año)"] || 0);

    chartInstance = new Chart(canvas, {
        type: "bar",
        data: {
            labels: [
                "Pérdidas vs Autorizado",
                "Técnicas vs Aparentes",
                "Composición Detallada"
            ],
            datasets: [
                // barra 1
                {
                    label: "Pérdidas Totales",
                    data: [perdidasTotales, 0, 0],
                    backgroundColor: "#b2182b",
                    stack: "grupo1"
                },
                {
                    label: "Consumo Autorizado",
                    data: [autorizado, 0, 0],
                    backgroundColor: "#ef8a62",
                    stack: "grupo1"
                },

                // barra 2
                {
                    label: "Pérdidas Técnicas",
                    data: [0, tecnicas, 0],
                    backgroundColor: "#2b8cbe",
                    stack: "grupo2"
                },
                {
                    label: "Pérdidas Aparentes",
                    data: [0, aparentes, 0],
                    backgroundColor: "#74add1",
                    stack: "grupo2"
                },

                // barra 3
                {
                    label: "Fugas Visibles",
                    data: [0, 0, visibles],
                    backgroundColor: "#fee090",
                    stack: "grupo3"
                },
                {
                    label: "Fugas No Visibles",
                    data: [0, 0, noVisibles],
                    backgroundColor: "#fdae61",
                    stack: "grupo3"
                },
                {
                    label: "Submedición",
                    data: [0, 0, sub],
                    backgroundColor: "#91bfdb",
                    stack: "grupo3"
                },
                {
                    label: "Consumo No Autorizado",
                    data: [0, 0, cna],
                    backgroundColor: "#1a9850",
                    stack: "grupo3"
                },
                {
                    label: "Errores en el Manejo de Datos",
                    data: [0, 0, errores],
                    backgroundColor: "#fc8d59",
                    stack: "grupo3"
                }
            ]
        },
options: {
    indexAxis: "x",     // ⭐ ahora las barras son VERTICALES
    responsive: true,
    maintainAspectRatio: false,

    // ⭐ HACER LAS BARRAS MÁS ANCHAS
    elements: {
        bar: {
            barThickness: 20   // <-- Aumenta aquí (40–80 recomendado)
        }
    },

    scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
    },

    plugins: {
        legend: {
            display: false   // ⭐ quitar la convención / leyenda
        },
        tooltip: {
            callbacks: {
                label: (ctx) =>
                    `${ctx.dataset.label}: ${ctx.raw.toFixed(2)} Mm³/año`
            }
        }
    }
}
    });
}
