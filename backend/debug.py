import os
import pandas as pd

# Rutas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "crm_data")
FILE_PATH = os.path.join(DATA_DIR, "df_cuentas.csv")

print(f"--- DIAGNÓSTICO DE DATOS ---")
print(f"1. Buscando archivo en: {FILE_PATH}")

if os.path.exists(FILE_PATH):
    print("✅ El archivo EXISTE.")
    try:
        df = pd.read_csv(FILE_PATH)
        print(f"2. Filas encontradas: {len(df)}")
        print("3. Columnas encontradas:", df.columns.tolist())
        if not df.empty:
            print("4. Ejemplo de primera fila:")
            print(df.iloc[0].to_dict())
        else:
            print("⚠️ EL ARCHIVO ESTÁ VACÍO (0 filas).")
    except Exception as e:
        print(f"❌ Error leyendo el CSV: {e}")
else:
    print("❌ EL ARCHIVO NO EXISTE. Revisa la carpeta crm_data.")