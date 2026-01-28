import { useState, useEffect, useCallback } from 'react';
import { RutaFormState, IRutogramaPayload, GlobalDataState } from '../types/rutograma.types';

// --- Definiciones de estado inicial ---
export const initialGlobalState: GlobalDataState = {
  id: 0,
  estado: 'Borrador',
  error: undefined,
  horarioTrabajoDesde: '08:00',
  horarioTrabajoHasta: '16:30',
  horaSalida: null,
  nombreReferencia: '',
  telefonoReferencia: '',
};

const initialIdaState: RutaFormState = {
  rutas: [''],
  tipoTransporteSeleccionado: [],
  medioTransporteOtro: '',
  tiempoViaje: null,
  haceEscalas: null,
  numEscalas: null,
  haceActividadAntes: null,
  actividadesSeleccionadas: [],
  detallesActividades: {},
};

const initialRegresoState: RutaFormState = {
  id: 0,
  estado: 'Borrador',

  rutas: [''],
  tipoTransporteSeleccionado: [],
  medioTransporteOtro: '',
  tiempoViaje: null,
  haceEscalas: null,
  numEscalas: null,
  haceActividadAntes: null,
  actividadesSeleccionadas: [],
  detallesActividades: {},
};

// --- El Custom Hook ---
export const useRutogramaState = (cod_emp: string | undefined) => {
  const storageKey = `rutograma_${cod_emp || 'anon'}`;

  const [globalState, setGlobalState] = useState<GlobalDataState>(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const data: IRutogramaPayload = JSON.parse(raw);
        if (data.global) return { ...initialGlobalState, ...data.global };
      } catch (e) {
        console.warn('Fallo al parsear estado global desde localStorage', e);
      }
    }
    return initialGlobalState;
  });

  const [ida, setIda] = useState<RutaFormState>(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const data: IRutogramaPayload = JSON.parse(raw);
        if (data.ida) return { ...initialIdaState, ...data.ida };
      } catch (e) {
        console.warn('Fallo al parsear estado de ida desde localStorage', e);
      }
    }
    return initialIdaState;
  });

  const [regreso, setRegreso] = useState<RutaFormState>(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const data: IRutogramaPayload = JSON.parse(raw);
        if (data.regreso) return { ...initialRegresoState, ...data.regreso };
      } catch (e) {
        console.warn('Fallo al parsear estado de regreso desde localStorage', e);
      }
    }
    return initialRegresoState;
  });

  // Función para resetear el estado a los valores iniciales
  // ...existing code...
  const resetState = useCallback((errorOccurred = false) => {
    // Al resetear, el estado vuelve a ser 'Borrador', por lo que el guardado local se reactivará.
    setGlobalState({ ...initialGlobalState, error: errorOccurred });
    setIda(initialIdaState);
    setRegreso(initialRegresoState);
    // localStorage.removeItem(storageKey); // <-- ¡ELIMINAR ESTA LÍNEA!
  }, [storageKey]);

// ...existing code...
  useEffect(() => {
    // No hacer nada si el estado de error no está resuelto (es decir, es undefined)
    if (globalState.error === undefined) {
      return;
    }
   
    const puedeGuardarLocalmente = globalState.estado === 'Borrador' || globalState.estado === 'Devuelto';
  if (puedeGuardarLocalmente) {
    // Si el estado permite guardar, programamos el guardado como antes.
    const scheduleSave = () => {
      const payload: IRutogramaPayload = {
        global: globalState,
        ida,
        regreso,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    };
    
    const saveTimeout = window.setTimeout(scheduleSave, 500);
    return () => window.clearTimeout(saveTimeout);
  } else {
    // Si el estado es 'Pendiente' o 'Aprobado', eliminamos el borrador local.
    localStorage.removeItem(storageKey);
  }
}, [globalState, ida, regreso, storageKey]);

  return { globalState, setGlobalState, ida, setIda, regreso, setRegreso, resetState };
}
