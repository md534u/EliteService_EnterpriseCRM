import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Download, Trash, Calculator, AlertTriangle } from 'lucide-react';
import { API_URL } from '../config';

const PLANES: string[] = [];

// Lista específica de plazos solicitada
const PLAZOS = [0, 12, 18, 24, 30, 36, 48];

const PRECIOS: Record<string, number> = {};

interface QuoteGeneratorProps {
    embedded?: boolean; 
    opportunity?: any;
}

const QuoteGenerator = ({ embedded = false, opportunity }: QuoteGeneratorProps) => {
  const [clientName, setClientName] = useState('');
  const [repName, setRepName] = useState('');
  const [items, setItems] = useState<any[]>([]);

  // Item Form States
  const [dn, setDn] = useState('');
  const [plan, setPlan] = useState(PLANES[0] || '');
  const [dmr, setDmr] = useState('0');
  const [term, setTerm] = useState('24 MESES');
  const [device, setDevice] = useState('');
  const [listPrice, setListPrice] = useState(0);
  const [prefPrice, setPrefPrice] = useState(0);
  const [control, setControl] = useState(false);

  // Auto-llenado
  useEffect(() => {
    if (opportunity) {
        setClientName(opportunity.Nombre_Cuenta || opportunity.Nombre_Cliente || '');
        setRepName(opportunity.Nombre_Representante || '');
    }
  }, [opportunity]);

  const addItem = () => {
    const basePrice = PRECIOS[plan] || 0;
    
    // Calculo DMR
    const dmrVal = parseFloat(dmr) / 100;
    const netPlan = basePrice * (1 - dmrVal);
    
    // Meses
    let months = 24;
    try { months = parseInt(term.split(' ')[0]); } catch(e) {}
    
    // Pago Equipo Mensual (Evitamos división por cero si es 0 meses)
    const devicePayment = months > 0 ? prefPrice / months : 0;
    
    let costo_addon = 0;
    let nombre_plan_final = plan;
    
    if (control) {
        nombre_plan_final += " + Control";
    }

    const total_mensual_final = netPlan + devicePayment + costo_addon;
    const ahorro_equipo_total = listPrice - prefPrice;

    const newItem = {
      DN: dn || 'N/A',
      PLAN: nombre_plan_final,
      PLAZO: term,
      EQUIPO: device || 'Equipo Propio',
      PRECIO_ESPECIAL: prefPrice,
      PAGO_EQ_MES: devicePayment,
      TOTAL_MENSUAL: total_mensual_final,
      AHORRO_EQ: ahorro_equipo_total
    };

    setItems([...items, newItem]);
    
    // Resetear campos visuales
    setDn(''); setDevice(''); setListPrice(0); setPrefPrice(0);
  };

  const generatePDF = async () => {
    if (!clientName || items.length === 0) return alert("Faltan datos para generar la cotización");
    
    try {
      const payload = {
        Nombre_Cliente: clientName,
        Representante: repName,
        Fecha_Emision: new Date().toISOString().split('T')[0],
        Vigencia: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        Items: items,
        Opportunity_ID: opportunity?.ID 
      };

      const res = await axios.post(`${API_URL}/quotes/generate`, payload, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cotizacion_${clientName.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      console.error(e);
      alert("Error generando PDF.");
    }
  };

  return (
    <div className={`${embedded ? '' : 'max-w-6xl mx-auto p-6'}`}>
      
      {!embedded && (
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Generador de Propuesta Comercial
          </h1>
      )}

      {/* Datos Generales */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
         <h2 className="text-sm font-bold text-gray-400 uppercase border-b border-gray-100 pb-2 mb-4">1. Datos Generales</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Razón Social</label>
             <input 
               className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-gray-50 font-medium text-gray-700" 
               value={clientName} 
               onChange={e => setClientName(e.target.value)} 
               placeholder="Se llenará automáticamente..." 
             />
           </div>
           <div>
             <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Representante Legal</label>
             <input 
               className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-gray-50 font-medium text-gray-700" 
               value={repName} 
               onChange={e => setRepName(e.target.value)} 
               placeholder="Se llenará automáticamente..." 
             />
           </div>
         </div>
      </div>

      {/* Configuración de Línea */}
      <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-4 mb-6">
         <h2 className="text-sm font-bold text-blue-800 border-b border-blue-200 pb-2 mb-4 flex items-center gap-2">
            <Calculator size={16}/> 2. Configuración de Líneas 📱
         </h2>

         <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded mb-6 flex items-start gap-3">
            <AlertTriangle className="text-amber-500 shrink-0" size={18} />
            <div className="text-xs text-amber-800">
                <p><strong>Nota:</strong> El total mensual es una estimación.</p>
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="group">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">DN (Opcional)</label>
                <input className="w-full border border-gray-300 rounded p-2 text-sm bg-white" placeholder="10 dígitos" value={dn} onChange={e => setDn(e.target.value)} />
            </div>
            <div className="group">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Plan</label>
                <select className="w-full border border-gray-300 rounded p-2 text-sm bg-white" value={plan} onChange={e => setPlan(e.target.value)}>
                   {PLANES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div className="group">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">DMR</label>
                <select className="w-full border border-gray-300 rounded p-2 text-sm bg-white" value={dmr} onChange={e => setDmr(e.target.value)}>
                   {/* Generamos lista de 0 a 25 sin saltos */}
                   {Array.from({length: 26}, (_, i) => (
                       <option key={i} value={i}>{i}%</option>
                   ))}
                </select>
            </div>
            <div className="group">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Plazo</label>
                <select className="w-full border border-gray-300 rounded p-2 text-sm bg-white" value={term} onChange={e => setTerm(e.target.value)}>
                   {PLAZOS.map(p => (
                       <option key={p} value={`${p} MESES`}>{p} MESES</option>
                   ))}
                </select>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="group">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Equipo</label>
                <input className="w-full border border-gray-300 rounded p-2 text-sm bg-white" placeholder="Ej. iPhone 15" value={device} onChange={e => setDevice(e.target.value)} />
            </div>
            <div>
               <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Precio Lista Equipo</label>
               <input type="number" min="0" className="w-full border border-gray-300 rounded p-2 text-sm bg-white" value={listPrice || ''} onChange={e => setListPrice(parseFloat(e.target.value))} />
            </div>
            <div>
               <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Precio Preferencial</label>
               <input type="number" min="0" className="w-full border border-gray-300 rounded p-2 text-sm bg-white font-bold" value={prefPrice || ''} onChange={e => setPrefPrice(parseFloat(e.target.value))} />
            </div>
            <div className="flex items-center gap-2 h-10 pb-1">
               <input type="checkbox" className="w-5 h-5 text-blue-600 rounded cursor-pointer" checked={control} onChange={e => setControl(e.target.checked)} />
               <div className="leading-tight cursor-pointer" onClick={() => setControl(!control)}>
                   <span className="text-sm font-bold text-gray-700 block">Add On Control</span>
               </div>
            </div>
         </div>
         
         <div className="mt-6 flex justify-end">
            <button onClick={addItem} className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-black flex items-center gap-2 transition-all shadow-lg active:scale-95">
               <Plus size={16} /> AGREGAR A LA COTIZACIÓN
            </button>
         </div>
      </div>

      {items.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
           <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase">Resumen de Propuesta</h2>
              <div className="text-right">
                 <div className="text-[10px] text-gray-400 uppercase font-bold">Renta Mensual Total Estimada</div>
                 <div className="text-2xl font-bold text-green-600">
                    ${items.reduce((acc, curr) => acc + curr.TOTAL_MENSUAL, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                 </div>
              </div>
           </div>
           
           <div className="overflow-x-auto">
               <table className="w-full text-sm text-left mb-6">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                     <tr>
                        <th className="p-3 rounded-l-md">DN</th>
                        <th className="p-3">Plan</th>
                        <th className="p-3">Plazo</th>
                        <th className="p-3">Equipo</th>
                        <th className="p-3">Precio Especial</th>
                        <th className="p-3">Pago Eq Mes</th>
                        <th className="p-3 text-right">Total Mensual</th>
                        <th className="p-3 w-10 rounded-r-md"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                           <td className="p-3 font-medium text-gray-700">{item.DN}</td>
                           <td className="p-3 text-gray-600">{item.PLAN}</td>
                           <td className="p-3 text-gray-500">{item.PLAZO}</td>
                           <td className="p-3 text-gray-600 font-medium">{item.EQUIPO}</td>
                           <td className="p-3 text-gray-600">${item.PRECIO_ESPECIAL.toLocaleString()}</td>
                           <td className="p-3 text-gray-600">${item.PAGO_EQ_MES.toFixed(2)}</td>
                           <td className="p-3 text-right font-bold text-blue-900 bg-blue-50/30">${item.TOTAL_MENSUAL.toFixed(2)}</td>
                           <td className="p-3 text-center">
                              <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 transition-colors">
                                 <Trash size={16} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
           </div>

           <div className="flex justify-between items-center border-t pt-4">
              <div className="text-xs text-gray-500">
                  <span className="font-bold">Ahorro Total en Equipos: </span> 
                  <span className="text-green-600 font-bold text-sm">
                    ${items.reduce((acc, curr) => acc + curr.AHORRO_EQ, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setItems([])} className="px-4 py-2 text-red-500 text-xs font-bold hover:bg-red-50 rounded-lg transition-colors">BORRAR TODO</button>
                <button onClick={generatePDF} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                    <Download size={18} /> GENERAR Y DESCARGAR PDF
                </button>
              </div>
           </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-400 text-sm">Agrega una línea arriba para comenzar.</p>
        </div>
      )}
    </div>
  );
};

export default QuoteGenerator;