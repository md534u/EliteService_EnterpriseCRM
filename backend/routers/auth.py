from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from enum import Enum
from datetime import datetime, timedelta
from typing import Optional
import sqlite3
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["auth"])

# --- CONFIGURACIÓN DE SEGURIDAD ---
SECRET_KEY = "tu_clave_secreta_super_segura_cambiala_por_algo_largo" # ⚠️ CAMBIAR ESTO
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 horas

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

DB_NAME = "crm.db"

# --- MODELOS ---
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    SOPORTE = "soporte"
    GERENTE = "gerente"

class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole = UserRole.USER

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str

# --- FUNCIONES AUXILIARES ---
def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- INICIALIZAR TABLA DE USUARIOS ---
def init_users_db():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE,
                  hashed_password TEXT,
                  role TEXT)''')
    conn.commit()
    conn.close()

# Ejecutamos esto al importar el archivo para asegurar que exista la tabla
init_users_db()

# --- RUTAS ---

@router.post("/register", response_model=Token)
def register_user(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Verificar si ya existe
    cursor.execute("SELECT * FROM users WHERE username = ?", (user.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    # 2. Encriptar contraseña
    hashed_pw = get_password_hash(user.password)
    
    # 3. Guardar
    cursor.execute("INSERT INTO users (username, hashed_password, role) VALUES (?, ?, ?)",
                   (user.username, hashed_pw, user.role.value))
    conn.commit()
    conn.close()
    
    # 4. Auto-login al registrarse
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "username": user.username, "role": user.role}

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2PasswordRequestForm espera 'username' y 'password'
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE username = ?", (form_data.username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or not verify_password(form_data.password, user['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user['username'], "role": user['role']})
    return {"access_token": access_token, "token_type": "bearer", "username": user['username'], "role": user['role']}