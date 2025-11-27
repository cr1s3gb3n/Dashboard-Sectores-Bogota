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

// ===============================
// 3. Flecha de despliegue coroplético
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const flecha = document.getElementById("toggle-coropletico");
  const flechaSvg = document.getElementById("flecha-svg");
  const opciones = document.getElementById("coropletico-opciones");
  if (flecha && opciones && flechaSvg) {
    // ensure initial expanded state
    opciones.classList.remove('collapsed');
    flechaSvg.style.transform = 'rotate(0deg)';

    flecha.addEventListener("click", () => {
      const collapsed = opciones.classList.toggle('collapsed');
      if (collapsed) {
        // collapsed -> rotate arrow 90deg to point right
        flechaSvg.style.transform = 'rotate(90deg)';
      } else {
        // expanded -> point down
        flechaSvg.style.transform = 'rotate(0deg)';
      }
    });
  }

  // --- Sector dropdown population & handlers ---
  const sectorToggle = document.getElementById('sector-toggle');
  const sectorDropdown = document.getElementById('sector-dropdown');
  const sectorList = document.getElementById('sector-list');
  const sectorActual = document.getElementById('sector-actual');

  function populateSectorList() {
    if (!sectorList || !window.sectorDataMap) return;
    sectorList.innerHTML = '';
    const codes = Object.keys(window.sectorDataMap).sort();
    codes.forEach(code => {
      const li = document.createElement('li');
      li.textContent = code;
      li.addEventListener('click', () => {
        // select sector
        sectorActual.textContent = code;
        const data = window.sectorDataMap[code];
        try { window.actualizarKPIs && window.actualizarKPIs(data); } catch(e){}
        try { window.renderPieFugas && window.renderPieFugas(data); } catch(e){}
        try { window.renderDoubleStackedBars && window.renderDoubleStackedBars(data); } catch(e){}
        try { window.highlightSector && window.highlightSector(code); } catch(e){}
        // close dropdown
        if (sectorDropdown) sectorDropdown.classList.add('hidden');
        if (sectorToggle) sectorToggle.setAttribute('aria-expanded','false');
      });
      sectorList.appendChild(li);
    });
  }

  // Listen for data ready event
  window.addEventListener('sectorDataReady', populateSectorList);

  // If data already loaded before this script, populate now
  if (window.sectorDataMap && Object.keys(window.sectorDataMap).length) populateSectorList();

  if (sectorToggle) {
    sectorToggle.addEventListener('click', () => {
      if (!sectorDropdown) return;
      const open = sectorDropdown.classList.toggle('hidden');
      sectorToggle.setAttribute('aria-expanded', String(!open));
    });
  }
});

console.log("✔ app.js arrancando... pero SIN inicializar mapas (correcto)");
