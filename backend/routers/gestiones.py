import os
import sys
import traceback
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Request

# Ajuste de path para localizar data_manager.py en la carpeta raíz
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from data_manager import db
except ImportError:
    from data_manager import db

# 1. Cambiamos el prefijo y el tag
router = APIRouter(prefix="/gestiones", tags=["Gestiones"])

# Nota: Ya no necesitamos el diccionario de PROBABILIDAD_POR_ETAPA
# porque las gestiones operativas no se basan en % de cierre.

@router.get("/")
def get_gestiones(account_id: Optional[str] = None):
    try:
        # 2. Cambiamos la fuente de datos a 'df_gestiones'
        df = db.get_df("df_gestiones")
        
        if df.empty: return []
        
        # Filtro por cuenta (Manteniendo la compatibilidad con tu esquema FK)
        if account_id:
            # Busca por ID_Cuenta_FK o id_cuenta (por si acaso)
            if "ID_Cuenta_FK" in df.columns:
                df = df[df["ID_Cuenta_FK"].astype(str) == str(account_id)]
            elif "id_cuenta" in df.columns:
                df = df[df["id_cuenta"].astype(str) == str(account_id)]
                
        return df.to_dict(orient="records")
    except Exception as e:
        print(f"Error getting gestiones: {e}")
        return []

@router.post("/")
async def create_gestion(request: Request):
    try:
        data = await request.json()
        
        # 3. Generación de ID y Folio Operativo (GO-)
        # Asegúrate de que 'df_gestiones' esté registrado en tu data_manager o que lo cree automáticamente
        gestion_id = db.get_next_id('df_gestiones')
        
        data['id'] = gestion_id # Usamos minuscula o mayuscula según tu estándar, aquí normalizo a 'id' del Pydantic
        
        # Formato: GO-2026-0001
        data['Folio'] = f"GO-{datetime.now().year}-{gestion_id.zfill(4)}"
        
        # 4. Metadatos Automáticos
        # Usamos created_at en lugar de Fecha_Creacion para ser más modernos, o mantenlo si prefieres
        data['created_at'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Valores por defecto si no vienen del frontend
        if 'etapa' not in data:
            data['etapa'] = 'Solicitud Recibida'
        if 'prioridad' not in data:
            data['prioridad'] = 'Media'
        if 'tipo_gestion' not in data:
            data['tipo_gestion'] = 'Agenda y Reuniones'

        # 5. Guardado en df_gestiones.csv
        db.add_row("df_gestiones", data)
        
        return {"status": "success", "id": gestion_id, "folio": data['Folio']}
        
    except Exception as e:
        print(f"❌ Error en POST /gestiones: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno al guardar gestión: {str(e)}")

@router.put("/{gestion_id}")
async def update_gestion(gestion_id: str, request: Request):
    try:
        data = await request.json()
        
        # 6. Actualización de timestamp
        data['updated_at'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Eliminamos campos que no deberían cambiar o que dan error si se reenvían
        data.pop('id', None)
        data.pop('Folio', None)
        data.pop('created_at', None)

        # 7. Actualizar en CSV
        # Nota: Asegúrate de que la columna ID en tu CSV coincida (puede ser 'id' o 'ID')
        # Aquí asumo que data_manager es flexible o busca 'id'.
        success = db.update_row("df_gestiones", "id", gestion_id, data)
        
        # Fallback por si en el CSV se guardó como 'ID' mayúscula
        if not success:
             success = db.update_row("df_gestiones", "ID", gestion_id, data)

        if not success:
            raise HTTPException(status_code=404, detail="Gestión no encontrada")
            
        return {"status": "updated"}
    except Exception as e:
        print(f"Error updating: {e}")
        raise HTTPException(status_code=500, detail=str(e))