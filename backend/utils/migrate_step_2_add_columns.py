# backend/utils/migrate_step_2_add_columns.py

import sys
import os
import pandas as pd
from datetime import date

# Asegurar que Python vea /backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_manager import db

# Columnas nuevas y valor por defecto
NEW_COLUMNS = {
    'Folio': None,
    'Fecha_Creacion': None,
    'Motivo_Perdida': None,
    'Submotivo_Cuenta': None,
    'Canal_Origen': None,
}

def run():
    df_ops = db.get_df('df_ops')

    if df_ops.empty:
        print("⚠️ df_ops está vacío. No se realizó ningún cambio.")
        return

    print("Columnas ANTES:")
    print(list(df_ops.columns))

    # Crear columnas solo si no existen
    for col, default in NEW_COLUMNS.items():
        if col not in df_ops.columns:
            df_ops[col] = default

    # Fecha de creación por defecto (solo donde esté vacía)
    if 'Fecha_Creacion' in df_ops.columns:
        df_ops['Fecha_Creacion'] = df_ops['Fecha_Creacion'].fillna(date.today().isoformat())

    print("\nColumnas DESPUÉS:")
    print(list(df_ops.columns))

    # Guardar usando el patrón correcto de tu DataManager
    db.data['df_ops'] = df_ops
    db.save_data('df_ops')

    print("\n✅ PASO 2 completado: columnas nuevas creadas correctamente.")

if __name__ == "__main__":
    run()
