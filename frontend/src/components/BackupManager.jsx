import React, { useState } from 'react';

const API_URL = 'https://crm-backend-56gq.onrender.com';

const BackupManager = () => {
  const [stats, setStats] = useState({
    file_count: 0,
    total_size_mb: 0,
    total_size_bytes: 0,
    files: []
  });

  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const checkBackupSize = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/stats/backups-size`);

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }

      const data = await response.json();

      // ✅ NORMALIZAMOS DATOS (CLAVE)
      setStats({
        file_count: data?.file_count ?? 0,
        total_size_mb: data?.total_size_mb ?? 0,
        total_size_bytes: data?.total_size_bytes ?? 0,
        files: Array.isArray(data?.files) ? data.files : []
      });

      setHasData(true);
    } catch (error) {
      console.error('Error fetching backup stats:', error);
      alert('No se pudo obtener la información de los backups.');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      // NOTA: Ajusta '/backups' si tu ruta en el backend es diferente (ej: /api/create-backup)
      // ⚠️ Reemplaza '/create-backup' con la ruta exacta de tu @app.post(...) en el backend
      const response = await fetch(`${API_URL}/create-backup`, {
        method: 'POST',
      });

      if (!response.ok) {
        // Intentamos leer el mensaje de error que envía el servidor
        const errorText = await response.text();
        throw new Error(`Código ${response.status}: ${errorText || response.statusText}`);
      }

      alert('✅ Backup creado exitosamente');
      // Actualizamos las estadísticas automáticamente para ver el nuevo archivo
      checkBackupSize();
    } catch (error) {
      console.error('Error creating backup:', error);
      alert(`❌ Error al crear backup: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = async (filename) => {
    try {
      // Asumimos que el endpoint para descargar es GET /backups/{filename}
      const response = await fetch(`${API_URL}/backups/${filename}`);

      if (!response.ok) throw new Error('Error en la descarga');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading:', error);
      alert('❌ No se pudo descargar el archivo.');
    }
  };

  const restoreBackup = async (filename) => {
    const confirmMessage = `⚠️ PELIGRO: ¿Estás seguro de que deseas restaurar "${filename}"?\n\nEsto SOBREESCRIBIRÁ todos los datos actuales con la versión de este backup. Esta acción no se puede deshacer.`;
    
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/restore-backup/${filename}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Error al restaurar la base de datos');

      alert('✅ Sistema restaurado exitosamente. La página se recargará.');
      window.location.reload(); // Recargamos para ver los datos antiguos restaurados
    } catch (error) {
      console.error('Error restoring:', error);
      alert('❌ Hubo un error al restaurar el sistema.');
      setLoading(false);
    }
  };

  const deleteBackup = async (filename) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el archivo "${filename}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/backups/${filename}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el backup');

      checkBackupSize(); // Actualizamos la lista para que desaparezca el archivo eliminado
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert('❌ Hubo un error al eliminar el backup.');
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>💾 Gestión de Backups</h3>

      <div style={styles.controls}>
        <button
          onClick={checkBackupSize}
          disabled={loading}
          style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Calculando...' : 'Verificar Espacio Usado'}
        </button>
        <button
          onClick={createBackup}
          disabled={creating}
          style={{
            ...styles.button,
            backgroundColor: '#28a745', // Color verde para diferenciarlo
            opacity: creating ? 0.7 : 1
          }}
        >
          {creating ? 'Creando...' : 'Crear Nuevo Backup'}
        </button>
      </div>

      {hasData && (
        <div style={styles.statsBox}>
          <div style={styles.statItem}>
            <span style={styles.label}>Archivos de respaldo:</span>
            <span style={styles.value}>{stats.file_count}</span>
          </div>

          <div style={styles.statItem}>
            <span style={styles.label}>Tamaño Total:</span>
            <span style={styles.value}>
              {Number(stats.total_size_mb).toLocaleString()} MB
            </span>
          </div>

          <p style={styles.byteInfo}>
            ({Number(stats.total_size_bytes).toLocaleString()} bytes)
          </p>

          {stats.files.length > 0 && (
            <div style={styles.fileListContainer}>
              <h4 style={styles.fileListTitle}>Archivos Disponibles:</h4>
              <ul style={styles.fileList}>
                {stats.files.map((file, index) => (
                  <li key={index} style={styles.fileItem}>
                    <span>📄 {file}</span>
                    <div>
                      <button
                        onClick={() => restoreBackup(file)}
                        style={styles.restoreBtn}
                        title="Restaurar este backup"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => downloadBackup(file)}
                        style={styles.downloadBtn}
                        title="Descargar"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => deleteBackup(file)}
                        style={styles.deleteBtn}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 🎨 Estilos
const styles = {
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
    marginBottom: '15px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
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
    color: '#444',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  downloadBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 5px'
  },
  restoreBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 5px',
    marginRight: '8px'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 5px',
    marginLeft: '5px'
  }
};

export default BackupManager;
