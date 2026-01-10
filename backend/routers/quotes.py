from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import List, Optional
import pandas as pd
import os
import shutil
import uuid
import json
from datetime import datetime
import sys

# Asegurar rutas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_manager import db 

router = APIRouter(prefix="/quotes", tags=["Quotes"])

# Directorio de uploads
UPLOAD_DIR = os.path.join("crm_data", "quotes")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# --- 1. OBTENER LISTA ---
@router.get("/")
def get_quotes(account_id: Optional[str] = None, opportunity_id: Optional[str] = None):
    try:
        df = db.get_df('df_cotizaciones')
    except:
        return []

    if df.empty: return []
    
    # Normalizar para búsquedas (convertir a string para evitar errores de tipo)
    # Filtro por Cuenta
    if account_id and 'ID_Cuenta_FK' in df.columns:
        df = df[df['ID_Cuenta_FK'].astype(str) == str(account_id)]
    
    # Filtro por Oportunidad (usando la columna correcta)
    if opportunity_id and 'ID_Oportunidad_FK' in df.columns:
        df = df[df['ID_Oportunidad_FK'].astype(str) == str(opportunity_id)]
        
    return df.replace({float('nan'): None}).to_dict(orient='records')

# --- 2. SUBIR Y GUARDAR (MAPEO EXACTO A TUS COLUMNAS) ---
@router.post("/upload")
async def upload_quote(
    file: UploadFile = File(...),
    opportunity_id: str = Form(...),
    total_amount: str = Form(...),
    notes: str = Form(None)
):
    try:
        # 1. Guardar archivo físico
        safe_filename = file.filename or f"cotizacion_{uuid.uuid4()}.pdf"
        file_ext = os.path.splitext(safe_filename)[1]
        unique_name = f"{os.path.splitext(safe_filename)[0]}_{str(uuid.uuid4())[:8]}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. RECUPERAR DATOS FALTANTES (Cuenta y Cliente)
        # Como el frontend solo manda ID de Oportunidad, buscamos el resto en la BD
        id_cuenta = ""
        nombre_cliente = "Cliente Desconocido"
        
        try:
            # Buscar Oportunidad para sacar ID Cuenta
            df_ops = db.get_df('df_opportunities')
            if not df_ops.empty:
                op_row = df_ops[df_ops['ID'].astype(str) == str(opportunity_id)]
                if not op_row.empty:
                    # Intenta buscar columna ID_Cuenta_FK o account_id
                    if 'ID_Cuenta_FK' in op_row.columns:
                        id_cuenta = str(op_row.iloc[0]['ID_Cuenta_FK'])
                    elif 'account_id' in op_row.columns:
                        id_cuenta = str(op_row.iloc[0]['account_id'])

            # Buscar Cuenta para sacar Nombre Cliente
            if id_cuenta:
                df_acc = db.get_df('df_accounts')
                if not df_acc.empty:
                    acc_row = df_acc[df_acc['ID'].astype(str) == str(id_cuenta)]
                    if not acc_row.empty:
                        nombre_cliente = acc_row.iloc[0].get('Nombre_Cuenta', 'Cliente')
        except Exception as e:
            print(f"Advertencia: No se pudieron autocompletar datos de cuenta: {e}")

        # 3. CREAR DICCIONARIO CON TUS COLUMNAS EXACTAS
        # ID,ID_Oportunidad_FK,ID_Cuenta_FK,Nombre_Cliente,Fecha_Emision,Vigencia,Version,Total_Mensual,Ahorro_Total,Items_JSON,Ruta_PDF,Usuario
        
        new_quote = {
            "ID": str(uuid.uuid4()),
            "ID_Oportunidad_FK": str(opportunity_id),
            "ID_Cuenta_FK": str(id_cuenta),
            "Nombre_Cliente": str(nombre_cliente),
            "Fecha_Emision": datetime.now().strftime("%Y-%m-%d"),
            "Vigencia": str(notes) if notes else "15 días", # Usamos las notas como vigencia o referencia
            "Version": "1",
            "Total_Mensual": float(total_amount) if total_amount else 0.0,
            "Ahorro_Total": 0.0, # Frontend no lo envía en el upload, se pone 0 por defecto
            "Items_JSON": "[]",  # PDF generado en frontend, no tenemos los items aquí.
            "Ruta_PDF": unique_name, # Guardamos solo el nombre para que sea relativo
            "Usuario": "Sistema Web"
        }

        # 4. Guardar en Base de Datos
        db.add_row('df_cotizaciones', new_quote)
        
        print("✅ Cotización guardada con columnas correctas.")

        return {"status": "success", "filename": unique_name, "id": new_quote["ID"]}

    except Exception as e:
        print(f"Error crítico subiendo archivo: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al guardar: {str(e)}")

# --- 3. DESCARGAR ---
@router.get("/download/{filename}")
async def download_quote(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/pdf', filename=filename)
    raise HTTPException(status_code=404, detail="Archivo no encontrado")