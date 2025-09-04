import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { RutaFormState, IRutogramaPayload } from '../types/rutograma.types';

// --- Funciones de ayuda para serialización y parseo ---
const serializeTime = (t: any) => {
  if (t && typeof t.format === 'function') return t.format('HH:mm');
  if (typeof t === 'string' && /^\d{2}:\d{2}$/.test(t)) return t;
  return null;
};

const parseTime = (s: any) => {
  if (s === null || s === undefined) return null;
  const d = dayjs(s, 'HH:mm');
  return d.isValid() ? d : null;
};

const serializeState = (state: RutaFormState): any => ({
  ...state,
  horarioTrabajoDesde: serializeTime(state.horarioTrabajoDesde),
  horarioTrabajoHasta: serializeTime(state.horarioTrabajoHasta),
  horaSalida: serializeTime(state.horaSalida),
});

const parseState = (state: any): RutaFormState => ({
  ...state,
  horarioTrabajoDesde: parseTime(state.horarioTrabajoDesde),
  horarioTrabajoHasta: parseTime(state.horarioTrabajoHasta),
  horaSalida: parseTime(state.horaSalida),
});

// --- Definiciones de estado inicial ---
const initialIdaState: RutaFormState = {
  rutas: [''],
  horarioTrabajoDesde: dayjs().set('hour', 8).set('minute', 0),
  horarioTrabajoHasta: dayjs().set('hour', 16).set('minute', 30),
  horaSalida: null,
  tipoTransporteSeleccionado: [],
  medioTransporteOtro: '',
  tiempoViaje: null,
  haceEscalas: null,
  numEscalas: null,
  haceActividadAntes: null,
  actividadesSeleccionadas: [],
  detallesActividades: {},
  telefonoReferencia: '',
  nombreReferencia: '',
};

const initialRegresoState: RutaFormState = {
  rutas: [''],
  horarioTrabajoDesde: null,
  horarioTrabajoHasta: null,
  horaSalida: null,
  tipoTransporteSeleccionado: [],
  medioTransporteOtro: '',
  tiempoViaje: null,
  haceEscalas: null,
  numEscalas: null,
  haceActividadAntes: null,
  actividadesSeleccionadas: [],
  detallesActividades: {},
  telefonoReferencia: '',
  nombreReferencia: '',
};

// --- El Custom Hook ---
export const useRutogramaState = (cod_emp: string | undefined) => {
  const storageKey = `rutograma_${cod_emp || 'anon'}`;

  const [ida, setIda] = useState<RutaFormState>(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const data: IRutogramaPayload = JSON.parse(raw);
        if (data.ida) return parseState(data.ida);
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
        if (data.regreso) return parseState(data.regreso);
      } catch (e) {
        console.warn('Fallo al parsear estado de regreso desde localStorage', e);
      }
    }
    return initialRegresoState;
  });

  useEffect(() => {
    const scheduleSave = () => {
      const payload: IRutogramaPayload = {
        ida: serializeState(ida),
        regreso: serializeState(regreso),
        otros: { draftSavedAt: new Date().toISOString() },
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    };
    const saveTimeout = window.setTimeout(scheduleSave, 500);
    return () => window.clearTimeout(saveTimeout);
  }, [ida, regreso, storageKey]);

  return { ida, setIda, regreso, setRegreso };
};
