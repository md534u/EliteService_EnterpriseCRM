from fastapi import APIRouter
from data_manager import db
import pandas as pd
from models import SearchResult

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/", response_model=SearchResult)
def search_client(term: str):
    term = str(term).strip()
    
    # 1. Search in Services (Active Clients)
    df_serv = db.get_df('df_servicios')
    if not df_serv.empty:
        col_dn = 'DN' if 'DN' in df_serv.columns else 'Línea_o_Circuito'
        res_serv = df_serv[df_serv[col_dn] == term]
        
        if not res_serv.empty:
            servicio = res_serv.iloc[0]
            cuenta_id = servicio['ID_Cuenta_FK']
            
            df_cuentas = db.get_df('df_cuentas')
            res_cuenta = df_cuentas[df_cuentas['ID'] == cuenta_id]
            
            nombre_cuenta = "Cuenta Desconocida"
            segmento = "Empresarial"
            
            if not res_cuenta.empty:
                cta = res_cuenta.iloc[0]
                nombre_cuenta = cta['Nombre_Cuenta']
                segmento = cta['Segmento_Tipo']
                
            return {
                "tipo": "CLIENTE",
                "nombre": nombre_cuenta,
                "linea_movil": term,
                "ID_Cliente": cuenta_id,
                "ID_Servicio": servicio['ID_Servicio'],
                "Plan": servicio.get('Plan_Contratado', 'N/A'),
                "Estado": servicio.get('Estado_Servicio', 'N/A'),
                "Segmento": segmento
            }

    # 2. Search in Leads
    df_leads = db.get_df('df_leads')
    if not df_leads.empty:
        resultado = df_leads[df_leads['Telefono'] == term]
        if not resultado.empty:
            c = resultado.iloc[0]
            n = c['Razon_Social'] if c.get('Segmento') == "Persona Moral" else f"{c['Nombre']} {c['Apellido_Paterno']}"
            return {
                "tipo": "PROSPECTO",
                "nombre": n,
                "linea_movil": c['Telefono'],
                "ID_Cliente": c['Folio'],
                "Segmento": c['Segmento']
            }
            
    return None
