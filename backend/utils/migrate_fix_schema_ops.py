import sys
import os
from datetime import date

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_manager import db

def run():
    df_ops = db.get_df('df_ops')

    print("Columnas INICIALES:")
    print(list(df_ops.columns))

    # --- PASO 1: Renombrar columnas legacy ---
    rename_map = {
        'Nombre_Op': 'Nombre_Oportunidad',
        'Tipo_Op': 'Tipo_Oportunidad'
    }

    df_ops = df_ops.rename(columns=rename_map)

    # --- PASO 2: Agregar columnas nuevas ---
    new_columns = {
        'Folio': None,
        'Fecha_Creacion': date.today().isoformat(),
        'Motivo_Perdida': None,
        'Submotivo_Cuenta': None
    }

    for col, default in new_columns.items():
        if col not in df_ops.columns:
            df_ops[col] = default

    print("\nColumnas FINALES:")
    print(list(df_ops.columns))

    # Guardar de forma definitiva
    db.data['df_ops'] = df_ops
    db.save_data('df_ops')

    print("\n✅ ESQUEMA CORREGIDO Y PERSISTIDO CORRECTAMENTE.")

if __name__ == "__main__":
    run()
