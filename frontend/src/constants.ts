export const STAGES = [
  'Solicitud Recibida', 
  'En Análisis', 
  'En Ejecución', 
  'En Espera',
  'En Seguimiento', 
  'Completada'
];

// 2. Estado excepcional (Equivalente al antiguo 'Lost')
export const STATUS_CANCELED = 'Cancelada';

// 3. Porcentaje de Progreso estimado según la etapa
// (Antes PROBABILITIES, ahora refleja cuánto falta para terminar)
export const PROGRESS_PERCENTAGE: Record<string, number> = {
  'Solicitud Recibida': 10,
  'En Análisis': 25,
  'En Ejecución': 50,
  'En Espera': 50, // Se mantiene igual que ejecución porque está pausado
  'En Seguimiento': 90,
  'Completada': 100,
  [STATUS_CANCELED]: 0
};

// 4. Descripciones operativas para tooltips o ayudas visuales
export const STAGE_DESCRIPTIONS: Record<string, string> = {
  'Solicitud Recibida': 'Requerimiento registrado en sistema, pendiente de revisión.',
  'En Análisis': 'Evaluando viabilidad, recursos necesarios o costos.',
  'En Ejecución': 'El equipo está trabajando activamente en la resolución.',
  'En Espera': 'Proceso pausado por falta de información o terceros.',
  'En Seguimiento': 'Solución entregada, en periodo de validación o monitoreo.',
  'Completada': 'Gestión finalizada exitosamente y cerrada.',
  'Cancelada': 'Gestión desestimada, rechazada o anulada.'
};