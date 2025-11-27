console.log("tabs.js cargado");

const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Quitar activo
    tabs.forEach((t) => t.classList.remove("active"));
    contents.forEach((c) => c.classList.remove("active"));

    // Activar el seleccionado
    tab.classList.add("active");
    document.querySelector(`#tab-${tab.dataset.tab}`).classList.add("active");
  });
});
