import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { FaArrowRight, FaArrowLeft, FaArrowUp, FaTimes } from 'react-icons/fa';
import dayjs from 'dayjs';
import { useAuth } from '../../auth/AuthProvider';
import style from '../../css/ExpedienteEmpleado.module.css';
import IntroRutograma from './IntroRutograma';
import ModalConfirmarGuardarRutas from '../../components/ModalConfirmarGuardarRutas';
import TravelSegment from './TravelSegment';
import { RutogramaPhaseProps, IRutogramaPayload, RutaFormState, TravelSegmentConfig } from '../../types/rutograma.types'; // Importar tipos

const RutogramaPhase: React.FC<RutogramaPhaseProps> = ({
  ida,
  setIda,
  regreso,
  setRegreso,
  global
}) => {
  // Estado para intro
  const [showIntro, setShowIntro] = useState(true);
  const { cod_emp } = useAuth();
  const storageKeyRef = useRef(`rutograma_${cod_emp || 'anon'}`); // almacén principal (auto-guardado)
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrorsAlert, setShowErrorsAlert] = useState(true);
  const [showResumen, setShowResumen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showExit, setShowExit] = useState(false);
  // Agrega el estado para mostrarRegreso
  const [mostrarRegreso, setMostrarRegreso] = useState(false);
  // Agrega el estado para draftSavedAt
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // Altura dinámica para eliminar espacio en blanco cuando una cara es más alta que la otra
  const flipContainerRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
  // Control de visibilidad display:none de cada cara
  const [showFrontFace, setShowFrontFace] = useState(true);
  const [showBackFace, setShowBackFace] = useState(false);
  const FLIP_ANIM_MS = 700; // Debe coincidir con transición CSS

  // --- Lógica de parseo y serialización ---
  const serializeTime = (t: any) => {
    if (t && typeof t.format === 'function') return t.format('HH:mm');
    if (typeof t === 'string' && /^\d{2}:\d{2}$/.test(t)) return t;
    return null;
  };
  const parseTime = (s: any) => {
    console.log('Parsing time:', s);
    if (s === null || s === undefined) return null; // <-- Manejo explícito de null/undefined
    const d = dayjs(s, 'HH:mm');
    return d.isValid() ? d : null;
    console.log('Parsed time:', d);

  };

  const serializeState = (state: RutaFormState): any => (
    console.log('Serializing state:', state),{
    ...state,
    horarioTrabajoDesde: serializeTime(state.horarioTrabajoDesde),
    horarioTrabajoHasta: serializeTime(state.horarioTrabajoHasta),
    horaSalida: serializeTime(state.horaSalida),
  });

  const parseState = (state: any, initial: RutaFormState): RutaFormState => ({
    ...state,
    horarioTrabajoDesde: state.horarioTrabajoDesde !== null && state.horarioTrabajoDesde !== undefined
      ? parseTime(state.horarioTrabajoDesde)
      : initial.horarioTrabajoDesde,
    horarioTrabajoHasta: state.horarioTrabajoHasta !== null && state.horarioTrabajoHasta !== undefined
      ? parseTime(state.horarioTrabajoHasta)
      : initial.horarioTrabajoHasta,
    horaSalida: state.horaSalida !== null && state.horaSalida !== undefined
      ? parseTime(state.horaSalida)
      : initial.horaSalida,
  });

  // --- Lógica de guardado y restauración ---
  const scheduleSave = useCallback(() => {
    const payload: IRutogramaPayload = {
      
      ida: serializeState(ida),
      regreso: serializeState(regreso),
      otros: { draftSavedAt: new Date().toISOString() }
    };
    localStorage.setItem(storageKeyRef.current, JSON.stringify(payload));
    setDraftSavedAt(new Date().toLocaleString());
  }, [ida, regreso]);

  useEffect(() => {
    const saveTimeout = window.setTimeout(scheduleSave, 500);
    return () => window.clearTimeout(saveTimeout);
  }, [ida, regreso, scheduleSave]);

  useEffect(() => {
    const raw = localStorage.getItem(storageKeyRef.current);
    if (!raw) return;
    try {
      const data: IRutogramaPayload = JSON.parse(raw);
      if (data.ida) setIda(parseState(data.ida, ida)); // <-- usa el estado inicial de ida
      if (data.regreso) setRegreso(parseState(data.regreso, regreso)); // <-- usa el estado inicial de regreso
      if (data.otros?.draftSavedAt) setDraftSavedAt(new Date(data.otros.draftSavedAt).toLocaleString());
    } catch (e) {
      console.warn('No se pudo restaurar rutograma:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // --- Lógica de UI y Animaciones (sin cambios) ---
  const measureActiveHeight = useCallback(() => {
    const active = mostrarRegreso ? backRef.current : frontRef.current;
    if (active) {
      const h = active.offsetHeight;
      if (h && h !== contentHeight) setContentHeight(h);
    }
  }, [mostrarRegreso, contentHeight]);

  useEffect(() => {
    measureActiveHeight();
    const id = window.setTimeout(measureActiveHeight, 300);
    return () => window.clearTimeout(id);
  }, [measureActiveHeight, ida, regreso]);

  useEffect(() => {
    const active = mostrarRegreso ? backRef.current : frontRef.current;
    if (!active || !(window as any).ResizeObserver) return;
    const ro = new (window as any).ResizeObserver(() => measureActiveHeight());
    ro.observe(active);
    return () => ro.disconnect();
  }, [mostrarRegreso, measureActiveHeight]);

  useEffect(() => { if (!showIntro) measureActiveHeight(); }, [showIntro, measureActiveHeight]);

  useEffect(() => {
    if (showIntro) return;
    let timeout: number | undefined;
    if (mostrarRegreso) {
      // mostrar regreso antes del flip
      setShowBackFace(true);
      // tras animación ocultar ida
      timeout = window.setTimeout(() => setShowFrontFace(false), FLIP_ANIM_MS + 30);
    } else {
      setShowFrontFace(true);
      timeout = window.setTimeout(() => setShowBackFace(false), FLIP_ANIM_MS + 30);
    }
    return () => { if (timeout) window.clearTimeout(timeout); };
  }, [mostrarRegreso, showIntro]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowExit(window.scrollY > 150);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // --- Lógica de Validación y Handlers ---
  function validarRutograma(idaData: RutaFormState, regresoData: RutaFormState) {
    const errs: string[] = [];
    if (!idaData.rutas.some(r => r.trim() !== '')) errs.push('Debe describir al menos una ruta: Domicilio → Trabajo');
    if (!regresoData.rutas.some(r => r.trim() !== '')) errs.push('Debe describir al menos una ruta: Trabajo → Domicilio');
    if (!idaData.horaSalida) errs.push('Hora de salida de casa es obligatoria');
    if (!idaData.horarioTrabajoDesde || !idaData.horarioTrabajoHasta) errs.push('Horario de trabajo incompleto');
    if (!idaData.tiempoViaje) errs.push('Seleccione tiempo de viaje (ida)');
    if (idaData.haceEscalas === null) errs.push('Indique si hace escalas (ida)');
    if (idaData.haceEscalas && idaData.numEscalas === null) errs.push('Indique número de escalas (ida)');
    if (idaData.haceActividadAntes === null) errs.push('Indique si realiza actividades antes de llegar (ida)');
    if (idaData.haceActividadAntes) {
      if (idaData.actividadesSeleccionadas.length === 0) {
        errs.push('Debe seleccionar al menos una actividad que realiza antes de llegar al trabajo (ida).');
      } else {
        idaData.actividadesSeleccionadas.forEach(idActividad => {
          const actividad = global.tiposActividad.find(a => a.id === idActividad);
          const nombreActividad = actividad ? actividad.nombre : `Actividad ID ${idActividad}`;
          const detalles = idaData.detallesActividades[idActividad];
          if (!detalles || !detalles.ubicacion?.trim() || !detalles.tiempo || !detalles.descripcion?.trim()) {
            errs.push(`Debe completar todos los detalles (ubicación, tiempo, descripción) para la actividad "${nombreActividad}" en la ruta de ida.`);
          }
        });
      }
    }
    if (!regresoData.tiempoViaje) errs.push('Seleccione tiempo de viaje (regreso)');
    if (regresoData.haceEscalas === null) errs.push('Indique si hace escalas (regreso)');
    if (regresoData.haceEscalas && regresoData.numEscalas === null) errs.push('Indique número de escalas (regreso)');
    if (regresoData.haceActividadAntes === null) errs.push('Indique si realiza actividades antes de llegar (regreso)');
    if (regresoData.haceActividadAntes) {
      if (regresoData.actividadesSeleccionadas.length === 0) {
        errs.push('Debe seleccionar al menos una actividad que realiza después de salir del trabajo (regreso).');
      } else {
        regresoData.actividadesSeleccionadas.forEach(idActividad => {
          const actividad = global.tiposActividad.find(a => a.id === idActividad);
          const nombreActividad = actividad ? actividad.nombre : `Actividad ID ${idActividad}`;
          const detalles = regresoData.detallesActividades[idActividad];
          if (!detalles || !detalles.ubicacion || !detalles.tiempo || !detalles.descripcion?.trim()) {
            errs.push(`Debe completar todos los detalles (ubicación, tiempo, descripción) para la actividad "${nombreActividad}" en la ruta de regreso.`);
          }
        });
      }
    }
    if (idaData.tipoTransporteSeleccionado.length === 0) errs.push('Seleccione al menos un tipo de transporte (ida)');
    if (idaData.tipoTransporteSeleccionado.includes(8) && !idaData.medioTransporteOtro.trim()) errs.push('Debe especificar cuál es el "Otro" medio de transporte (ida)');
    if (regresoData.tipoTransporteSeleccionado.length === 0) errs.push('Seleccione al menos un tipo de transporte (regreso)');
    if (regresoData.tipoTransporteSeleccionado.includes(8) && !regresoData.medioTransporteOtro.trim()) errs.push('Debe especificar cuál es el "Otro" medio de transporte (regreso)');
    return errs;
  }

  const validarYContinuar = () => {
    const errs = validarRutograma(ida, regreso);
    setErrors(errs);
    setShowErrorsAlert(true);
    if (errs.length > 0) {
      global.showToast('Revise los errores del formulario', 'error');
      return false;
    }
    setShowResumen(true);
    global.setShowModalGuardarRutas(true);
    return true;
  };

  const handleFlip = (showRegreso: boolean) => {
    setMostrarRegreso(showRegreso);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showIntro) {
    return (
      <IntroRutograma
        onStart={() => setShowIntro(false)}
        global={global}
        handlePreviousPhase={global.handlePreviousPhase}
      />
    );
  }

  // --- Configuración para TravelSegment ---
  const configIda: TravelSegmentConfig = {
    mainTitle: "Ruta de ida: Domicilio → Trabajo",
    transportTitle: "Medio(s) de transporte que utiliza para ir al trabajo",
    transportHint: "Puede seleccionar varias opciones",
    departureTimeLabel: "Hora de salida de casa",
    travelSubtitle: "Durante el viaje de ida",
    actividadPreguntaLabel: "¿Realiza alguna actividad antes de llegar al trabajo?",
    rutaTitulo: "Describa su ruta habitual de ida",
    rutaPlaceholder: "Ej: Tomo el metro en la estación X, hago trasbordo en Y...",
    includeSchedule: true,
    includeContact: true,
  };

  const configRegreso: TravelSegmentConfig = {
    mainTitle: "Ruta de regreso: Trabajo → Domicilio",
    transportTitle: "Medio(s) de transporte que utiliza para regresar a casa",
    transportHint: "Puede seleccionar varias opciones",
    departureTimeLabel: "", // No se pregunta en el regreso
    travelSubtitle: "Durante el viaje de regreso",
    actividadPreguntaLabel: "¿Realiza alguna actividad después de salir del trabajo?",
    rutaTitulo: "Describa su ruta habitual de regreso",
    rutaPlaceholder: "Ej: Tomo el autobús en la parada Z, bajo en la avenida W...",
    includeSchedule: false,
    includeContact: false,
  };

  const resumenDatos: IRutogramaPayload = {
    ida,
    regreso,
    otros: { draftSavedAt },
  };

  return (
    <>
      <Form className={`container ${style.rutogramaFormContainer}`}>
        {showErrorsAlert && errors.length > 0 && (
          <Alert variant='danger' dismissible onClose={() => setShowErrorsAlert(false)} style={{ maxWidth: 1000, margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}>
            <strong>Se encontraron {errors.length} error(es):</strong>
            <ul style={{ margin: '8px 0 0 18px' }}>
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </Alert>
        )}
        {draftSavedAt && <div style={{ fontSize: 12, color: '#6c757d', textAlign: 'center', margin: '0 auto 8px', maxWidth: 1000 }}>Borrador guardado: {draftSavedAt}</div>}
        <div className={style['rutograma-flip-container']} style={{ height: contentHeight }} ref={flipContainerRef}>
          <div className={`${style['rutograma-flip']} ${mostrarRegreso ? style['mostrar-regreso'] : ''}`}>
            {/* IDA */}
            <div className={style['rutograma-flip-cara']} style={{ paddingBottom: 40, display: showFrontFace ? 'block' : 'none' }} ref={frontRef}>
              <Card bg='primary' className='mb-3' style={{ padding: '24px 22px', color: 'white', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', position: 'relative' }} id='rutograma-form-ida'>
                <Button variant="light" onClick={() => setShowIntro(true)} title="Cerrar formulario" style={{ position: 'absolute', top: '15px', right: '15px', borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', zIndex: 10 }}>
                    <FaTimes style={{ color: '#003f9e' }} />
                </Button>
                <TravelSegment
                  config={configIda}
                  horario={{
                    horarioTrabajoDesde: ida.horarioTrabajoDesde,
                    setHorarioTrabajoDesde: (v) => setIda(prev => ({ ...prev, horarioTrabajoDesde: v })),
                    horarioTrabajoHasta: ida.horarioTrabajoHasta,
                    setHorarioTrabajoHasta: (v) => setIda(prev => ({ ...prev, horarioTrabajoHasta: v })),
                    horaSalida: ida.horaSalida,
                    setHoraSalida: (v) => setIda(prev => ({ ...prev, horaSalida: v })),
                  }}
                  contacto={{
                    nombreReferencia: ida.nombreReferencia,
                    setNombreReferencia: (v) => setIda(prev => ({ ...prev, nombreReferencia: v })),
                    telefonoReferencia: ida.telefonoReferencia,
                    setTelefonoReferencia: (v) => setIda(prev => ({ ...prev, telefonoReferencia: v })),
                  }}
                  transporte={{
                    tipoTransporteSeleccionado: ida.tipoTransporteSeleccionado,
                    setTipoTransporteSeleccionado: (v) => setIda(prev => ({ ...prev, tipoTransporteSeleccionado: v })),
                    medioTransporteOtro: ida.medioTransporteOtro,
                    setMedioTransporteOtro: (v) => setIda(prev => ({ ...prev, medioTransporteOtro: v })),
                  }}
                  viaje={{
                    tiempoViaje: ida.tiempoViaje,
                    setTiempoViaje: (v) => setIda(prev => ({ ...prev, tiempoViaje: v })),
                    haceEscalas: ida.haceEscalas,
                    setHaceEscalas: (v) => setIda(prev => ({ ...prev, haceEscalas: v, numEscalas: v === false ? null : prev.numEscalas })),
                    numEscalas: ida.numEscalas,
                    setNumEscalas: (v) => setIda(prev => ({ ...prev, numEscalas: v })),
                  }}
                  actividad={{
                    haceActividadAntes: ida.haceActividadAntes,
                    setHaceActividadAntes: (v) => setIda(prev => ({ ...prev, haceActividadAntes: v })),
                    actividadesSeleccionadas: ida.actividadesSeleccionadas,
                    setActividadesSeleccionadas: (v) => setIda(prev => ({ ...prev, actividadesSeleccionadas: v })),
                    detallesActividades: ida.detallesActividades,
                    setDetallesActividades: (v) => setIda(prev => ({ ...prev, detallesActividades: v })),
                  }}
                  ruta={{
                    rutas: ida.rutas,
                    setRutas: (value) => {
                      if (typeof value === 'function') {
                        setIda(prevIda => ({ ...prevIda, rutas: value(prevIda.rutas) }));
                      } else {
                        setIda(prev => ({ ...prev, rutas: value }));
                      }
                    },
                  }}
                  global={{
                    tiposTransporte: global.tiposTransporte,
                    tiposActividad: global.tiposActividad,
                  }}
                />
                <div className={`${style.right} ${style.rutogramaPhaseNav}`}>
                  <Button size='lg' variant='light' style={{ color: '#003f9e', fontWeight: 600 }} onClick={() => handleFlip(true)}>
                    Continuar con regreso <FaArrowRight style={{ marginLeft: 6 }} />
                  </Button>
                </div>
              </Card>
            </div>
            {/* REGRESO */}
            <div className={`${style['rutograma-flip-cara']} ${style['regreso']}`} style={{ paddingBottom: 40, display: showBackFace ? 'block' : 'none' }} ref={backRef}>
              <Card bg='primary' className='mb-3' style={{ padding: '24px 22px', color: 'white', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', position: 'relative' }} id='rutograma-form-regreso'>
                <Button variant="light" onClick={() => setShowIntro(true)} title="Cerrar formulario" style={{ position: 'absolute', top: '15px', right: '15px', borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', zIndex: 10 }}>
                    <FaTimes style={{ color: '#003f9e' }} />
                </Button>
                <TravelSegment
                  config={configRegreso}
                  horario={undefined} // Regreso no tiene horario
                  contacto={{ // Regreso no tiene contacto
                    nombreReferencia: '', setNombreReferencia: () => {},
                    telefonoReferencia: '', setTelefonoReferencia: () => {},
                  }}
                  transporte={{
                    tipoTransporteSeleccionado: regreso.tipoTransporteSeleccionado,
                    setTipoTransporteSeleccionado: (v) => setRegreso(prev => ({ ...prev, tipoTransporteSeleccionado: v })),
                    medioTransporteOtro: regreso.medioTransporteOtro,
                    setMedioTransporteOtro: (v) => setRegreso(prev => ({ ...prev, medioTransporteOtro: v })),
                  }}
                  viaje={{
                    tiempoViaje: regreso.tiempoViaje,
                    setTiempoViaje: (v) => setRegreso(prev => ({ ...prev, tiempoViaje: v })),
                    haceEscalas: regreso.haceEscalas,
                    setHaceEscalas: (v) => setRegreso(prev => ({ ...prev, haceEscalas: v, numEscalas: v === false ? null : prev.numEscalas })),
                    numEscalas: regreso.numEscalas,
                    setNumEscalas: (v) => setRegreso(prev => ({ ...prev, numEscalas: v })),
                  }}
                  actividad={{
                    haceActividadAntes: regreso.haceActividadAntes,
                    setHaceActividadAntes: (v) => setRegreso(prev => ({ ...prev, haceActividadAntes: v })),
                    actividadesSeleccionadas: regreso.actividadesSeleccionadas,
                    setActividadesSeleccionadas: (v) => setRegreso(prev => ({ ...prev, actividadesSeleccionadas: v })),
                    detallesActividades: regreso.detallesActividades,
                    setDetallesActividades: (v) => setRegreso(prev => ({ ...prev, detallesActividades: v })),
                  }}
                  ruta={{
                    rutas: regreso.rutas,
                    setRutas: (value) => {
                      if (typeof value === 'function') {
                        setRegreso(prevRegreso => ({ ...prevRegreso, rutas: value(prevRegreso.rutas) }));
                      } else {
                        setRegreso(prev => ({ ...prev, rutas: value }));
                      }
                    },
                  }}
                  global={{
                    tiposTransporte: global.tiposTransporte,
                    tiposActividad: global.tiposActividad,
                  }}
                />
                <div className={`${style.rutogramaPhaseNav} ${style.between}`}>
                  <Button size='lg' variant='light' style={{ color: '#003f9e', fontWeight: 600 }} onClick={() => handleFlip(false)}>
                    <FaArrowLeft style={{ marginRight: 6 }} /> Volver a ida
                  </Button>
                  <Button size='lg' variant='success' onClick={validarYContinuar}>
                    Finalizar y ver resumen
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
        <ModalConfirmarGuardarRutas
          show={showResumen}
          onHide={() => { setShowResumen(false); global.setShowModalGuardarRutas(false); }}
          onConfirm={() => {
            setShowResumen(false);
            global.onConfirmarGuardarRutas();
          }}
          resumenDatos={resumenDatos}
          tiposTransporte={global.tiposTransporte}
          tiposActividad={global.tiposActividad}
        />
      </Form>

      {/* Botón fijo X: se muestra encima del botón scroll-to-top y sigue su visibilidad */}
      <Button
        onClick={() => { setShowIntro(true); setMostrarRegreso(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className={`${style.closeFormBtn} ${showExit ? style.visible : ''}`}
        aria-label="Cerrar formulario"
        title='Cerrar formulario'
        variant="light"
      >
        <FaTimes style={{ color: '#003f9e', fontSize: 20 }} />
      </Button>
      
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`${style.scrollToTopBtn} ${showScrollTop ? style.visible || 'visible' : ''}`}
        aria-label="Ir arriba"
        title='Ir arriba'
      >
        <FaArrowUp />
      </Button>
    </>
  );
};

export default RutogramaPhase;