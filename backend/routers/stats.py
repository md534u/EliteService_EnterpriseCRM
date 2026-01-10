from fastapi import APIRouter
from data_manager import db, DATA_DIR
import pandas as pd
import os

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/")
def get_dashboard_stats():
    # 1. Active Leads
    df_leads = db.get_df('df_leads')
    total_prospectos = 0
    if not df_leads.empty:
        total_prospectos = len(df_leads[df_leads['Estado_CRM'] == 'ACTIVO'])
        
    # 2. Open Tickets
    df_req = db.get_df('requerimientos_df')
    total_tickets = 0
    ESTADOS_CERRADOS = ["Cerrado Sí Procede", "Cerrado No Procede", "Oportunidad Ganada", "Oportunidad Perdida"]
    if not df_req.empty:
        total_tickets = len(df_req[~df_req['Estado'].isin(ESTADOS_CERRADOS)])
        
    # 3. Pipeline Value
    df_ops = db.get_df('df_ops')
    pipeline_val = 0
    grouped_pipeline = []
    if not df_ops.empty:
        df_ops_copy = df_ops.copy()
        df_ops_copy['Cantidad_Lineas'] = pd.to_numeric(df_ops_copy['Cantidad_Lineas'], errors='coerce').fillna(0)
        df_ops_copy['Probabilidad'] = pd.to_numeric(df_ops_copy['Probabilidad'], errors='coerce').fillna(0)
        pipeline_val = (df_ops_copy['Cantidad_Lineas'] * (df_ops_copy['Probabilidad']/100)).sum()
        
        # Group for chart
        if 'Etapa' in df_ops_copy.columns:
            grouped = df_ops_copy.groupby('Etapa')['Cantidad_Lineas'].sum().reset_index()
            grouped_pipeline = grouped.to_dict(orient='records')

    # 4. Lines at Risk (Alerts)
    lines_risk = []
    df_serv = db.get_df('df_servicios')
    if not df_serv.empty:
        df_cuentas = db.get_df('df_cuentas')
        if not df_cuentas.empty:
            df_serv_copy = df_serv.copy()
            # Ensure proper merge keys
            # Assuming ID is string in both
            merged = pd.merge(df_serv_copy, df_cuentas[['ID', 'Nombre_Cuenta']], left_on='ID_Cuenta_FK', right_on='ID', how='left')
            
            from datetime import datetime
            hoy = datetime.now()
            
            for idx, row in merged.iterrows():
                try:
                    if row['Fecha_Vencimiento'] != 'SIN FECHA FIN':
                        fv = datetime.strptime(str(row['Fecha_Vencimiento']), "%Y-%m-%d")
                        dias = (fv - hoy).days
                        if dias <= 90:
                            lines_risk.append({
                                'Nombre_Cuenta': row['Nombre_Cuenta'],
                                'DN': row.get('DN', row.get('Línea_o_Circuito')),
                                'Plan_Contratado': row['Plan_Contratado'],
                                'Fecha_Vencimiento': row['Fecha_Vencimiento'],
                                'Dias_Para_Vencer': dias
                            })
                except:
                    pass

    return {
        "active_leads": total_prospectos,
        "open_tickets": total_tickets,
        "pipeline_value": int(pipeline_val),
        "pipeline_chart": grouped_pipeline,
        "risk_alerts": lines_risk
    }

@router.get("/backups-size")
def get_backups_size():
    backup_dir = os.path.join(DATA_DIR, "backups")
    total_size = 0
    file_count = 0
    files = []

    if os.path.exists(backup_dir):
        for f in os.listdir(backup_dir):
            fp = os.path.join(backup_dir, f)
            if os.path.isfile(fp):
                total_size += os.path.getsize(fp)
                file_count += 1
                files.append(f)  # ✅ AQUÍ ESTÁ LA CLAVE

    return {
        "backup_exists": file_count > 0,
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "file_count": file_count,
        "files": files  # ✅ AHORA SÍ
    }

