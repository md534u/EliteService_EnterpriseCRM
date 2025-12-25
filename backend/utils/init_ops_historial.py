import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "crm_data")

path = os.path.join(DATA_DIR, "df_ops_historial.csv")

if not os.path.exists(path):
    df = pd.DataFrame(columns=[
        "ID_Evento",
        "ID_Oportunidad",
        "Etapa_Anterior",
        "Etapa_Nueva",
        "Probabilidad",
        "Fecha_Cambio"
    ])
    df.to_csv(path, index=False)
    print("✅ df_ops_historial.csv creado correctamente")
else:
    print("ℹ️ df_ops_historial.csv ya existe")
