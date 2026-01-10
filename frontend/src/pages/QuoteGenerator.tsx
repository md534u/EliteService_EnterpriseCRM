import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Plus, Download, Trash } from 'lucide-react';
import { API_URL } from '../config';

const PLANES = [
  "AT&T Ármalo Negocios $239", "AT&T Ármalo Negocios $299", "AT&T Ármalo Negocios $399",
  "AT&T Ármalo Negocios $499", "AT&T Ármalo Negocios $599", "AT&T Ármalo Negocios $699",
  "AT&T Ármalo Negocios $799", "AT&T Ármalo Negocios $899", "AT&T Ármalo Negocios $999",
  "AT&T Ármalo Negocios $1,299", "AT&T Ármalo Negocios $1,499"
];

const PRECIOS = {
    "AT&T Ármalo Negocios $239": 239.0, "AT&T Ármalo Negocios $299": 299.0, "AT&T Ármalo Negocios $399": 399.0,
    "AT&T Ármalo Negocios $499": 499.0, "AT&T Ármalo Negocios $599": 599.0, "AT&T Ármalo Negocios $699": 699.0,
    "AT&T Ármalo Negocios $799": 799.0, "AT&T Ármalo Negocios $899": 899.0, "AT&T Ármalo Negocios $999": 999.0,
    "AT&T Ármalo Negocios $1,299": 1299.0, "AT&T Ármalo Negocios $1,499": 1499.0
};

const QuoteGenerator = () => {
  const [clientName, setClientName] = useState('');
  const [repName, setRepName] = useState('');
  const [items, setItems] = useState<any[]>([]);

  // Item Form
  const [dn, setDn] = useState('');
  const [plan, setPlan] = useState(PLANES[0]);
  const [dmr, setDmr] = useState('0');
  const [term, setTerm] = useState('24 MESES');
  const [device, setDevice] = useState('');
  const [listPrice, setListPrice] = useState(0);
  const [prefPrice, setPrefPrice] = useState(0);
  const [control, setControl] = useState(false);

  const addItem = () => {
    const basePrice = PRECIOS[plan as keyof typeof PRECIOS] || 0;
    const dmrVal = parseFloat(dmr) / 100;
    const netPlan = basePrice * (1 - dmrVal);
    
    let months = 24;
    try { months = parseInt(term.split(' ')[0]); } catch(e) {}
    
    const devicePayment = months > 0 ? prefPrice / months : 0;
    const addon = control ? (basePrice < 500 ? 30 : 50) : 0;
    
    const total = netPlan + devicePayment + addon;
    const saving = listPrice - prefPrice;

    const newItem = {
      DN: dn || 'N/A',
      PLAN: plan + (control ? ' + Control' : ''),
      PLAZO: term,
      EQUIPO: device || 'Propio',
      PRECIO_ESPECIAL: prefPrice,
      PAGO_EQ_MES: devicePayment,
      TOTAL_MENSUAL: total,
      AHORRO_EQ: saving
    };

    setItems([...items, newItem]);
    // Reset fields
    setDn(''); setDevice(''); setListPrice(0); setPrefPrice(0);
  };

  const generatePDF = async () => {
    if (!clientName || items.length === 0) return alert("Faltan datos");
    
    try {
      const payload = {
        Nombre_Cliente: clientName,
        Representante: repName,
        Fecha_Emision: new Date().toISOString().split('T')[0],
        Vigencia: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        Items: items
      };

      const res = await axios.post(`${API_URL}/quotes/generate`, payload, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cotizacion_${clientName}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      console.error(e);
      alert("Error generando PDF");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="text-att-blue" />
        Generador de Propuesta Comercial
      </h1>

      <div className="google-card mb-6">
         <h2 className="text-lg font-bold text-gray-700 border-b pb-2 mb-4">1. Datos Generales</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Razón Social</label>
              <input className="input-field" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ej. ACME Corp" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Representante Legal</label>
              <input className="input-field" value={repName} onChange={e => setRepName(e.target.value)} placeholder="Nombre Completo" />
            </div>
         </div>
      </div>

      <div className="google-card mb-6 bg-blue-50 border border-blue-100">
         <h2 className="text-lg font-bold text-gray-700 border-b border-blue-200 pb-2 mb-4">2. Configuración de Línea</h2>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input className="input-field" placeholder="DN (Opcional)" value={dn} onChange={e => setDn(e.target.value)} />
            <select className="input-field" value={plan} onChange={e => setPlan(e.target.value)}>
               {PLANES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="input-field" value={dmr} onChange={e => setDmr(e.target.value)}>
               <option value="0">DMR 0%</option>
               <option value="10">DMR 10%</option>
               <option value="15">DMR 15%</option>
               <option value="20">DMR 20%</option>
            </select>
            <select className="input-field" value={term} onChange={e => setTerm(e.target.value)}>
               <option>24 MESES</option>
               <option>12 MESES</option>
               <option>36 MESES</option>
            </select>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <input className="input-field" placeholder="Equipo" value={device} onChange={e => setDevice(e.target.value)} />
            <div>
               <label className="text-xs text-gray-500">Precio Lista</label>
               <input type="number" className="input-field" value={listPrice} onChange={e => setListPrice(parseFloat(e.target.value))} />
            </div>
            <div>
               <label className="text-xs text-gray-500">Precio Preferencial</label>
               <input type="number" className="input-field" value={prefPrice} onChange={e => setPrefPrice(parseFloat(e.target.value))} />
            </div>
            <div className="flex items-center gap-2 h-11">
               <input type="checkbox" className="w-5 h-5 text-att-blue" checked={control} onChange={e => setControl(e.target.checked)} />
               <span className="text-sm font-medium">Add On Control</span>
            </div>
         </div>
         <div className="mt-4 flex justify-end">
            <button onClick={addItem} className="btn-primary flex items-center gap-2 bg-gray-800 hover:bg-black">
               <Plus size={18} /> Agregar Item
            </button>
         </div>
      </div>

      {items.length > 0 && (
        <div className="google-card">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-700">Resumen de Partidas</h2>
              <div className="text-right">
                 <div className="text-xs text-gray-500 uppercase font-bold">Total Mensual Estimado</div>
                 <div className="text-2xl font-bold text-green-600">
                    ${items.reduce((acc, curr) => acc + curr.TOTAL_MENSUAL, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                 </div>
              </div>
           </div>
           
           <table className="w-full text-sm text-left mb-6">
              <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs">
                 <tr>
                    <th className="p-3">DN</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Plazo</th>
                    <th className="p-3">Equipo</th>
                    <th className="p-3 text-right">Mensualidad</th>
                    <th className="p-3 w-10"></th>
                 </tr>
              </thead>
              <tbody>
                 {items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                       <td className="p-3">{item.DN}</td>
                       <td className="p-3">{item.PLAN}</td>
                       <td className="p-3">{item.PLAZO}</td>
                       <td className="p-3">{item.EQUIPO}</td>
                       <td className="p-3 text-right font-bold">${item.TOTAL_MENSUAL.toFixed(2)}</td>
                       <td className="p-3 text-center">
                          <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                             <Trash size={16} />
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>

           <div className="flex justify-end gap-4">
              <button onClick={() => setItems([])} className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg">Borrar Todo</button>
              <button onClick={generatePDF} className="btn-primary flex items-center gap-2">
                 <Download size={18} /> Generar y Descargar PDF
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default QuoteGenerator;