import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Filter, Edit, Trash, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import ProductForm from './ProductForm';
import { API_URL } from '../config';

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Cantidad de productos por página

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Resetear a página 1 al buscar
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleSaveProduct = async (productData: any) => {
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, productData);
      } else {
        await axios.post(`${API_URL}/products`, productData);
      }
      fetchProducts();
      handleClose();
    } catch (error: any) {
      console.error("Error saving product:", error);
      const msg = error.response?.data?.detail || error.message || "Error desconocido";
      alert(`Error al guardar: ${msg}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      fetchProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      const msg = error.response?.data?.detail || error.message || "Error desconocido";
      alert(`Error al eliminar: ${msg}`);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-blue-600" /> Catálogo de Productos
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona el inventario de equipos, planes y servicios.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center gap-2 transition-colors">
                <Filter size={16} /> Filtros
            </button>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12 text-gray-400">
            <Loader2 className="animate-spin mr-2" /> Cargando productos...
          </div>
        ) : (
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4 text-right">Precio Base</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                        {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{product.sku}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-700">
                    ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.status === 'Activo' || product.status === 'En Stock' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                             product.status === 'Activo' || product.status === 'En Stock' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></span>
                        {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleEdit(product)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Editar"
                        >
                            <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Eliminar"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        No se encontraron productos que coincidan con tu búsqueda.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
        )}
      </div>

      {/* Controles de Paginación */}
      {!loading && filteredProducts.length > 0 && (
        <div className="flex justify-between items-center mt-4 px-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="text-sm text-gray-500">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredProducts.length)} de {filteredProducts.length} resultados
          </span>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white text-gray-600"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2">
                Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white text-gray-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <ProductForm 
        isOpen={isModalOpen} 
        onClose={handleClose} 
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />
    </div>
  );
};

export default ProductList;
