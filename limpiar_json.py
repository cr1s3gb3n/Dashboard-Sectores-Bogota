import json

# === ARCHIVOS ===
geojson_file = "data/sectores.geojson"
kpi_file = "data/dashboard_data_final.json"
output_file = "data/sectores_3d.geojson"

print("🔄 Cargando archivos...")

# === Cargar GeoJSON ===
with open(geojson_file, "r", encoding="utf-8") as f:
    geo = json.load(f)

# === Cargar KPIs ===
with open(kpi_file, "r", encoding="utf-8") as f:
    datos = json.load(f)

print("🟢 Archivos cargados correctamente")

# Convertir KPIs a diccionario indexado por Sector_
kpi_dict = { item["Sector_"]: item for item in datos }

# === Fusionar ===
contador = 0

print("🔧 Insertando KPIs en el GeoJSON...")

for feature in geo["features"]:
    props = feature["properties"]
    sector = props.get("Sector_")

    if sector in kpi_dict:
        kpis = kpi_dict[sector]

        # Insertar TODAS las columnas excepto "Sector_"
        for key, value in kpis.items():
            if key == "Sector_":
                continue

            # Valores nulos → 0 o None
            if value in ["", None, "-", "--"]:
                props[key] = None
            else:
                try:
                    props[key] = float(value)
                except:
                    props[key] = value

        contador += 1

print(f"🟢 KPIs insertados en {contador} sectores.")

# === Guardar nuevo GeoJSON ===
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(geo, f, ensure_ascii=False, indent=2)

print(f"✅ Archivo final creado: {output_file}")
