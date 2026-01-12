import sys
import os
from passlib.context import CryptContext

# Asegurar que encontramos database.py añadiendo el directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import get_db_connection
except ImportError:
    print("❌ Error importando database.py. Asegúrate de ejecutar esto desde la carpeta backend.")
    sys.exit(1)

# Configuración de Hashing (Debe coincidir con auth.py)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_default_admin():
    print("🔌 Conectando a la base de datos...")
    conn = get_db_connection()
    if not conn:
        print("❌ Error: No se pudo conectar a la base de datos.")
        return

    cursor = conn.cursor()
    
    # 1. Asegurar que la tabla existe y tiene las columnas correctas
    # (Esto replica la lógica de auth.py para asegurar consistencia)
    try:
        # Crear tabla si no existe
        cursor.execute('''CREATE TABLE IF NOT EXISTS users
                     (id SERIAL PRIMARY KEY,
                      username TEXT UNIQUE,
                      hashed_password TEXT,
                      role TEXT,
                      full_name TEXT,
                      position TEXT)''')
        conn.commit()
        
        # Asegurar columnas nuevas (Migración por si la tabla es vieja)
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT")
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS position TEXT")
        conn.commit()
    except Exception as e:
        print(f"⚠️ Error verificando estructura de tabla: {e}")
        conn.rollback()

    # 2. Verificar si ya hay usuarios
    try:
        cursor.execute("SELECT count(*) as cnt FROM users")
        result = cursor.fetchone()
        count = result['cnt']
    except Exception as e:
        print(f"❌ Error consultando usuarios: {e}")
        conn.close()
        return

    if count > 0:
        print(f"ℹ️ Ya existen {count} usuarios en la base de datos. No se requiere acción.")
        conn.close()
        return

    print("⚡ Base de datos de usuarios vacía. Creando administrador por defecto...")

    # Datos del Admin por defecto
    admin_user = "admin"
    admin_pass = "admin123" 
    hashed_pw = get_password_hash(admin_pass)
    role = "admin"
    full_name = "Administrador Sistema"
    position = "Super Admin"

    try:
        cursor.execute(
            "INSERT INTO users (username, hashed_password, role, full_name, position) VALUES (%s, %s, %s, %s, %s)",
            (admin_user, hashed_pw, role, full_name, position)
        )
        conn.commit()
        print(f"✅ Usuario creado exitosamente.")
        print(f"   Usuario: {admin_user}")
        print(f"   Password: {admin_pass}")
        print("   ⚠️ RECOMENDACIÓN: Cambia esta contraseña inmediatamente después de ingresar.")
    except Exception as e:
        print(f"❌ Error creando usuario: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_default_admin()