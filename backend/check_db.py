import sqlite3
import os

# Ruta al archivo de base de datos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "crm.db")

def inspect_db():
    print(f"🔍 Buscando base de datos en: {DB_PATH}")
    
    if not os.path.exists(DB_PATH):
        print("❌ El archivo crm.db no existe todavía. Asegúrate de haber iniciado el backend al menos una vez.")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        # Esto permite acceder a las columnas por nombre
        conn.row_factory = sqlite3.Row 
        cursor = conn.cursor()
        
        # Verificar si existe la tabla products
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='products';")
        if not cursor.fetchone():
            print("⚠️ La tabla 'products' no existe aún.")
            return

        # Obtener productos
        cursor.execute("SELECT * FROM products")
        rows = cursor.fetchall()
        
        print(f"\n📦 --- PRODUCTOS ENCONTRADOS: {len(rows)} ---")
        
        for row in rows:
            # Convertimos el objeto Row a diccionario para verlo mejor
            print(dict(row))
            print("-" * 40)

        conn.close()

    except Exception as e:
        print(f"❌ Error leyendo la base de datos: {e}")

if __name__ == "__main__":
    inspect_db()
