import sys
import os
import pandas as pd

# Asegurar que Python vea /backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
sys.path.append(BACKEND_DIR)

from data_manager import db
from utils.folio_generator import generar_folio_oportunidad


def run():
    # --- Cargar CSV DIRECTAMENTE (sin caché) ---
    csv_path = os.path.join(BACKEND_DIR, "crm_data", "df_ops.csv")
    df_ops = pd.read_csv(csv_path)
    df_ops['Folio'] = df_ops['Folio'].astype('string')
    print("✅ Datos de oportunidades cargados directamente desde CSV.")

    # --- Validación mínima ---
    if 'Folio' not in df_ops.columns:
        print("❌ La columna Folio no existe. Ejecuta PASO 2 primero.")
        return

    pendientes = df_ops[df_ops['Folio'].isna() | (df_ops['Folio'] == '')]

    print(f"Oportunidades sin folio: {len(pendientes)}")

    if pendientes.empty:
        print("ℹ️ No hay oportunidades pendientes de folio.")
        return

    # --- Generar folios OP ---
    for idx in pendientes.index:
        folio = generar_folio_oportunidad(df_ops)
        df_ops.loc[idx, 'Folio'] = folio

    # --- Guardar definitivamente ---
    db.data['df_ops'] = df_ops
    db.save_data('df_ops')

    print("\n✅ PASO 4 completado: Folios generados y fijados correctamente.")
    print("\nMuestra:")
    print(df_ops[['ID', 'Folio']].tail())


if __name__ == "__main__":
    run()
