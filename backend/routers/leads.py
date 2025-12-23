from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Lead
from data_manager import db
import pandas as pd
from datetime import datetime

router = APIRouter(prefix="/leads", tags=["Leads"])

@router.get("/", response_model=List[Lead])
def get_leads(status: Optional[str] = None):
    df = db.get_df('df_leads')
    if df.empty:
        return []
    
    if status:
        df = df[df['Estado_CRM'] == status]
    
    # Replace NaN with None for Pydantic
    return df.where(pd.notnull(df), None).to_dict(orient='records')

@router.post("/", response_model=Lead)
def create_lead(lead: Lead):
    df = db.get_df('df_leads')
    # Folio should be provided or generated. For now we assume provided as in original code logic or handled by frontend
    # But if we want auto-generation here:
    if not lead.Folio:
        raise HTTPException(status_code=400, detail="Folio is required")
        
    db.add_row('df_leads', lead.dict())
    return lead

@router.put("/{folio}", response_model=Lead)
def update_lead(folio: str, lead: Lead):
    success = db.update_row('df_leads', 'Folio', folio, lead.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.post("/convert/{folio}")
def convert_lead(folio: str):
    df_leads = db.get_df('df_leads')
    lead_rows = df_leads[df_leads['Folio'] == folio]
    
    if lead_rows.empty:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    l = lead_rows.iloc[0]
    
    # Generate new IDs
    new_acc_id = db.get_next_id('df_cuentas')
    new_con_id = db.get_next_id('df_contactos')
    new_op_id = db.get_next_id('df_ops')
    
    nombre_cta = l['Razon_Social'] if l['Segmento'] == "Persona Moral" else f"{l['Nombre']} {l['Apellido_Paterno']}"
    rfc_cta = l['RFC_Empresa'] if l['Segmento'] == "Persona Moral" else l['RFC']
    
    # Create Account
    db.add_row('df_cuentas', {
        'ID': new_acc_id,
        'Nombre_Cuenta': nombre_cta,
        'RFC': rfc_cta,
        'Giro_Empresa': l.get('Giro', 'N/A'),
        'Domicilio_Fiscal': f"{l['Calle']} {l['No_Exterior']} {l['Colonia']} CP: {l['CP']}",
        'Propietario_ID': 'md534u', # Hardcoded user ID from original code
        'Segmento_Tipo': l['Segmento']
    })
    
    # Create Contact
    db.add_row('df_contactos', {
        'ID': new_con_id,
        'Nombre': l['Nombre'],
        'Apellido_Paterno': l['Apellido_Paterno'],
        'Email': l['Email_Facturacion'],
        'Telefono': l['Telefono'],
        'ID_Cuenta_FK': new_acc_id,
        'Rol': 'Representante Legal'
    })
    
    # Create Opportunity
    db.add_row('df_ops', {
        'ID': new_op_id,
        'Nombre_Op': f"Op Inicial | {nombre_cta}",
        'ID_Cuenta_FK': new_acc_id,
        'Etapa': 'Contacto',
        'Cantidad_Lineas': '10',
        'Fecha_Cierre': (datetime.now() + pd.Timedelta(days=30)).strftime("%Y-%m-%d"),
        'Servicio_Clave': 'Inicial',
        'Probabilidad': 10,
        'Tipo_Op': 'Venta Nueva',
        'Comentarios': 'Creación de oportunidad inicial al convertir prospecto.'
    })
    
    # Update Lead Status
    db.update_row('df_leads', 'Folio', folio, {'Estado_CRM': 'CONVERTIDO'})
    
    return {"message": "Lead converted successfully", "account_id": new_acc_id, "opportunity_id": new_op_id}
