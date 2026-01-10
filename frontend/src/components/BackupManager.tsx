import React, { useState } from 'react';
import { API_URL } from '../config'; // Asumiendo que existe, si no, usar URL directa o props

interface BackupStats {
  file_count: number;
  total_size_mb: number;
  total_size_bytes: number;
  files?: string[]; // Agregamos el campo opcional para la lista de archivos
}

const BackupManager = () => {
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(false);

  const checkBackupSize = async () => {
    setLoading(true);
    try {
      // Ajusta la URL si es necesario según tu configuración
      const response = await fetch(`${API_URL}/stats/backups-size`);
      
      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }

      const data: BackupStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching backup stats:", error);
      alert("No se pudo obtener la información de los backups.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>💾 Gestión de Backups</h3>
      
      <div style={styles.controls}>
        <button 
          onClick={checkBackupSize} 
          disabled={loading} 
          style={{...styles.button, opacity: loading ? 0.7 : 1}}
        >
          {loading ? 'Calculando...' : 'Verificar Espacio Usado'}
        </button>
      </div>

      {stats && (
        <div style={styles.statsBox}>
          <div style={styles.statItem}>
            <span style={styles.label}>Archivos de respaldo:</span>
            <span style={styles.value}>{stats.file_count}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.label}>Tamaño Total:</span>
            <span style={styles.value}>{stats.total_size_mb} MB</span>
          </div>
          <p style={styles.byteInfo}>({stats.total_size_bytes.toLocaleString()} bytes)</p>

          {/* Renderizamos la lista de archivos si existen */}
          {stats.files && stats.files.length > 0 && (
            <div style={styles.fileListContainer}>
              <h4 style={styles.fileListTitle}>Archivos Disponibles:</h4>
              <ul style={styles.fileList}>
                {stats.files.map((file, index) => (
                  <li key={index} style={styles.fileItem}>📄 {file}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Estilos básicos en línea
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fff',
    maxWidth: '400px',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    margin: '0 0 15px 0',
    color: '#333',
    fontSize: '18px'
  },
  controls: {
    marginBottom: '15px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  statsBox: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    border: '1px solid #eee'
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  label: {
    color: '#666'
  },
  value: {
    fontWeight: 'bold',
    color: '#333'
  },
  byteInfo: {
    fontSize: '11px',
    color: '#999',
    textAlign: 'right',
    margin: '5px 0 0 0'
  },
  fileListContainer: {
    marginTop: '15px',
    borderTop: '1px solid #e0e0e0',
    paddingTop: '10px'
  },
  fileListTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '8px',
    marginTop: 0
  },
  fileList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    maxHeight: '120px',
    overflowY: 'auto',
    border: '1px solid #eee',
    borderRadius: '4px',
    backgroundColor: '#fff'
  },
  fileItem: {
    padding: '6px 10px',
    fontSize: '12px',
    borderBottom: '1px solid #f0f0f0',
    color: '#444'
  }
};

export default BackupManager;
