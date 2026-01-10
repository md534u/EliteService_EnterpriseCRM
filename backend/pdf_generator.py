from fpdf import FPDF
from datetime import datetime
import os
import tempfile

# --- CONFIGURACIÓN DE COLORES ---
COLOR_ATT_BLUE = (0, 159, 219)
COLOR_HEADER_TEXT = (255, 255, 255)
COLOR_TEXT_MAIN = (50, 50, 50)
COLOR_ROW_FILL = (240, 245, 255)
COLOR_WARNING_BG = (255, 252, 235) 

class PDF(FPDF):
    def header(self):
        # 1. LOGO
        logo_path = os.path.join(os.path.dirname(__file__), 'logo.png')
        if os.path.exists(logo_path):
            try:
                self.image(logo_path, 10, 8, 30)
            except: pass
        
        # 2. TÍTULO
        self.set_font('Helvetica', 'B', 20)
        self.set_text_color(*COLOR_ATT_BLUE)
        self.cell(0, 10, 'Propuesta Comercial', 0, 1, 'R')
        
        # 3. SUBTÍTULO (MODIFICADO AQUÍ)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, 'Gestiones Especiales AT&T Plaza Nia', 0, 1, 'R')
        
        self.ln(5)
        self.set_draw_color(*COLOR_ATT_BLUE)
        self.set_line_width(0.5)
        self.line(10, 30, 200, 30)
        self.ln(10)

    def footer(self):
        self.set_y(-20)
        self.set_draw_color(200, 200, 200)
        self.line(10, self.get_y(), 200, self.get_y())
        self.set_font('Helvetica', 'I', 7)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, 'Documento Confidencial - EliteService CRM', 0, 0, 'L')
        self.cell(0, 10, f'Pág {self.page_no()}/{{nb}}', 0, 0, 'R')

def create_quote_pdf(incoming_data):
    # --- ADAPTADOR DE DATOS ---
    data = incoming_data
    if "header" not in incoming_data:
        data = {
            "header": {
                "nombre": incoming_data.get("Nombre_Cliente", ""),
                "representante": incoming_data.get("Representante", ""),
                "vigencia": incoming_data.get("Vigencia", ""),
                "tramite": "Trámite Empresarial"
            },
            "items": []
        }
        for item in incoming_data.get("Items", []):
            total = float(item.get("totalMensual") or item.get("TOTAL_MENSUAL", 0))
            pago_eq = float(item.get("pagoEquipoMes") or item.get("PAGO_EQ_MES", 0))
            renta_plan = float(item.get("rentaPlan", 0))
            if renta_plan == 0 and total > 0:
                renta_plan = total - pago_eq
            addons = float(item.get("serviciosAdicionales", 0))

            data["items"].append({
                "dn": item.get("dn") or item.get("DN", ""),
                "plan": item.get("plan") or item.get("PLAN", ""),
                "plazo": item.get("plazo") or item.get("PLAZO", ""),
                "dmr": item.get("dmr") or item.get("DMR", ""),
                "equipo": item.get("equipo") or item.get("EQUIPO", ""),
                "precioEspecial": float(item.get("precioEspecial") or item.get("PRECIO_ESPECIAL", 0)),
                "pagoEquipoMes": pago_eq,
                "rentaPlan": renta_plan,
                "addons": addons,
                "totalMensual": total,
                "ahorro": float(item.get("ahorro") or item.get("AHORRO_EQ", 0))
            })

    # --- INICIO PDF ---
    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # 1. INFO CLIENTE
    pdf.set_fill_color(245, 245, 245)
    pdf.rect(10, pdf.get_y(), 190, 30, 'F')
    
    pdf.set_y(pdf.get_y() + 5)
    pdf.set_x(15)
    
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(*COLOR_TEXT_MAIN)
    
    pdf.cell(25, 6, 'Cliente:', 0, 0)
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(100, 6, data["header"]["nombre"], 0, 1)
    
    pdf.set_x(15)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(25, 6, 'Atención:', 0, 0)
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(100, 6, data["header"]["representante"], 0, 1)

    pdf.set_x(15)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(25, 6, 'Vigencia:', 0, 0)
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(50, 6, data["header"]["vigencia"], 0, 0)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(20, 6, 'Fecha:', 0, 0)
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(40, 6, datetime.now().strftime("%d-%m-%Y"), 0, 1)
    
    pdf.ln(10)

    # 1.5 MENSAJE DE BIENVENIDA
    pdf.ln(2)
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(*COLOR_TEXT_MAIN)
    
    mensaje = (
        "Estimado/a Cliente:\n"
        "Por medio de la presente, le compartimos los detalles de la propuesta comercial, agradeciendo de antemano "
        "pueda verificar que la información contenida sea acorde a lo negociado.\n"
        "En caso de requerir alguna modificación o aclaración, le solicitamos amablemente contactar a su Ejecutivo "
        "asignado o al equipo de Gestiones Especiales, escribiendo al correo rm-Gestiones.Especiales@mx.att.com, "
        "indicando de forma puntual la modificación requerida."
    )
    pdf.multi_cell(0, 5, mensaje, 0, 'L')
    pdf.ln(5)

    # 2. TABLA
    pdf.set_fill_color(*COLOR_ATT_BLUE)
    pdf.set_text_color(*COLOR_HEADER_TEXT)
    pdf.set_font('Helvetica', 'B', 7)
    pdf.set_line_width(0.1)
    
    w = [18, 35, 37, 20, 20, 20, 20, 20] 
    headers = ['DN', 'Plan / Plazo', 'Equipo', 'Renta Plan', 'Add-ons', 'Precio Eq.', 'Men. Eq.', 'Total']
    
    for i, h in enumerate(headers):
        pdf.cell(w[i], 8, h, 0, 0, 'C', True)
    pdf.ln()

    # Filas
    pdf.set_text_color(*COLOR_TEXT_MAIN)
    pdf.set_font('Helvetica', '', 7)
    
    total_renta = 0
    total_ahorro = 0
    fill = False 
    
    for item in data["items"]:
        if fill: pdf.set_fill_color(*COLOR_ROW_FILL)
        else: pdf.set_fill_color(255, 255, 255)
            
        plan_desc = f"{item['plan']}\n{item['plazo']} (DMR {item['dmr']})"
        equipo_desc = str(item['equipo'])
        
        lines_plan = pdf.get_string_width(plan_desc) / w[1]
        lines_eq = pdf.get_string_width(equipo_desc) / w[2]
        height_multiplier = max(1, int(lines_plan) + 1, int(lines_eq) + 1)
        row_height = 5 * height_multiplier
        
        if pdf.get_y() + row_height > 250:
            pdf.add_page()
            pdf.set_fill_color(*COLOR_ATT_BLUE)
            pdf.set_text_color(*COLOR_HEADER_TEXT)
            pdf.set_font('Helvetica', 'B', 7)
            for i, h in enumerate(headers):
                pdf.cell(w[i], 8, h, 0, 0, 'C', True)
            pdf.ln()
            pdf.set_text_color(*COLOR_TEXT_MAIN)
            pdf.set_font('Helvetica', '', 7)

        x_start = pdf.get_x()
        y_start = pdf.get_y()
        
        pdf.cell(w[0], row_height, str(item['dn']), 0, 0, 'C', fill)
        pdf.set_xy(x_start + w[0], y_start)
        pdf.multi_cell(w[1], 5, plan_desc, 0, 'L', fill)
        pdf.set_xy(x_start + w[0] + w[1], y_start)
        pdf.multi_cell(w[2], 5, equipo_desc, 0, 'L', fill)
        
        curr_x = x_start + w[0] + w[1] + w[2]
        pdf.set_xy(curr_x, y_start)
        pdf.cell(w[3], row_height, f"${item['rentaPlan']:,.2f}", 0, 0, 'R', fill)
        pdf.cell(w[4], row_height, f"${item['addons']:,.2f}", 0, 0, 'R', fill)
        pdf.cell(w[5], row_height, f"${item['precioEspecial']:,.2f}", 0, 0, 'R', fill)
        pdf.cell(w[6], row_height, f"${item['pagoEquipoMes']:,.2f}", 0, 0, 'R', fill)
        pdf.set_font('Helvetica', 'B', 7)
        pdf.cell(w[7], row_height, f"${item['totalMensual']:,.2f}", 0, 0, 'R', fill)
        pdf.set_font('Helvetica', '', 7)
        
        pdf.ln(row_height)
        pdf.set_draw_color(230, 230, 230)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        
        total_renta += item['totalMensual']
        total_ahorro += item['ahorro']
        fill = not fill

    pdf.ln(3)

    # 3. BANNER / NOTA IMPORTANTE
    if pdf.get_y() + 25 > 270:
        pdf.add_page()
    
    pdf.set_fill_color(*COLOR_WARNING_BG)
    pdf.set_draw_color(220, 220, 200)
    pdf.set_font('Helvetica', 'B', 7)
    pdf.set_text_color(80, 80, 80)
    
    nota_titulo = "Nota importante:"
    nota_cuerpo = (
        "La presente propuesta se encuentra sujeta a previa validación y aprobación por parte del área de Crédito. "
        "En caso de aplicar, podrá requerirse garantía tanto en equipo como en servicio, conforme a las políticas vigentes.\n"
        "Equipos, modelos y colores están sujetos a disponibilidad de Fulfillment al momento de la autorización y formalización de la contratación."
    )
    
    pdf.multi_cell(0, 4, f"{nota_titulo}\n{nota_cuerpo}", border=1, align='L', fill=True)
    pdf.ln(5)
    
    # 4. TOTALES
    if pdf.get_y() + 30 > 270:
        pdf.add_page()

    x_totals = 130
    pdf.set_x(x_totals)
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(*COLOR_TEXT_MAIN)
    pdf.cell(40, 8, 'Total Mensual:', 0, 0, 'R', True)
    pdf.set_text_color(*COLOR_ATT_BLUE)
    pdf.cell(30, 8, f"${total_renta:,.2f}", 0, 1, 'R', True)
    
    if total_ahorro > 0:
        pdf.set_x(x_totals)
        pdf.set_text_color(0, 100, 0)
        pdf.cell(40, 8, 'Ahorro Equipos:', 0, 0, 'R')
        pdf.cell(30, 8, f"${total_ahorro:,.2f}", 0, 1, 'R')

    pdf.set_text_color(*COLOR_TEXT_MAIN)
    pdf.set_draw_color(50, 50, 50)
    pdf.ln(10)
    
    # 5. FIRMA
    if pdf.get_y() + 30 > 270:
        pdf.add_page()
        
    pdf.line(10, pdf.get_y(), 70, pdf.get_y()) 
    pdf.ln(2)
    
    exec_info = incoming_data.get("Exec_Info", {})
    user_name = incoming_data.get("User_Name", "Ejecutivo AT&T")
    
    pdf.set_font('Helvetica', 'B', 9)
    pdf.cell(0, 4, user_name, 0, 1)
    
    pdf.set_font('Helvetica', '', 8)
    pdf.cell(0, 4, exec_info.get("PUESTO", "Especialista Empresarial"), 0, 1)
    pdf.cell(0, 4, exec_info.get("TIENDA", "Tienda AT&T"), 0, 1)
    pdf.set_text_color(*COLOR_ATT_BLUE)
    pdf.cell(0, 4, exec_info.get("EMAIL", ""), 0, 1)

    # --- SALIDA SEGURA ---
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp_path = tmp.name
        pdf.output(tmp_path)
        with open(tmp_path, "rb") as f:
            pdf_bytes = f.read()
        try: os.remove(tmp_path)
        except: pass
        return pdf_bytes
    except Exception as e:
        print(f"ERROR CRÍTICO: {e}")
        return b""