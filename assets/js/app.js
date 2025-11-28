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
  // loading overlay coordination
  window._dashboardLoading = { map: false, data: false };
  function tryHideLoading() {
    const st = window._dashboardLoading;
    if (st.map && st.data) {
      const ov = document.getElementById('loading-overlay');
      if (ov) {
        ov.classList.add('loading-hidden');
        setTimeout(() => { ov.style.display = 'none'; }, 350);
        // reveal right panel with a slide-in animation
        try {
          const panel = document.getElementById('panel');
          if (panel) {
            panel.classList.remove('panel-hidden');
            panel.classList.add('panel-visible');
            // reveal KPI cards one by one
            try {
              const kpis = Array.from(panel.querySelectorAll('.kpi'));
              kpis.forEach((el, i) => {
                setTimeout(() => el.classList.add('kpi-show'), 220 + i * 140);
              });
            } catch (e) {}
          }
        } catch (e) {}
      }
    }
  }
  // listen for map and data readiness
  window.addEventListener('mapReady', () => {
    window._dashboardLoading.map = true;
    tryHideLoading();
  });
  window.addEventListener('sectorDataReady', () => {
    window._dashboardLoading.data = true;
    tryHideLoading();
  });
  // If data was loaded before DOMContentLoaded, mark it ready now
  if (window.sectorDataMap && Object.keys(window.sectorDataMap).length) {
    window._dashboardLoading.data = true;
  }
  // fallback: if not ready after 15s, hide overlay to allow user to interact
  setTimeout(() => {
    const ov = document.getElementById('loading-overlay');
    if (ov && !ov.classList.contains('loading-hidden')) {
      console.warn('Fallback: hiding loading overlay after timeout');
      ov.classList.add('loading-hidden');
      setTimeout(() => { ov.style.display = 'none'; }, 350);
    }
  }, 15000);
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
  // New simpler toggle: the header contains a button `#coropletico-toggle-btn`
  const corButton = document.getElementById('coropletico-toggle-btn');
  if (corButton && opciones) {
    // start collapsed so the button toggles to open on first click
    opciones.classList.add('collapsed');
    corButton.setAttribute('aria-expanded', 'false');
    corButton.classList.remove('active');
    corButton.addEventListener('click', (ev) => {
      const collapsed = opciones.classList.toggle('collapsed');
      // when collapsed === true -> hidden, so aria-expanded should be false
      corButton.setAttribute('aria-expanded', String(!collapsed));
      corButton.classList.toggle('active', !collapsed);
    });
  }

  // --- Sector dropdown population & handlers ---
  const sectorToggle = document.getElementById('sector-toggle');
  const sectorDropdown = document.getElementById('sector-dropdown');
  const sectorList = document.getElementById('sector-list');
  const sectorActual = document.getElementById('sector-actual');

  function populateSectorList() {
        // Comparativo: llenar el select con los sectores
        const comparativoSelect = document.getElementById('comparativo-sector-select');
        if (comparativoSelect) {
          comparativoSelect.innerHTML = '<option value="">Seleccione un sector...</option>';
          const codes = Object.keys(window.sectorDataMap).sort();
          codes.forEach(code => {
            const opt = document.createElement('option');
            opt.value = code;
            opt.textContent = code;
            comparativoSelect.appendChild(opt);
          });
        }
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
