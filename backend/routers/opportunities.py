from fastapi import APIRouter, HTTPException
from typing import List
from models import Opportunity
from data_manager import db
import pandas as pd

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

@router.get("/", response_model=List[Opportunity])
def get_opportunities(account_id: str = None):
    df = db.get_df('df_ops')
    if df.empty:
        return []
    
    if account_id:
        df = df[df['ID_Cuenta_FK'] == account_id]
        
    return df.where(pd.notnull(df), None).to_dict(orient='records')

@router.post("/", response_model=Opportunity)
def create_opportunity(op: Opportunity):
    new_id = db.get_next_id('df_ops')
    op.ID = new_id
    db.add_row('df_ops', op.dict())
    return op

@router.put("/{op_id}", response_model=Opportunity)
def update_opportunity(op_id: str, op: Opportunity):
    success = db.update_row('df_ops', 'ID', op_id, op.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return op
