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

  // Escala de color
  return [
    "interpolate",
    ["linear"],
    ["get", campo],
    min, "#d0e9ff",
    max, "#1f78b4",
  ];
}
