import axios from 'axios';
import { Mosaic } from 'react-loading-indicators';
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useEffect,   useState } from "react";
import { useAuth } from '@/auth/AuthProvider';
import ModalConfirmarCambioDatos from "@/components/ModalConfirmarCambioDatos" ;
import NavbarEmpresa from "@/components/NavbarEmpresa";
import style from '../Expediente/styles/ExpedienteEmpleado.module.css';
import stylesLoading from "@/css/loading.module.css";
import DatosPersonalesPhase from '../Expediente/phases/DatosPersonalesPhase';
import RutogramaPhase from "../Expediente/phases/RutogramaPhase";
import DocumentosPhase from './phases/DocumentosPhase';
import PhaseNavigator from './components/PhaseNavigator'; 
import ErrorPhase from './components/errorPhase'; 
import { FaBook, FaFilm, FaQuestionCircle, FaRunning, FaShoppingCart, FaTags } from 'react-icons/fa';
import { useRutogramaState } from '@/hooks/useRutogramaState';


export interface DatosPersonales {
  cedula: string;
  nombres: string;
  apellidos: string;
  rif: string;
  estadoCivil: string;
  email: string;
  fechaNacimiento: string;
  telefonoCelular: string;
  direccion: string;
  RutaaCasa: string[];
  RutaaOficina: string[];
  medioTransporteOtro?: string;
  nombre: string;
  telefono: string;
}

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

const apiUrl = import.meta.env.VITE_API_URL;

const phaseRoutes = [
  "/expediente/datos",
  "/expediente/rutograma", 
  "/expediente/documentos"
];

const Expendiente = () => {
/*   const { seccion } = useParams(); */
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [phase, setPhase] = useState(1); // Estado para controlar la fase actual
  const [datosPersonales, setDatosPersonales] = useState<DatosPersonales | null>(null);
  const { cod_emp } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bloquearCambioDatos, setBloquearCambioDatos] = useState(false);
  const [telefonoOriginal, setTelefonoOriginal] = useState<string>('');
  const [showModalConfirmar, setShowModalConfirmar] = useState(false);
  const [, setShowModalGuardarRutas] = useState(false);
  const [telefonoAdicional, setTelefonoAdicional] = useState<string>(''); // Nuevo estado para teléfono adicional
  const [telefonoAdicionalOriginal, setTelefonoAdicionalOriginal] = useState<string>(''); // Guardar original
  
  // Estado temporal para los datos de contacto de emergencia del expediente
  const [contactoEmergencia, setContactoEmergencia] = useState<{ nombre: string; telefono: string } | null>(null);

  const [uploading, ] = useState(false); // Estado para loading de subida/actualización de archivos
  const [tiposTransporte, setTiposTransporte] = useState<TipoTransporte[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const { globalState, setGlobalState, ida, setIda, regreso, setRegreso, resetState } = useRutogramaState(cod_emp);


  const fetchRutograma = async () => {
    if (!cod_emp) return;
    try {
      const res = await axios.get(`${apiUrl}/expediente/rutograma-completo/${cod_emp}`);
      if (res.data && res.data.success && res.data.data) {
        const { global, ida, regreso } = res.data.data;
        console.log('Rutograma cargado/actualizado desde API:', { global, ida, regreso });
        setGlobalState(prev => ({ ...prev, ...global, error: false }));
        setIda(ida);
        setRegreso(regreso);
      } else {
        // Esto es improbable si la API devuelve 404, pero es una salvaguarda.
        // Si la API responde 200 pero sin datos, reseteamos.
        resetState(false);
        if (contactoEmergencia) {
          setGlobalState(prevState => ({
            ...prevState,
            nombreReferencia: contactoEmergencia.nombre,
            telefonoReferencia: contactoEmergencia.telefono,
          }));
        }
      }
    } catch (error) {
      console.error('Error al obtener el rutograma:', error);
      if (axios.isAxiosError(error) && error.response) {
        // --- ¡LÓGICA CORREGIDA! ---
        if (error.response.status === 404) {
          // Si es 404, NO HACEMOS NADA.
          // Confiamos en que el estado ya se cargó desde localStorage.
          // Solo necesitamos marcar que la carga terminó sin error de sistema.
          console.log('No se encontró rutograma en la API (404). Se mantiene el estado local.');
          setGlobalState(prev => ({ ...prev, error: false }));
          // Opcional: si aún quieres el contacto de emergencia en un borrador nuevo
          if (contactoEmergencia && !globalState.nombreReferencia) {
            setGlobalState(prevState => ({
              ...prevState,
              nombreReferencia: contactoEmergencia.nombre,
              telefonoReferencia: contactoEmergencia.telefono,
            }));
          }
        } else {
          // Para otros errores (500, etc.), SÍ es un fallo y reseteamos.
          console.error('Error del servidor al obtener el rutograma:', error);
          resetState(true); // true = es un error de sistema
        }
      } else {
        // Para errores de red, también es un fallo.
        console.error('Error de red o desconocido al obtener el rutograma:', error);
        resetState(true); // true = es un error de sistema
      }
    }
  };

  // Validación de campos requeridos y comparación de cambios

  const camposRequeridos = [
    { key: 'cedula', label: 'Cédula de Identidad' },
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'rif', label: 'RIF' },
    { key: 'estadoCivil', label: 'Estado Civil' },
    { key: 'email', label: 'Email' },
    { key: 'fechaNacimiento', label: 'Fecha de Nacimiento' },
    { key: 'telefonoCelular', label: 'Teléfono Celular' },
    { key: 'direccion', label: 'Dirección' },
  ];

    const [tiposActividad] = useState<TipoActividad[]>(
    [
    { id: 1, nombre: 'Educativa', icon: <FaBook /> },
    { id: 2, nombre: 'Compras', icon: <FaShoppingCart /> },
    { id: 3, nombre: 'Deportivas', icon: <FaRunning /> },
    { id: 4, nombre: 'Ventas', icon: <FaTags /> },
    { id: 5, nombre: 'Recreacional', icon: <FaFilm /> },
    { id: 6, nombre: 'Otro', icon: <FaQuestionCircle /> },
  ]);
  const [cambiosDetectados, setCambiosDetectados] = useState<any[]>([]);
  const [, setErroresDatos] = useState<string[]>([]);
  const [datosOriginales, setDatosOriginales] = useState<DatosPersonales | null>(null);

  // Guardar datos originales al cargar
  useEffect(() => {
    if (datosPersonales && !datosOriginales) {
      setDatosOriginales({ ...datosPersonales });
      setTelefonoAdicionalOriginal(telefonoAdicional); // Guardar el adicional original
    }
  }, [datosPersonales]);

  // Utilidad para acceder a los campos por string
  const getCampo = (obj: DatosPersonales, key: string): string => {
    switch (key) {
      case 'cedula': return obj.cedula;
      case 'nombres': return obj.nombres;
      case 'apellidos': return obj.apellidos;
      case 'rif': return obj.rif;
      case 'estadoCivil': return obj.estadoCivil;
      case 'email': return obj.email;
      case 'fechaNacimiento': return obj.fechaNacimiento;
      case 'telefonoCelular': 
        // Unir teléfono principal y adicional si existe
        return telefonoAdicional && telefonoAdicional.trim() !== ''
          ? `${obj.telefonoCelular} / ${telefonoAdicional}`
          : obj.telefonoCelular;
      case 'direccion': return obj.direccion;
      default: return '';
    }
  };

  const validarDatosPersonales = () => {
    const errores: string[] = [];
    camposRequeridos.forEach(campo => {
      if (!datosPersonales || !getCampo(datosPersonales, campo.key) || getCampo(datosPersonales, campo.key).trim() === '') {
        errores.push(`El campo '${campo.label}' es obligatorio.`);
      }
    });
    return errores;
  };

  const compararDatos = () => {
    if (!datosOriginales || !datosPersonales) return [];
    const cambios = camposRequeridos.map(campo => {
      let anterior = getCampo(datosOriginales, campo.key);
      let nuevo = getCampo(datosPersonales, campo.key);
      // Para teléfono, unir adicional si existe
      if (campo.key === 'telefonoCelular') {
        // Usar el adicional original para comparar correctamente
        const anteriorCompleto = telefonoAdicionalOriginal && telefonoAdicionalOriginal.trim() !== ''
          ? `${datosOriginales.telefonoCelular} / ${telefonoAdicionalOriginal}`
          : datosOriginales.telefonoCelular;
        const nuevoCompleto = telefonoAdicional && telefonoAdicional.trim() !== ''
          ? `${datosPersonales.telefonoCelular} / ${telefonoAdicional}`
          : datosPersonales.telefonoCelular;
        if (anteriorCompleto !== nuevoCompleto) {
          return {
            campo: campo.label,
            anterior: anteriorCompleto,
            nuevo: nuevoCompleto,
          };
        }
        return null;
      }
      if (anterior !== nuevo) {
        return {
          campo: campo.label,
          anterior,
          nuevo,
        };
      }
      return null;
    }).filter(Boolean);
    return cambios;
  };

  function handleAbrirModalConfirmar() {
    const errores = validarDatosPersonales();
    setErroresDatos(errores);
    if (errores.length > 0) {
      showToast(errores.join('\n'), 'error');
      return;
    }
    const cambios = compararDatos();
    setCambiosDetectados(cambios);
    if (cambios.length === 0) {
      showToast('No se detectaron cambios en los datos personales.', 'error');
      return;
    }
    setShowModalConfirmar(true);
  }

    useEffect(() => {
      const fetchTiposTransporte = async () => {
        try {
          const res = await axios.get(`${apiUrl}/expediente/getTiposTransporte`);
          setTiposTransporte(res.data.tiposTransporte || []);
        } catch (error) {
          console.error('Error fetching tipos de transporte:', error);
        }
      };
  
      fetchTiposTransporte();
    }, []);

    useEffect(() => {
      setLoading(true);
      const fetchDatosPersonales = async () => {
        try {
          await axios.get(`${apiUrl}/expediente/getDatosPersonales/${cod_emp}`)
            .then((response) => {
              // Procesar teléfonos si hay "/"
              let telefonoPrincipal = response.data.expediente.telefonoCelular || '';
              let telefonoAdic = '';
              if (telefonoPrincipal.includes('/')) {
                const partes = telefonoPrincipal.split('/');
                telefonoPrincipal = partes[0].trim();
                telefonoAdic = (partes[1] || '').trim();
              }
              
              // Guardar temporalmente los datos de contacto de emergencia
              setContactoEmergencia({
                nombre: response.data.expediente.nombre_contacto,
                telefono: response.data.expediente.telefono_contacto,
              });
  
              setDatosPersonales({
                ...response.data.expediente,
                telefonoCelular: telefonoPrincipal
              });
              setTelefonoAdicional(telefonoAdic);
              setTelefonoOriginal(telefonoPrincipal);
              // Bloquear si estatusSolicitudCambio existe y es 0
              console.log('Estatus Solicitud Cambio:', response.data.expediente.estatusSolicitudCambio);
              setBloquearCambioDatos(
                typeof response.data.expediente.estatusSolicitudCambio !== "undefined" &&
                response.data.expediente.estatusSolicitudCambio === 1
              );
              return response;
            });
  
        } catch (error) {
          console.error('Error fetching datos personales:', error);
        }
        finally{
          setLoading(false);
        }
      };
      fetchDatosPersonales();
    }, [cod_emp]);

    useEffect(() => {
      // Solo buscar rutograma si estamos en la fase de rutograma
      if (location.pathname === "/expediente/rutograma" && cod_emp) {
        fetchRutograma();
      }
      // eslint-disable-next-line
    }, [location.pathname, cod_emp, contactoEmergencia]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    (type === "success" ? toast.success : toast.error)(message, {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };
    
    const handleSolicitarCambioDatos = async () => {
    if (!datosPersonales || !cod_emp) {
      showToast('Datos personales incompletos.', 'error');
      return;
    }
  
    // Solo números del original y del editado
    const telefonoOriginalNumeros = telefonoOriginal.replace(/\D/g, '');
    const telefonoEditadoNumeros = datosPersonales.telefonoCelular.replace(/\D/g, '');
  
    // Si los números son iguales, usa el original (con caracteres)
    let telefonoParaEnviar = datosPersonales.telefonoCelular;
    if (telefonoOriginalNumeros === telefonoEditadoNumeros) {
      telefonoParaEnviar = telefonoOriginal;
    }
  
    // Concatenar teléfono adicional si existe
    let telefonoFinal = telefonoParaEnviar;
    if (telefonoAdicional && telefonoAdicional.trim() !== '') {
      telefonoFinal = `${telefonoParaEnviar} / ${telefonoAdicional}`;
    }
  
    try {
      const res = await axios.post(`${apiUrl}/expediente/SolicitarCambioDatosPersonales`, {
        cod_emp,
        cedula: datosPersonales.cedula,
        nombres: datosPersonales.nombres,
        apellidos: datosPersonales.apellidos,
        rif: datosPersonales.rif,
        edocivil: datosPersonales.estadoCivil,
        email: datosPersonales.email,
        fechaNacimiento: datosPersonales.fechaNacimiento,
        telefonoCelular: telefonoFinal,
        direccion: datosPersonales.direccion
      });
  
      if (res.data && res.data.cambios_realizados > 0) {
        showToast('Solicitud de cambio enviada correctamente.');
        setBloquearCambioDatos(true);
      } else if (res.data && res.data.cambios_realizados === 0) {
        showToast('No se detectaron cambios en los datos personales.', 'error');
      } else {
        showToast('No se pudo enviar la solicitud de cambio.', 'error');
      }
    } catch (error) {
      showToast('Error al enviar la solicitud de cambio.', 'error');
      console.error(error);
    }
  };
  
    const handleGuardarRutas = async () => {
      if (!cod_emp) {
        showToast('No se encontró el código de empleado.', 'error');
        return;
      }
      // Filtra rutas vacías
      const rutasOficinaValidas = ida.rutas.filter(r => r.trim() !== "");
      const rutasCasaValidas = regreso.rutas.filter(r => r.trim() !== "");
  
      // Recolectar todos los parámetros de ida y regreso
      const payload = {
        cod_emp,
        // Datos globales (ya son strings)
        horarioTrabajoDesde: globalState.horarioTrabajoDesde,
        horarioTrabajoHasta: globalState.horarioTrabajoHasta,
        horaSalidaCasa: globalState.horaSalida,
        nombreReferencia: globalState.nombreReferencia,
        telefonoReferencia: globalState.telefonoReferencia,
        
        // Datos de Ida
        RutaaOficina: rutasOficinaValidas,
        tipoTransporteSeleccionado: ida.tipoTransporteSeleccionado,
        medioTransporteOtro: ida.medioTransporteOtro,
        tiempoViaje: ida.tiempoViaje,
        haceEscalas: ida.haceEscalas,
        numEscalas: ida.numEscalas,
        haceActividadAntes: ida.haceActividadAntes,
        actividadesSeleccionadas: ida.actividadesSeleccionadas,
        detallesActividades: ida.detallesActividades,
  
        // Datos de Regreso
        RutaaCasa: rutasCasaValidas,
        tipoTransporteSeleccionadoRegreso: regreso.tipoTransporteSeleccionado,
        medioTransporteOtroRegreso: regreso.medioTransporteOtro,
        tiempoViajeRegreso: regreso.tiempoViaje,
        haceEscalasRegreso: regreso.haceEscalas,
        numEscalasRegreso: regreso.numEscalas,
        haceActividadAntesRegreso: regreso.haceActividadAntes,
        actividadesSeleccionadasRegreso: regreso.actividadesSeleccionadas,
        detallesActividadesRegreso: regreso.detallesActividades,
      };
  
      try {
        console.log("Payload Guardar Rutas:", JSON.stringify(payload)); // Para depuración
        const res = await axios.post(`${apiUrl}/expediente/rutograma`, payload);
        if (res.data && res.data.success) {
          showToast('Rutas guardadas correctamente.', 'success');
          // Limpiar borrador de localStorage al guardar exitosamente
          localStorage.removeItem(`rutograma_${cod_emp || 'anon'}`);
          await fetchRutograma();
        } else {
          showToast(res.data.message || 'No se pudieron guardar las rutas.', 'error');
        }
      } catch (error: any) {
        showToast(error.response?.data?.message || 'Error al guardar las rutas.', 'error');
        console.error(error);
      }
    };

  
    // Cambiar ruta al cambiar de fase
    
  const goToPhase = (newPhase: number) => {
    setPhase(newPhase);
    navigate(phaseRoutes[newPhase - 1], { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
    function handlePreviousPhase(): void {
      if (phase > 1) {
        goToPhase(phase - 1);
      }
    }
  
    function handleNextPhase(): void {
      if (phase < phaseRoutes.length) {
        goToPhase(phase + 1);
      }
    }
    useEffect(() => {
      if (location.pathname.startsWith("/expediente/")) {
        const idx = phaseRoutes.findIndex(route => route === location.pathname);
        if (idx !== -1) setPhase(idx + 1);
      }
    }, [location.pathname]);
    return (
      <>
        <NavbarEmpresa />
        <div className={style.expedienteContainer}> {/* <-- 2. Envolver contenido principal */}
          <PhaseNavigator currentPhase={phase} onNavigate={goToPhase} /> {/* <-- 3. Añadir el navegador */}
          <main style={{ flex: 1, padding: '2rem' }}> {/* 4. Contenedor para el contenido de la fase */}
            <h1 style={{marginTop:'100px', alignSelf:'center', display:'flex'}}>Expediente</h1>
        {loading && <div className={stylesLoading.loadingContainer}><Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="large" text="" textColor="#0d1bff" /></div>}
        {/* Animación de loading para uploads/updates */}
        {uploading && (
          <div className={stylesLoading.loadingContainer} style={{zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="large"  textColor="#0d1bff" />
            <span style={{ marginTop: '10px', textAlign: 'center', color: '#0000ff', fontSize: '20px' }}>Procesando archivo...</span>
          </div>
        )}
        <div className={style.phaseWrapper}>
          <ToastContainer />
          
          <TransitionGroup>
            <CSSTransition
              key={phase}
              timeout={500}
              classNames="fade"
            >
              <div className={style.phaseContainer}>
                {/* 2. Lógica de renderizado actualizada */}
                {!loading && !datosPersonales ? (
                  <ErrorPhase />
                ) : (
                  <>
                    {(phase === 1) && datosPersonales && (
                      <DatosPersonalesPhase
                        datosPersonales={datosPersonales}
                        setDatosPersonales={setDatosPersonales}
                        telefonoAdicional={telefonoAdicional}
                        setTelefonoAdicional={setTelefonoAdicional}
                        bloquearCambioDatos={bloquearCambioDatos}
                        handleAbrirModalConfirmar={handleAbrirModalConfirmar}
                        handleNextPhase={handleNextPhase}
                      />
                    )}
                    {(phase === 2) && datosPersonales && (
                      <RutogramaPhase
                        ida={ida}
                        setIda={setIda}
                        regreso={regreso}
                        setRegreso={setRegreso}
                        global={{
                          globalState,
                          setGlobalState,
                          datosPersonales,
                          tiposTransporte,
                          tiposActividad,
                          showToast,
                          setShowModalGuardarRutas,
                          onConfirmarGuardarRutas: handleGuardarRutas,
                          handlePreviousPhase,
                          handleNextPhase,
                          loading,
                          bloquearCambioDatos,
                        }}
                      />
                    )}
                    {(phase === 3) && (
                      <DocumentosPhase
                        selectedDocument={selectedDocument}
                        setSelectedDocument={setSelectedDocument}
                        
                        handlePreviousPhase={handlePreviousPhase}
                        cod_emp={cod_emp}
                        datosPersonales={datosPersonales}
                        showToast={showToast}
                        apiUrl={apiUrl}
                      />
                    )}
                  </>
                )}
              </div>
            </CSSTransition>
          </TransitionGroup>
        </div>
        <br />
        <ModalConfirmarCambioDatos
          show={showModalConfirmar}
          onHide={() => setShowModalConfirmar(false)}
          onConfirm={() => {
            setShowModalConfirmar(false);
            handleSolicitarCambioDatos();
          }}
          cambios={cambiosDetectados}
        />
      </main>
      </div>
      </>
    );
  }
  
  export default Expendiente;