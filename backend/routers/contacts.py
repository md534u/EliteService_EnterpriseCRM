from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import os
import uuid

router = APIRouter(prefix="/contacts", tags=["Contacts"])

# --- Modelo de Datos (Pydantic) ---
class ContactModel(BaseModel):
    # Campos opcionales para permitir flexibilidad
    ID: Optional[str] = None
    Nombre: str
    
    # Aceptamos variantes para Apellido
    Apellido_Paterno: Optional[str] = None
    Apellido: Optional[str] = None 
    
    # Aceptamos variantes para Email
    Email: Optional[str] = None
    Correo: Optional[str] = None
    
    Telefono: Optional[str] = None
    Puesto: Optional[str] = None
    Departamento: Optional[str] = None
    
    # EL FIX DE RAÍZ: Aceptamos cualquiera de los dos nombres para el ID de cuenta
    Account_ID: Optional[str] = None
    ID_Cuenta_FK: Optional[str] = None

# --- Helpers para CSV ---
def get_csv_path():
    # Ajusta la ruta según tu estructura de carpetas
    # Subimos 3 niveles: routers -> backend -> BOS
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    return os.path.join(base_dir, "crm_data", "contacts.csv")

def load_contacts():
    path = get_csv_path()
    if not os.path.exists(path):
        return pd.DataFrame(columns=["ID","ID_Cuenta_FK","Nombre_Completo","Nombre","Apellido_Paterno","Telefono","Email","Rol","Puesto","Account_ID"])
    # Leemos todo como string para evitar problemas de tipos (float vs int)
    return pd.read_csv(path, dtype=str).fillna("")

def save_contacts(df):
    path = get_csv_path()
    df.to_csv(path, index=False)

# --- Endpoints ---

@router.get("/")
def get_all_contacts():
    df = load_contacts()
    return df.to_dict(orient="records")

@router.get("/by-account/{account_id}")
def get_contacts_by_account(account_id: str):
    df = load_contacts()
    if df.empty:
        return []
    
    # Filtramos buscando en la columna ESTÁNDAR (ID_Cuenta_FK)
    # Convertimos a string para asegurar comparación correcta
    filtered = df[df["ID_Cuenta_FK"].astype(str) == str(account_id)]
    return filtered.to_dict(orient="records")

@router.post("/")
def create_contact(contact: ContactModel):
    df = load_contacts()
    
    # 1. LÓGICA DE UNIFICACIÓN (El "Arreglo de Raíz")
    # Usamos Account_ID si viene, si no, usamos ID_Cuenta_FK
    final_account_id = contact.Account_ID or contact.ID_Cuenta_FK
    
    # Unificamos Apellido y Email
    final_apellido = contact.Apellido_Paterno or contact.Apellido or ""
    final_email = contact.Email or contact.Correo or ""
    
    # 2. Crear el objeto con las columnas EXACTAS del CSV
    new_row_data = {
        "ID": str(uuid.uuid4()), # Generamos ID único
        "ID_Cuenta_FK": final_account_id, # Guardamos en la columna correcta para que el filtro funcione
        "Nombre_Completo": f"{contact.Nombre} {final_apellido}".strip(),
        "Nombre": contact.Nombre,
        "Apellido_Paterno": final_apellido,
        "Telefono": contact.Telefono,
        "Email": final_email,
        "Rol": contact.Puesto, # Mapeamos Puesto a Rol si es necesario
        "Puesto": contact.Puesto,
        "Account_ID": final_account_id # Guardamos también aquí por redundancia/compatibilidad
    }
    
    # 3. Guardar
    df = pd.concat([df, pd.DataFrame([new_row_data])], ignore_index=True)
    save_contacts(df)
    
    return new_row_data

@router.delete("/{contact_id}")
def delete_contact(contact_id: str):
    df = load_contacts()
    
    # Verificar si el ID existe (convertimos a string para asegurar coincidencia)
    if df.empty or contact_id not in df["ID"].astype(str).values:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    
    # Filtrar el DataFrame para quedarse con todo MENOS el contacto a borrar
    df = df[df["ID"].astype(str) != contact_id]
    save_contacts(df)
    
    return {"message": "Contacto eliminado correctamente", "id": contact_id}