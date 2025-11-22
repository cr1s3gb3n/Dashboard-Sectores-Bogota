import pandas as pd
import json
import os
import numpy as np

PATH_RES = "data/Resultados_BH_DB.xlsx"
PATH_BAL = "data/BalanceHidrico_Dashboard.xlsx"
OUTPUT   = "data/dashboard_data.json"

# Eliminar archivo previo
if os.path.exists(OUTPUT):
    os.remove(OUTPUT)

print("Cargando archivos...")

df_res = pd.read_excel(PATH_RES)
df_bal = pd.read_excel(PATH_BAL, header=2)

print("Archivos cargados correctamente.\n")

# ---------------------------------------
# 1. LIMPIAR COLUMNAS DUPLICADAS
# ---------------------------------------
df_bal = df_bal.loc[:, ~df_bal.columns.duplicated()]
df_res = df_res.loc[:, ~df_res.columns.duplicated()]

# ---------------------------------------
# 2. LIMPIAR NOMBRES
# ---------------------------------------
df_res.columns = df_res.columns.astype(str).str.strip()
df_bal.columns = df_bal.columns.astype(str).str.strip()

# ---------------------------------------
# 3. UNIR POR Sector_
# ---------------------------------------
print("Uniendo archivos por Sector_...")

df = pd.merge(df_res, df_bal, on="Sector_", how="inner")

print(f"Unión completada. Registros combinados: {len(df)}\n")

# ---------------------------------------
# 4. LIMPIEZA ROBUSTA DE COLUMNAS
# ---------------------------------------
for col in df.columns:

    # Convertir toda la columna a string para manipulación
    df[col] = df[col].astype(str)

    # Quitar espacios
    df[col] = df[col].str.replace(" ", "", regex=False)

    # Reemplazar coma decimal por punto
    df[col] = df[col].str.replace(",", ".", regex=False)

    # Convertir a número si es posible
    df[col] = pd.to_numeric(df[col], errors="ignore")

# Reemplazar textos que significan vacío
df = df.replace(["nan", "None", "NaN"], np.nan)

# ---------------------------------------
# 5. GUARDAR JSON
# ---------------------------------------
records = df.to_dict(orient="records")

with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(records, f, indent=2, ensure_ascii=False)

print("===============================================")
print(f"JSON generado correctamente → {OUTPUT}")
print("===============================================")
