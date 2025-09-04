import { Dayjs } from 'dayjs';
import type { Dispatch, SetStateAction } from 'react';
import { DatosPersonales } from '../routes/Expendiente';

// Tipos base para transporte y actividades
export interface TipoTransporte {
  IdTipo: number;
  nombre: string;
  activo?: boolean;
}

export interface TipoActividad {
  id: number;
  nombre: string;
  icon?: React.ReactNode;
}

// Configuración de UI para TravelSegment
export interface TravelSegmentConfig {
  mainTitle: string;
  transportTitle: string;
  transportHint: string;
  departureTimeLabel: string;
  travelSubtitle: string;
  actividadPreguntaLabel: string;
  rutaTitulo: string;
  rutaPlaceholder: string;
  includeSchedule?: boolean;
  includeContact?: boolean;
}

// --- Props agrupadas para TravelSegment ---

// Datos y Handlers de Horario
export interface HorarioProps {
  horarioTrabajoDesde: Dayjs | null;
  setHorarioTrabajoDesde: (v: Dayjs | null) => void;
  horarioTrabajoHasta: Dayjs | null;
  setHorarioTrabajoHasta: (v: Dayjs | null) => void;
  horaSalida: Dayjs | null;
  setHoraSalida: (v: Dayjs | null) => void;
}

// Datos y Handlers de Contacto
export interface ContactoProps {
  nombreReferencia: string;
  setNombreReferencia: (v: string) => void;
  telefonoReferencia: string;
  setTelefonoReferencia: (v: string) => void;
}

// Datos y Handlers de Transporte
export interface TransporteProps {
  tipoTransporteSeleccionado: number[];
  setTipoTransporteSeleccionado: (v: number[]) => void;
  medioTransporteOtro: string;
  setMedioTransporteOtro: (v: string) => void;
}

// Datos y Handlers de Viaje
export interface ViajeProps {
  tiempoViaje: string | null;
  setTiempoViaje: (v: string | null) => void;
  haceEscalas: boolean | null;
  setHaceEscalas: (v: boolean | null) => void;
  numEscalas: number | null;
  setNumEscalas: (v: number | null) => void;
}

// Datos y Handlers de Actividades
export interface ActividadProps {
  haceActividadAntes: boolean | null;
  setHaceActividadAntes: (v: boolean | null) => void;
  actividadesSeleccionadas: number[];
  setActividadesSeleccionadas: (v: number[]) => void;
  detallesActividades: Record<number, {
    ubicacion: string;
    tiempo: string;
    frecuencia: string;
    descripcion: string;
    otro?: string;
  }>;
  setDetallesActividades: (v: ActividadProps['detallesActividades']) => void;
}

// Datos y Handlers de Rutas
export interface RutaProps {
  rutas: string[];
  setRutas: React.Dispatch<React.SetStateAction<string[]>>;
}

// Datos globales del sistema
export interface GlobalProps {
  tiposTransporte: TipoTransporte[];
  tiposActividad: TipoActividad[];
}

// Props refactorizadas para TravelSegment
export interface TravelSegmentProps {
  config: TravelSegmentConfig;
  horario?: HorarioProps;
  contacto: ContactoProps;
  transporte: TransporteProps;
  viaje: ViajeProps;
  actividad: ActividadProps;
  ruta: RutaProps;
  global: GlobalProps;
}


// --- Tipos para RutogramaPhase y Expendiente ---

// Estado completo de una ruta (ida/regreso)
export interface RutaFormState {
  rutas: string[];
  horarioTrabajoDesde: Dayjs | null;
  horarioTrabajoHasta: Dayjs | null;
  horaSalida: Dayjs | null;
  tipoTransporteSeleccionado: number[];
  medioTransporteOtro: string; // Añadido
  tiempoViaje: string | null;
  haceEscalas: boolean | null;
  numEscalas: number | null;
  haceActividadAntes: boolean | null;
  actividadesSeleccionadas: number[];
  detallesActividades: ActividadProps['detallesActividades'];
  telefonoReferencia: string;
  nombreReferencia: string;
}

// Props para RutogramaPhase
export interface RutogramaPhaseProps {
  ida: RutaFormState;
  setIda: Dispatch<SetStateAction<RutaFormState>>;
  regreso: RutaFormState;
  setRegreso: Dispatch<SetStateAction<RutaFormState>>;
  global: {
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
  };
}

// Payload para el rutograma completo
export interface IRutogramaPayload {
  ida: RutaFormState;
  regreso: RutaFormState;
  otros: {
    draftSavedAt?: string | null;
  };
}
