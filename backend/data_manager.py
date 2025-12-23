import os
import pandas as pd
from typing import List, Optional, Any

DATA_DIR = "crm_data"
DOCS_DIR = os.path.join(DATA_DIR, "documentos")

# Define columns as per original code
COLS_LEADS = ['Folio', 'Segmento', 'Fecha_Registro', 'Nombre', 'Segundo_Nombre', 'Apellido_Paterno', 'Apellido_Materno', 'Fecha_Nacimiento', 'RFC', 'Telefono', 'Email_Facturacion', 'Razon_Social', 'RFC_Empresa', 'Giro', 'Calle', 'No_Exterior', 'No_Interno', 'Colonia', 'Municipio', 'Estado', 'CP', 'Estado_CRM']
COLS_CUENTAS = ['ID', 'Nombre_Cuenta', 'RFC', 'Giro_Empresa', 'Domicilio_Fiscal', 'Propietario_ID', 'Segmento_Tipo']
COLS_CONTACTOS = ['ID', 'Nombre', 'Apellido_Paterno', 'Email', 'Telefono', 'ID_Cuenta_FK', 'Rol']
COLS_OPS = ['ID', 'Nombre_Op', 'ID_Cuenta_FK', 'Etapa', 'Cantidad_Lineas', 'Fecha_Cierre', 'Servicio_Clave', 'Probabilidad', 'Tipo_Op', 'Comentarios']
COLS_SERVICIOS = ['ID_Servicio', 'ID_Cuenta_FK', 'DN', 'Plan_Contratado', 'Controlado', 'Estado_Servicio', 'Fecha_Activacion', 'Fecha_Vencimiento', 'Servicios_Adicionales', 'Costo_Mensual', 'Inicio_Contrato', 'Equipo_Asignado', 'Plazo_Contratacion', 'Sucursal_Activacion', 'Ejecutivo_Activacion']
COLS_INTERACCIONES = ['ID', 'ID_Servicio_FK', 'ID_Cuenta_FK', 'Fecha_Hora', 'Canal_Atencion', 'Tipo_Interaccion', 'Usuario_Registro', 'Notas_Detalle']
COLS_REQUERIMIENTOS = ['ID', 'Cliente', 'Línea_Móvil', 'Titulo', 'Tipo1', 'Tipo2', 'Tipo3', 'Prioridad', 'Severidad', 'Estado', 'PadreHijo', 'ID_Padre', 'Notas', 'Fila_Trabajo', 'Agente', 'Fecha']
COLS_MOVIMIENTOS = ['ID_Ticket', 'Usuario', 'Nota', 'Fecha', 'Nuevo_Estado']
COLS_COTIZACIONES = ['ID', 'ID_Oportunidad_FK', 'ID_Cuenta_FK', 'Nombre_Cliente', 'Fecha_Emision', 'Vigencia', 'Version', 'Total_Mensual', 'Ahorro_Total', 'Items_JSON', 'Ruta_PDF', 'Usuario']

FILE_MAPPING = {
    'df_leads': (os.path.join(DATA_DIR, "df_leads.csv"), COLS_LEADS),
    'df_cuentas': (os.path.join(DATA_DIR, "df_cuentas.csv"), COLS_CUENTAS),
    'df_contactos': (os.path.join(DATA_DIR, "df_contactos.csv"), COLS_CONTACTOS),
    'df_ops': (os.path.join(DATA_DIR, "df_ops.csv"), COLS_OPS),
    'df_servicios': (os.path.join(DATA_DIR, "df_servicios.csv"), COLS_SERVICIOS),
    'df_interacciones': (os.path.join(DATA_DIR, "df_interacciones.csv"), COLS_INTERACCIONES),
    'requerimientos_df': (os.path.join(DATA_DIR, "requerimientos_df.csv"), COLS_REQUERIMIENTOS),
    'movimientos_df': (os.path.join(DATA_DIR, "movimientos_df.csv"), COLS_MOVIMIENTOS),
    'df_cotizaciones': (os.path.join(DATA_DIR, "df_cotizaciones.csv"), COLS_COTIZACIONES)
}

class DataManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataManager, cls).__new__(cls)
            cls._instance._load_data()
        return cls._instance

    def _load_data(self):
        if not os.path.exists(DATA_DIR): os.makedirs(DATA_DIR)
        if not os.path.exists(DOCS_DIR): os.makedirs(DOCS_DIR)
        
        self.data = {}
        for name, (filepath, cols) in FILE_MAPPING.items():
            try:
                df = pd.read_csv(filepath, dtype=str)
                # Ensure all columns exist
                for col in cols:
                    if col not in df.columns:
                        df[col] = pd.NA
                self.data[name] = df[cols].fillna('')
            except (FileNotFoundError, pd.errors.EmptyDataError):
                self.data[name] = pd.DataFrame(columns=cols).fillna('')

    def save_data(self, df_name: str):
        if df_name in self.data and df_name in FILE_MAPPING:
            filepath, _ = FILE_MAPPING[df_name]
            self.data[df_name].to_csv(filepath, index=False)

    def get_df(self, df_name: str) -> pd.DataFrame:
        return self.data.get(df_name)

    def set_df(self, df_name: str, df: pd.DataFrame):
        self.data[df_name] = df
        self.save_data(df_name)
    
    def get_next_id(self, df_name: str) -> str:
        df = self.get_df(df_name)
        if df.empty or 'ID' not in df.columns:
            return "1"
        try:
            numeric_ids = pd.to_numeric(df['ID'], errors='coerce').dropna()
            if numeric_ids.empty:
                return "1"
            return str(int(numeric_ids.max()) + 1)
        except Exception:
            # Fallback UUID logic could be implemented here, but matching original logic
            return "1"

    def add_row(self, df_name: str, row_data: dict):
        df = self.get_df(df_name)
        # Ensure only valid columns are added
        valid_cols = FILE_MAPPING[df_name][1]
        cleaned_row = {k: v for k, v in row_data.items() if k in valid_cols}
        
        new_row = pd.DataFrame([cleaned_row])
        # Align columns
        for col in valid_cols:
            if col not in new_row.columns:
                new_row[col] = ''
        
        updated_df = pd.concat([df, new_row], ignore_index=True).fillna('')
        self.set_df(df_name, updated_df)
        return cleaned_row

    def update_row(self, df_name: str, id_col: str, id_val: str, updates: dict):
        df = self.get_df(df_name)
        mask = df[id_col] == str(id_val)
        if not mask.any():
            return False
        
        idx = df[mask].index[0]
        for k, v in updates.items():
            if k in df.columns:
                df.at[idx, k] = str(v)
        
        self.set_df(df_name, df)
        return True

db = DataManager()
