import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileText, Calculator, Download, Info, List, ChevronDown, ShieldCheck, Zap, Save } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

// --- CONSTANTES DE NEGOCIO (INTACTAS) ---
const PRECIOS_PLANES: Record<string, number> = {
    "AT&T Ármalo Negocios $239": 239.0, "AT&T Ármalo Negocios $299": 299.0, "AT&T Ármalo Negocios $399": 399.0,
    "AT&T Ármalo Negocios $499": 499.0, "AT&T Ármalo Negocios $599": 599.0, "AT&T Ármalo Negocios $699": 699.0,
    "AT&T Ármalo Negocios $799": 799.0, "AT&T Ármalo Negocios $899": 899.0, "AT&T Ármalo Negocios $999": 999.0,
    "AT&T Ármalo Negocios $1,299": 1299.0, "AT&T Ármalo Negocios $1,499": 1499.0
};
const PLANES_ATT = Object.keys(PRECIOS_PLANES);
const OPCIONES_DMR = Array.from({length: 26}, (_, i) => `${i}%`);

// --- LÓGICA DE SEGURO (INTACTA) ---
const calcularCostoProteccion = (precioLista: number): number => {
    if (precioLista >= 500 && precioLista <= 4000) return 99;
    if (precioLista >= 4001 && precioLista <= 6000) return 159;
    if (precioLista >= 6001 && precioLista <= 13000) return 219;
    if (precioLista >= 13001 && precioLista <= 38000) return 254;
    if (precioLista >= 38001) return 279;
    return 0;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  opportunity: any;
  accountData?: any;
  primaryContact?: any;
}

interface QuoteItem {
  id: number;
  dn: string;
  plan: string;
  dmr: string;
  plazo: string;
  equipo: string;
  precioLista: number;
  precioEspecial: number;
  pagoEquipoMes: number;
  totalMensual: number;
  ahorro: number;
  addonControl: boolean;
  proteccionPlus: boolean;
  costoProteccion: number;
}

const QuoteBuilder: React.FC<Props> = ({ isOpen, onClose, opportunity, accountData, primaryContact }) => {
  // --- ESTADO ---
  const [headerData, setHeaderData] = useState({
    nombre: '',
    representante: '',
    vigencia: new Date().toISOString().split('T')[0],
    tramite: 'Línea Nueva'
  });

  const [notes, setNotes] = useState(''); // Estado para Notas

  const [lineForm, setLineForm] = useState({
    dn: '',
    plan: 'AT&T Ármalo Negocios $299',
    dmr: '0%',
    plazo: '24 MESES',
    equipo: '',
    precioLista: 0,
    precioPreferencial: 0,
    addonControl: false,
    proteccionPlus: false
  });

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHeaderData(prev => ({
        ...prev,
        nombre: accountData?.Nombre_Cuenta || '',
        representante: primaryContact ? `${primaryContact.Nombre} ${primaryContact.Apellido_Paterno}` : ''
      }));
    }
  }, [isOpen, accountData, primaryContact]);

  if (!isOpen) return null;

  // --- HANDLERS (Lógica Original) ---
  const handleAddItem = () => {
    const costoPlanBruto = PRECIOS_PLANES[lineForm.plan] || 0;
    const dmrPerc = parseFloat(lineForm.dmr.replace('%', '')) / 100;
    const costoPlanNeto = costoPlanBruto * (1 - dmrPerc);
    
    const meses = parseInt(lineForm.plazo.split(' ')[0]) || 24;
    const pagoEqMensual = meses > 0 ? lineForm.precioPreferencial / meses : 0;
    
    let costoAddon = 0;
    if (lineForm.addonControl) {
      costoAddon = costoPlanBruto < 500 ? 30.0 : 50.0;
    }

    let costoSeguro = 0;
    if (lineForm.proteccionPlus) {
        costoSeguro = calcularCostoProteccion(lineForm.precioLista);
    }

    const totalMensualFinal = costoPlanNeto + pagoEqMensual + costoAddon + costoSeguro;

    const newItem: QuoteItem = {
      id: Date.now(),
      dn: lineForm.dn || 'N/A',
      plan: lineForm.plan + (lineForm.addonControl ? ' + Control' : ''),
      dmr: lineForm.dmr, plazo: lineForm.plazo,
      equipo: lineForm.equipo || 'Equipo Propio',
      precioLista: lineForm.precioLista, precioEspecial: lineForm.precioPreferencial,
      pagoEquipoMes: pagoEqMensual, 
      totalMensual: totalMensualFinal,
      ahorro: lineForm.precioLista - lineForm.precioPreferencial,
      addonControl: lineForm.addonControl,
      proteccionPlus: lineForm.proteccionPlus,
      costoProteccion: costoSeguro
    };

    setItems([...items, newItem]);
    
    setLineForm(prev => ({ 
        ...prev, dn: '', equipo: '', precioLista: 0, precioPreferencial: 0, proteccionPlus: false 
    }));
  };

  const removeItem = (id: number) => setItems(items.filter(i => i.id !== id));
  
  const totalRentaMensual = items.reduce((sum, item) => sum + item.totalMensual, 0);
  const totalAhorro = items.reduce((sum, item) => sum + item.ahorro, 0);

  // --- GENERAR PDF ---
  const handleGeneratePDF = async () => {
    if (items.length === 0) return alert("Agrega al menos una línea.");
    setIsGenerating(true);
    try {
        const payload = { header: headerData, items: items, notes: notes }; // Enviamos notas
        const response = await axios.post(`${API_URL}/quotes/generate`, payload, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Cotizacion_${headerData.nombre || 'Cliente'}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    } catch (error) { console.error("Error PDF:", error); alert("Error al generar PDF."); } 
    finally { setIsGenerating(false); }
  };

  // --- GUARDAR EN BD (Nueva Función) ---
  const handleSaveQuote = async () => {
      if (items.length === 0) return alert("La cotización está vacía.");
      setIsSaving(true);
      try {
          // Aquí conectarás con tu endpoint real de guardar (ej: POST /quotes/)
          // const payload = { header: headerData, items: items, notes: notes, opportunityId: opportunity.ID };
          // await axios.post(`${API_URL}/quotes/`, payload);
          
          // Simulación de éxito por ahora
          await new Promise(resolve => setTimeout(resolve, 1000));
          alert("Cotización guardada exitosamente en el sistema.");
      } catch (error) {
          console.error("Error Saving:", error);
          alert("Error al guardar la cotización.");
      } finally {
          setIsSaving(false);
      }
  };

  // --- ESTILOS ---
  const labelStyle = "block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wide";
  const inputStyle = "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 border bg-white";
  const cardStyle = "bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-6";
  const sectionTitleStyle = "text-lg font-bold text-gray-900 flex items-center gap-2 mb-5 pb-2 border-b border-gray-100";

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-95 z-50 overflow-y-auto backdrop-blur-sm">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-transparent w-full max-w-6xl relative">
            
          {/* HEADER PRINCIPAL */}
          <div className="flex justify-between items-start mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                 <Calculator className="text-blue-600" /> Cotizador Empresarial
              </h1>
              <p className="text-sm text-gray-500 mt-1 ml-9">Oportunidad: <span className="font-medium">{opportunity?.Nombre_Op}</span></p>
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <X size={16} /> Cancelar
                </button>
                
                {/* BOTÓN NUEVO: GUARDAR */}
                <button 
                    onClick={handleSaveQuote}
                    disabled={isSaving || items.length === 0}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? 'Guardando...' : <><Save size={16} /> Guardar</>}
                </button>

                <button 
                    onClick={handleGeneratePDF}
                    disabled={isGenerating || items.length === 0}
                    className={`px-4 py-2 rounded-md text-sm font-bold text-white flex items-center gap-2 shadow-sm
                        ${isGenerating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isGenerating ? 'Generando...' : <><Download size={16} /> Generar PDF</>}
                </button>
            </div>
          </div>

          {/* SECCIÓN 1: INFORMACIÓN GENERAL (INTACTO) */}
          <div className={cardStyle}>
            <h3 className={sectionTitleStyle}>
              <Info className="text-blue-500" size={20} /> Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                  <label className={labelStyle}>Razón Social / Cliente</label>
                  <input className={inputStyle} value={headerData.nombre} onChange={e => setHeaderData({...headerData, nombre: e.target.value})} />
              </div>
              <div>
                  <label className={labelStyle}>Representante Legal</label>
                  <input className={inputStyle} value={headerData.representante} onChange={e => setHeaderData({...headerData, representante: e.target.value})} />
              </div>
              <div>
                  <label className={labelStyle}>Vigencia Hasta</label>
                  <input type="date" className={inputStyle} value={headerData.vigencia} onChange={e => setHeaderData({...headerData, vigencia: e.target.value})} />
              </div>
              <div>
                  <label className={labelStyle}>Tipo de Trámite</label>
                  <div className="relative">
                    <select className={inputStyle + " appearance-none"} value={headerData.tramite} onChange={e => setHeaderData({...headerData, tramite: e.target.value})}>
                        <option>Línea Nueva</option><option>Renovación</option><option>Portabilidad</option><option>Adición</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                  </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: ÍTEMS DE LA COTIZACIÓN (INTACTO) */}
          <div className={cardStyle}>
            <div className="flex justify-between items-center mb-2">
                <h3 className={sectionTitleStyle + " border-0 mb-0"}>
                  <List className="text-blue-500" size={20} /> Ítems de la Cotización
                </h3>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-blue-100 mb-8 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Agregar Nueva Línea</h4>
                </div>
                
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-4">
                        <label className={labelStyle}>Plan AT&T</label>
                        <div className="relative">
                            <select className={inputStyle + " appearance-none"} value={lineForm.plan} onChange={e => setLineForm({...lineForm, plan: e.target.value})}>
                                {PLANES_ATT.map(p => <option key={p} value={p}>{p.replace('AT&T Ármalo Negocios', 'Ármalo')}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                    
                    <div className="col-span-6 md:col-span-2">
                         <label className={labelStyle}>Plazo</label>
                         <div className="relative">
                            <select className={inputStyle + " appearance-none"} value={lineForm.plazo} onChange={e => setLineForm({...lineForm, plazo: e.target.value})}>
                                <option>12 MESES</option><option>24 MESES</option><option>36 MESES</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={14} />
                         </div>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                         <label className={labelStyle}>DMR</label>
                         <div className="relative">
                            <select className={inputStyle + " appearance-none"} value={lineForm.dmr} onChange={e => setLineForm({...lineForm, dmr: e.target.value})}>
                                {OPCIONES_DMR.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={14} />
                         </div>
                    </div>

                    <div className="col-span-12 md:col-span-4 flex flex-col justify-end pb-1">
                        <label className={labelStyle}>Servicios Adicionales</label>
                        <div className="flex gap-4">
                            <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded border transition-colors flex-1
                                ${lineForm.addonControl ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <input type="checkbox" checked={lineForm.addonControl} onChange={e => setLineForm({...lineForm, addonControl: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                                <div className="flex items-center gap-1.5">
                                    <Zap size={14} className={lineForm.addonControl ? "text-blue-600" : "text-gray-400"} />
                                    <span className="text-xs font-bold text-gray-700">Control</span>
                                </div>
                            </label>

                            <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded border transition-colors flex-1
                                ${lineForm.proteccionPlus ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <input type="checkbox" checked={lineForm.proteccionPlus} onChange={e => setLineForm({...lineForm, proteccionPlus: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck size={14} className={lineForm.proteccionPlus ? "text-blue-600" : "text-gray-400"} />
                                    <span className="text-xs font-bold text-gray-700">Protección+</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-3">
                        <label className={labelStyle}>DN (Opcional)</label>
                        <input className={inputStyle} placeholder="10 dígitos" value={lineForm.dn} onChange={e => setLineForm({...lineForm, dn: e.target.value})} />
                    </div>

                    <div className="col-span-12 md:col-span-3">
                        <label className={labelStyle}>Equipo</label>
                        <input className={inputStyle} placeholder="Ej. iPhone 15" value={lineForm.equipo} onChange={e => setLineForm({...lineForm, equipo: e.target.value})} />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                        <label className={labelStyle}>$ Lista</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                            <input type="number" className={inputStyle + " pl-6"} value={lineForm.precioLista} onChange={e => setLineForm({...lineForm, precioLista: parseFloat(e.target.value) || 0})} />
                        </div>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                        <label className={labelStyle}>$ Pref.</label>
                         <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                            <input type="number" className={inputStyle + " pl-6"} value={lineForm.precioPreferencial} onChange={e => setLineForm({...lineForm, precioPreferencial: parseFloat(e.target.value) || 0})} />
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-2 flex items-end">
                        <button onClick={handleAddItem} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-bold shadow-md flex items-center justify-center gap-1 transition-all h-[38px] mb-[1px]">
                            <Plus size={18} /> Agregar
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">LÍNEA / PLAN / EQUIPO</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">CONFIGURACIÓN</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">PAGOS EQUIPO</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-green-600 uppercase tracking-wider">TOTAL MENSUAL</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Eliminar</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No hay ítems agregados aún. Comienza llenando el formulario de arriba.</td></tr>
                  ) : (
                    items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{item.plan.replace('AT&T Ármalo Negocios', 'Ármalo')}</div>
                        <div className="text-sm text-gray-600">{item.equipo}</div>
                        {item.dn !== 'N/A' && <div className="text-xs text-blue-500 font-mono mt-1 font-medium">DN: {item.dn}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex gap-2">
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs w-fit">Plazo: {item.plazo}</span>
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs w-fit">DMR: {item.dmr}</span>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {item.addonControl && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><Zap size={10}/> Control</span>}
                                {item.proteccionPlus && <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><ShieldCheck size={10}/> Prot+ (${item.costoProteccion})</span>}
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="text-gray-900 font-bold">${item.pagoEquipoMes.toFixed(2)} /mes</div>
                        <div className="text-xs text-gray-400">Pref: ${item.precioEspecial.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-lg font-bold text-blue-600">${item.totalMensual.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER MODIFICADO: NOTAS A LA IZQUIERDA, TOTALES (INTACTOS) A LA DERECHA */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mt-6 flex flex-col md:flex-row gap-8 justify-between items-end">
            
            {/* IZQUIERDA: NOTAS Y TÉRMINOS (NUEVO) */}
            <div className="w-full md:flex-1">
                <label className={labelStyle}>Notas y Términos</label>
                <textarea 
                    className={inputStyle + " h-32 resize-none"} 
                    placeholder="Escriba aquí condiciones de pago, vigencia especial, o notas para el cliente..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                ></textarea>
            </div>
            
            {/* DERECHA: TOTALES (INTACTO) */}
            <div className="w-full md:w-1/3 flex flex-col gap-3">
                <div className="flex justify-between text-sm text-gray-600 font-medium">
                    <span>Subtotal Renta (Aprox):</span>
                    <span>${(totalRentaMensual * 0.84).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-bold border-b border-gray-100 pb-3">
                    <span>Ahorro Total Equipos:</span>
                    <span>- ${totalAhorro.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                    <span className="text-lg font-bold text-gray-900">Total Mensual Estimado</span>
                    <span className="text-4xl font-bold text-blue-600">${totalRentaMensual.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuoteBuilder;