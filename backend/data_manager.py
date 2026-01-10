import pandas as pd
import os
import shutil
from datetime import datetime

# Definimos la ruta base para guardar los datos (carpeta crm_data)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "crm_data")

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

class DataManager:
    def __init__(self):
        # Mapeo de nombres lógicos a archivos físicos
        self.file_map = {
            "df_cuentas": "df_cuentas.csv",
            "df_contactos": "contacts.csv",
            "df_leads": "leads.csv",
            "df_gestiones": "gestiones.csv",
            "df_servicios": "services.csv",
            "df_interacciones": "interactions.csv",
            "df_tickets": "tickets.csv",
            "requerimientos_df": "tickets.csv", # Alias usado en stats
            "df_movements": "movements.csv",
            "df_cotizaciones": "quotes.csv"
        }

    def _get_filepath(self, df_name):
        filename = self.file_map.get(df_name, f"{df_name}.csv")
        return os.path.join(DATA_DIR, filename)

    def get_df(self, df_name):
        filepath = self._get_filepath(df_name)
        if os.path.exists(filepath):
            try:
                # Leemos todo como string para evitar problemas de tipos
                return pd.read_csv(filepath, dtype=str).fillna("")
            except Exception as e:
                print(f"Error leyendo {df_name}: {e}")
                return pd.DataFrame()
        return pd.DataFrame()

    def save_df(self, df_name, df):
        filepath = self._get_filepath(df_name)

        # --- BACKUP AUTOMÁTICO ---
        # Si el archivo ya existe, creamos una copia antes de sobrescribirlo
        if os.path.exists(filepath):
            backup_dir = os.path.join(DATA_DIR, "backups")
            if not os.path.exists(backup_dir):
                os.makedirs(backup_dir)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = os.path.basename(filepath)
            backup_path = os.path.join(backup_dir, f"{os.path.splitext(filename)[0]}_{timestamp}.csv")
            
            try:
                shutil.copy2(filepath, backup_path)
            except Exception as e:
                print(f"⚠️ Error creando backup de {df_name}: {e}")
        # -------------------------

        df.to_csv(filepath, index=False)

    def add_row(self, df_name, row_data):
        """Agrega un diccionario como fila al DataFrame y guarda el CSV."""
        df = self.get_df(df_name)
        new_row = pd.DataFrame([row_data])
        
        # Aseguramos que todo sea string para consistencia
        new_row = new_row.astype(str)

        if df.empty:
            df = new_row
        else:
            df = pd.concat([df, new_row], ignore_index=True)
        
        self.save_df(df_name, df)
        return True

    def update_row(self, df_name, id_col, id_val, updates):
        df = self.get_df(df_name)
        if df.empty: return False
        
        mask = df[id_col].astype(str) == str(id_val)
        if not mask.any(): return False
        
        idx = df[mask].index[0]
        for k, v in updates.items():
            df.at[idx, k] = str(v)
            
        self.save_df(df_name, df)
        return True

    def set_df(self, df_name, new_df):
        self.save_df(df_name, new_df)

    def get_next_id(self, df_name):
        df = self.get_df(df_name)
        if df.empty: return "1"
        if "ID" in df.columns:
            try:
                ids = pd.to_numeric(df["ID"], errors='coerce').fillna(0)
                return str(int(ids.max()) + 1)
            except: pass
        return str(len(df) + 1)

db = DataManager()