console.log("🚀 app.js arrancando...");

// Variable global
window.datosSectorSeleccionado = null;

crearMapaBase();

Promise.all([
  cargarJSON(),
  cargarGeoJSON()
]).then(() => {
  inicializarPanel();
  iniciarAnimacion();
}).catch(err => console.error("❌", err));

// Desplegable de indicadores
document.getElementById("toggle-indicadores").addEventListener("click", () => {
  const wrapper = document.getElementById("indicadores-wrapper");
  const arrow = document.getElementById("toggle-indicadores");

  if (wrapper.classList.contains("expanded")) {
    wrapper.classList.remove("expanded");
    wrapper.classList.add("collapsed");
    arrow.classList.remove("rotated");
  } else {
    wrapper.classList.remove("collapsed");
    wrapper.classList.add("expanded");
    arrow.classList.add("rotated");
  }
});
