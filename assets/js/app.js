console.log("🚀 app.js cargado correctamente");

// ============================================================
// ESTE ARCHIVO YA NO DEBE CREAR NI TOCAR NINGÚN MAPA.
// El mapa 3D se inicializa EXCLUSIVAMENTE en map.js
// ============================================================


// ===============================
// 1. Animación inicial (modo cine)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro-text");
  const logos = document.getElementById("logos-container");

  if (intro) intro.classList.add("show");
  if (logos) logos.classList.add("show");

  setTimeout(() => {
    if (intro) intro.classList.add("fade-out");
    if (logos) logos.classList.add("fade-out");
  }, 1800);

  setTimeout(() => {
    if (intro) intro.style.display = "none";
    if (logos) logos.style.display = "none";
  }, 2600);
});


// ===============================
// 2. Tabs (Información / Geográfico)
// ===============================
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const selected = tab.dataset.tab;

    document
      .querySelectorAll(".tab-panel")
      .forEach((panel) => panel.classList.add("hidden"));

    document.getElementById(`tab-${selected}`).classList.remove("hidden");
  });
});

console.log("✔ app.js arrancando... pero SIN inicializar mapas (correcto)");
