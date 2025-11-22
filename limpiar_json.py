import json
import math
import os

INPUT = "data/dashboard_data.json"
OUTPUT = "data/dashboard_data.json"   # sobrescribe el original

def limpiar_valor(v):
    """
    Convierte valores no válidos de JSON:
    - NaN, Infinity, -Infinity  → None
    - Cadenas "NaN" → None
    """
    if isinstance(v, float):
        if math.isnan(v) or math.isinf(v):
            return None
        return v

    if isinstance(v, str):
        if v.strip().lower() in ["nan", "inf", "infinity", "-inf", "-infinity"]:
            return None
        return v

    return v

def limpiar_json(data):
    """
    Recorre recursivamente todo el JSON
    y reemplaza valores inválidos.
    """
    if isinstance(data, dict):
        return {k: limpiar_json(v) for k, v in data.items()}

    if isinstance(data, list):
        return [limpiar_json(v) for v in data]

    return limpiar_valor(data)


print("Cargando archivo JSON...")
with open(INPUT, "r", encoding="utf-8") as f:
    data = json.load(f)

print("Limpiando valores (NaN, Infinity, etc.)...")
data_limpio = limpiar_json(data)

print("Guardando JSON limpio...")
with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(data_limpio, f, indent=2, ensure_ascii=False)

print("\n======================================")
print("✔ JSON limpiado correctamente")
print(f"✔ Guardado en: {OUTPUT}")
print("======================================\n")
