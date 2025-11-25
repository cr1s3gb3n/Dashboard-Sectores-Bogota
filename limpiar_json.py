import json

INPUT = "data/dashboard_data_limpio.json"
OUTPUT = "data/dashboard_data_final.json"

def procesar():
    with open(INPUT, "r", encoding="utf-8") as f:
        data = json.load(f)

    salida = []

    for r in data:
        nuevo = {}

        # Renombrar
        nuevo["Sector_"] = r.get("Sector_")

        nuevo["VE (Mm³/año)"] = r.get("VE (Mm³/año)", 0)
        nuevo["Consumo Autorizado (Mm³/año)"] = r.get("Consumo autorizado (Mm³/año)", 0)

        # Técnicas
        tecnicas = r.get("Pérdidas Técnicas (Mm³/año)", 0)
        nuevo["Pérdidas Técnicas (Mm³/año)"] = tecnicas

        # Componentes
        sub = r.get("Submedición (Mm³/año)", 0)
        no_vis = r.get("Fugas no visibles (Fugas de fondo) (Mm³/año)", 0)
        vis = r.get("Fugas visibles (reportadas) (Mm³/año)", 0)
        err = r.get("Errores en el manejo de datos (Mm³/año)", 0)
        cna = r.get("Consumo no autorizado (Mm³/año)", 0)

        nuevo["Fugas Visibles (Mm³/año)"] = vis
        nuevo["Fugas No Visibles (Mm³/año)"] = no_vis
        nuevo["Submedición (Mm³/año)"] = sub
        nuevo["Errores en el Manejo de Datos (Mm³/año)"] = err
        nuevo["Consumo No Autorizado (Mm³/año)"] = cna

        # Aparentes = Sub + CNA + Errores
        aparentes = sub + cna + err
        nuevo["Pérdidas Aparentes (Mm³/año)"] = aparentes

        # Totales = Técnicas + Aparentes
        totales = tecnicas + aparentes
        nuevo["Pérdidas Totales (Mm³/año)"] = totales

        # Otros indicadores
        nuevo["AMSI"] = r.get("AMSI", 0)
        nuevo["UARL"] = r.get("UARL", 0)
        nuevo["ILI"] = r.get("ILI", 0)
        nuevo["IPUF"] = r.get("IPUF", 0)

        salida.append(nuevo)

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(salida, f, ensure_ascii=False, indent=2)

    print("✔ Archivo final creado en:", OUTPUT)

if __name__ == "__main__":
    procesar()
