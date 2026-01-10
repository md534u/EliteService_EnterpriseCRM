from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import sys
import os

# Asegurar que encontramos data_manager subiendo niveles
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from data_manager import db
except ImportError:
    db = None

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# --- Modelo de Datos ---
class NotificationModel(BaseModel):
    ID: Optional[str] = None
    Usuario_Destino: str
    Titulo: str
    Mensaje: str
    Tipo: Optional[str] = "Info"  # Info, Success, Warning, Error
    Leido: Optional[str] = "False"
    Fecha: Optional[str] = None
    Link: Optional[str] = None

# --- Función Helper (Para usar desde otros routers) ---
def send_notification(usuario: str, titulo: str, mensaje: str, tipo: Optional[str] = "Info", link: Optional[str] = None):
    """
    Crea una notificación en el sistema (df_notificaciones.csv).
    Retorna True si se guardó correctamente.
    """
    try:
        if db is None:
            return False

        new_notif = {
            "ID": str(uuid.uuid4()),
            "Usuario_Destino": usuario,
            "Titulo": titulo,
            "Mensaje": mensaje,
            "Tipo": tipo,
            "Leido": "False",
            "Fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Link": link if link else ""
        }
        # db.add_row se encarga de crear el CSV si no existe
        db.add_row("df_notificaciones", new_notif)
        return True
    except Exception as e:
        print(f"❌ Error enviando notificación a {usuario}: {e}")
        return False

# --- Endpoints ---

@router.get("/", response_model=List[NotificationModel])
def get_notifications(user: Optional[str] = None, unread_only: bool = False):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")

    df = db.get_df("df_notificaciones")
    if df.empty:
        return []
    
    # Filtros
    if user:
        df = df[df["Usuario_Destino"] == user]
    
    if unread_only:
        # Convertimos a string para asegurar comparación ("True"/"False")
        df = df[df["Leido"].astype(str) == "False"]
        
    # Ordenar por fecha descendente (más recientes primero)
    if "Fecha" in df.columns:
        df = df.sort_values(by="Fecha", ascending=False)
        
    return df.replace({float("nan"): None}).to_dict(orient="records")

@router.post("/")
def create_notification_endpoint(notif: NotificationModel):
    success = send_notification(notif.Usuario_Destino, notif.Titulo, notif.Mensaje, notif.Tipo, notif.Link)
    if not success:
        raise HTTPException(status_code=500, detail="Error al crear notificación")
    return {"message": "Notificación enviada"}

@router.patch("/{id}/read")
def mark_as_read(id: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")

    success = db.update_row("df_notificaciones", "ID", id, {"Leido": "True"})
    if not success:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    return {"message": "Marcada como leída"}