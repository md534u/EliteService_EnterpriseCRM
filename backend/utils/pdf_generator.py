from fpdf import FPDF
import os

# --- PDF CONFIGURATION ---
ATT_BLUE = (0, 159, 219) 
ATT_BLUE_HEX = "#009fdb"
TABLE_HEADER_GREY = (200, 200, 200)

class PDFQuote(FPDF):
    def header(self):
        # Header Azul Sólido AT&T
        self.set_fill_color(0, 159, 219) 
        # Ancho Carta Vertical (216mm)
        self.rect(0, 0, 216, 25, 'F')
        self.set_font('Arial', 'B', 16)
        self.set_text_color(255, 255, 255)
        self.set_xy(0, 8)
        self.cell(0, 10, "AT&T Negocios | Propuesta Comercial", 0, 1, 'C')
        self.ln(20)

def generate_pdf_bytes(items: list, cliente_nombre: str, representante: str, vigencia: str, total_mensual: float, ahorro_total: float, ejecutivo_info: dict, usuario_nombre: str) -> bytes:
    # 1. CONFIGURACIÓN VERTICAL ('P')
    pdf = PDFQuote(orientation='P', unit='mm', format='Letter')
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Colores
    GREEN_MONEY = (40, 167, 69)
    YELLOW_BG = (255, 243, 205)
    YELLOW_TXT = (133, 100, 4)
    BLACK = (30, 30, 30)

    # --- DATOS DEL CLIENTE ---
    pdf.set_text_color(*BLACK)
    
    # Etiqueta: Normal 10
    pdf.set_font("Arial", '', 10) 
    pdf.cell(20, 6, "CLIENTE:", 0, 0)
    
    # Valor: Negrita 10
    pdf.set_font("Arial", 'B', 10) 
    pdf.cell(100, 6, str(cliente_nombre).encode('latin-1', 'replace').decode('latin-1').upper(), 0, 1)

    # Etiqueta: Normal 10
    pdf.set_font("Arial", '', 10)
    pdf.cell(22, 6, "VIGENCIA:", 0, 0)
    
    # Valor: Negrita Rojo 10
    pdf.set_font("Arial", 'B', 10)
    pdf.set_text_color(220, 53, 69)
    pdf.cell(50, 6, str(vigencia), 0, 1)
    
    # --- INTRODUCCIÓN ---
    pdf.ln(6)
    pdf.set_text_color(*BLACK)
    pdf.set_font("Arial", '', 10)
    rep_clean = str(representante).encode('latin-1', 'replace').decode('latin-1')
    pdf.write(5, f"Estimado/a "); pdf.set_font("Arial", 'B', 10); pdf.write(5, f"{rep_clean}:\n")
    pdf.set_font("Arial", '', 10)
    pdf.multi_cell(0, 5, "Le presentamos la propuesta comercial detallada de las líneas solicitadas. Si requiere alguna modificación, notifíquelo para realizar las validaciones correspondientes:")
    pdf.ln(5)

    # --- TABLA (Anchos calibrados para Arial 8 - Total 196mm) ---
    headers = [("DN", 22), ("Plan", 36), ("Plazo", 17), ("Equipo", 52), ("P. Esp", 22), ("Pago Eq", 22), ("Total", 25)]
    
    # Encabezados: Tamaño 9 Negrita
    pdf.set_fill_color(230, 230, 230); pdf.set_font("Arial", 'B', 9)
    for label, w in headers: pdf.cell(w, 8, label, 1, 0, 'C', True)
    pdf.ln()

    # Contenido: Tamaño 8
    pdf.set_font("Arial", '', 8)
    
    for item in items:
        # Items is a list of dicts or objects
        # Safely access attributes whether it's a dict or Pydantic model
        if hasattr(item, 'dict'):
            row = item.dict()
        else:
            row = item

        datos_fila = [
            str(row.get('DN', 'N/A')),
            str(row.get('PLAN', '')).replace("AT&T", "").strip(),
            str(row.get('PLAZO', '')),
            str(row.get('EQUIPO', '')).encode('latin-1', 'replace').decode('latin-1'),
            f"${float(row.get('PRECIO_ESPECIAL', 0)):,.2f}",
            f"${float(row.get('PAGO_EQ_MES', 0)):,.2f}",
            f"${float(row.get('TOTAL_MENSUAL', 0)):,.2f}"
        ]

        # 1. CALCULAR ALTURA DE FILA
        line_height = 4
        max_lines = 1
        
        for i, text in enumerate(datos_fila):
            text_width = pdf.get_string_width(text)
            col_width = headers[i][1]
            if col_width > 2:
                l_needed = int(text_width / (col_width - 2)) + 1 
            else:
                l_needed = 1
            if l_needed > max_lines: max_lines = l_needed
        
        h_fila = max(6, max_lines * line_height + 2) 

        # Control de salto de página
        if pdf.get_y() + h_fila > pdf.h - 20:
            pdf.add_page(); pdf.set_fill_color(230, 230, 230); pdf.set_font("Arial", 'B', 9)
            for label, w in headers: pdf.cell(w, 8, label, 1, 0, 'C', True)
            pdf.ln(); pdf.set_font("Arial", '', 8)

        # 2. DIBUJAR CELDAS
        y_ini = pdf.get_y()
        x_curr = pdf.get_x()
        
        for i, text in enumerate(datos_fila):
            w_col = headers[i][1]
            
            # A. Dibujar borde
            pdf.rect(x_curr, y_ini, w_col, h_fila)
            
            # B. Calcular Centrado Vertical
            text_width = pdf.get_string_width(text)
            lines_text = int(text_width / (w_col - 2)) + 1
            text_block_height = lines_text * line_height
            v_offset = (h_fila - text_block_height) / 2
            if v_offset < 0: v_offset = 0.5 
            
            # C. Escribir texto
            pdf.set_xy(x_curr, y_ini + v_offset)
            align = 'L' if i == 1 or i == 3 else 'C'
            pdf.multi_cell(w_col, line_height, text, border=0, align=align)
            
            x_curr += w_col
            
        pdf.set_xy(10, y_ini + h_fila)

    pdf.ln(5)

    # --- TOTALES ---
    y_tot = pdf.get_y()
    if y_tot + 20 > pdf.h - 15: pdf.add_page(); y_tot = pdf.get_y()

    # Caja Izquierda (Ahorro)
    pdf.set_draw_color(*GREEN_MONEY); pdf.set_fill_color(230, 250, 230)
    pdf.rect(10, y_tot, 85, 10, 'FD'); pdf.set_xy(10, y_tot + 2)
    pdf.set_font("Arial", 'B', 10); pdf.set_text_color(0, 0, 0)
    pdf.cell(50, 6, "AHORRO EN EQUIPOS:", 0, 0, 'R')
    pdf.set_font("Arial", 'B', 11); pdf.set_text_color(*GREEN_MONEY)
    pdf.cell(30, 6, f"${ahorro_total:,.2f}", 0, 0, 'L')

    # Caja Derecha (Total Mensual)
    x_total_box = 216 - 10 - 90
    pdf.set_fill_color(*ATT_BLUE); pdf.rect(x_total_box, y_tot, 90, 10, 'F')
    pdf.set_xy(x_total_box, y_tot + 2); pdf.set_text_color(255, 255, 255)
    pdf.set_font("Arial", 'B', 10)
    pdf.cell(45, 6, "TOTAL MENSUAL:", 0, 0, 'R')
    pdf.set_font("Arial", 'B', 11)
    pdf.cell(40, 6, f"${total_mensual:,.2f}", 0, 1, 'L')

    # --- TEXTO DE CONFIRMACIÓN / REQUISITOS (NUEVO) ---
    pdf.ln(14) # Espacio después de las cajas de totales
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", '', 9) # Tamaño 9 para texto secundario
    
    texto_requisitos = "Si están de acuerdo con la propuesta, agradeceremos su confirmación vía correo a Gestiones Especiales. Para la generación del contrato, es necesario adjuntar la INE del representante legal (ambos lados) y la Constancia de Situación Fiscal actualizada (máximo 30 dias de antiguedad)."
    pdf.multi_cell(0, 5, texto_requisitos.encode('latin-1', 'replace').decode('latin-1'), 0, 'L')

    # --- NOTA LEGAL ---
    pdf.ln(5)
    pdf.set_fill_color(*YELLOW_BG); pdf.set_text_color(*YELLOW_TXT); pdf.set_font("Arial", '', 7)
    pdf.multi_cell(0, 4, "Nota Importante: Precios incluyen IVA. Sujeto a evaluación crediticia. Cotización informativa, no representa compromiso de contratación.", 0, 'L', True)
    
    # --- DATOS EJECUTIVO ---
    pdf.ln(5); pdf.set_text_color(0, 0, 0)
    if pdf.get_y() + 30 > pdf.h - 15: pdf.add_page()
    
    pdf.set_font("Arial", 'B', 10)
    pdf.cell(0, 4, usuario_nombre, 0, 1)
    
    pdf.set_font("Arial", 'I', 9)
    pdf.cell(0, 4, f"{ejecutivo_info['PUESTO']} | {ejecutivo_info['TIENDA']}", 0, 1)
    
    pdf.set_font("Arial", '', 9)
    pdf.cell(0, 4, f"Móvil: {ejecutivo_info['MOVIL']} | Email: {ejecutivo_info['EMAIL']}", 0, 1)
    pdf.cell(0, 4, f"Gestiones Especiales: {ejecutivo_info['GESTIONES']}", 0, 1)
    
    # Force use of temp file to avoid byte string confusion
    import tempfile
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        pdf.output(tmp.name, 'F')
        tmp.close()
        with open(tmp.name, 'rb') as f:
            data = f.read()
        os.unlink(tmp.name)
        return data
