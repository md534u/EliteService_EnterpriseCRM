import sys
import os

# Asegurar que encontramos database.py añadiendo el directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import get_db_connection
except ImportError:
    print("❌ Error importando database.py. Asegúrate de ejecutar esto desde la carpeta backend.")
    sys.exit(1)

def reset_users():
    print("\n⚠️  PELIGRO: ESTA ACCIÓN BORRARÁ TODOS LOS USUARIOS REGISTRADOS.")
    print("   Esto incluye al administrador y cualquier usuario creado.")
    print("   (No afectará a clientes ni tickets, solo el acceso al sistema)")
    
    confirm = input("\n¿Estás seguro? Escribe 'BORRAR TODO' para confirmar: ")
    
    if confirm != "BORRAR TODO":
        print("❌ Operación cancelada.")
        return

    print("\n🔌 Conectando a la base de datos...")
    conn = get_db_connection()
    if not conn:
        print("❌ Error de conexión.")
        return

    try:
        cursor = conn.cursor()
        
        # 1. Ejecutamos el borrado
        cursor.execute("DELETE FROM users")
        count = cursor.rowcount
        
        # 2. Reiniciamos la secuencia de IDs (para que el próximo usuario sea ID 1)
        cursor.execute("ALTER SEQUENCE users_id_seq RESTART WITH 1")
        
        conn.commit()
        
        print(f"✅ ÉXITO: Se eliminaron {count} usuarios.")
        print("ℹ️  La tabla de usuarios está vacía y el contador de IDs reiniciado.")
        print("\n👉 Siguiente paso: Ejecuta 'python init_admin.py' para crear el admin por defecto.")
            
    except Exception as e:
        print(f"❌ Error durante el borrado: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    reset_users()