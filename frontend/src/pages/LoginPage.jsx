import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Loader2, Hexagon } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans transition-colors duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-6xl w-full flex flex-col md:flex-row min-h-[700px]">
        
        {/* Panel Izquierdo (Branding) */}
        <div className="hidden md:flex md:w-5/12 bg-[#0B0C10] relative flex-col justify-between p-12 text-white overflow-hidden">
          {/* Fondo Geométrico Sutil */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
              backgroundSize: '40px 40px'
          }}></div>
          
          {/* Efectos de Luz (Glows) */}
          <div className="absolute top-0 left-[20%] w-px h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] rotate-12 opacity-40"></div>
          <div className="absolute bottom-0 right-[20%] w-px h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)] -rotate-12 opacity-40"></div>
          
          {/* Contenido Central */}
          <div className="relative z-10 flex flex-col h-full justify-center items-center text-center">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-2xl mb-8 transform transition-transform hover:scale-105 duration-500">
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Hexagon className="text-white" size={32} fill="currentColor" />
              </div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight text-white">BO Simplificado</h1>
              <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full my-4"></div>
              <p className="text-gray-300 text-sm font-medium tracking-wider uppercase">CRM Servicio Elite B2B</p>
            </div>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed font-light">
              Plataforma de gestión empresarial inteligente con análisis de datos geométricos.
            </p>
          </div>
          
          {/* Footer Izquierdo */}
          <div className="relative z-10 text-center">
            <span className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">System v3.0.4</span>
          </div>
        </div>

        {/* Panel Derecho (Formulario) */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-white relative">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h2>
              <p className="text-gray-500">Ingrese sus credenciales para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700 animate-pulse">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 ml-1">Usuario</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-150 ease-in-out sm:text-sm focus:bg-white"
                    placeholder="Ingrese su usuario"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 ml-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-150 ease-in-out sm:text-sm focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3.5 px-4 rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:-translate-y-0.5 tracking-wide"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>VERIFICANDO...</span>
                    </div>
                  ) : (
                    'INGRESAR'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-xs text-gray-400">
                © 2026 Back Office Simplificado. Protected by Enterprise Shield.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;