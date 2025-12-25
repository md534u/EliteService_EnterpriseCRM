from datetime import datetime
import pandas as pd

TIPO_OPORTUNIDAD_PREFIJO = {
    'Venta Nueva': 'VN',
    'Adición': 'ADD',
    'Renovación': 'RC',
    'Cancelación': 'CAN',
    'Cesión de Derechos': 'CES',
    'Renovación/Adición': 'RA'
}

from datetime import datetime

def generar_folio_oportunidad(df_ops):
    year = datetime.now().year

    if 'Folio' in df_ops.columns:
        existentes = df_ops['Folio'].dropna().astype(str)
        secuencias = [
            int(f.split('-')[-1])
            for f in existentes
            if f.startswith(f"OP-{year}-")
        ]
        next_seq = max(secuencias) + 1 if secuencias else 1
    else:
        next_seq = 1

    return f"OP-{year}-{str(next_seq).zfill(5)}"


    # Si no hay datos aún
    if df_ops.empty or 'Folio' not in df_ops.columns:
        secuencia = 1
    else:
        df_filtrado = df_ops[df_ops['Folio'].str.startswith(base, na=False)]
        if df_filtrado.empty:
            secuencia = 1
        else:
            secuencia = (
                df_filtrado['Folio']
                .str.replace(base, '', regex=False)
                .astype(int)
                .max() + 1
            )

    return f"{base}{str(secuencia).zfill(5)}"
