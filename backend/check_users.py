import sys
import os
from psycopg2.extras import RealDictCursor

# Asegurar que encontramos database.py añadiendo el directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import get_db_connection
except ImportError:
    print("❌ Error importando database.py. Asegúrate de ejecutar esto desde la carpeta backend.")
    sys.exit(1)

def list_users():
    print("🔌 Conectando a la base de datos...")
    conn = get_db_connection()
    if not conn:
        print("❌ Error: No se pudo conectar a la base de datos.")
        return

    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id, username, role, full_name, position FROM users")
        users = cursor.fetchall()
        
        print(f"\n👥 --- USUARIOS ENCONTRADOS: {len(users)} ---")
        if not users:
            print("⚠️ La tabla 'users' está vacía.")
        
        for user in users:
            print(f"ID: {user['id']} | Usuario: {user['username']} | Rol: {user['role']} | Nombre: {user['full_name']}")
            print("-" * 40)
            
    except Exception as e:
        print(f"❌ Error consultando usuarios: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    list_users()
