from fastapi import APIRouter, HTTPException
from typing import List
from models import Account
from data_manager import db
import pandas as pd

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.get("/", response_model=List[Account])
def get_accounts():
    df = db.get_df('df_cuentas')
    if df.empty:
        return []
    return df.where(pd.notnull(df), None).to_dict(orient='records')

@router.get("/{account_id}", response_model=Account)
def get_account(account_id: str):
    df = db.get_df('df_cuentas')
    if df.empty:
        raise HTTPException(status_code=404, detail="Account not found")
        
    rows = df[df['ID'] == account_id]
    if rows.empty:
        raise HTTPException(status_code=404, detail="Account not found")
        
    return rows.iloc[0].where(pd.notnull(rows.iloc[0]), None).to_dict()

@router.put("/{account_id}", response_model=Account)
def update_account(account_id: str, account: Account):
    success = db.update_row('df_cuentas', 'ID', account_id, account.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Account not found")
    return account
