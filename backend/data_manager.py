import pandas as pd
from database import get_db_connection
import psycopg2
from psycopg2.extras import RealDictCursor

class DataManager:
    def __init__(self):
        # Mapeamos los nombres viejos (DataFrames) a nombres de Tablas SQL reales
        self.table_map = {
            "df_cuentas": "accounts",
            "df_contactos": "contacts",
            "df_leads": "leads",
            "df_gestiones": "gestiones",
            "df_servicios": "services",
            "df_interacciones": "interactions",
            "df_tickets": "tickets",
            "requerimientos_df": "tickets", # Alias
            "df_movements": "movements",
            "df_cotizaciones": "quotes"
        }

    def _get_table_name(self, df_name):
        return self.table_map.get(df_name, df_name)

    def get_df(self, df_name):
        """Descarga una tabla de SQL y la convierte en DataFrame de Pandas"""
        table_name = self._get_table_name(df_name)
        conn = get_db_connection()
        
        if conn is None:
            return pd.DataFrame()

        try:
            # Leemos SQL directo a Pandas
            query = f"SELECT * FROM {table_name}"
            df = pd.read_sql(query, conn)
            conn.close()
            
            # Convertimos todo a string para mantener compatibilidad con tu código anterior
            # (Más adelante podremos usar tipos reales como int o date)
            return df.fillna("").astype(str)
            
        except Exception as e:
            print(f"⚠️ La tabla {table_name} aún no existe o está vacía. ({e})")
            conn.close()
            return pd.DataFrame()

    def add_row(self, df_name, row_data):
        """Inserta una nueva fila en SQL"""
        table_name = self._get_table_name(df_name)
        conn = get_db_connection()
        if conn is None: return False

        try:
            cur = conn.cursor()
            
            # Preparamos las columnas y los valores
            columns = list(row_data.keys())
            values = list(row_data.values())
            
            # Magia SQL: Creamos los huecos %s dinámicamente
            placeholders = ", ".join(["%s"] * len(values))
            columns_str = ", ".join(columns)
            
            query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"
            
            cur.execute(query, values)
            conn.commit()
            cur.close()
            conn.close()
            return True
        except Exception as e:
            print(f"❌ Error insertando en {table_name}: {e}")
            conn.close()
            return False

    def update_row(self, df_name, id_col, id_val, updates):
        """Actualiza una fila existente usando SQL UPDATE"""
        table_name = self._get_table_name(df_name)
        conn = get_db_connection()
        if conn is None: return False

        try:
            cur = conn.cursor()
            
            # Construimos la query: "UPDATE tabla SET col1=%s, col2=%s WHERE id=%s"
            set_clauses = []
            values = []
            
            for key, value in updates.items():
                set_clauses.append(f"{key} = %s")
                values.append(value)
            
            # Agregamos el ID al final para el WHERE
            values.append(id_val)
            
            set_query = ", ".join(set_clauses)
            query = f"UPDATE {table_name} SET {set_query} WHERE {id_col} = %s"
            
            cur.execute(query, values)
            conn.commit()
            cur.close()
            conn.close()
            return True
        except Exception as e:
            print(f"❌ Error actualizando {table_name}: {e}")
            conn.close()
            return False

    def get_next_id(self, df_name):
        """Obtiene el siguiente ID contando registros en la BD"""
        table_name = self._get_table_name(df_name)
        conn = get_db_connection()
        if conn is None: return "1"

        try:
            cur = conn.cursor()
            # Intentamos obtener el ID máximo numérico
            cur.execute(f"SELECT MAX(CAST(id AS INTEGER)) FROM {table_name}")
            max_id = cur.fetchone()[0] # En psycopg2 esto devuelve una tupla o dict
            conn.close()
            
            if max_id is None:
                return "1"
            return str(max_id + 1)
            
        except Exception:
            # Si falla (ej. la tabla no existe), retornamos 1
            if conn: conn.close()
            return "1"

    # Método de compatibilidad (por si algo llama a save_df)
    def save_df(self, df_name, df):
        print(f"⚠️ ADVERTENCIA: 'save_df' fue llamado para {df_name}. En SQL no sobrescribimos tablas enteras. Ignorando.")
        pass

db = DataManager()