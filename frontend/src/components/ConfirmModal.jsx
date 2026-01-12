import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null; // Si no está abierto, no renderiza nada

  return (
    // 1. El Fondo Oscuro (Overlay)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity">
      
      {/* 2. La Caja Blanca (El Modal) */}
      <div className="bg-white rounded-lg shadow-2xl p-6 w-96 transform transition-all scale-100">
        
        {/* Título e Ícono */}
        <div className="flex items-center mb-4">
          <div className="bg-yellow-100 p-2 rounded-full mr-3">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6 text-sm">
          {message}
        </p>

        {/* Botones */}
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm font-medium"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-lg transition text-sm font-medium"
          >
            Sí, cerrar sesión
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;