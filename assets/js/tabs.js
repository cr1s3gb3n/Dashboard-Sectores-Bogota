console.log("📑 tabs.js cargado");

// Manejo de pestañas Información / Geográfico
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    // Quitar estado activo de todos los botones
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));

    // Ocultar todos los paneles
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));

    // Activar el botón clickeado
    btn.classList.add("active");

    const tabName = btn.dataset.tab; // "info" o "geo"
    const panel = document.getElementById(`tab-${tabName}`);
    if (panel) {
      panel.classList.remove("hidden");
    }

    // Si entro a la pestaña GEOGRÁFICO y ya hay sector seleccionado,
    // vuelvo a dibujar las barras
    if (
      tabName === "geo" &&
      window.datosSectorSeleccionado &&
      typeof window.dibujarGraficas === "function"
    ) {
      window.dibujarGraficas(window.datosSectorSeleccionado);
    }
  });
});
