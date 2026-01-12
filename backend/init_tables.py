from database import get_db_connection

def create_tables():
    conn = get_db_connection()
    if conn is None:
        return
    
    cur = conn.cursor()
    
    print("🔨 Creando tablas en PostgreSQL...")

    # 1. Tabla LEADS
    cur.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id SERIAL PRIMARY KEY,
            nombre TEXT,
            empresa TEXT,
            email TEXT,
            telefono TEXT,
            estado TEXT,
            fecha_registro TEXT,
            origen TEXT
        );
    """)

    # 2. Tabla GESTIONES
    cur.execute("""
        CREATE TABLE IF NOT EXISTS gestiones (
            id SERIAL PRIMARY KEY,
            cliente_id TEXT,
            tipo TEXT,
            nota TEXT,
            fecha TEXT,
            usuario TEXT
        );
    """)
    
    # 3. Tabla TICKETS
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id SERIAL PRIMARY KEY,
            titulo TEXT,
            descripcion TEXT,
            prioridad TEXT,
            estado TEXT,
            cliente TEXT,
            fecha_creacion TEXT
        );
    """)

    # 4. Tabla ACCOUNTS (Clientes)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            id SERIAL PRIMARY KEY,
            nombre TEXT,
            rfc TEXT,
            direccion TEXT,
            industria TEXT,
            telefono TEXT,
            contacto_principal TEXT
        );
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("✅ ¡Tablas creadas exitosamente!")

if __name__ == "__main__":
    create_tables()