export function generarExpresionColor(indicador, geojson) {

  // Correspondencia EXACTA entre indicador visible y campo en el GeoJSON
  const campos = {
    "Submedición": "SUBMEDICIÓN",
    "Errores / Fallas de catastro":
      "ERRORES_EN_EL_MANEJO_DE_DATOS_Y_FALLAS_DE_CATASTRO",
    "Consumo no autorizado": "CONSUMO_NO_AUTORIZADO",
    "Fugas técnicas": "FUGAS_TÉCNICAS",
    "AMSI": "AMSI",
  };

  const campo = campos[indicador];

  if (!campo) {
    console.warn("Indicador no encontrado:", indicador);
    return ["rgba", 220, 220, 220, 1];
  }

  console.log("Usando campo:", campo);

  // Obtener valores
  const features = geojson.features;
  const valores = features
    .map((f) => Number(f.properties[campo]))
    .filter((v) => !isNaN(v));

  if (valores.length === 0) {
    console.warn("No hay valores para", indicador);
    return ["rgba", 230, 230, 230, 1];
  }

  const min = Math.min(...valores);
  const max = Math.max(...valores);

  // Colores gradiente por indicador (igual que la leyenda)
  const colores = {
    "Submedición": {min: "#d0e9ff", max: "#2b8cbe"},
    "Errores / Fallas de catastro": {min: "#fff2d6", max: "#fdae61"},
    "Consumo no autorizado": {min: "#b7e3c7", max: "#1a9850"},
    "Fugas técnicas": {min: "#f7c6c6", max: "#d73027"},
    "AMSI": {min: "#e2d6f7", max: "#6a51a3"}
  };

  const colorSet = colores[indicador] || {min: "#e0e0e0", max: "#d0e9ff"};

  // Gradiente por valor
  return [
    "interpolate",
    ["linear"],
    ["get", campo],
    min, colorSet.min,
    max, colorSet.max
  ];
}
