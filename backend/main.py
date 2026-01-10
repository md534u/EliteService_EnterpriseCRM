from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from routers import leads, accounts, contacts, gestiones, tickets, interactions, notifications
from models import StatsResponse, BackupStatsResponse
import sqlite3
import os
import shutil
import zipfile
from datetime import datetime

app = FastAPI(title="CRM EliteService API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de rutas: Esto elimina los errores 404 al llamar a /opportunities
app.include_router(leads.router)
app.include_router(accounts.router)
app.include_router(contacts.router)
app.include_router(gestiones.router) # Registro crucial
app.include_router(tickets.router) # Registro de Tickets
app.include_router(interactions.router)
app.include_router(notifications.router) # Registro de Notificaciones

# --- MODELOS Y LOGICA DE PRODUCTOS ---
class Product(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    category: str
    price: float
    sku: str
    status: str

DB_NAME = "crm.db"
BACKUP_DIR = "backups" # Carpeta donde se guardan los backups
UPLOADS_DIR = "uploads" # Carpeta de archivos adjuntos/imágenes
CRM_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "crm_data")

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS products
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT,
                  description TEXT,
                  category TEXT,
                  price REAL,
                  sku TEXT,
                  status TEXT)''')
    conn.commit()
    conn.close()

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/products", response_model=List[Product])
def get_products():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    products = conn.execute('SELECT * FROM products').fetchall()
    conn.close()
    return [dict(p) for p in products]

@app.post("/products", response_model=Product)
def create_product(product: Product):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO products (name, description, category, price, sku, status) VALUES (?, ?, ?, ?, ?, ?)',
                   (product.name, product.description, product.category, product.price, product.sku, product.status))
    conn.commit()
    product.id = cursor.lastrowid
    conn.close()
    return product

@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: int, updated_product: Product):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('UPDATE products SET name=?, description=?, category=?, price=?, sku=?, status=? WHERE id=?',
                   (updated_product.name, updated_product.description, updated_product.category, updated_product.price, updated_product.sku, updated_product.status, product_id))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    conn.commit()
    conn.close()
    updated_product.id = product_id
    return updated_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM products WHERE id = ?', (product_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    conn.commit()
    conn.close()
    return {"message": "Producto eliminado"}

# --- RUTAS DE ESTADÍSTICAS (DASHBOARD) ---
@app.get("/stats", response_model=StatsResponse)
def get_dashboard_stats():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Función auxiliar para contar registros de forma segura
    def count_table(table_name):
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            result = cursor.fetchone()
            return result[0] if result else 0
        except sqlite3.OperationalError:
            # Si la tabla no existe aún, devolvemos 0
            return 0

    # Obtenemos los conteos
    c_leads = count_table("leads")
    c_accounts = count_table("accounts")
    c_opportunities = count_table("opportunities")
    c_tickets = count_table("tickets")

    stats = StatsResponse(
        leads=c_leads,
        prospectos=c_leads,
        accounts=c_accounts,
        clientes=c_accounts,
        opportunities=c_opportunities,
        oportunidades=c_opportunities,
        tickets=c_tickets,
        requerimientos=c_tickets
    )
    conn.close()
    return stats

@app.get("/stats/backups-size")
def get_backup_stats():
    # Calcular espacio usado en vivo
    live_size = 0

    if os.path.exists(DB_NAME):
        live_size += os.path.getsize(DB_NAME)

    if os.path.exists(CRM_DATA_DIR):
        for root, _, files in os.walk(CRM_DATA_DIR):
            for f in files:
                live_size += os.path.getsize(os.path.join(root, f))

    if os.path.exists(UPLOADS_DIR):
        for root, _, files in os.walk(UPLOADS_DIR):
            for f in files:
                live_size += os.path.getsize(os.path.join(root, f))

    # --- LISTA DE ARCHIVOS DE BACKUP ---
    files = []
    if os.path.exists(BACKUP_DIR):
        for f in os.listdir(BACKUP_DIR):
            fp = os.path.join(BACKUP_DIR, f)
            if os.path.isfile(fp):
                files.append(f)

    backup_file = os.path.join(BACKUP_DIR, "backup_sistema_actual.zip")
    backup_exists = os.path.exists(backup_file)
    last_backup = None

    if backup_exists:
        last_backup = datetime.fromtimestamp(
            os.path.getmtime(backup_file)
        ).strftime('%Y-%m-%d %H:%M:%S')

    return {
        "live_size_bytes": live_size,
        "live_size_mb": round(live_size / (1024 * 1024), 2),
        "last_backup": last_backup,
        "backup_exists": backup_exists,
        "files": files
    }


@app.post("/create-backup")
def create_new_backup():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    
    # Nombre FIJO para sobrescribir siempre el mismo
    filename = "backup_sistema_actual.zip"
    dest_path = os.path.join(BACKUP_DIR, filename)
    
    try:
        with zipfile.ZipFile(dest_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # 1. Agregar Base de Datos
            if os.path.exists(DB_NAME):
                zipf.write(DB_NAME, arcname=DB_NAME)
            
            # 2. Agregar carpeta crm_data (CSVs) - CRÍTICO
            if os.path.exists(CRM_DATA_DIR):
                for root, dirs, files in os.walk(CRM_DATA_DIR):
                    for file in files:
                        file_path = os.path.join(root, file)
                        # Guardar con la estructura de carpetas relativa (ej: crm_data/archivo.csv)
                        rel_path = os.path.relpath(file_path, os.path.dirname(CRM_DATA_DIR))
                        zipf.write(file_path, arcname=rel_path)

            # 3. Agregar carpeta de uploads (recursivamente)
            if os.path.exists(UPLOADS_DIR):
                for root, dirs, files in os.walk(UPLOADS_DIR):
                    for file in files:
                        file_path = os.path.join(root, file)
                        zipf.write(file_path, arcname=file_path)
                        
        return {
            "message": "Backup actualizado exitosamente", 
            "filename": filename,
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        # No borramos el archivo si falla, para mantener el anterior si existía
        raise HTTPException(status_code=500, detail=f"Error al crear backup: {str(e)}")
    
@app.get("/backups/{filename}/contents")
def get_backup_contents(filename: str):
    file_path = os.path.join(BACKUP_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Backup no encontrado")

    if not zipfile.is_zipfile(file_path):
        raise HTTPException(status_code=400, detail="El archivo no es un ZIP válido")

    try:
        with zipfile.ZipFile(file_path, 'r') as zipf:
            files = zipf.namelist()

        return {
            "filename": filename,
            "file_count": len(files),
            "files": files
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/backups/{filename}")
def download_backup_file(filename: str):
    file_path = os.path.join(BACKUP_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')
    raise HTTPException(status_code=404, detail="Archivo no encontrado")

@app.get("/backups/{filename}/contents")
def list_backup_contents(filename: str):
    backup_path = os.path.join(BACKUP_DIR, filename)

    if not os.path.exists(backup_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    if not filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="No es un ZIP")

    with zipfile.ZipFile(backup_path, 'r') as zipf:
        return {
            "filename": filename,
            "files": zipf.namelist()
        }


@app.post("/restore-backup/{filename}")
def restore_database(filename: str):
    backup_path = os.path.join(BACKUP_DIR, filename)
    if not os.path.exists(backup_path):
        raise HTTPException(status_code=404, detail="Archivo de backup no encontrado")
    
    try:
        if filename.endswith('.zip'):
            # Restaurar desde ZIP (DB + Archivos)
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(path=".")
        else:
            # Soporte retroactivo para archivos .db antiguos
            shutil.copy2(backup_path, DB_NAME)
            
        return {"message": f"Base de datos restaurada exitosamente desde {filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al restaurar la base de datos: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)