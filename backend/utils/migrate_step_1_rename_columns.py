import sys
import os
import pandas as pd

# Agregar backend al PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_manager import db


# Mapeo de columnas legacy → nuevas
COLUMN_MAP = {
    'Nombre_Op': 'Nombre_Oportunidad',
    'Tipo_Op': 'Tipo_Oportunidad'
}

def run():
    df_ops = db.get_df('df_ops')

    if df_ops.empty:
        print("⚠️ df_ops está vacío. No se realizó ningún cambio.")
        return

    print("Columnas ANTES:")
    print(list(df_ops.columns))

    # Renombrar solo si existen
    columnas_a_renombrar = {k: v for k, v in COLUMN_MAP.items() if k in df_ops.columns}

    if not columnas_a_renombrar:
        print("ℹ️ No se encontraron columnas legacy para renombrar.")
        return

    df_ops = df_ops.rename(columns=columnas_a_renombrar)

    print("\nColumnas DESPUÉS:")
    print(list(df_ops.columns))

    # Guardar cambios
    db.data['df_ops'] = df_ops
    db.save_data('df_ops')
    print("\n✅ PASO 1 completado: columnas renombradas correctamente.")

if __name__ == "__main__":
    run()
