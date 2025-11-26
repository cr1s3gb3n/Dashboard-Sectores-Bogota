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
