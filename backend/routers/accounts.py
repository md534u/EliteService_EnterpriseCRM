from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from data_manager import db
from models import Account
import pandas as pd
import os

router = APIRouter(prefix="/accounts", tags=["Accounts"])


# =========================
# MODELO PATCH (ACTUALIZACIÓN PARCIAL)
# =========================
class AccountUpdate(BaseModel):
    Nombre_Cuenta: Optional[str] = None
    RFC: Optional[str] = None
    Giro_Empresa: Optional[str] = None
    Domicilio_Fiscal: Optional[str] = None
    Status: Optional[str] = None
    Nombre_Representante: Optional[str] = None
    Telefono: Optional[str] = None
    Email: Optional[str] = None
    Segmento_Tipo: Optional[str] = None
    Propietario_ID: Optional[str] = None


# =========================
# GET ALL
# =========================
@router.get("/", response_model=List[Account])
def get_accounts():
    df = db.get_df("df_cuentas")

    # 🔁 Fallback a CSV físico
    if df.empty:
        print("⚠️ ALERTA: 'df_cuentas' está vacío en memoria. Intentando lectura directa...")
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            csv_path = os.path.join(base_dir, "crm_data", "df_cuentas.csv")

            if os.path.exists(csv_path):
                df = pd.read_csv(csv_path)
                print(f"✅ RECUPERADO: Se cargaron {len(df)} cuentas desde CSV físico.")
            else:
                print(f"❌ No se encontró el archivo CSV en: {csv_path}")
                return []
        except Exception as e:
            print(f"❌ Error leyendo CSV físico: {e}")
            return []

    if df.empty:
        return []

    # =========================
    # 🔐 NORMALIZACIÓN CRÍTICA (ANTI-500)
    # =========================
    columnas_str = [
        "ID",
        "Telefono",
        "RFC",
        "Email",
        "Nombre_Cuenta",
        "Nombre_Representante",
        "Status",
        "Segmento_Tipo",
        "Propietario_ID"
    ]

    for col in columnas_str:
        if col in df.columns:
            df[col] = df[col].astype(str)

    # Reemplazar NaN / "nan" por None real
    df = df.replace(
        to_replace=["nan", "NaN", "None", "<NA>"],
        value=None
    ).replace({float("nan"): None})

    print(f"✅ Enviando {len(df)} cuentas al frontend.")
    return df.to_dict(orient="records")


# =========================
# GET STATS
# =========================
@router.get("/stats")
def get_stats():
    df = db.get_df("df_cuentas")

    if df.empty:
        return {"total": 0, "by_status": {}, "by_segment": {}}

    return {
        "total": int(len(df)),
        "by_status": (
            df["Status"]
            .fillna("Sin Especificar")
            .value_counts()
            .to_dict()
            if "Status" in df.columns else {}
        ),
        "by_segment": (
            df["Segmento_Tipo"]
            .fillna("Sin Especificar")
            .value_counts()
            .to_dict()
            if "Segmento_Tipo" in df.columns else {}
        ),
    }


# =========================
# GET BY ID
# =========================
@router.get("/{id}", response_model=Account)
def get_account(id: str):
    df = db.get_df("df_cuentas")

    if df.empty:
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            csv_path = os.path.join(base_dir, "crm_data", "df_cuentas.csv")
            if os.path.exists(csv_path):
                df = pd.read_csv(csv_path)
        except Exception:
            pass

    if df.empty or "ID" not in df.columns:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    # Normalizar ID
    df["ID"] = df["ID"].astype(str)

    account = df[df["ID"] == str(id)]
    if account.empty:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    # Normalizar salida
    account = account.astype(object).replace(
        to_replace=["nan", "NaN", "<NA>"],
        value=None
    ).replace({float("nan"): None})

    return account.iloc[0].to_dict()


# =========================
# PATCH (ACTUALIZAR CUENTA)
# =========================
@router.patch("/{id}")
def update_account(id: str, payload: AccountUpdate):
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No se enviaron datos para actualizar"
        )

    success = db.update_row(
        df_name="df_cuentas",
        id_col="ID",
        id_val=str(id),
        updates=update_data
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Cuenta no encontrada"
        )

    return {
        "ok": True,
        "message": "Cuenta actualizada correctamente",
        "updated_fields": update_data
    }
