import React, { useState } from 'react';
import axios from 'axios';
import { Search, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const SearchPage = () => {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    try {
      const res = await axios.get(`${API_URL}/search/?term=${term}`);
      if (res.data) {
        setResult(res.data);
      } else {
        setError('No se encontraron resultados.');
      }
    } catch (err) {
      setError('Ocurrió un error en la búsqueda.');
    }
  };

  const goToUniverse = () => {
      // In a real app, we would navigate to the detail page.
      // For now, let's just show an alert or navigate to universe root
      if (result?.tipo === 'CLIENTE') {
        navigate(`/universe/${result.ID_Cliente}`);
      } else {
        navigate('/universe'); // Prospect viewing not implemented specifically
      }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Búsqueda Global</h1>
      
      <div className="google-card p-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" />
            <input 
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg shadow-sm"
              placeholder="Buscar por Teléfono (DN), Razón Social o Nombre..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 bg-blue-600 text-white px-6 py-1.5 rounded-full hover:bg-blue-700 transition-colors font-medium"
            >
              Buscar
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 animate-fade-in-up">
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
              <div className="bg-[#0057b8] text-white px-6 py-3 flex justify-between items-center">
                 <div className="font-medium flex items-center gap-2">
                   <ExternalLink size={18} />
                   EXPEDIENTE DIGITAL
                 </div>
                 <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded">
                   {result.tipo}
                 </span>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{result.nombre}</h2>
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Línea Móvil</span>
                  <div className="text-lg font-mono text-gray-900">{result.linea_movil}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {result.Plan && (
                    <div>
                      <span className="block text-xs text-gray-500 uppercase font-bold">Plan</span>
                      <span className="text-gray-800">{result.Plan}</span>
                    </div>
                  )}
                  {result.Estado && (
                    <div>
                      <span className="block text-xs text-gray-500 uppercase font-bold">Estado</span>
                      <span className="text-gray-800">{result.Estado}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-bold">Segmento</span>
                    <span className="text-gray-800">{result.Segmento}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={goToUniverse}
                    className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    Ver Detalle Completo
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
