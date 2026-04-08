
import type { Dispatch, SetStateAction } from 'react';
import { DatosPersonales } from '@/routes/Expediente/Expendiente';

// Tipos base para transporte y actividades
export interface TipoTransporte {
  IdTipo: number;
  nombre: string;
  activo?: boolean;
}

export interface TipoActividad {
  id: number;
  nombre:string;
  icon?: React.ReactNode;
}

// Configuración de UI para TravelSegment
export interface TravelSegmentConfig {
  mainTitle: string;
  transportTitle: string;
  transportHint: string;
  transportNote: string;
  departureTimeLabel: string;
  travelSubtitle: string;
  actividadPreguntaLabel: string;
  rutaTitulo: string;
  rutaPlaceholder: string;
  includeSchedule?: boolean;
  includeContact?: boolean;
}

// --- Props agrupadas para TravelSegment ---

// Datos globales del sistema
export interface GlobalProps {
  tiposTransporte: TipoTransporte[];
  tiposActividad: TipoActividad[];
}

// Props refactorizadas para TravelSegment
export interface TravelSegmentProps {
  config: TravelSegmentConfig;
  globalState: GlobalDataState;
  setGlobalState: Dispatch<SetStateAction<GlobalDataState>>;
  formState: RutaFormState;
  setFormState: Dispatch<SetStateAction<RutaFormState>>;
  global: GlobalProps;
  disabled?: boolean;
}


// --- Tipos para RutogramaPhase y Expendiente ---

// Estado de datos globales del rutograma
export interface GlobalDataState {
  id?: number;
  estado: string;
  error?: boolean;
  horarioTrabajoDesde: string | null;
  horarioTrabajoHasta: string | null;
  horaSalida: string | null;
  nombreReferencia: string;
  telefonoReferencia: string;
  fechaEnvio?: Date;
  comentarios_revision?: string;
  fecha_aprobacion?: Date;
  cod_revisor?: string | null;
  nombre_completo_revisor?: string | null;
}

// Estado completo de una ruta (ida/regreso)
export interface RutaFormState {
  id?: number;
  estado?: string;
  error?:boolean;
  rutas: string[];
  tipoTransporteSeleccionado: number[];
  medioTransporteOtro: string; // Añadido
  tiempoViaje: string | null;
  haceEscalas: boolean | null;
  numEscalas: number | null;
  haceActividadAntes: boolean | null;
  actividadesSeleccionadas: number[];
  detallesActividades: Record<number, {
    ubicacion: string;
    tiempo: string;
    frecuencia: string;
    descripcion: string;
    otro?: string;
  }>;
}

// Props para RutogramaPhase
export interface RutogramaPhaseProps {
  ida: RutaFormState;
  setIda: Dispatch<SetStateAction<RutaFormState>>;
  regreso: RutaFormState;
  setRegreso: Dispatch<SetStateAction<RutaFormState>>;
  global: {
    globalState: GlobalDataState;
    setGlobalState: Dispatch<SetStateAction<GlobalDataState>>;
    datosPersonales: DatosPersonales | null;
    tiposTransporte: TipoTransporte[];
    tiposActividad: TipoActividad[];
    showToast: (msg: string, type?: 'success' | 'error') => void;
    setShowModalGuardarRutas: (value: boolean) => void;
    onConfirmarGuardarRutas: () => void;
    handlePreviousPhase: () => void;
    handleNextPhase: () => void;
    loading: boolean;
    bloquearCambioDatos: boolean;
    isSubmitting: boolean;
  };
}

// Payload para el rutograma completo
export interface IRutogramaPayload {
  global?: Partial<GlobalDataState>;
  ida?: Partial<RutaFormState>;
  regreso?: Partial<RutaFormState>;
}

export const validarRutograma = (
  globalData: GlobalDataState,
  idaData: RutaFormState,
  regresoData: RutaFormState,
  tiposActividad: TipoActividad[]
): string[] => {
  const errs: string[] = [];

  // Validaciones globales
  if (!globalData.horaSalida) errs.push('Hora de salida de casa es obligatoria');
  if (!globalData.horarioTrabajoDesde || !globalData.horarioTrabajoHasta) errs.push('Horario de trabajo incompleto');

  // Validaciones de Ida
  if (!idaData.rutas.some(r => r.trim() !== '')) errs.push('Debe describir al menos una ruta: Domicilio → Trabajo');
  if (!idaData.tiempoViaje) errs.push('Seleccione tiempo de viaje (ida)');
  if (idaData.haceEscalas === null) errs.push('Indique si hace escalas (ida)');
  if (idaData.haceEscalas && idaData.numEscalas === null) errs.push('Indique número de escalas (ida)');
  if (idaData.haceActividadAntes === null) errs.push('Indique si realiza actividades antes de llegar (ida)');
  if (idaData.tipoTransporteSeleccionado.length === 0) errs.push('Seleccione al menos un tipo de transporte (ida)');
  if (idaData.tipoTransporteSeleccionado.includes(8) && !idaData.medioTransporteOtro.trim()) errs.push('Debe especificar cuál es el "Otro" medio de transporte (ida)');

  // Validaciones de Regreso
  if (!regresoData.rutas.some(r => r.trim() !== '')) errs.push('Debe describir al menos una ruta: Trabajo → Domicilio');
  if (!regresoData.tiempoViaje) errs.push('Seleccione tiempo de viaje (regreso)');
  if (regresoData.haceEscalas === null) errs.push('Indique si hace escalas (regreso)');
  if (regresoData.haceEscalas && regresoData.numEscalas === null) errs.push('Indique número de escalas (regreso)');
  if (regresoData.haceActividadAntes === null) errs.push('Indique si realiza actividades antes de llegar (regreso)');
  if (regresoData.tipoTransporteSeleccionado.length === 0) errs.push('Seleccione al menos un tipo de transporte (regreso)');
  if (regresoData.tipoTransporteSeleccionado.includes(8) && !regresoData.medioTransporteOtro.trim()) errs.push('Debe especificar cuál es el "Otro" medio de transporte (regreso)');

  // Helper para validar detalles de actividades de un segmento (ida/regreso)
  const validarDetallesActividades = (data: RutaFormState, prefijo: string) => {
    if (data.haceActividadAntes) {
      if (data.actividadesSeleccionadas.length === 0) {
        errs.push(`Si indica que realiza actividades, debe seleccionar al menos una para ${prefijo}.`);
      } else {
        data.actividadesSeleccionadas.forEach(id => {
          const actividad = tiposActividad.find(a => a.id === id);
          const nombreActividad = actividad ? actividad.nombre : `ID ${id}`;
          const detalles = data.detallesActividades[id];

          if (!detalles) {
            errs.push(`Faltan detalles para la actividad "${nombreActividad}" en ${prefijo}.`);
            return;
          }

          if (!detalles.ubicacion?.trim()) {
            errs.push(`El campo "Ubicación" es obligatorio para la actividad "${nombreActividad}" en ${prefijo}.`);
          }
          if (!detalles.tiempo?.trim()) {
            errs.push(`El campo "Tiempo aproximado" es obligatorio para la actividad "${nombreActividad}" en ${prefijo}.`);
          }
          if (!detalles.frecuencia?.trim()) {
            errs.push(`El campo "Frecuencia" es obligatorio para la actividad "${nombreActividad}" en ${prefijo}.`);
          }
          if (!detalles.descripcion?.trim()) {
            errs.push(`El campo "Descripción" es obligatorio para la actividad "${nombreActividad}" en ${prefijo}.`);
          }
        });
      }
    }
  };

  validarDetallesActividades(idaData, 'la ruta de ida');
  validarDetallesActividades(regresoData, 'la ruta de regreso');

  return errs;
};