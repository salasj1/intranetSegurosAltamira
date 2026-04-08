import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { FaArrowRight, FaArrowLeft, FaArrowUp, FaTimes } from 'react-icons/fa';
import style from '../styles/ExpedienteEmpleado.module.css';
import IntroRutograma from './IntroRutograma';
import ModalConfirmarGuardarRutas from '../components/ModalConfirmarGuardarRutas';
import TravelSegment from './TravelSegment';
import { RutogramaPhaseProps, IRutogramaPayload, TravelSegmentConfig, validarRutograma } from '@/types/rutograma.types'; // Importar tipos
import ErrorPhase from '../components/ErrorPhase'; 
const RutogramaPhase: React.FC<RutogramaPhaseProps> = ({
  ida,
  setIda,
  regreso,
  setRegreso,
  global
}) => {
  // Estado para intro
  const [showIntro, setShowIntro] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrorsAlert, setShowErrorsAlert] = useState(true);
  const [showResumen, setShowResumen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showExit, setShowExit] = useState(false);
  // Agrega el estado para mostrarRegreso
  const [mostrarRegreso, setMostrarRegreso] = useState(false);

  // Altura dinámica para eliminar espacio en blanco cuando una cara es más alta que la otra
  const flipContainerRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
  // Control de visibilidad display:none de cada cara
  const [showFrontFace, setShowFrontFace] = useState(true);
  const [showBackFace, setShowBackFace] = useState(false);
  const FLIP_ANIM_MS = 700; // Debe coincidir con transición CSS

   // ¡CORRECCIÓN DEFINITIVA! Acceder directamente a global.globalState
  const disabled = global.globalState.estado === 'Pendiente' ||  global.globalState.estado === 'Aprobado';
  const puedeGuardar = global.globalState.estado === 'Borrador' || global.globalState.estado === 'Devuelto';

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
  const validarYContinuar = () => {
    const errs = validarRutograma(global.globalState, ida, regreso, global.tiposActividad);
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

  if (global.globalState.error) {
    return <ErrorPhase />;
  }



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
    transportHint: "Puede seleccionar varias opciones.",
    transportNote: "Nota: No se puede utilizar la moto como medio de transporte.",
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
    transportHint: "Puede seleccionar varias opciones.",
    transportNote: "Nota: No se puede utilizar la moto como medio de transporte.",
    departureTimeLabel: "", // No se pregunta en el regreso
    travelSubtitle: "Durante el viaje de regreso",
    actividadPreguntaLabel: "¿Realiza alguna actividad después de salir del trabajo?",
    rutaTitulo: "Describa su ruta habitual de regreso",
    rutaPlaceholder: "Ej: Tomo el autobús en la parada Z, bajo en la avenida W...",
    includeSchedule: false,
    includeContact: false,
  };

  const resumenDatos: IRutogramaPayload = {
    global: global.globalState,
    ida,
    regreso,
  };

  return (
    <>
      <Form className={`container ${style.rutogramaFormContainer}`}>
        {/* Mostrar comentario si está Devuelto */}
        {global.globalState.estado === "Devuelto" && global.globalState.comentarios_revision && (
          <Alert variant="warning" style={{maxWidth: 900, margin: '0 auto 20px'}}>
            <b>Comentario de revisión:</b>
            <div style={{whiteSpace:'pre-wrap'}}>{global.globalState.comentarios_revision}</div>
          </Alert>
        )}
        {showErrorsAlert && errors.length > 0 && (
          <Alert variant='danger' dismissible onClose={() => setShowErrorsAlert(false)} style={{ margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}>
            <strong>Se encontraron {errors.length} error(es):</strong>
            <ul style={{ margin: '8px 0 0 18px' }}>
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </Alert>
        )}
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
                  globalState={global.globalState}
                  setGlobalState={global.setGlobalState}
                  formState={ida}
                  setFormState={setIda}
                  global={{
                    tiposTransporte: global.tiposTransporte,
                    tiposActividad: global.tiposActividad,
                  }}
                  disabled={disabled}
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
                  globalState={global.globalState}
                  setGlobalState={global.setGlobalState}
                  formState={regreso}
                  setFormState={setRegreso}
                  global={{
                    tiposTransporte: global.tiposTransporte,
                    tiposActividad: global.tiposActividad,
                  }}
                  disabled={disabled}
                />
                <div className={`${style.rutogramaPhaseNav} ${style.between}`}>
                  <Button size='lg' variant='light' style={{ color: '#003f9e', fontWeight: 600 }} onClick={() => handleFlip(false)}>
                    <FaArrowLeft style={{ marginRight: 6 }} /> Volver a ida
                  </Button>
                  {/* Solo mostrar el botón si puedeGuardar */}
                  {puedeGuardar && (
                    <Button size='lg' variant='success' onClick={validarYContinuar}>
                      Finalizar y ver resumen
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
        <ModalConfirmarGuardarRutas
          show={showResumen}
          onHide={() => { setShowResumen(false); global.setShowModalGuardarRutas(false); }}
          onConfirm={async () => {
            setShowResumen(false);
            if (puedeGuardar) {
              await global.onConfirmarGuardarRutas();
            }
            setShowResumen(false);
            global.setShowModalGuardarRutas(false);
          }}
          resumenDatos={resumenDatos}
          tiposTransporte={global.tiposTransporte}
          tiposActividad={global.tiposActividad}
          isSubmitting={global.isSubmitting}
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