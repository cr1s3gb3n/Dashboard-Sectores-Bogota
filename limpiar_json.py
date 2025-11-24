import json
import re

INPUT = "data/dashboard_data.json"
OUTPUT = "data/dashboard_data_limpio.json"

print("🔧 Limpiando nombres de columnas...")

with open(INPUT, "r", encoding="utf-8") as f:
    data = json.load(f)

def normalizar_clave(clave):
    original = clave

    # Corregir Pérdidas Técnicas
    clave = clave.replace("ténicas", "técnicas")
    clave = clave.replace("técnicas (Mm3/año)", "técnicas (Mm³/año)")

    # Estandarizar AMSI
    clave = clave.replace("AMSI (m3/día/km/mca)", "AMSI")

    # Estandarizar unidades Mm3 → Mm³
    clave = clave.replace("Mm3", "Mm³")

    # Otras normalizaciones posibles
    clave = clave.strip()

    if clave != original:
        print(f"✔ Renombrada: '{original}' → '{clave}'")

    return clave

def convertir_num(valor):
    if isinstance(valor, (int, float)):
        return valor
    try:
        valor = valor.replace(",", "")
        return float(valor)
    except:
        return valor

nuevo = []

for fila in data:
    nueva = {}
    for k, v in fila.items():
        key = normalizar_clave(k)
        nueva[key] = convertir_num(v)
    nuevo.append(nueva)

with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(nuevo, f, ensure_ascii=False, indent=2)

print("\n🎉 JSON limpio generado con éxito →", OUTPUT)
print("Registros:", len(nuevo))
