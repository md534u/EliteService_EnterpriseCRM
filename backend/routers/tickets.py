from fastapi import APIRouter, HTTPException, Form, File, UploadFile, Request
from fastapi.responses import FileResponse
from typing import List, Optional
from models import Requirement, Movement
from data_manager import db
import pandas as pd
from datetime import datetime
import uuid
import shutil
import os
from pathlib import Path
import random

# --- IMPORTAR NOTIFICACIONES ---
try:
    from .notifications import send_notification
except ImportError:
    def send_notification(*args, **kwargs): pass # Fallback seguro

router = APIRouter(prefix="/tickets", tags=["Tickets"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Helper para normalizar IDs y evitar desajustes de tipo (str vs float)
def normalize_id(val):
    try:
        if pd.isna(val): return ""
        return str(int(float(val)))
    except (ValueError, TypeError):
        return str(val)

@router.get("/", response_model=List[Requirement])
def get_tickets(status_list: Optional[str] = None, agent: Optional[str] = None):
    df = db.get_df('df_tickets')
    if df.empty:
        return []
    
    if status_list:
        statuses = status_list.split(',')
        df = df[df['Estado'].isin(statuses)]

    if agent:
        df = df[df['Agente'] == agent]
        
    # --- ENRIQUECIMIENTO: Unir con Cuentas para obtener Representante ---
    try:
        df_acc = db.get_df('df_cuentas')
        
        # Fallback: Cargar CSV si el DataFrame en memoria está vacío (igual que en create_ticket)
        if df_acc.empty:
            try:
                base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                csv_path = os.path.join(base_dir, "crm_data", "df_cuentas.csv")
                if os.path.exists(csv_path):
                    df_acc = pd.read_csv(csv_path)
            except Exception:
                pass

        if not df_acc.empty and 'Cuenta_ID' in df.columns:
            # Asegurar tipos string para el merge
            df['temp_join_id'] = df['Cuenta_ID'].apply(normalize_id)
            df_acc['temp_id'] = df_acc['ID'].apply(normalize_id)
            
            # Merge para traer Nombre_Representante
            cols_to_merge = ['temp_id']
            if 'Nombre_Representante' in df_acc.columns:
                cols_to_merge.append('Nombre_Representante')
            if 'Nombre_Cuenta' in df_acc.columns:
                cols_to_merge.append('Nombre_Cuenta')

            if len(cols_to_merge) > 1:
                df = df.merge(
                    df_acc[cols_to_merge], 
                    left_on='temp_join_id', 
                    right_on='temp_id', 
                    how='left',
                    suffixes=('', '_acc')
                )
                
                # Rellenar Nombre_Cuenta si falta o es nulo usando el maestro de cuentas
                if 'Nombre_Cuenta_acc' in df.columns:
                    if 'Nombre_Cuenta' not in df.columns:
                        df['Nombre_Cuenta'] = df['Nombre_Cuenta_acc']
                    else:
                        df['Nombre_Cuenta'] = df['Nombre_Cuenta'].fillna(df['Nombre_Cuenta_acc'])
                    df.drop(columns=['Nombre_Cuenta_acc'], inplace=True)

                # Rellenar Nombre_Representante si falta (Corrección para "Sin Contacto")
                if 'Nombre_Representante_acc' in df.columns:
                    if 'Nombre_Representante' not in df.columns:
                        df['Nombre_Representante'] = df['Nombre_Representante_acc']
                    else:
                        df['Nombre_Representante'] = df['Nombre_Representante'].fillna(df['Nombre_Representante_acc'])
                    df.drop(columns=['Nombre_Representante_acc'], inplace=True)

            df.drop(columns=['temp_join_id', 'temp_id'], inplace=True, errors='ignore')
    except Exception as e:
        print(f"Advertencia al unir tickets con cuentas: {e}")

    return df.replace({float('nan'): None}).to_dict(orient='records')

# Función auxiliar para generar el folio
def generar_folio_id(tipo: str) -> str:
    prefijo = "INC" if tipo == "Incidencia" else "REQ"
    aleatorio = str(random.randint(0, 999999)).zfill(6)
    return f"{prefijo}{aleatorio}"

@router.post("/", response_model=Requirement)
async def create_ticket(
    ID: Optional[str] = Form(None),
    Titulo: str = Form(...),
    Notas: str = Form(...),
    Prioridad: str = Form(...),
    Estado: str = Form(...),
    Cuenta_ID: str = Form(...),
    Tipo1: str = Form(...),
    Fecha: str = Form(...),
    Agente: Optional[str] = Form(None),
    Contacto: Optional[str] = Form(None),
    Usuario: Optional[str] = Form(None),
    Tipo2: Optional[str] = Form(None),
    Tipo3: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    try:
        nuevo_folio = generar_folio_id(Tipo1)

        agente_final = Agente if Agente and Agente.strip() else "Sin Asignar"

        ticket_data = {
            "ID": nuevo_folio,
            "Titulo": Titulo,
            "Notas": Notas,
            "Prioridad": Prioridad,
            "Estado": Estado,
            "Cuenta_ID": Cuenta_ID,
            "Tipo1": Tipo1,
            "Fecha": Fecha,
            "Agente": agente_final,
            "Contacto": Contacto,
            "Tipo2": Tipo2,
            "Tipo3": Tipo3,
            "Nombre_Cuenta": None,
            "Adjunto_Ruta": None,
            "Adjunto_Nombre": None
        }

        # --- VALIDACIÓN DE CUENTA ---
        if Cuenta_ID:
            df_acc = db.get_df('df_cuentas')
            
            if df_acc.empty:
                try:
                    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                    csv_path = os.path.join(base_dir, "crm_data", "df_cuentas.csv")
                    if os.path.exists(csv_path):
                        df_acc = pd.read_csv(csv_path)
                except Exception:
                    pass

            # Normalizar IDs para comparación robusta
            cuenta_id_norm = normalize_id(Cuenta_ID)
            df_acc['id_norm'] = df_acc['ID'].apply(normalize_id)

            if df_acc.empty or cuenta_id_norm not in df_acc['id_norm'].values:
                raise HTTPException(status_code=400, detail="La cuenta especificada no existe.")
            
            ticket_data['Nombre_Cuenta'] = (
                df_acc[df_acc['id_norm'] == cuenta_id_norm]
                .iloc[0]['Nombre_Cuenta']
            )

        # --- MANEJO DE ARCHIVO ---
        if file:
            if file.filename is None:
                raise HTTPException(status_code=400, detail="El archivo no tiene nombre válido")

            file_ext = os.path.splitext(file.filename)[1]
            safe_filename = f"{nuevo_folio}{file_ext}"
            file_path = UPLOAD_DIR / safe_filename
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            ticket_data["Adjunto_Ruta"] = str(file_path)
            ticket_data["Adjunto_Nombre"] = file.filename

        db.add_row('df_tickets', ticket_data)

        # --- ENVIAR NOTIFICACIÓN AL AGENTE ---
        if agente_final and agente_final != "Sin Asignar":
            send_notification(
                usuario=agente_final,
                titulo="🎟️ Nuevo Ticket Asignado",
                mensaje=f"Se te ha asignado el ticket {nuevo_folio}: {Titulo}",
                tipo="Info",
                link=f"/tickets/{nuevo_folio}"
            )

        usuario_creador = Usuario if Usuario else "Sistema"
        
        mov = {
            'ID': str(uuid.uuid4()),
            'ID_Ticket': nuevo_folio,
            'Usuario': usuario_creador,
            'Nota': f"Creación del Ticket. Tipo: {Tipo1}/{Tipo2}/{Tipo3}. Nota Inicial: {Notas}",
            'Fecha': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'Nuevo_Estado': Estado
        }
        db.add_row('df_movements', mov)
        
        return ticket_data

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando el ticket: {str(e)}")

@router.get("/{ticket_id}/download")
async def download_ticket_attachment(ticket_id: str):
    df = db.get_df('df_tickets')
    if df.empty:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    ticket_row = df[df['ID'] == ticket_id]
    if ticket_row.empty:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    ticket = ticket_row.iloc[0]
    file_path_str = ticket.get('Adjunto_Ruta')
    
    if not file_path_str or pd.isna(file_path_str):
        raise HTTPException(status_code=404, detail="Este ticket no tiene archivos adjuntos")
        
    file_path = Path(file_path_str)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="El archivo adjunto no se encuentra en el servidor")
        
    filename = ticket.get('Adjunto_Nombre') or file_path.name
    return FileResponse(path=file_path, filename=filename)

@router.get("/by-account/{account_id}", response_model=List[Requirement])
def get_tickets_by_account(account_id: str):
    df = db.get_df('df_tickets')
    if df.empty:
        return []
    
    df = df[df['Cuenta_ID'].astype(str) == str(account_id)]
    return df.replace({float('nan'): None}).to_dict(orient='records')

@router.put("/{ticket_id}")
async def update_ticket(ticket_id: str, request: Request):
    try:
        data = await request.json()
        if "ID" in data:
            del data["ID"]
            
        usuario_log = data.pop("Usuario", "Sistema")
        
        nuevo_estado = data.get("Estado")
        if nuevo_estado and ("Cerrado" in nuevo_estado or "Resuelto" in nuevo_estado):
            agente_check = data.get("Agente")
            if not agente_check:
                df_temp = db.get_df('df_tickets')
                row = df_temp[df_temp['ID'] == ticket_id]
                if not row.empty:
                    agente_check = row.iloc[0].get('Agente')
            
            if not agente_check or agente_check == "Sin Asignar":
                raise HTTPException(status_code=400, detail="No se puede cerrar el ticket sin un Agente asignado.")

        detalles_cambios = ", ".join([f"{k}: {v}" for k, v in data.items()])
        nota_movimiento = f"Actualización de Ticket. Cambios: {detalles_cambios}"
            
        success = db.update_row('df_tickets', 'ID', ticket_id, data)
        if not success:
            raise HTTPException(status_code=404, detail="Ticket no encontrado")
            
        mov = {
            'ID': str(uuid.uuid4()),
            'ID_Ticket': ticket_id,
            'Usuario': usuario_log,
            'Nota': nota_movimiento,
            'Fecha': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'Nuevo_Estado': data.get("Estado", "")
        }
        db.add_row('df_movements', mov)
            
        return {"status": "success", "message": "Ticket actualizado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error actualizando ticket: {str(e)}")

@router.get("/{ticket_id}", response_model=Requirement)
def get_ticket(ticket_id: str):
    df = db.get_df('df_tickets')
    if df.empty:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    # Copia segura para evitar warnings al modificar
    ticket_df = df[df['ID'] == ticket_id].copy()
    
    if ticket_df.empty:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
        
    # --- ENRIQUECIMIENTO DE DATOS ---
    try:
        row = ticket_df.iloc[0]
        # Si faltan datos en el ticket, intentamos recuperarlos de la cuenta
        if pd.isna(row.get('Nombre_Cuenta')) or pd.isna(row.get('Contacto')):
            df_acc = db.get_df('df_cuentas')
            
            if df_acc.empty:
                try:
                    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                    csv_path = os.path.join(base_dir, "crm_data", "df_cuentas.csv")
                    if os.path.exists(csv_path):
                        df_acc = pd.read_csv(csv_path)
                except:
                    pass

            if not df_acc.empty:
                cuenta_id = normalize_id(row.get('Cuenta_ID'))
                df_acc['id_norm'] = df_acc['ID'].apply(normalize_id)
                
                match = df_acc[df_acc['id_norm'] == cuenta_id]
                
                if not match.empty:
                    datos = match.iloc[0]
                    # Rellenamos solo si es necesario
                    if pd.isna(row.get('Nombre_Cuenta')):
                        ticket_df.loc[ticket_df.index[0], 'Nombre_Cuenta'] = datos.get('Nombre_Cuenta')
                    
                    if pd.isna(row.get('Contacto')):
                        ticket_df.loc[ticket_df.index[0], 'Contacto'] = datos.get('Nombre_Representante')
    except Exception as e:
        print(f"Advertencia al enriquecer ticket individual: {e}")

    # Convertimos a diccionario reemplazando NaN por None
    return ticket_df.replace({float('nan'): None}).iloc[0].to_dict()

@router.get("/{ticket_id}/movements", response_model=List[Movement])
def get_ticket_movements(ticket_id: str):
    df = db.get_df('df_movements')
    if df.empty:
        return []
        
    df = df[df['ID_Ticket'] == ticket_id].sort_values(by='Fecha', ascending=False)
    return df.replace({float('nan'): None}).to_dict(orient='records')

@router.post("/{ticket_id}/movements", response_model=Movement)
def add_movement(ticket_id: str, movement: Movement):
    movement.ID_Ticket = ticket_id
    if not movement.Fecha:
        movement.Fecha = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
    db.add_row('df_movements', movement.model_dump())
    
    if movement.Nuevo_Estado:
        db.update_row('df_tickets', 'ID', ticket_id, {'Estado': movement.Nuevo_Estado})
        
    return movement