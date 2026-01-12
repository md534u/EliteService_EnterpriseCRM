from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="va") # Valores: 'admin' o 'va'
    is_active = Column(Boolean, default=True)

    # Relación inversa: Una VA puede tener muchos clientes asignados
    clients = relationship("Client", back_populates="assigned_va")

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    contact_email = Column(String)
    # Datos sensibles (Solo Admin debería ver esto en frontend)
    monthly_fee = Column(Integer) 
    
    # CLAVE: Aquí asignamos el cliente a una VA específica
    # Si es NULL, el cliente es de la agencia pero nadie lo atiende aún
    assigned_va_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relación para acceder a los datos de la VA desde el objeto cliente
    assigned_va = relationship("User", back_populates="clients")