import React, { useState, useEffect } from 'react';
import { X, Save, Package, Tag, DollarSign, Barcode, Activity, FileText } from 'lucide-react';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const CATEGORIES = ['Servicios', 'Equipos', 'Software', 'Seguros', 'Accesorios', 'Licencias'];
const STATUSES = ['Activo', 'Inactivo', 'En Stock', 'Bajo Stock', 'Agotado'];

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Servicios',
    price: '',
    sku: '',
    status: 'Activo'
  });

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                description: '',
                category: 'Servicios',
                price: '',
                sku: '',
                status: 'Activo'
            });
        }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        ...formData,
        price: parseFloat(formData.price.toString()) || 0
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-blue-600" size={20} />
            {initialData ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-200 rounded-full p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nombre */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Producto</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"
                    placeholder="Ej. iPhone 15 Pro"
                    required
                />
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                <div className="relative">
                    <FileText className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 resize-none"
                        placeholder="Breve descripción del producto..."
                        rows={2}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Categoría */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                        >
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                {/* Precio */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio Base</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* SKU */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU / Código</label>
                    <div className="relative">
                        <Barcode className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
                            placeholder="PROD-001"
                            required
                        />
                    </div>
                </div>

                {/* Estatus */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                    <div className="relative">
                        <Activity className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                        >
                            {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
                >
                    <Save size={16} /> Guardar Producto
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;