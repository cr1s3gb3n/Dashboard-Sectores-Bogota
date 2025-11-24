console.log("🚀 app.js arrancando...");

// Variable global para guardar el sector seleccionado
window.datosSectorSeleccionado = null;

// ==============================
// 1. Crear mapa base
// ==============================
crearMapaBase();

// ==============================
// 2. Cargar datos + GeoJSON
// ==============================
Promise.all([
    cargarJSON(),      // datos EAAB
    cargarGeoJSON()    // sectores Bogotá
]).then(() => {

    console.log("✔ Todo cargado. Inicializando UI...");

    inicializarPanel();
    iniciarAnimacion();

}).catch(err => console.error("❌ Error cargando recursos:", err));


// ===========================================================
//  FUNCIÓN QUE LLAMAREMOS DESDE map.js AL HACER CLICK EN SECTOR
// ===========================================================
window.seleccionarSector = function (dataSector) {

    console.log("📌 Sector seleccionado:", dataSector);

    // Guardar globalmente para tabs.js
    window.datosSectorSeleccionado = dataSector;

    // Si la pestaña activa es “Geográfico”, renderizar las barras inmediatamente
    const geoTabActiva = document.querySelector('.tab.active[data-tab="geo"]');
    if (geoTabActiva) {
        console.log("📊 Renderizando charts desde app.js…");
        renderCharts(window.datosSectorSeleccionado);
    }
};
