import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User, Briefcase, Search, X, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';
import { useToast } from '../context/ToastContext';

interface UserData {
  id: number;
  username: string;
  role: string;
  full_name?: string;
  position?: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    position: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const res = await fetch(`${API_URL}/auth/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Usuario eliminado correctamente', 'success');
        fetchUsers();
      } else {
        addToast('Error al eliminar usuario', 'error');
      }
    } catch (error) {
      addToast('Error de conexión', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        addToast('Usuario creado exitosamente', 'success');
        setShowModal(false);
        setFormData({ username: '', password: '', full_name: '', position: '', role: 'user' });
        fetchUsers();
      } else {
        const err = await res.json();
        addToast(err.detail || 'Error al crear usuario', 'error');
      }
    } catch (error) {
      addToast('Error de conexión', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm">Administra el acceso y roles del sistema</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
        >
          <UserPlus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {/* Lista de Usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Puesto</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">Cargando...</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                        {u.full_name ? u.full_name.charAt(0) : u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.full_name || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        u.role === 'soporte' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {u.position || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(u.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Creación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Crear Nuevo Usuario</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input required type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                  <input required type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puesto</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input required type="password" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="user">Usuario (Ventas)</option>
                  <option value="soporte">Soporte</option>
                  <option value="gerente">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
                Guardar Usuario
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;