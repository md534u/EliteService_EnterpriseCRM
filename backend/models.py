from typing import Optional, List
from enum import Enum  # <--- NUEVO
from datetime import date # <--- NUEVO
from pydantic import BaseModel, Field, ConfigDict

# --- 1. LEADS (PROSPECTOS) ---
class Lead(BaseModel):
    # Identidad
    Folio: str
    Segmento: Optional[str] = None
    Estado_CRM: Optional[str] = None
    Fecha_Registro: Optional[str] = None

    # Persona
    Nombre: Optional[str] = None
    Segundo_Nombre: Optional[str] = None
    Apellido_Paterno: Optional[str] = None
    Apellido_Materno: Optional[str] = None
    Fecha_Nacimiento: Optional[str] = None

    # Empresa
    Razon_Social: Optional[str] = None
    RFC_Empresa: Optional[str] = None
    Giro: Optional[str] = None

    # Fiscal personal
    RFC: Optional[str] = None

    # Contacto
    Telefono: Optional[str] = None
    Email_Facturacion: Optional[str] = None

    # Dirección
    Calle: Optional[str] = None
    No_Exterior: Optional[str] = None
    No_Interno: Optional[str] = None
    Colonia: Optional[str] = None
    Municipio: Optional[str] = None
    Estado: Optional[str] = None
    CP: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --- 2. CUENTAS (EMPRESAS) ---
class Account(BaseModel):
    ID: str
    Nombre_Cuenta: Optional[str] = None
    RFC: Optional[str] = None
    Giro: Optional[str] = Field(None, alias="Giro_Empresa") # Simplificado a Giro
    Domicilio: Optional[str] = Field(None, alias="Domicilio_Fiscal")
    
    ID_Propietario: Optional[str] = Field(None, alias="Propietario_ID") # Estandarizado ID_
    Segmento: Optional[str] = Field(None, alias="Segmento_Tipo")        # Simplificado
    
    Nombre_Representante: Optional[str] = None
    Telefono: Optional[str] = None
    Email: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


# --- 3. CONTACTOS (PERSONAS) ---
class Contact(BaseModel):
    ID: str
    Nombre_Contacto: Optional[str] = Field(None, alias="Nombre") # Estandarizado
    Apellido: Optional[str] = Field(None, alias="Apellido_Paterno")
    Email: Optional[str] = None
    Telefono: Optional[str] = None
    
    ID_Cuenta: Optional[str] = Field(None, alias="ID_Cuenta_FK") # Relación Estandarizada
    Rol: Optional[str] = None
    
    model_config = ConfigDict(populate_by_name=True)

# --- ENUMS PARA GESTIÓN OPERATIVA ---
class TipoGestionEnum(str, Enum):
    AGENDA = "Agenda y Reuniones"
    ADMINISTRACION = "Administración General"
    RH = "Recursos Humanos"
    ATENCION = "Atención al Cliente"
    REDES = "Redes Sociales"
    FINANZAS = "Finanzas y Facturación"
    VIAJES = "Viajes y Suministros"

class EtapaGestionEnum(str, Enum):
    SOLICITUD = "Solicitud Recibida"
    ANALISIS = "En Análisis"
    EJECUCION = "En Ejecución"
    ESPERA = "En Espera"
    SEGUIMIENTO = "En Seguimiento"
    COMPLETADA = "Completada"
    CANCELADA = "Cancelada"

class PrioridadEnum(str, Enum):
    ALTA = "Alta"
    MEDIA = "Media"
    BAJA = "Baja"


# --- 4. GESTIONES OPERATIVAS (Antes Oportunidades) ---
class GestionOperativa(BaseModel):
    id: Optional[int] = None # Usamos int si es SQL ID auto-incremental
    
    # Relaciones
    id_cuenta: Optional[str] = Field(None, alias="ID_Cuenta_FK")
    nombre_cuenta: Optional[str] = Field(None, alias="Nombre_Cliente") # Contexto visual
    nombre_representante: Optional[str] = None # Contexto visual
    owner_id: Optional[int] = None # ID del usuario responsable

    # Campos Core (Usando los Enums definidos arriba)
    tipo_gestion: Optional[TipoGestionEnum] = Field(default=TipoGestionEnum.AGENDA)
    etapa: Optional[EtapaGestionEnum] = Field(default=EtapaGestionEnum.SOLICITUD)
    prioridad: Optional[PrioridadEnum] = Field(default=PrioridadEnum.MEDIA)
    
    # Fechas y Detalles
    fecha_compromiso: Optional[date] = None
    descripcion: Optional[str] = None
    
    # Auditoría
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    # Helper para frontend: GO-00001
    @property
    def codigo_visual(self):
        if self.id:
            return f"GO-{str(self.id).zfill(5)}"
        return "GO-PENDING"

    model_config = ConfigDict(
        populate_by_name=True, 
        from_attributes=True,
        use_enum_values=True # Permite guardar el string valor del enum ("Alta")
    )


# --- 5. SERVICIOS ---
class Service(BaseModel):
    ID: str = Field(..., alias="ID_Servicio")
    ID_Cuenta: Optional[str] = Field(None, alias="ID_Cuenta_FK") # Relación
    
    DN: Optional[str] = None
    Plan: Optional[str] = Field(None, alias="Plan_Contratado")
    Estado: Optional[str] = Field(None, alias="Estado_Servicio")
    
    # Fechas
    Fecha_Activacion: Optional[str] = None
    Fecha_Vencimiento: Optional[str] = None
    Inicio_Contrato: Optional[str] = None
    Plazo: Optional[str] = Field(None, alias="Plazo_Contratacion")
    
    # Detalles
    Controlado: Optional[str] = None
    Servicios_Adicionales: Optional[str] = None
    Costo_Mensual: Optional[str] = None
    Equipo: Optional[str] = Field(None, alias="Equipo_Asignado")
    Sucursal: Optional[str] = Field(None, alias="Sucursal_Activacion")
    Ejecutivo: Optional[str] = Field(None, alias="Ejecutivo_Activacion")

    model_config = ConfigDict(populate_by_name=True)


# --- 6. INTERACCIONES ---
class Interaction(BaseModel):
    ID: str
    ID_Servicio: Optional[str] = Field(None, alias="ID_Servicio_FK")
    ID_Cuenta: Optional[str] = Field(None, alias="ID_Cuenta_FK")
    
    Fecha: Optional[str] = Field(None, alias="Fecha_Hora")
    Canal: Optional[str] = Field(None, alias="Canal_Atencion")
    Tipo: Optional[str] = Field(None, alias="Tipo_Interaccion")
    Usuario: Optional[str] = Field(None, alias="Usuario_Registro")
    Notas: Optional[str] = Field(None, alias="Notas_Detalle")

    model_config = ConfigDict(populate_by_name=True)


# --- 7. TICKETS / REQUERIMIENTOS ---
class Requirement(BaseModel):
    ID: str
    Cuenta_ID: Optional[str] = Field(None, alias="ID_Cuenta")
    Nombre_Cuenta: Optional[str] = Field(None, alias="Cliente")
    Linea: Optional[str] = Field(None, alias="Línea_Móvil")
    
    Titulo: Optional[str] = None
    Tipo1: Optional[str] = None
    Tipo2: Optional[str] = None
    Tipo3: Optional[str] = None
    
    Prioridad: Optional[str] = None
    Severidad: Optional[str] = None
    Estado: Optional[str] = None
    
    PadreHijo: Optional[str] = None
    ID_Padre: Optional[str] = None
    
    Notas: Optional[str] = None
    Fila: Optional[str] = Field(None, alias="Fila_Trabajo")
    Agente: Optional[str] = None
    Fecha: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


# --- 8. MOVIMIENTOS DE TICKET ---
class Movement(BaseModel):
    ID_Ticket: str
    Usuario: Optional[str] = None
    Nota: Optional[str] = None
    Fecha: Optional[str] = None
    Nuevo_Estado: Optional[str] = None


# --- 9. COTIZACIONES ---
class Quote(BaseModel):
    ID: str
    ID_Oportunidad: Optional[str] = Field(None, alias="ID_Oportunidad_FK")
    ID_Cuenta: Optional[str] = Field(None, alias="ID_Cuenta_FK")
    
    Nombre_Cuenta: Optional[str] = Field(None, alias="Nombre_Cliente") # Unificado
    Fecha_Emision: Optional[str] = None
    Vigencia: Optional[str] = None
    Version: Optional[str] = None
    
    Total_Mensual: Optional[float] = None
    Ahorro_Total: Optional[float] = None
    
    Items_JSON: Optional[str] = None
    Ruta_PDF: Optional[str] = None
    Usuario: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


# --- 10. ITEMS DE COTIZACION ---
class QuoteItem(BaseModel):
    DN: Optional[str] = None
    PLAN: str
    PLAZO: str
    EQUIPO: str
    PRECIO_ESPECIAL: float
    PAGO_EQ_MES: float
    TOTAL_MENSUAL: float
    AHORRO_EQ: float


# --- 11. REQUESTS ESPECIALES ---
class CreateQuoteRequest(BaseModel):
    ID_Oportunidad: Optional[str] = Field(None, alias="ID_Gestion_FK") # Renombrado opcional
    ID_Cuenta: Optional[str] = Field(None, alias="ID_Cuenta_FK")
    
    Nombre_Cuenta: str = Field(..., alias="Nombre_Cliente")
    Representante: str
    
    Fecha_Emision: str
    Vigencia: str
    Items: List[QuoteItem]

    model_config = ConfigDict(populate_by_name=True)

# --- 12. BÚSQUEDA GLOBAL ---
class SearchResult(BaseModel):
    tipo: str
    nombre: str
    linea_movil: str
    ID_Cliente: str
    
    ID_Servicio: Optional[str] = None
    Plan: Optional[str] = None
    Estado: Optional[str] = None
    Segmento: Optional[str] = None

# --- 13. ESTADÍSTICAS ---
class StatsResponse(BaseModel):
    leads: int = 0
    prospectos: int = 0
    accounts: int = 0
    clientes: int = 0
    opportunities: int = 0
    oportunidades: int = 0
    tickets: int = 0
    requerimientos: int = 0

class BackupStatsResponse(BaseModel):
    total_size: str = "0 MB"
    count: int = 0
    last_backup: Optional[str] = None