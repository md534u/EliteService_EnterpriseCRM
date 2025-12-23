from fastapi import APIRouter, HTTPException
from typing import List
from models import Service
from data_manager import db
import pandas as pd
import uuid

router = APIRouter(prefix="/services", tags=["Services"])

@router.get("/", response_model=List[Service])
def get_services(account_id: str = None):
    df = db.get_df('df_servicios')
    if df.empty:
        return []
    
    if account_id:
        df = df[df['ID_Cuenta_FK'] == account_id]
        
    return df.where(pd.notnull(df), None).to_dict(orient='records')

@router.post("/", response_model=Service)
def create_service(service: Service):
    # Auto-generate ID if not present or "0"
    if not service.ID_Servicio or service.ID_Servicio == "string":
        service.ID_Servicio = str(uuid.uuid4())[:8].upper()
        
    db.add_row('df_servicios', service.dict())
    return service

@router.put("/{service_id}", response_model=Service)
def update_service(service_id: str, service: Service):
    success = db.update_row('df_servicios', 'ID_Servicio', service_id, service.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.delete("/{service_id}")
def delete_service(service_id: str):
    df = db.get_df('df_servicios')
    if df.empty:
        raise HTTPException(status_code=404, detail="Service not found")
        
    new_df = df[df['ID_Servicio'] != service_id]
    if len(new_df) == len(df):
        raise HTTPException(status_code=404, detail="Service not found")
        
    db.set_df('df_servicios', new_df)
    return {"message": "Service deleted"}
