from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import os
import shutil
import uuid
from data_manager import db

router = APIRouter(prefix="/interactions", tags=["Interactions"])

class InteractionModel(BaseModel):
    ID: Optional[str] = None
    ID_Servicio_FK: Optional[str] = None
    ID_Cuenta_FK: str
    Fecha_Hora: str
    Canal_Atencion: str
    Tipo_Interaccion: str
    Sentido_Contacto: Optional[str] = None
    Usuario_Registro: str
    Notas_Detalle: str

@router.get("/")
def get_interactions():
    # Intentar cargar desde memoria (data_manager)
    df = db.get_df("df_interacciones")
    
    # Si está vacío en memoria, intentar cargar del CSV físico
    if df.empty:
        try:
            # Subimos 3 niveles: routers -> backend -> BOS
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            csv_path = os.path.join(base_dir, "crm_data", "df_interacciones.csv")
            if os.path.exists(csv_path):
                df = pd.read_csv(csv_path)
        except Exception:
            pass

    if df.empty:
        return []
    
    # Normalización para evitar valores NaN que rompen el JSON
    df = df.fillna("")
    return df.to_dict(orient="records")

@router.post("/")
def create_interaction(
    ID_Servicio_FK: Optional[str] = Form(None),
    ID_Cuenta_FK: str = Form(...),
    Fecha_Hora: str = Form(...),
    Canal_Atencion: str = Form(...),
    Tipo_Interaccion: str = Form(...),
    Sentido_Contacto: Optional[str] = Form(None),
    Usuario_Registro: str = Form(...),
    Notas_Detalle: str = Form(...),
    files: List[UploadFile] = File(None)
):
    new_data = {
        "ID_Servicio_FK": ID_Servicio_FK,
        "ID_Cuenta_FK": ID_Cuenta_FK,
        "Fecha_Hora": Fecha_Hora,
        "Canal_Atencion": Canal_Atencion,
        "Tipo_Interaccion": Tipo_Interaccion,
        "Sentido_Contacto": Sentido_Contacto,
        "Usuario_Registro": Usuario_Registro,
        "Notas_Detalle": Notas_Detalle,
        "Adjuntos": ""
    }
    new_data["ID"] = str(uuid.uuid4())
    
    # Procesar archivos adjuntos
    if files:
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            upload_dir = os.path.join(base_dir, "uploads", "interactions", new_data["ID"])
            os.makedirs(upload_dir, exist_ok=True)
            
            saved_files = []
            for file in files:
                # --- CORRECCIÓN PYLANCE ---
                # Aseguramos que filename sea un string válido y no None
                safe_filename = str(file.filename) if file.filename else f"adjunto_{uuid.uuid4()}"
                
                file_path = os.path.join(upload_dir, safe_filename)
                
                print(f"✅ Guardando adjunto en: {file_path}")
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                saved_files.append(safe_filename)
            
            # Guardar lista de archivos en columna dedicada
            if saved_files:
                new_data["Adjuntos"] = ",".join(saved_files)
        except Exception as e:
            print(f"Error guardando archivos: {e}")

    # Guardado físico en CSV
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    csv_path = os.path.join(base_dir, "crm_data", "df_interacciones.csv")
    
    try:
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
        else:
            df = pd.DataFrame(columns=list(new_data.keys()))
            
        # Concatenar nueva fila
        new_row = pd.DataFrame([new_data])
        df = pd.concat([df, new_row], ignore_index=True)
        df.to_csv(csv_path, index=False)
        
        return new_data
    except Exception as e:
        print(f"Error guardando interacción: {e}")
        raise HTTPException(status_code=500, detail="Error interno al guardar la interacción")

@router.get("/{interaction_id}/download/{filename}")
def download_interaction_attachment(interaction_id: str, filename: str):
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    file_path = os.path.join(base_dir, "uploads", "interactions", interaction_id, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename)
    raise HTTPException(status_code=404, detail="Archivo no encontrado")