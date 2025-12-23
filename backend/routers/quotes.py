from fastapi import APIRouter, HTTPException, Response
from typing import List
from models import CreateQuoteRequest, Quote
from data_manager import db
from utils.pdf_generator import generate_pdf_bytes
import pandas as pd
import json
import uuid
import os

router = APIRouter(prefix="/quotes", tags=["Quotes"])

@router.get("/", response_model=List[Quote])
def get_quotes(account_id: str = None):
    df = db.get_df('df_cotizaciones')
    if df.empty:
        return []
    
    if account_id:
        df = df[df['ID_Cuenta_FK'] == account_id]
        
    return df.where(pd.notnull(df), None).to_dict(orient='records')

@router.post("/generate")
def generate_quote_pdf(request: CreateQuoteRequest):
    # Calculate totals
    total_mensual = sum(item.TOTAL_MENSUAL for item in request.Items)
    ahorro_total = sum(item.AHORRO_EQ for item in request.Items)
    
    # User info (mocked for now, normally from Auth)
    user_name = "Marcos Victor de la O Cano"
    exec_info = {
        "PUESTO": "Especialista en Servicio Empresarial",
        "TIENDA": "Tienda Monterrey Nuevo León Plaza Nia",
        "MOVIL": "81.1378.5486",
        "EMAIL": "md534u@mx.att.com",
        "GESTIONES": "rm-Gestiones.Especiales@mx.att.com"
    }

    # Generate PDF
    pdf_bytes = generate_pdf_bytes(
        request.Items,
        request.Nombre_Cliente,
        request.Representante,
        request.Vigencia,
        total_mensual,
        ahorro_total,
        exec_info,
        user_name
    )
    
    # Save Metadata to DB
    # Determine Version
    version = "1"
    if request.ID_Oportunidad_FK:
        df_cots = db.get_df('df_cotizaciones')
        if not df_cots.empty:
            existing = df_cots[df_cots['ID_Oportunidad_FK'] == request.ID_Oportunidad_FK]
            if not existing.empty:
                try:
                    max_v = pd.to_numeric(existing['Version'], errors='coerce').fillna(0).max()
                    version = str(int(max_v) + 1)
                except: pass

    quote_id = str(uuid.uuid4())[:8]
    # Serialize items
    # Convert Pydantic models to dicts first
    items_dicts = [item.dict() for item in request.Items]
    items_json = json.dumps(items_dicts)
    
    new_quote = {
        'ID': quote_id,
        'ID_Oportunidad_FK': request.ID_Oportunidad_FK or "",
        'ID_Cuenta_FK': request.ID_Cuenta_FK or "",
        'Nombre_Cliente': request.Nombre_Cliente,
        'Fecha_Emision': request.Fecha_Emision,
        'Vigencia': request.Vigencia,
        'Version': version,
        'Total_Mensual': total_mensual,
        'Ahorro_Total': ahorro_total,
        'Items_JSON': items_json,
        'Ruta_PDF': f"quotes/{quote_id}.pdf", # Placeholder path
        'Usuario': user_name
    }
    
    db.add_row('df_cotizaciones', new_quote)
    
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=Cotizacion_{request.Nombre_Cliente}_{version}.pdf"})
