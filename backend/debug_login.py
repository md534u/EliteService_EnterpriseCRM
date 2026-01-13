import sys
import os
from passlib.context import CryptContext
from psycopg2.extras import RealDictCursor

# Asegurar que encontramos database.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import get_db_connection
except ImportError:
    print("❌ Error importando database.py")
    sys.exit(1)

# Configuración de Hashing (Igual que en auth.py)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def debug_admin_login():
    print("🕵️‍♂️ Iniciando diagnóstico de login para 'admin'...")
    
    conn = get_db_connection()
    if not conn:
        print("❌ No se pudo conectar a la BD.")
        return

    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        
        if not user:
            print("❌ El usuario 'admin' NO existe en la base de datos.")
            print("👉 Ejecuta 'python init_admin.py' para crearlo.")
            return

        print(f"✅ Usuario 'admin' encontrado (ID: {user['id']})")
        
        # Prueba de verificación
        password_to_test = "admin123"
        is_valid = pwd_context.verify(password_to_test, user['hashed_password'])
        
        if is_valid:
            print(f"✅ La contraseña '{password_to_test}' es CORRECTA y coincide con el hash.")
            print("🚀 Si el login falla en la web, revisa que no tengas espacios extra al escribir.")
        else:
            print(f"❌ La contraseña '{password_to_test}' NO coincide con el hash almacenado.")
            print("⚠️ Es posible que el hash se haya generado mal o la contraseña sea otra.")
            
            # Intentar arreglarlo
            print("\n🛠️ Intentando reparar la contraseña a 'admin123'...")
            new_hash = pwd_context.hash(password_to_test)
            cursor.execute("UPDATE users SET hashed_password = %s WHERE username = 'admin'", (new_hash,))
            conn.commit()
            print("✅ Contraseña restablecida a 'admin123'. Intenta loguearte de nuevo.")

    except Exception as e:
        print(f"❌ Error durante el diagnóstico: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    debug_admin_login()