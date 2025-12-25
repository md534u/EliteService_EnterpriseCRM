# backend/utils/migrate_step_3_normalize_stage_probability.py

import sys
import os
import pandas as pd

# Asegurar que Python vea /backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_manager import db

# Catálogo oficial de etapas
ETAPAS_OPORTUNIDAD = [
    'Contacto',
    'Identificar Necesidades',
    'Propuesta',
    'Negociación',
    'Firma',
    'En validación por Crédito',
    'Oportunidad Ganada',
    'Oportunidad Perdida'
]

# Probabilidad por etapa (fuente única de verdad)
PROBABILIDAD_POR_ETAPA = {
    'Contacto': 10,
    'Identificar Necesidades': 25,
    'Propuesta': 50,
    'Negociación': 75,
    'Firma': 90,
    'En validación por Crédito': 95,
    'Oportunidad Ganada': 100,
    'Oportunidad Perdida': 0
}

# Normalización de valores legacy → oficiales
ETAPA_MAP = {
    'Prospección': 'Contacto',
    'Prospeccion': 'Contacto',
    'Contacto': 'Contacto',

    'Calificación': 'Identificar Necesidades',
    'Calificacion': 'Identificar Necesidades',
    'Identificar Necesidades': 'Identificar Necesidades',

    'Propuesta': 'Propuesta',

    'Negociación': 'Negociación',
    'Negociacion': 'Negociación',

    'Firma': 'Firma',

    'Validación Crédito': 'En validación por Crédito',
    'Validacion Credito': 'En validación por Crédito',
    'En validación por Crédito': 'En validación por Crédito',

    'Ganada': 'Oportunidad Ganada',
    'Cerrada Ganada': 'Oportunidad Ganada',
    'Oportunidad Ganada': 'Oportunidad Ganada',

    'Perdida': 'Oportunidad Perdida',
    'Perdida ': 'Oportunidad Perdida',
    'Cerrada Perdida': 'Oportunidad Perdida',
    'Oportunidad Perdida': 'Oportunidad Perdida'
}

def run():
    df_ops = db.get_df('df_ops')

    if df_ops.empty:
        print("⚠️ df_ops está vacío. No se realizó ningún cambio.")
        return

    print("Etapas ANTES (valores únicos):")
    print(df_ops['Etapa'].dropna().unique())

    # Normalizar etapa
    df_ops['Etapa'] = (
        df_ops['Etapa']
        .map(ETAPA_MAP)
        .fillna(df_ops['Etapa'])
    )

    # Validar contra catálogo oficial
    invalidas = df_ops[~df_ops['Etapa'].isin(ETAPAS_OPORTUNIDAD)]

    if not invalidas.empty:
        print("\n⚠️ Etapas no reconocidas (revisión manual):")
        print(invalidas[['ID', 'Etapa']])

    # Recalcular probabilidad SIEMPRE
    df_ops['Probabilidad'] = df_ops['Etapa'].map(PROBABILIDAD_POR_ETAPA).fillna(0)

    print("\nEtapas DESPUÉS (valores únicos):")
    print(df_ops['Etapa'].dropna().unique())

    print("\nProbabilidades recalculadas (muestra):")
    print(df_ops[['Etapa', 'Probabilidad']].drop_duplicates())

    # Guardar usando el patrón correcto de tu DataManager
    db.data['df_ops'] = df_ops
    db.save_data('df_ops')

    print("\n✅ PASO 3 completado: Etapas normalizadas y Probabilidad recalculada.")

if __name__ == "__main__":
    run()
