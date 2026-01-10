from fastapi import APIRouter, HTTPException
from datetime import datetime
import pandas as pd
from data_manager import db
from typing import List

router = APIRouter(prefix="/leads", tags=["Leads"])

# --- ENDPOINT FALTANTE: Obtener todos los leads ---
@router.get("/")
def get_leads():
    df = db.get_df("df_leads")
    if df.empty:
        return []
    return df.to_dict(orient="records")

# --- ENDPOINT EXISTENTE: Crear lead (POST /leads/) ---
@router.post("/")
def create_lead(data: dict):
    # Generar folio si no viene
    if not data.get("Folio"):
        data["Folio"] = f"PROSP-{datetime.now().strftime('%f')}"
    db.add_row("df_leads", data)
    return data

# --- ENDPOINT EXISTENTE: Convertir (POST /leads/convert/{folio}) ---
@router.post("/convert/{folio}")
def convert_lead(folio: str):
    df_leads = db.get_df("df_leads")
    lead_df = df_leads[df_leads["Folio"] == folio]
    
    if lead_df.empty:
        raise HTTPException(status_code=404, detail="Lead no encontrado")

    l = lead_df.iloc[0]
    acc_id = db.get_next_id("df_cuentas")
    con_id = db.get_next_id("df_contactos")

    nombre_completo = " ".join(str(x) for x in [l["Nombre"], l["Segundo_Nombre"], l["Apellido_Paterno"], l["Apellido_Materno"]] if x).strip()
    
    nombre_cuenta = l["Razon_Social"] if l["Segmento"] == "Persona Moral" else nombre_completo
    rfc = l["RFC_Empresa"] if l["Segmento"] == "Persona Moral" else l["RFC"]
    domicilio = f"{l['Calle']} {l['No_Exterior']}, {l['Colonia']}, {l['Municipio']}, {l['Estado']}"

    db.add_row("df_cuentas", {
        "ID": acc_id,
        "Nombre_Cuenta": nombre_cuenta,
        "RFC": rfc,
        "Giro_Empresa": l["Giro"],
        "Segmento_Tipo": l["Segmento"],
        "Domicilio_Fiscal": domicilio,
        "Status": "ACTIVO",
        "FechaAlta": datetime.now().strftime("%Y-%m-%d"),
        "Nombre_Representante": nombre_completo,
        "Telefono": l["Telefono"],
        "Email": l["Email_Facturacion"]
    })

    db.add_row("df_contactos", {
        "ID": con_id,
        "ID_Cuenta_FK": acc_id,
        "Nombre_Completo": nombre_completo,
        "Nombre": l["Nombre"],
        "Apellido_Paterno": l["Apellido_Paterno"],
        "Telefono": l["Telefono"],
        "Email": l["Email_Facturacion"],
        "Rol": "Representante Legal"
    })

    db.update_row("df_leads", "Folio", folio, {"Estado_CRM": "CONVERTIDO"})
    return {"message": "Conversión exitosa", "account_id": acc_id}