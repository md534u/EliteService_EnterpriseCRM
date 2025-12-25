# backend/utils/stage_rules.py

PROBABILIDAD_POR_ETAPA = {
    "Contacto": 10,
    "Identificar Necesidades": 25,
    "Propuesta": 50,
    "Negociación": 75,
    "Firma": 90,
    "En validación por Crédito": 95,
    "Oportunidad Ganada": 100,
    "Oportunidad Perdida": 0
}

ETAPAS_VALIDAS = list(PROBABILIDAD_POR_ETAPA.keys())
