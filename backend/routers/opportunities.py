from fastapi import APIRouter, HTTPException
from typing import List, Optional, Any, Dict # Agregamos Any y Dict
from pydantic import BaseModel
from models import Opportunity
from data_manager import db
from utils.stage_rules import PROBABILIDAD_POR_ETAPA, ETAPAS_VALIDAS
from utils.folio_generator import generar_folio_oportunidad
from datetime import datetime
import pandas as pd
import uuid
import traceback

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

class StageUpdate(BaseModel):
    Etapa: str
    Motivo_Perdida: Optional[str] = None
    Submotivo_Perdida: Optional[str] = None

# --- CAMBIO IMPORTANTE: Quitamos response_model=List[Opportunity] ---
# Esto evita que el servidor se rompa si faltan campos o hay nulos.
@router.get("/")
def get_opportunities(account_id: Optional[str] = None):
    try:
        df = db.get_df("df_ops")
        
        # Validación si el DF no carga
        if df is None or df.empty:
            return []

        if account_id:
            # Convertimos a string para comparar seguramente
            df = df[df["ID_Cuenta_FK"].astype(str) == str(account_id)]

        # Limpieza de datos (NaN -> None) para JSON
        df = df.astype(object).where(pd.notnull(df), None) # type: ignore

        # Retornamos la lista de diccionarios directamente
        return df.to_dict(orient="records")

    except Exception as e:
        print(f"❌ ERROR EN GET /opportunities: {e}")
        traceback.print_exc()
        return []

# Agregar esto a opportunities.py para ver el Detalle de una sola oportunidad
# --- AGREGAR AL FINAL DE opportunities.py ---

@router.get("/{op_id}")
def get_opportunity_detail(op_id: str):
    try:
        # 1. Obtener el DataFrame
        df = db.get_df("df_ops")
        
        # 2. Filtrar por ID (convertimos a string para asegurar coincidencia)
        # Nota: Usamos astype(str) para que no falle si en Excel es número
        row = df[df["ID"].astype(str) == str(op_id)]
        
        # 3. Validar si existe
        if row.empty:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        
        # 4. Limpieza de Nulos (Vital para evitar Error 500)
        # Convertimos NaN a None para que JSON no se rompa
        row = row.astype(object).where(pd.notnull(row), None) # type: ignore
        
        # 5. Retornar el primer resultado como diccionario
        return row.iloc[0].to_dict()

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ ERROR GET DETAIL: {e}")
        # En caso de error interno, retornamos 404 o 500 según prefieras
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Opportunity)
def create_opportunity(op: Opportunity):
    df_ops = db.get_df("df_ops")
    op.Folio = generar_folio_oportunidad(df_ops)
    db.add_row("df_ops", op.dict())
    return op

@router.put("/{op_id}", response_model=Opportunity)
def update_opportunity(op_id: str, op: Opportunity):
    data = op.dict(exclude_unset=True)
    data.pop("Folio", None)
    success = db.update_row("df_ops", "ID", op_id, data)
    if not success:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return op

@router.patch("/{op_id}/stage")
def update_opportunity_stage(op_id: str, update: StageUpdate):
    df_ops = db.get_df("df_ops")
    row = df_ops[df_ops["ID"] == op_id]

    if row.empty:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    etapa_anterior = row.iloc[0]["Etapa"]

    if update.Etapa not in ETAPAS_VALIDAS:
        raise HTTPException(status_code=400, detail="Etapa inválida")

    if update.Etapa == "Oportunidad Perdida":
        if not update.Motivo_Perdida or not update.Submotivo_Perdida:
            raise HTTPException(
                status_code=400,
                detail="Motivo_Perdida y Submotivo_Perdida son obligatorios"
            )

    if etapa_anterior == update.Etapa:
        return {
            "ID": op_id,
            "Etapa": update.Etapa,
            "Probabilidad": PROBABILIDAD_POR_ETAPA.get(update.Etapa, 0)
        }

    payload = {
        "Etapa": update.Etapa,
        "Probabilidad": PROBABILIDAD_POR_ETAPA.get(update.Etapa, 0)
    }

    if update.Etapa == "Oportunidad Perdida":
        payload["Motivo_Perdida"] = update.Motivo_Perdida
        payload["Submotivo_Perdida"] = update.Submotivo_Perdida

    success = db.update_row("df_ops", "ID", op_id, payload)
    if not success:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Historial
    df_hist = db.get_df("df_ops_historial")
    if df_hist is None or df_hist.empty:
         df_hist = pd.DataFrame(columns=["ID_Evento", "ID_Oportunidad", "Etapa_Anterior", "Etapa_Nueva", "Probabilidad", "Fecha_Cambio"])

    evento = {
        "ID_Evento": str(uuid.uuid4()),
        "ID_Oportunidad": op_id,
        "Etapa_Anterior": etapa_anterior,
        "Etapa_Nueva": update.Etapa,
        "Probabilidad": PROBABILIDAD_POR_ETAPA.get(update.Etapa, 0),
        "Fecha_Cambio": datetime.now().isoformat()
    }

    new_row_df = pd.DataFrame([evento])
    df_hist = pd.concat([df_hist, new_row_df], ignore_index=True)
    db.data["df_ops_historial"] = df_hist
    db.save_data("df_ops_historial")

    return {
        "ID": op_id,
        "Etapa": update.Etapa,
        "Probabilidad": PROBABILIDAD_POR_ETAPA.get(update.Etapa, 0)
    }