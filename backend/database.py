import os
import psycopg2
from psycopg2.extras import RealDictCursor

# 👇 PEGA TU URL DE NEON AQUÍ (Entre las comillas)
# Debe empezar con: postgresql://neondb_owner:....
DATABASE_URL = "postgresql://neondb_owner:npg_ilFDAcO41Xme@ep-winter-dust-ahxz9dgj-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"❌ Error fatal conectando a Neon DB: {e}")
        return None