from fastapi import APIRouter, HTTPException
from typing import List
from models import Interaction
from data_manager import db
import pandas as pd
import uuid

router = APIRouter(prefix="/interactions", tags=["Interactions"])

@router.get("/", response_model=List[Interaction])
def get_interactions():
    df = db.get_df('df_interacciones')
    if df.empty:
        return []
    return df.where(pd.notnull(df), None).to_dict(orient='records')

@router.post("/", response_model=Interaction)
def create_interaction(interaction: Interaction):
    if not interaction.ID:
        interaction.ID = str(uuid.uuid4())[:10].upper()
        
    db.add_row('df_interacciones', interaction.dict())
    return interaction
