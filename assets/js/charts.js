// charts.js - single stacked-bar chart version

console.log("📊 charts.js cargado correctamente");

// referencia global a la gráfica
let graficoUnico = null;

window.seleccionarSector = function(props) {
    console.log("📊 Dibujando gráfica única para:", props);

    const box = document.getElementById("chart-box");
    if (!box) return console.warn("⚠ No existe #chart-box");

    // limpiar contenido previo
    box.innerHTML = '<canvas id="stackedChart"></canvas>';
    const ctx = document.getElementById("stackedChart");

    if (!ctx) return;

    // colores
    const azul = "#4e79a7";
    const rojo = "#e15759";
    const amarillo = "#f28e2b";
    const verde = "#76b7b2";
    const morado = "#59a14f";

    // valores
    const totalPerdidas = props["Pérdidas totales (Mm³/año)"] || 0;
    const consumoAut = props["Consumo autorizado (Mm³/año)"] || 0;

    const perdidasTec = props["Pérdidas técnicas (Mm³/año)"] || 0;
    const perdidasApa = props["Pérdidas aparentes (Mm³/año)"] || 0;

    const visibles = props["Fugas visibles (reportadas) (Mm³/año)"] || 0;
    const noVisibles = props["Fugas no visibles (Fugas de fondo) (Mm³/año)"] || 0;
    const subm = props["Submedición (Mm³/año)"] || 0;
    const errores = props["Errores en el manejo de datos (Mm³/año)"] || 0;
    const cna = props["Consumo no autorizado (Mm³/año)"] || 0;

    // destruir gráfica previa
    if (graficoUnico) graficoUnico.destroy();

    graficoUnico = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["PT vs CA", "PTec vs PA", "Detalle pérdidas"],
            datasets: [
                // barra 1
                { label: "Pérdidas Totales", data: [totalPerdidas, 0, 0], backgroundColor: rojo },
                { label: "Consumo Autorizado", data: [consumoAut, 0, 0], backgroundColor: azul },

                // barra 2
                { label: "Pérdidas Técnicas", data: [0, perdidasTec, 0], backgroundColor: morado },
                { label: "Pérdidas Aparentes", data: [0, perdidasApa, 0], backgroundColor: amarillo },

                // barra 3
                { label: "Visibles", data: [0, 0, visibles], backgroundColor: verde },
                { label: "No visibles", data: [0, 0, noVisibles], backgroundColor: azul },
                { label: "Submedición", data: [0, 0, subm], backgroundColor: amarillo },
                { label: "Errores MD", data: [0, 0, errores], backgroundColor: morado },
                { label: "CNA", data: [0, 0, cna], backgroundColor: rojo },
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" },
                tooltip: {
                    callbacks: {
                        label: ctx => ctx.dataset.label
                    }
                }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true }
            }
        }
    });
};
