# schemas.py
from typing import Optional, List
from enum import Enum
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict, EmailStr

# ==========================================
# 1. ENUMS (OPCIONES PREDEFINIDAS)
# ==========================================

class RoleEnum(str, Enum):
    ADMIN = "admin"  # Tú (Dueño)
    VA = "va"        # Asistente Virtual

class TaskStatusEnum(str, Enum):
    PENDING = "Pendiente"
    IN_PROGRESS = "En Proceso"
    REVIEW = "En Revisión"
    COMPLETED = "Completada"
    CANCELED = "Cancelada"

# ==========================================
# 2. USUARIOS (TUS ASISTENTES - "COSTOS")
# ==========================================

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    role: RoleEnum = RoleEnum.VA
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    # 💰 DATO SENSIBLE: Cuánto le pagas por hora (Ej: 150.00)
    # Esto se usa para calcular tu costo operativo.
    hourly_rate: float = 0.0

class UserLogin(BaseModel):
    username: str
    password: str

# Lo que ve la propia VA o el público (Sin datos financieros)
class UserResponse(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Lo que ves TÚ como Admin (Con datos financieros)
class UserAdminResponse(UserResponse):
    hourly_rate: float  # Solo tú ves cuánto gana cada una
    model_config = ConfigDict(from_attributes=True)

# Token de seguridad
class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str

# ==========================================
# 3. CLIENTES (INGRESOS FIJOS)
# ==========================================

class ClientBase(BaseModel):
    company_name: str
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    
    # Info operativa: ¿Qué paquete compró? (Ej: "Paquete 20h Admin")
    package_name: Optional[str] = "Personalizado"

# Para crear un cliente nuevo
class ClientCreate(ClientBase):
    # 💰 DATO SENSIBLE: Cuánto te paga el cliente al mes (Ej: 10,500)
    monthly_retainer: float = 0.0
    billing_day: int = 1  # Día de corte
    assigned_va_id: Optional[int] = None

# VISTA PARA LA VA (CENSURADA)
# La VA necesita ver quién es el cliente para trabajar, 
# pero NO debe saber cuánto paga.
class ClientResponseVA(ClientBase):
    id: int
    assigned_va_id: Optional[int]
    
    model_config = ConfigDict(from_attributes=True)

# VISTA PARA EL ADMIN (COMPLETA)
# Tú ves cuánto paga para calcular rentabilidad
class ClientResponseAdmin(ClientResponseVA):
    monthly_retainer: float
    billing_day: int
    
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 4. TAREAS (EL TRABAJO DIARIO)
# ==========================================

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: TaskStatusEnum = TaskStatusEnum.PENDING
    priority: str = "Media" # Alta, Media, Baja

class TaskCreate(TaskBase):
    client_id: int

class TaskResponse(TaskBase):
    id: int
    client_id: int
    assigned_va_id: Optional[int] # Quién la completó
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 5. TIME LOGS (REGISTRO DE HORAS - NÓMINA)
# ==========================================
# Esto es lo que permite pagarle a la VA por hora variable
# mientras cobras fijo al cliente.

class TimeLogBase(BaseModel):
    minutes_spent: int  # Ej: 45 minutos
    description: str    # "Redacción de correo mensual"
    date_logged: date   # Cuándo se hizo

class TimeLogCreate(TimeLogBase):
    task_id: Optional[int] = None
    client_id: int # Obligatorio: ¿A qué cliente se le carga el tiempo?

class TimeLogResponse(TimeLogBase):
    id: int
    va_id: int # Quién trabajó
    
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 6. DASHBOARD FINANCIERO (SOLO LECTURA)
# ==========================================
# Esquema para el reporte de rentabilidad

class ProfitabilityReport(BaseModel):
    cliente: str
    ingreso_fijo: float      # $10,500
    costo_nomina: float      # $2,000 (Horas VA * Tarifa VA)
    horas_consumidas: float  # 20.5 Horas
    utilidad_neta: float     # $8,500 (Tu ganancia)
    margen_porcentaje: float # 81%