console.log("📁 tabs.js cargado...");

// Manejo de pestañas
document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
        
        // Remover estado activo de todas las tabs
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

        // Ocultar todos los paneles
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));

        // Activar tab clickeada
        btn.classList.add("active");

        const tabName = btn.dataset.tab;

        // Mostrar panel correspondiente
        document.getElementById(`tab-${tabName}`).classList.remove("hidden");

        // Si se entra en la pestaña GEOGRÁFICO → renderizar gráficas
        if (tabName === "geo") {
            if (window.datosSectorSeleccionado) {
                console.log("📊 Renderizando gráficas para:", window.datosSectorSeleccionado);
                renderCharts(window.datosSectorSeleccionado);
            } else {
                console.warn("⚠ No hay sector seleccionado todavía.");
            }
        }
    });
});
