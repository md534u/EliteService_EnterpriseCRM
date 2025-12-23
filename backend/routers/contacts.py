from fastapi import APIRouter, HTTPException
from typing import List
from models import Contact
from data_manager import db
import pandas as pd

router = APIRouter(prefix="/contacts", tags=["Contacts"])

@router.get("/", response_model=List[Contact])
def get_contacts(account_id: str = None):
    df = db.get_df('df_contactos')
    if df.empty:
        return []
    
    if account_id:
        df = df[df['ID_Cuenta_FK'] == account_id]
        
    return df.where(pd.notnull(df), None).to_dict(orient='records')

@router.post("/", response_model=Contact)
def create_contact(contact: Contact):
    # If ID is not provided or wants auto-gen (though Pydantic model has ID required)
    # The frontend usually sends blank ID or we handle it. 
    # Let's assume frontend sends 0 or we overwrite it.
    new_id = db.get_next_id('df_contactos')
    contact.ID = new_id
    db.add_row('df_contactos', contact.dict())
    return contact

@router.put("/{contact_id}", response_model=Contact)
def update_contact(contact_id: str, contact: Contact):
    success = db.update_row('df_contactos', 'ID', contact_id, contact.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact
