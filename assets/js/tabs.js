import { renderDoubleStackedBars, renderPieFugas } from "./charts.js";

const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {

        // Quitar active
        tabs.forEach(t => t.classList.remove("active"));
        contents.forEach(c => c.classList.remove("active"));

        // Activar nueva tab
        tab.classList.add("active");
        const target = tab.dataset.tab;
        const panel = document.getElementById(`tab-${target}`);

        if (panel) {
            panel.classList.add("active");
        }

        // 🔥 Cuando la pestaña es "geo": renderizar dos barras apiladas y un pie
        if (target === "geo") {
            setTimeout(() => {
                // Agregación simple de todos los sectores cargados en window.sectorDataMap
                const values = Object.values(window.sectorDataMap || {});

                function findNum(obj, substr) {
                    if (!obj) return 0;
                    const k = Object.keys(obj).find(key => key.toLowerCase().includes(substr.toLowerCase()));
                    return k ? Number(obj[k]) || 0 : 0;
                }

                const agg = values.reduce((acc, item) => {
                    acc.perdidas_totales += findNum(item, 'pérdidas totales') || findNum(item, 'perdidas totales');
                    acc.consumo_autorizado += findNum(item, 'consumo autorizado');
                    acc.perdidas_tecnicas += findNum(item, 'pérdidas técnicas') || findNum(item,'perdidas técnicas');
                    acc.perdidas_aparentes += findNum(item, 'pérdidas aparentes') || findNum(item,'pérdidas aparentes');
                    acc.fugas_visibles += findNum(item, 'fugas visibles') || findNum(item,'fugas visibles');
                    acc.fugas_no_visibles += findNum(item, 'fugas de fondo') || findNum(item,'fugas de fondo') || findNum(item,'fugas no visibles');
                    acc.submedicion += findNum(item, 'submedición') || findNum(item,'submedicion');
                    acc.errores += findNum(item, 'errores en el manejo de datos') || findNum(item,'errores');
                    acc.cna += findNum(item, 'conexiones clandestinas') || findNum(item,'cna') || findNum(item,'conexiones clandestinas y fraude');
                    return acc;
                }, {
                    perdidas_totales:0, consumo_autorizado:0, perdidas_tecnicas:0, perdidas_aparentes:0,
                    fugas_visibles:0, fugas_no_visibles:0, submedicion:0, errores:0, cna:0
                });

                renderDoubleStackedBars({
                    'Pérdidas Totales': agg.perdidas_totales,
                    'Consumo autorizado': agg.consumo_autorizado,
                    'Pérdidas Técnicas': agg.perdidas_tecnicas,
                    'Pérdidas aparentes': agg.perdidas_aparentes
                });
                renderPieFugas({
                    fugas_visibles: agg.fugas_visibles,
                    fugas_no_visibles: agg.fugas_no_visibles,
                    submedicion: agg.submedicion,
                    errores: agg.errores,
                    cna: agg.cna
                });

            }, 150);
        }
    });
});
