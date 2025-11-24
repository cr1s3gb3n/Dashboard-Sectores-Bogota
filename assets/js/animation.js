console.log("🎬 animation.js cargado");

function iniciarAnimacion() {
  document.getElementById("intro-text").style.opacity = 1;

  setTimeout(() => {
    document.getElementById("intro-text").style.opacity = 0;
    document.getElementById("logos-container").style.opacity = 1;
    document.getElementById("panel").style.opacity = 1;
  }, 1800);

  setTimeout(() => {
    map.flyTo([4.65, -74.1], 12.4, {
      duration: 7.5,
      easeLinearity: 0.2
    });
  }, 1200);
}
