from fpdf import FPDF
from datetime import datetime

class PDF(FPDF):
    def header(self):
        # Intentar cargar logo (si existe)
        try:
            # Ajusta la ruta si tu logo está en otro lado, o comenta si no tienes logo aún
            # self.image('assets/logo.png', 10, 8, 33) 
            pass
        except:
            pass
            
        self.set_font('Arial', 'B', 15)
        self.cell(80) # Mover a la derecha
        self.cell(30, 10, 'EliteService - Cotización Empresarial', 0, 0, 'C')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Página {self.page_no()}/{{nb}} - Generado por EliteService CRM', 0, 0, 'C')

def create_quote_pdf(data):
    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # --- 1. DATOS DEL CLIENTE ---
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, f'Cliente: {data["header"]["nombre"]}', 0, 1)
    
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 5, f'Atención: {data["header"]["representante"]}', 0, 1)
    pdf.cell(0, 5, f'Fecha de Emisión: {datetime.now().strftime("%Y-%m-%d")}', 0, 1)
    pdf.cell(0, 5, f'Vigencia: {data["header"]["vigencia"]}', 0, 1)
    pdf.cell(0, 5, f'Trámite: {data["header"]["tramite"]}', 0, 1)
    pdf.ln(10)

    # --- 2. TABLA DE PRODUCTOS ---
    # Encabezados
    pdf.set_fill_color(11, 87, 208) # Azul AT&T
    pdf.set_text_color(255, 255, 255) # Blanco
    pdf.set_font('Arial', 'B', 9)
    
    # Anchos de columna
    w = [25, 50, 40, 25, 25, 25] 
    headers = ['DN', 'Plan / Plazo', 'Equipo', 'Precio Eq.', 'Men. Eq.', 'Total']
    
    for i, h in enumerate(headers):
        pdf.cell(w[i], 7, h, 1, 0, 'C', True)
    pdf.ln()

    # Filas
    pdf.set_text_color(0, 0, 0) # Negro
    pdf.set_font('Arial', '', 8)
    
    total_renta = 0
    total_ahorro = 0
    
    for item in data["items"]:
        # Cálculos auxiliares
        plan_desc = f"{item['plan']}\n{item['plazo']} (DMR {item['dmr']})"
        
        x_start = pdf.get_x()
        y_start = pdf.get_y()
        
        # Guardar altura máxima de la fila (por si el texto del plan es largo)
        pdf.multi_cell(w[0], 6, str(item['dn']), 'LR', 'C')
        pos_y_next = pdf.get_y()
        pdf.set_xy(x_start + w[0], y_start)
        
        pdf.multi_cell(w[1], 6, plan_desc, 'LR', 'L')
        pos_y_next = max(pos_y_next, pdf.get_y())
        pdf.set_xy(x_start + w[0] + w[1], y_start)
        
        pdf.multi_cell(w[2], 6, str(item['equipo']), 'LR', 'L')
        pos_y_next = max(pos_y_next, pdf.get_y())
        pdf.set_xy(x_start + w[0] + w[1] + w[2], y_start)
        
        # Celdas numéricas simples
        pdf.cell(w[3], pos_y_next - y_start, f"${item['precioEspecial']:,.2f}", 'LR', 0, 'R')
        pdf.cell(w[4], pos_y_next - y_start, f"${item['pagoEquipoMes']:,.2f}", 'LR', 0, 'R')
        pdf.cell(w[5], pos_y_next - y_start, f"${item['totalMensual']:,.2f}", 'LR', 0, 'R')
        
        pdf.ln(pos_y_next - y_start)
        
        # Dibujar línea inferior de la fila
        pdf.line(10, pos_y_next, 10 + sum(w), pos_y_next)
        
        total_renta += item['totalMensual']
        total_ahorro += item['ahorro']

    # --- 3. TOTALES ---
    pdf.ln(5)
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(sum(w)-50, 10, 'Renta Mensual Total Estimada:', 0, 0, 'R')
    pdf.set_text_color(11, 87, 208)
    pdf.cell(50, 10, f"${total_renta:,.2f}", 0, 1, 'R')
    
    pdf.set_text_color(0, 100, 0)
    pdf.set_font('Arial', 'B', 9)
    pdf.cell(sum(w)-50, 6, 'Ahorro Total en Equipos:', 0, 0, 'R')
    pdf.cell(50, 6, f"${total_ahorro:,.2f}", 0, 1, 'R')

    # Devolver los bytes del PDF
    return pdf.output(dest='S').encode('latin-1')