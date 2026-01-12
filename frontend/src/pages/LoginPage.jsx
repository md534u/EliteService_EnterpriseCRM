import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ShieldCheck, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // ⚠️ IMPORTANTE: FastAPI espera formato de formulario, no JSON
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('https://crm-backend-56gq.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión');
      }

      // Si todo sale bien, guardamos el token y entramos
      login(data);
      navigate('/'); // Nos lleva al Dashboard
      
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] overflow-hidden border border-gray-100">
        
        {/* Cabecera Decorativa */}
        <div className="bg-[#0b57d0] p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <ShieldCheck size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white relative z-10">Acceso Seguro</h2>
          <p className="text-blue-100 text-sm mt-1 relative z-10">CRM Servicio Elite B2B</p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700 animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0b57d0] focus:border-transparent outline-none transition-all"
                  placeholder="Ej: AXC13163"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0b57d0] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Verificando...
                </>
              ) : (
                'Ingresar al Sistema'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">© 2026 Back Office Simplificado</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;