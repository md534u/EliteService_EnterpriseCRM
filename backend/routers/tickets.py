from fastapi import APIRouter, HTTPException
from typing import List
from models import Requirement, Movement
from data_manager import db
import pandas as pd
from datetime import datetime

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("/", response_model=List[Requirement])
def get_tickets(status_list: str = None, agent: str = None):
    df = db.get_df('requerimientos_df')
    if df.empty:
        return []
    
    if status_list:
        statuses = status_list.split(',')
        df = df[df['Estado'].isin(statuses)]
        
    if agent:
        df = df[df['Agente'] == agent]
        
    return df.where(pd.notnull(df), None).to_dict(orient='records')

@router.post("/", response_model=Requirement)
def create_ticket(ticket: Requirement):
    # ID provided by frontend usually (UUID)
    if not ticket.ID:
        raise HTTPException(status_code=400, detail="Ticket ID required")
        
    db.add_row('requerimientos_df', ticket.dict())
    
    # Create initial movement
    mov = {
        'ID_Ticket': ticket.ID,
        'Usuario': ticket.Agente,
        'Nota': f"Creación del Ticket. Tipo: {ticket.Tipo1}/{ticket.Tipo2}/{ticket.Tipo3}. Nota Inicial: {ticket.Notas}",
        'Fecha': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'Nuevo_Estado': ticket.Estado
    }
    db.add_row('movimientos_df', mov)
    
    return ticket

@router.get("/{ticket_id}/movements", response_model=List[Movement])
def get_ticket_movements(ticket_id: str):
    df = db.get_df('movimientos_df')
    if df.empty:
        return []
        
    df = df[df['ID_Ticket'] == ticket_id].sort_values(by='Fecha', ascending=False)
    return df.where(pd.notnull(df), None).to_dict(orient='records')

@router.post("/{ticket_id}/movements", response_model=Movement)
def add_movement(ticket_id: str, movement: Movement):
    movement.ID_Ticket = ticket_id # Ensure link
    if not movement.Fecha:
        movement.Fecha = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
    db.add_row('movimientos_df', movement.dict())
    
    # Update ticket status if changed
    if movement.Nuevo_Estado:
        db.update_row('requerimientos_df', 'ID', ticket_id, {'Estado': movement.Nuevo_Estado})
        
    return movement
