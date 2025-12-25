from typing import Optional, List
from pydantic import BaseModel
from fastapi import Request


class Lead(BaseModel):
    Folio: str
    Segmento: Optional[str] = None
    Fecha_Registro: Optional[str] = None
    Nombre: Optional[str] = None
    Segundo_Nombre: Optional[str] = None
    Apellido_Paterno: Optional[str] = None
    Apellido_Materno: Optional[str] = None
    Fecha_Nacimiento: Optional[str] = None
    RFC: Optional[str] = None
    Telefono: Optional[str] = None
    Email_Facturacion: Optional[str] = None
    Razon_Social: Optional[str] = None
    RFC_Empresa: Optional[str] = None
    Giro: Optional[str] = None
    Calle: Optional[str] = None
    No_Exterior: Optional[str] = None
    No_Interno: Optional[str] = None
    Colonia: Optional[str] = None
    Municipio: Optional[str] = None
    Estado: Optional[str] = None
    CP: Optional[str] = None
    Estado_CRM: Optional[str] = None

class Account(BaseModel):
    ID: str
    Nombre_Cuenta: Optional[str] = None
    RFC: Optional[str] = None
    Giro_Empresa: Optional[str] = None
    Domicilio_Fiscal: Optional[str] = None
    Propietario_ID: Optional[str] = None
    Segmento_Tipo: Optional[str] = None

class Contact(BaseModel):
    ID: str
    Nombre: Optional[str] = None
    Apellido_Paterno: Optional[str] = None
    Email: Optional[str] = None
    Telefono: Optional[str] = None
    ID_Cuenta_FK: Optional[str] = None
    Rol: Optional[str] = None

from typing import Optional
from pydantic import BaseModel


class Opportunity(BaseModel):
    ID: Optional[str] = None
    ID_Cuenta_FK: Optional[str] = None
    Folio: Optional[str] = None
    Nombre_Oportunidad: Optional[str] = None
    Cliente: Optional[str] = None
    Propietario: Optional[str] = None
    Tipo_Op: Optional[str] = None
    Valor: Optional[float] = None
    Fecha_Cierre: Optional[str] = None
    Cantidad_Lineas: Optional[int] = None
    Canal_Ventas: Optional[str] = None
    Etapa: Optional[str] = None
    Probabilidad: Optional[int] = None
    Motivo_Perdida: Optional[str] = None
    Sub_Motivo: Optional[str] = None


class Service(BaseModel):
    ID_Servicio: str
    ID_Cuenta_FK: Optional[str] = None
    DN: Optional[str] = None
    Plan_Contratado: Optional[str] = None
    Controlado: Optional[str] = None
    Estado_Servicio: Optional[str] = None
    Fecha_Activacion: Optional[str] = None
    Fecha_Vencimiento: Optional[str] = None
    Servicios_Adicionales: Optional[str] = None
    Costo_Mensual: Optional[str] = None
    Inicio_Contrato: Optional[str] = None
    Equipo_Asignado: Optional[str] = None
    Plazo_Contratacion: Optional[str] = None
    Sucursal_Activacion: Optional[str] = None
    Ejecutivo_Activacion: Optional[str] = None

class Interaction(BaseModel):
    ID: str
    ID_Servicio_FK: Optional[str] = None
    ID_Cuenta_FK: Optional[str] = None
    Fecha_Hora: Optional[str] = None
    Canal_Atencion: Optional[str] = None
    Tipo_Interaccion: Optional[str] = None
    Usuario_Registro: Optional[str] = None
    Notas_Detalle: Optional[str] = None

class Requirement(BaseModel):
    ID: str
    Cliente: Optional[str] = None
    Línea_Móvil: Optional[str] = None # Keeping original accent for CSV compatibility
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
    Fila_Trabajo: Optional[str] = None
    Agente: Optional[str] = None
    Fecha: Optional[str] = None

class Movement(BaseModel):
    ID_Ticket: str
    Usuario: Optional[str] = None
    Nota: Optional[str] = None
    Fecha: Optional[str] = None
    Nuevo_Estado: Optional[str] = None

class Quote(BaseModel):
    ID: str
    ID_Oportunidad_FK: Optional[str] = None
    ID_Cuenta_FK: Optional[str] = None
    Nombre_Cliente: Optional[str] = None
    Fecha_Emision: Optional[str] = None
    Vigencia: Optional[str] = None
    Version: Optional[str] = None
    Total_Mensual: Optional[float] = None
    Ahorro_Total: Optional[float] = None
    Items_JSON: Optional[str] = None
    Ruta_PDF: Optional[str] = None
    Usuario: Optional[str] = None

class QuoteItem(BaseModel):
    DN: Optional[str] = None
    PLAN: str
    PLAZO: str
    EQUIPO: str
    PRECIO_ESPECIAL: float
    PAGO_EQ_MES: float
    TOTAL_MENSUAL: float
    AHORRO_EQ: float

class CreateQuoteRequest(BaseModel):
    ID_Oportunidad_FK: Optional[str] = None
    ID_Cuenta_FK: Optional[str] = None
    Nombre_Cliente: str
    Representante: str
    Fecha_Emision: str
    Vigencia: str
    Items: List[QuoteItem]
    
# Helper model for search results
class SearchResult(BaseModel):
    tipo: str
    nombre: str
    linea_movil: str
    ID_Cliente: str
    ID_Servicio: Optional[str] = None
    Plan: Optional[str] = None
    Estado: Optional[str] = None
    Segmento: Optional[str] = None
