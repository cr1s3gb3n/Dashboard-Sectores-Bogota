let totalChart = null;
let pieChart = null;

function safeGetCtx(id) {
    const el = document.getElementById(id);
    if (!el) {
        console.error(`❌ No existe el canvas #${id}`);
        return null;
    }
    return el.getContext("2d");
}

// Expose functions to non-module scripts (app.js) via window
try {
    window.renderPieFugas = renderPieFugas;
    window.renderDoubleStackedBars = renderDoubleStackedBars;
} catch (e) {
    // ignore in environments where window is not available
}



export function renderPieFugas(data) {
    const ctx = safeGetCtx("pie-fugas");
    if (!ctx) return;

    if (pieChart) pieChart.destroy();
    // Flexible field lookup: accept either explicit keys or raw sector object
    function g(kCandidates) {
        for (const k of kCandidates) {
            if (data[k] !== undefined) return Number(data[k]) || 0;
            // try case-insensitive match
            const found = Object.keys(data || {}).find(x => x.toLowerCase().includes(k.toLowerCase()));
            if (found) return Number(data[found]) || 0;
        }
        return 0;
    }

    const labels = [
        "Fugas visibles",
        "Fugas no visibles",
        "Submedición",
        "Errores en manejo de datos",
        "CNA"
    ];

    const values = [
        g(['Fugas visibles','fugas visibles','FUGAS_VISIBLES','Fugas reportadas','fugas_visible']),
        g(['Fugas no visibles','fugas no visibles','Fugas de fondo','fugas_de_fondo','FUGAS_DE_FONDO']),
        g(['Submedición','SUBMEDICIÓN','submedicion','Submedicion']),
        g(['Errores en el manejo de datos','Errores','errores','ERRORES_EN_EL_MANEJO_DE_DATOS']),
        g(['CNA','conexiones clandestinas','Conexiones clandestinas y fraude','conexiones clandestinas y fraude'])
    ];

    pieChart = new Chart(ctx, {
        type: 'pie',
        data: { labels, datasets: [{ data: values, backgroundColor: ['#d73027','#d0e9ff','#2b8cbe','#fdae61','#1a9850'] }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 10 }
                }
            }
        }
    });
}

export function renderDoubleStackedBars(data) {
    const ctx = safeGetCtx('stacked-bars-total');
    if (!ctx) return;
    if (totalChart) totalChart.destroy();

    function get(vCandidates) {
        for (const k of vCandidates) {
            if (data[k] !== undefined) return Number(data[k]) || 0;
            const found = Object.keys(data || {}).find(x => x.toLowerCase().includes(k.toLowerCase()));
            if (found) return Number(data[found]) || 0;
        }
        return 0;
    }

    // Barra 1: Pérdidas Totales + Consumo Autorizado
    const perdidas_totales = get(['Pérdidas Totales','perdidas totales','Pérdidas totales (Mm³/año)','Pérdidas totales (Mm3/año)','Pérdidas_totales']);
    const consumo_autorizado = get(['Consumo autorizado','Consumo autorizado (Mm³/año)','consumo autorizado']);
    // Barra 2: Pérdidas Técnicas + Pérdidas Aparentes
    const perdidas_tecnicas = get(['Pérdidas Técnicas','Pérdidas técnicas','Pérdidas ténicas','perdidas tecnicas']);
    const perdidas_aparentes = get(['Pérdidas aparentes','Pérdidas aparentes (Mm³/año)','Pérdidas aparentes (Mm3/año)']);

    const labels = ['', ''];
    const datasets = [
        {
            label: 'Pérdidas Totales',
            data: [perdidas_totales, 0],
            backgroundColor: '#d73027'
        },
        {
            label: 'Consumo Autorizado',
            data: [consumo_autorizado, 0],
            backgroundColor: '#2b8cbe'
        },
        {
            label: 'Pérdidas Técnicas',
            data: [0, perdidas_tecnicas],
            backgroundColor: '#6a51a3'
        },
        {
            label: 'Pérdidas Aparentes',
            data: [0, perdidas_aparentes],
            backgroundColor: '#fdae61'
        }
    ];

    totalChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 10 }
                }
            },
            scales: { x: { stacked: true }, y: { stacked: true } }
        }
    });
}
