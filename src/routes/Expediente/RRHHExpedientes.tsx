import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import axios from 'axios';
import styles from '@/css/RRHHExpedientes.module.css';
import { Mosaic } from 'react-loading-indicators';
import Select from 'react-select';
import NavbarEmpresa from '@/components/NavbarEmpresa';
import imagen from '@/assets/inspect.webp';
import { FiUser, FiBriefcase,  FiMail, FiPhone, FiCalendar, FiMapPin, FiCreditCard, FiPrinter, FiRefreshCcw } from "react-icons/fi";
import { FaRoute } from 'react-icons/fa';
import { MdApartment } from "react-icons/md";
import { toast, ToastContainer } from 'react-toastify';
import {Modal,  Alert, Accordion, Button } from 'react-bootstrap';
import { printExpediente } from '@/utils/printExpediente';
import AnimatedCounter from '@/components/AnimatedCounter';
import ModalVerRutogramaRRHH from './components/ModalVerRutogramaRRHH';
import { IRutogramaPayload, TipoActividad, TipoTransporte } from '@/types/rutograma.types';
import ReporteRutograma from './components/ReporteRutograma'; 
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface Empleado {
  cod_emp: string;
  nombre_completo: string;
  cedula: string;
}
interface SolicitudCambio {
  id: number;
  cod_emp: string;
  etiqueta: string;
  solicitud: string;
  status: number;
}
interface Archivo {
  id: string;
  name: string;
  mimeType: string;
}
interface DatosPersonales {
  cod_emp: string;
  nombres: string;
  apellidos: string;
  rif: string;
  edo_civ: string;
  correo_e: string;
  fecha_nac: string;
  telefono: string;
  direccion: string;
  ci: string;
  fecha_ing: string;
  cargo: string;
  departamento: string;
}
interface RutaSolicitud {
  id: number;
  cod_emp: string;
  tipo: string;
  descripcion: string;
  status: number;
}

interface SolicitudRutograma {
  id: number;
  nombres: string;
  apellidos: string;
  fecha: string;
  status: string;
  cod_emp: string;
  fecha_aprobacion: string | null;
  fecha_rechazo: string | null;
  cod_revisor: string | null;
  nombre_completo_revisor: string | null;
}

const apiUrl = import.meta.env.VITE_API_URL;

const RRHHExpedientes: React.FC = () => {
  const { RRHH,cod_emp } = useAuth(); 

  // Estados principales
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);
  const [solicitudes, setSolicitudes] = useState<SolicitudCambio[]>([]);
  const [datosPersonales, setDatosPersonales] = useState<DatosPersonales | null>(null);
  const [rutas, setRutas] = useState<RutaSolicitud[]>([]);
  const [archivos, setArchivos] = useState<Archivo[]>([]);

  const [archivosLoading, setArchivosLoading] = useState(false);
  const [tiposTransporte, setTiposTransporte] = useState<TipoTransporte[]>([]);
  const [tiposActividad, setTiposActividad] = useState<TipoActividad[]>([]);

  
  // Estados para el modal de rutograma de RRHH
  const [showRutogramaModal, setShowRutogramaModal] = useState(false);
  const [rutogramaData, setRutogramaData] = useState<IRutogramaPayload | null>(null);
  const [, setLoadingRutograma] = useState(false);
  const [rutogramaEstado, setRutogramaEstado] = useState<string | null>(null); 
  const [pdfReportData, setPdfReportData] = useState<any>(null); 

  const [empleadosVencidos, setEmpleadosVencidos] = useState<any[]>([]);
  const [loadingVencidos, setLoadingVencidos] = useState(false);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [loadingRutogramas, setLoadingRutogramas] = useState(false);
  const [tiposVencimiento, setTiposVencimiento] = useState<string[]>([]);
  const [filtroDocumentosVencidos, setFiltroDocumentosVencidos] = useState<string[]>([]);
  const [empleadosRutograma, setEmpleadosRutograma] = useState<SolicitudRutograma[]>([]);

  // Diccionario para mostrar nombres amigables de tipos de documentos
const tipoDocLabel: Record<string, string> = {
  Cedula: "Cédula",
  Rif: "RIF",
  CertificadoAdministracionRiesgo: "Certificado Administración de Riesgos",
  CertificadoAdministracionDeRiesgos: "Certificado Administración de Riesgos",
  // Puedes agregar más equivalencias si tu backend los nombra diferente
};

const mostrarTipoDoc = (tipo: string) => tipoDocLabel[tipo] || tipo;
// Opciones para el filtro de documentos vencidos (aplica el label bonito)
  const opcionesDocumentosVencidos = tiposVencimiento.map(tipo => ({
  value: tipo,
  label: mostrarTipoDoc(tipo)
}));
  // Filtrar empleados según los tipos de documentos seleccionados
const empleadosVencidosFiltrados = filtroDocumentosVencidos.length === 0 ? empleadosVencidos: empleadosVencidos.filter(emp => {
  // Verifica si el empleado tiene al menos un documento vencido del tipo seleccionado
  return filtroDocumentosVencidos.some(tipoSel => {
    return Object.keys(emp.documentosVencidos || {}).some(tipoDoc => {
      return (tiposVencimiento.find(t => t.toLowerCase() === tipoDoc) || tipoDoc) === tipoSel;
    });
  });
});

const cargarEmpleadosVencidos = () => {
  setLoadingVencidos(true);
  axios.get(`${apiUrl}/google-drive/empleados-documentos-vencidos-sheet`)
    .then(res => {
      setEmpleadosVencidos(res.data.empleados || []);
    })
    .catch(() => setEmpleadosVencidos([]))
    .finally(() => setLoadingVencidos(false));
}

useEffect(() => {
  cargarEmpleadosVencidos();
}, []);

// Cargar tipos de documentos con fechaVencimiento=true
useEffect(() => {
  axios.get(`${apiUrl}/google-drive/tiposDocumentos`).then(res => {
    // 
    const tipos = (res.data || []).filter((t: any) => t.fechaVencimiento === true || t.fechaVencimiento === 1).map((t: any) => t.nombre);
    setTiposVencimiento(tipos);
    // Selección por defecto: Rif y Cedula si existen
    setFiltroDocumentosVencidos(tipos.filter((t: string) => ["Rif", "Cedula"].includes(t)));
  });
}, []);
  
// Diccionario de palabras clave para documentos
const palabrasClaveDict: Record<string, string> = {
  CertificadoAdministracionRiesgo: "Certificado Administración de Riesgo",
  ImpuestoSobreRenta: "Impuesto Sobre la Renta (ISLR)",
  Rif: "RIF",
  Cedula: "Cédula",
  DocumentosOtros: "Otros Documentos",
  ConstanciaResidencia: "Constancia de Residencia",
  SolicitudCedula: "Solicitud de Cédula"
};

// Animación de panel de detalle
const [animating, setAnimating] = useState<'in' | 'out' | null>(null);
const [showDetalle, setShowDetalle] = useState(false);
const nextEmpleado = useRef<Empleado | null>(null);

// Menú contextual
const [openMenuSolicitud, setOpenMenuSolicitud] = useState<number | null>(null);

// Cargar empleados al inicio
useEffect(() => {
  if (RRHH !== 1) return;
  axios.get(`${apiUrl}/empleados/listar`)
    .then(res => setEmpleados(res.data))
    .catch(() => setEmpleados([]));
  axios.get(`${apiUrl}/expediente/getTiposTransporte`)
  .then(res => {
    setTiposTransporte(res.data.tiposTransporte || []);
  })
  .catch(() => {
    setTiposTransporte([]);
  });
}, [RRHH]);

// Opciones para react-select
const empleadoOptions = empleados.map(emp => ({
  value: emp.cod_emp,
  label: `${emp.nombre_completo} (${emp.cedula.replace(/\./g, '')})`,
  data: emp
}));

  // Empleados con solicitudes de cambio
  const [empleadosConSolicitudes, setEmpleadosConSolicitudes] = useState<any[]>([]);
  const [filtroSolicitudes, setFiltroSolicitudes] = useState<any | null>(null);
  const [filtroRutograma, setFiltroRutograma] = useState<SolicitudRutograma | null>(null);
  
  // --- NUEVOS ESTADOS PARA FILTROS DE RUTOGRAMA ---
  const [filtroStatusRutograma, setFiltroStatusRutograma] = useState<string[]>(['Pendiente']);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState<dayjs.Dayjs | null>(null);
  const [filtroFechaHasta, setFiltroFechaHasta] = useState<dayjs.Dayjs | null>(null);

  const cargarEmpleadosConSolicitudes = () => {
    setLoadingSolicitudes(true);
    axios.get(`${apiUrl}/expediente/empleados-con-solicitudes-cambio`)
      .then(res => setEmpleadosConSolicitudes(res.data))
      .catch(() => setEmpleadosConSolicitudes([]))
      .finally(() => setLoadingSolicitudes(false));
  };
  const cargarEmpleadosConRutograma = () => {
    setLoadingRutogramas(true);
    axios.get(`${apiUrl}/expediente/rutogramaRRHH/SolicitudesRutograma`)
      .then(res => {
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setEmpleadosRutograma(res.data.data);
        } else {
          setEmpleadosRutograma([]); // Si no viene el array, establece uno vacío
        }
      })
      .catch(() => setEmpleadosRutograma([]))
      .finally(() => setLoadingRutogramas(false));
  };
  const cargarDatos = async () => {
      await cargarEmpleadosConSolicitudes();
      await cargarEmpleadosConRutograma();
    };
  useEffect(() => {
    cargarDatos();
  }, []);



  // Opciones para el mini-buscador de la tabla de solicitudes
  const empleadosSolicitudesOptions = empleadosConSolicitudes
    .map(emp => ({
      value: emp.cod_emp,
      label: `${emp.nombres} ${emp.apellidos}`,
      estatus: emp.estatus
    }))
    .sort((a, b) => {
      // Ordenar por estatus (Incompleto primero), luego por nombre completo
      if (a.estatus !== b.estatus) {
        return a.estatus === 'Incompleto' ? -1 : 1;
      }
      return a.label.localeCompare(b.label, 'es', { sensitivity: 'base' });
    });
  // Opciones para el mini-buscador de la tabla de rutogramas
    const empleadosRutogramaOptions = empleadosRutograma.map(emp => {
      return {
        value: emp.id, // Usar id único
        label: `${emp.nombres} ${emp.apellidos}`,
        data: emp // Guarda el objeto completo si lo necesitas
      };
    });
  
    // *** NUEVO: Crea una lista filtrada para la tabla de rutogramas ***


    // *** LÓGICA DE FILTRADO AVANZADO PARA RUTOGRAMAS ***
const empleadosRutogramaFiltrados = empleadosRutograma.filter(emp => {
  // 1. Filtro por nombre (el que ya tenías)
  if (filtroRutograma && emp.cod_emp !== filtroRutograma.cod_emp) {
    return false;
  }

  // 2. Filtro por Estatus (ahora con array)
  if (filtroStatusRutograma.length > 0 && !filtroStatusRutograma.includes(emp.status)) {
    return false;
  }

  // 3. Filtro por Rango de Fechas (Desde - Hasta)
  let fechaAComparar: Date | null = null;
  // Seleccionar la fecha correcta según el estatus
  if (emp.status === 'Aprobado' && emp.fecha_aprobacion) {
    fechaAComparar = new Date(emp.fecha_aprobacion);
  } else if (emp.status === 'Devuelto' && emp.fecha_rechazo) {
    fechaAComparar = new Date(emp.fecha_rechazo);
  } else { // Para 'Pendiente' o si no hay fecha de revisión
    fechaAComparar = new Date(emp.fecha);
  }

  if (!fechaAComparar) return false; // Si no hay fecha, no se muestra

  // Normalizar la fecha del empleado a medianoche para comparar solo el día
  const fechaEmp = dayjs(fechaAComparar).startOf('day');

  if (filtroFechaDesde && fechaEmp.isBefore(filtroFechaDesde.startOf('day'))) {
    return false;
  }
  if (filtroFechaHasta && fechaEmp.isAfter(filtroFechaHasta.startOf('day'))) {
    return false;
  }

  return true; // Si pasa todos los filtros, se incluye
});

  // Filtrar empleados según el mini-buscador
  const empleadosConSolicitudesFiltrados = filtroSolicitudes
    ? empleadosConSolicitudes.filter(emp => emp.cod_emp === filtroSolicitudes.value)
    : empleadosConSolicitudes;

  // Handler para seleccionar desde la tabla de solicitudes
  const handleSeleccionarDesdeTabla = (cod_emp: string) => {
    
    const emp = empleados.find(e => 
      e.cod_emp.replace(/\s/g, '') === cod_emp.replace(/\s/g, '')
    );
    console.log(emp);
    if (emp) {
      handleSeleccionarEmpleado(emp);
      setEmpleadoSeleccionado(emp);
    } else {
      toast.warn("No se pudo encontrar al empleado en la lista principal.");
    }
  };

// Animación y carga de datos al seleccionar empleado
const handleSeleccionarEmpleado = (empleado: Empleado | null) => {
  if (empleadoSeleccionado) {
    setAnimating('out');
    nextEmpleado.current = empleado;
    setTimeout(() => {
      cargarEmpleado(empleado);
      setAnimating('in');
      setShowDetalle(!!empleado);
    }, 300);
    setTimeout(() => setAnimating(null), 650);
  } else {
    cargarEmpleado(empleado);
    setAnimating('in');
    setShowDetalle(!!empleado);
    setTimeout(() => setAnimating(null), 350);
  }
};

// Cargar datos de empleado seleccionado
const cargarEmpleado = (empleado: Empleado | null) => {
setEmpleadoSeleccionado(empleado);
setSolicitudes([]);
setDatosPersonales(null);
setRutas([]);
setArchivos([]);
setRutogramaEstado(null); // Limpiar estado al cambiar de empleado
if (!empleado) return;

setArchivosLoading(true);

axios.get(`${apiUrl}/expediente/solicitudes-cambio/${empleado.cod_emp}`)
  .then(res => setSolicitudes(res.data))
  .catch(() => setSolicitudes([]));
  axios.get(`${apiUrl}/expediente/datos-personales/${empleado.cod_emp}`)
  .then(res => {
  setDatosPersonales(res.data.datos);
  const ci = res.data.datos?.ci;
  if (ci) {
    const ciLimpia = ci.replace(/\./g, '').replace(/\s/g, '');
    setArchivos([]);
    setArchivosLoading(true);
    axios.get(`${apiUrl}/google-drive/buscar-archivos/carpeta/${ciLimpia}`)
      .then(resArch => setArchivos(resArch.data.archivos))
      .catch(() => setArchivos([]))
      .finally(() => setArchivosLoading(false));
} else {
  setArchivos([]);
  setArchivosLoading(false);
}
})
.catch(() => {
  setDatosPersonales(null);
  setArchivos([]);
  setArchivosLoading(false);
});

axios.get(`${apiUrl}/expediente/rutas/${empleado.cod_emp}`)
  .then(res => setRutas(res.data.rutas))
  .catch(() => setRutas([]));

  cargarRutograma(empleado.cod_emp);
};
const cargarRutograma = (cod_emp: string) => {
// Obtener estado del rutograma al seleccionar empleado
  axios.get(`${apiUrl}/expediente/rutograma-completo/${cod_emp}`)
  .then(res => {
    if (res.data && res.data.success && res.data.data && res.data.data.global && res.data.data.global.estado) {
      setRutogramaEstado(res.data.data.global.estado);
      setRutogramaData(res.data.data); // Opcional: para evitar doble petición al abrir modal

    } else {
      setRutogramaEstado(null);
      setRutogramaData(null);
    }
  })
  .catch(() => {
    setRutogramaEstado(null);
    setRutogramaData(null);
  });
};
  // Cierra el menú contextual si se hace click fuera
useEffect(() => {
  const handleClick = () => {
    setOpenMenuSolicitud(null);
  };
  window.addEventListener('click', handleClick);
  return () => window.removeEventListener('click', handleClick);
}, []);

// Oculta el panel de detalle al deseleccionar
useEffect(() => {
  if (!empleadoSeleccionado) setShowDetalle(false);
}, [empleadoSeleccionado]);

// Handlers para aprobar/rechazar solicitudes y rutas
const handleAprobarSolicitud = async (solicitud: SolicitudCambio) => {
  try {
    // 
    await axios.put(`${apiUrl}/expediente/actualizarDatosPersonales/${(solicitud as any).id}`);
    toast.success(`Solicitud aprobada correctamente`);
    // Refresca solicitudes y datos personales
    if (empleadoSeleccionado) {
      await cargarEmpleado(empleadoSeleccionado);
      // Si ya no quedan solicitudes pendientes, recargar la tabla de empleados con solicitudes
      const nuevasSolicitudes = await axios.get(`${apiUrl}/expediente/solicitudes-cambio/${empleadoSeleccionado.cod_emp}`);
      // 
      const quedanPendientes = nuevasSolicitudes.data.some((s: any) => s.status === 0);
      if (!quedanPendientes) cargarEmpleadosConSolicitudes();
    }
  } catch (error) {
    toast.error('Error al aprobar la solicitud');
  }
  setOpenMenuSolicitud(null);
};
const handleRechazarSolicitud = async (solicitud: SolicitudCambio) => {
  try {
    // 
    await axios.put(`${apiUrl}/expediente/rechazarSolicitud/${(solicitud as any).id }`);
    toast.success(`Solicitud rechazada correctamente`);
    // Refresca solicitudes y datos personales
    if (empleadoSeleccionado) {
      await cargarEmpleado(empleadoSeleccionado);
      // Si ya no quedan solicitudes pendientes, recargar la tabla de empleados con solicitudes
      const nuevasSolicitudes = await axios.get(`${apiUrl}/expediente/solicitudes-cambio/${empleadoSeleccionado.cod_emp}`);
      // 
      const quedanPendientes = nuevasSolicitudes.data.some((s: any) => s.status === 0);
      if (!quedanPendientes) cargarEmpleadosConSolicitudes();
    }
  } catch (error) {
    toast.error('Error al rechazar la solicitud');
  }
  setOpenMenuSolicitud(null);
};

  // Abrir modal de rutograma
  const handleVerRutograma = async () => {
    if (!empleadoSeleccionado) return;
    setLoadingRutograma(true);
    try {
      const res = await axios.get(`${apiUrl}/expediente/rutograma-completo/${empleadoSeleccionado.cod_emp}`);
      if (res.data.success && res.data.data) {
        setRutogramaData(res.data.data);
        setShowRutogramaModal(true);
      } else {
        toast.error(res.data.message || 'No se pudo cargar el rutograma.');
        setShowRutogramaModal(false);
      }
    } catch (error) {
      toast.error('Error de red al cargar el rutograma.');
      setShowRutogramaModal(false);
    } finally {
      setLoadingRutograma(false);
    }
  };

// FUNCIÓN SIMPLIFICADA PARA ABRIR EXCEL DE VISTA PREVIA EN NUEVA PESTAÑA
const handlePreviewPdf = async () => { // <-- 3. CAMBIAR NOMBRE Y LÓGICA
  if (!rutogramaData?.global?.id) {
    toast.error("No se puede generar la vista previa porque no hay un rutograma guardado.");
    return;
  }
  try {
    const url = `${apiUrl}/expediente/rutograma/${rutogramaData.global.id}/preview-pdf`;
    const response = await axios.get(url);
    if (response.data.success) {
      setPdfReportData(response.data.data);
      setTiposActividad(response.data.data.tiposActividades || []);
    } else {
      toast.error(response.data.message || "No se pudieron obtener los datos para el reporte.");
    }
  } catch (error) {
    toast.error("Error al obtener los datos para el reporte.");
    console.error(error);
  }
};

const handleApproveRutograma = async () => {
  // 2. Lógica para aprobar el rutograma (reconstruida)
  if (!rutogramaData?.global?.id || !cod_emp) {
    toast.error("No se puede aprobar: falta información del rutograma o del revisor.");
    return;
  }

  try {
    const response = await axios.put(
      `${apiUrl}/expediente/rutograma/aprobar/${rutogramaData.global.id}`,
      { cod_revisor: cod_emp } // Enviar el código del revisor en el cuerpo
    );

    if (response.data.success) {
      toast.success('Rutograma aprobado correctamente.');
      setShowRutogramaModal(false);
      // Refrescar los datos para que se actualice el estado en la UI
      if (empleadoSeleccionado) {
        cargarRutograma(empleadoSeleccionado.cod_emp);
      }
      cargarDatos(); // Recarga las listas de solicitudes
    } else {
      toast.error(response.data.message || 'Ocurrió un error al aprobar.');
    }
  } catch (error) {
    console.error("Error al aprobar el rutograma:", error);
    toast.error('Error de conexión al intentar aprobar el rutograma.');
  }
};

const handleReturnRutograma = (comentarios: string) => {
  // Lógica para devolver el rutograma con comentarios
  console.log('Devolviendo rutograma con comentarios:', comentarios);
  toast.warning('Rutograma devuelto para corrección.');
  setShowRutogramaModal(false);
};



// Utilidad para parsear nombre de archivo
function parseArchivoNombre(nombre: string) {
  const partes = nombre.replace('.pdf', '').split('_');
  let tipo = '', fechaCarga = '', fechaVencimiento = '', nombreArchivo = nombre;
  if (partes.length >= 3) {
    tipo = partes[1];
    fechaCarga = partes[2];
    if (partes.length >= 4) fechaVencimiento = partes[3];
    nombreArchivo = nombre;
  }
  return { tipo, fechaCarga, fechaVencimiento, nombreArchivo };
}

const EstadoSolicitud: React.FC<{ status: number }> = ({ status }) => {
  if (status === 0)
    return <span className={`${styles.estadoRRHH} ${styles.estadoPendiente}`}>Pendiente</span>;
  if (status === 1)
    return <span className={`${styles.estadoRRHH} ${styles.estadoAprobado}`}>Aprobado</span>;
  if (status === 2)
    return <span className={`${styles.estadoRRHH} ${styles.estadoRechazado}`}>Rechazado</span>;
  return <span className={styles.estadoRRHH}>Desconocido</span>;
};

if (RRHH !== 1) return <div>No autorizado</div>;

// Calcular resumen de empleados con documentos vencidos por tipo seleccionado
const resumenVencidosPorTipo: Record<string, number> = {};
filtroDocumentosVencidos.forEach(tipoSel => {
  resumenVencidosPorTipo[tipoSel] = empleadosVencidos.filter(emp =>
    Object.keys(emp.documentosVencidos || {}).some(tipoDoc =>
      (tiposVencimiento.find(t => t.toLowerCase() === tipoDoc) || tipoDoc) === tipoSel
    )
  ).length;
});
// Calcular total de empleados con al menos un documento vencido según filtro
const totalVencidos = empleadosVencidosFiltrados.length;
// Calcular total de documentos vencidos según filtro
const totalDocumentosVencidos = empleadosVencidosFiltrados.reduce((acc, emp) => {
  const docsFiltrados = filtroDocumentosVencidos.length === 0
    ? Object.entries(emp.documentosVencidos || {})
    : Object.entries(emp.documentosVencidos || {}).filter(([tipo]) =>
        filtroDocumentosVencidos.includes(tiposVencimiento.find(t => t.toLowerCase() === tipo) || tipo)
      );
  return acc + docsFiltrados.length;
}, 0);
return (
  <>
    <ToastContainer style={{ zIndex: 9999 }}/>
    <br /><br/>
    <NavbarEmpresa />
      <br /><br />
      <div style={{ padding: 24 }}>
        <h1 className={styles.tituloRRHH}>
          Directorio de Expedientes de Empleados
          {empleadoSeleccionado && (
            <button
              onClick={() => printExpediente(datosPersonales, rutas, archivos, palabrasClaveDict, parseArchivoNombre)}
              title="Imprimir expediente"
              style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: '#003391' }}
            >
              <FiPrinter />
            </button>
          )}
        </h1>
        <div className={styles.layoutRRHH}>
          <div className={styles.buscadorRRHH}>
            <h4 className={styles.SubtituloRRHH}>Buscar Empleado</h4>
            <Select
              options={empleadoOptions}
              styles={{
                control: (base) => ({ ...base, width: '100%' }),
                menu: (base) => ({ ...base, zIndex: 9999 }),
              }}
              placeholder="Buscar por nombre o cédula..."
              onChange={option => {
                if (option && 'data' in option) {
                  handleSeleccionarEmpleado(option.data);
                } else {
                  handleSeleccionarEmpleado(null);
                }
              }}
              isClearable
              value={
                empleadoSeleccionado
                  ? {
                      value: empleadoSeleccionado.cod_emp,
                      label: `${empleadoSeleccionado.nombre_completo} (${empleadoSeleccionado.cedula})`,
                      data: empleadoSeleccionado
                    }
                  : null
              }
              noOptionsMessage={() => "No se encontraron empleados"}
              filterOption={(option, inputValue) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
              }
            />

            {/* Accordion para la tabla de empleados con solicitudes de cambio y mini-buscador */}
            <Accordion  className={styles.accordionSolicitudesRRHH}>
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <span className={`${styles.SubtituloRRHH} ${styles.accordionTitle}`}>Empleados con Solicitudes de Cambio</span>
                </Accordion.Header>
                <Accordion.Body className={styles.accordionBodySolicitudesRRHH}>
                  <Button variant="primary" size="sm" onClick={cargarEmpleadosConSolicitudes} className={styles.botonRecargarRRHH} style={{ marginBottom: 16 , display: 'flex', justifyContent: 'flex-end', justifySelf: 'flex-end' }}>
                    <FiRefreshCcw size={20} />
                  </Button>
                  {loadingSolicitudes ? (
                    <div className={styles.archivosLoadingRRHH}>
                      <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="medium" text="" textColor="#0d1bff" />
                      <span className={styles.archivosLoadingTextRRHH}>Cargando empleados con solicitudes de cambio puede tardar unos minutos, por favor espere...</span>
                    </div>
                  ):(<>
                
                  <Select
                    options={empleadosSolicitudesOptions}
                    placeholder="Filtrar por nombre..."
                    isClearable
                    value={filtroSolicitudes}
                    onChange={setFiltroSolicitudes}
                    className={styles.selectSolicitudesRRHH}
                    classNamePrefix="react-select"
                    noOptionsMessage={() => "No hay coincidencias"}
                    filterOption={(option, inputValue) =>
                      option.label.toLowerCase().includes(inputValue.toLowerCase())
                    }
                  />

                  <div className={styles.tablaScrollRRHH} >
                    <table className={styles.tableRRHH + ' ' + styles.tableSolicitudesRRHH}>
                      <thead className={styles.theadSolicitudes}>
                        <tr>
                          <th className={styles.thRRHH}>Nombre y Apellido</th>
                          <th className={styles.thRRHH}>Estatus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empleadosConSolicitudesFiltrados.length === 0 ? (
                          <tr><td colSpan={2} className={styles.tdNoSolicitudesRRHH}>No hay empleados con solicitudes</td></tr>
                        ) : empleadosConSolicitudesFiltrados.map((emp) => (
                          <tr key={emp.cod_emp} className={styles.trSolicitudesRRHH} onClick={() => handleSeleccionarDesdeTabla(emp.cod_emp)}>
                            <td className={styles.tdRRHH}>{emp.nombres} {emp.apellidos}</td>
                            <td className={styles.tdRRHH}>
                              {emp.estatus === 'Incompleto' ? (
                                <span className={`${styles.estadoRRHH} ${styles.estadoPendiente}`}>Incompleto</span>
                              ) : (
                                <span className={`${styles.estadoRRHH} ${styles.estadoAprobado}`}>Completo</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>)}
                  
                  
                  
                </Accordion.Body>
              </Accordion.Item>
            {/* Accordion para empleados con documentos vencidos */}
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <span className={`${styles.SubtituloRRHH} ${styles.accordionTitle}`}>Empleados con Documentos Vencidos</span>
              </Accordion.Header>
              <Accordion.Body className={styles.accordionBodySolicitudesRRHH}>
                <Button variant="primary" size="sm" onClick={() => {
                  cargarEmpleadosVencidos();
                } } className={styles.botonRecargarRRHH} style={{ marginBottom: 16 , display: 'flex', justifyContent: 'flex-end', justifySelf: 'flex-end' }}>
                  <FiRefreshCcw size={20} />
                </Button>

                {/* Filtro de documentos vencidos */}
                <div style={{ marginBottom: 16 }}>
                  <Select
                    isMulti
                    options={opcionesDocumentosVencidos}
                    value={opcionesDocumentosVencidos.filter(opt => filtroDocumentosVencidos.includes(opt.value))}
                    // 
                    onChange={opts => setFiltroDocumentosVencidos(opts.map((o:any) => o.value))}
                    placeholder="Filtrar por tipo de documento..."
                    classNamePrefix="react-select"
                    styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                  />
                </div>
                
                {loadingVencidos ? (
                  <div className={styles.archivosLoadingRRHH}>
                    <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="medium" text="" textColor="#0d1bff" />
                    <span className={styles.archivosLoadingTextRRHH}>Cargando empleados con documentos vencidos, puede tardar unos minutos, por favor espere...</span>
                  </div>
                ) : empleadosVencidosFiltrados.length === 0 ? (
                  <div className={styles.tdNoSolicitudesRRHH}>No hay empleados con documentos vencidos para el filtro seleccionado</div>
                ) : (<>
                  {/* Resumen de empleados con documentos vencidos por tipo */}
                  {filtroDocumentosVencidos.length > 0 && (
                    <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      <AnimatedCounter value={totalVencidos} label="Total empleados con documentos vencidos seleccionados" />
                      <div style={{ color: '#003391', fontWeight: 600, fontSize: 18, margin: '8px 0 0 0' }}>
                        Total documentos vencidos: {totalDocumentosVencidos}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap', marginTop: 8 }}>
                        {filtroDocumentosVencidos.map(tipo => (
                          <AnimatedCounter
                            key={tipo}
                            value={resumenVencidosPorTipo[tipo]}
                            label={mostrarTipoDoc(tipo)}
                            color="#1A5FFA"
                            bgColor="#eaf1ff"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <Accordion alwaysOpen className={styles.accordionEmpleadosVencidos}>
                    {empleadosVencidosFiltrados.map((emp, idx) => {
                      const codEmp = emp.cod_emp || emp.COD_EMP || emp.cedula || emp.CEDULA;
                      // Filtrar solo los documentos vencidos seleccionados
                      const docsFiltrados = filtroDocumentosVencidos.length === 0
                      ? Object.entries(emp.documentosVencidos || {})
                      : Object.entries(emp.documentosVencidos || {}).filter(([tipo]) =>
                            filtroDocumentosVencidos.includes(tiposVencimiento.find(t => t.toLowerCase() === tipo) || tipo)
                    );
                    if (docsFiltrados.length === 0) return null;
                      return (
                        <Accordion.Item eventKey={String(idx)} key={codEmp || idx}>
                          <Accordion.Header>
                            <span style={{fontWeight:'bold', color:'#003391'}}>
                              {empleadosVencidos &&/* && nombresVencidos[codEmp] ? nombresVencidos[codEmp] :  */(emp.nombreCompleto || codEmp)}
                            </span>
                          </Accordion.Header>
                          <Accordion.Body className={styles.accordionBodyVencidosRRHH}>
                            <div className={styles.tablaScrollRRHH}>
                              <table className={styles.tableRRHH + ' ' + styles.tableSolicitudesRRHH}>
                                <thead className={styles.theadSolicitudes}>
                                  <tr>
                                    <th className={styles.thRRHH}>Documento</th>
                                    <th className={styles.thRRHH}>Fecha de Vencimiento</th>
                                  </tr>
                                </thead>
                                <tbody>

                                  {// 
                                  docsFiltrados.map(([tipo, doc]: any) => (
                                    <tr
                                      key={tipo}
                                      className={styles.trSolicitudesRRHH}
                                      style={doc.webViewLink ? { cursor: 'pointer' } : undefined}
                                      onClick={() => {
                                        if (doc.webViewLink) {
                                          window.open(doc.webViewLink, '_blank', 'noopener,noreferrer');
                                        }
                                      }}
                                      title={doc.webViewLink ? 'Ver en Drive' : 'No disponible'}
                                    >
                                      <td className={styles.tdRRHH}>
                                        {mostrarTipoDoc(tiposVencimiento.find(t => t.toLowerCase() === tipo) || tipo)}
                                      </td>
                                      <td className={styles.tdRRHH}>{doc.fechaVencimiento}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                    </>
                )}
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
                <Accordion.Header>
                  <span className={`${styles.SubtituloRRHH} ${styles.accordionTitle}`}>Histórico: Solicitudes de Rutograma</span>
                </Accordion.Header>
                <Accordion.Body className={styles.accordionBodySolicitudesRRHH}>
                <Button variant="primary" size="sm" onClick={() => {
                  setLoadingRutogramas(true);
                  cargarEmpleadosConRutograma();
                } } className={styles.botonRecargarRRHH} style={{ marginBottom: 16 , display: 'flex', justifyContent: 'flex-end', justifySelf: 'flex-end' }}>
                  <FiRefreshCcw size={20} />
                </Button>
                  {loadingRutogramas ? (
                    <div className={styles.archivosLoadingRRHH}>
                      <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="large" text="" textColor="#0d1bff" />
                      <span className={styles.archivosLoadingTextRRHH}>Cargando empleados con solicitudes de rutograma, puede tardar unos minutos, por favor espere...</span>
                    </div>):(<>

                      {/* --- CONTENEDOR PARA FILTROS --- */}
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem',
                      flexDirection: 'column'
                        
                      }}>
                        {/* Filtro por Nombre */}
                        <div style={{ flex: 2 }}>
                      <Select
                      options={empleadosRutogramaOptions}
                      placeholder="Filtrar por nombre..."
                      isClearable
                      value={
                        filtroRutograma
                          ? empleadosRutogramaOptions.find(opt => opt.data.id === filtroRutograma.id) || null
                          : null
                      }
                      onChange={option => setFiltroRutograma(option ? option.data : null)}
                      className={styles.selectSolicitudesRRHH}
                      classNamePrefix="react-select"
                      noOptionsMessage={() => "No hay coincidencias"}
                    />
                        </div>
                        {/* Filtro por Estatus */}
                        <div style={{ flex: 1 }}>
                          <Select
                            isMulti
                            options={[
                              { value: 'Pendiente', label: 'Pendiente' },
                              { value: 'Aprobado', label: 'Aprobado' },
                              { value: 'Devuelto', label: 'Devuelto' },
                            ]}
                            value={[
                              { value: 'Pendiente', label: 'Pendiente' },
                              { value: 'Aprobado', label: 'Aprobado' },
                              { value: 'Devuelto', label: 'Devuelto' },
                            ].filter(opt => filtroStatusRutograma.includes(opt.value))}
                            onChange={opts => setFiltroStatusRutograma(opts.map(opt => opt.value))}
                            classNamePrefix="react-select"
                            placeholder="Filtrar por estado..."
                            closeMenuOnSelect={false}
                          />
                        </div>
                        {/* Filtro por Rango de Fechas */}
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                          <div style={{ display: 'flex', gap: '10px', flex: 1, zIndex:0 }}>
                          <DatePicker
                            label="Desde"
                            value={filtroFechaDesde}
                            onChange={(newValue) => setFiltroFechaDesde(newValue)}
                            slotProps={{
                            textField: {
                            size: "small",
                            fullWidth: true,
                            InputLabelProps: { style: { fontFamily: 'inherit' } },
                            inputProps: { lang: 'es' },
                            }
                            }}
                            format="DD/MM/YYYY"
                          />
                          <DatePicker
                            label="Hasta"
                            value={filtroFechaHasta}
                            onChange={(newValue) => setFiltroFechaHasta(newValue)}
                            slotProps={{
                            textField: {
                            size: "small",
                            fullWidth: true,
                            InputLabelProps: { style: { fontFamily: 'inherit' } },
                            inputProps: { lang: 'es' },
                            }
                            }}
                            minDate={filtroFechaDesde || undefined}
                            format="DD/MM/YYYY"
                          />
                          </div>
                        </LocalizationProvider>
                      </div>
                    
                    <div className={styles.tablaScrollRRHH} >
                      <table className={styles.tableRRHH + ' ' + styles.tableSolicitudesRRHH}>
                        <thead className={styles.theadSolicitudes} >
                          <tr>
                            <th className={styles.thRRHH}>Nombre y Apellido</th>
                            <th className={styles.thRRHH}>Fecha</th> {/* Cambio de nombre */}
                            <th className={styles.thRRHH}>Estatus</th>
                          </tr>
                        </thead>
                        <tbody>
                          {empleadosRutogramaFiltrados.length === 0 ? (
                            <tr><td colSpan={3} className={styles.tdNoSolicitudesRRHH}>No hay empleados con solicitudes</td></tr>
                          ) : empleadosRutogramaFiltrados.map((emp) => (
                            <tr key={emp.id} className={styles.trSolicitudesRRHH} onClick={() => handleSeleccionarDesdeTabla(emp.cod_emp)}>
                              <td className={styles.tdRRHH}>{emp.nombres} {emp.apellidos}</td>
                              <td className={styles.tdRRHH}>
                                {/* Lógica condicional para la fecha */}
                                {
                                  emp.status === 'Aprobado' && emp.fecha_aprobacion ? new Date(emp.fecha_aprobacion).toLocaleDateString() :
                                  emp.status === 'Devuelto' && emp.fecha_rechazo ? new Date(emp.fecha_rechazo).toLocaleDateString() :
                                  new Date(emp.fecha).toLocaleDateString()
                                }
                              </td>
                              <td className={styles.tdRRHH}>
                                <span className={`${styles.estadoRRHH} ${emp.status === 'Pendiente' ? styles.estadoPendiente : emp.status === 'Devuelto' ? styles.estadoRechazado : styles.estadoAprobado}`}>
                                  {emp.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>)}
                    
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
          {!empleadoSeleccionado ? (
            <div className={styles.placeholderRRHH}>
              <img src={imagen} alt="Selecciona un empleado" className={styles.imagenPlaceholderRRHH} />
              <h3 className={styles.seccionRRHH}>Selecciona un empleado</h3>
              <p>Para ver sus datos personales, solicitudes de cambio, rutas y archivos asociados.</p>
            </div>
          ) : (
            <div
              className={
                styles.detalleRRHH +
                (animating === 'in'
                  ? ' ' + styles['detalleRRHH-anim-in']
                  : animating === 'out'
                  ? ' ' + styles['detalleRRHH-anim-out']
                  : '')
              }
              style={{ display: showDetalle ? undefined : 'none' }}
            >
              <div className={styles.detalleContenidoRRHH}>
                <h4 className={styles.SubtituloRRHH}>Datos Personales</h4>
                {datosPersonales ? (
                  <div className={styles.cardDatosPersonales}>
                    <div className={styles.dpHeader}>
                      <FiUser className={styles.dpIconMain} />
                      <div>
                        <div className={styles.dpNombre}>{datosPersonales.nombres} {datosPersonales.apellidos}</div>
                        <div className={styles.dpCargoDepto}>
                          <FiBriefcase className={styles.dpIconSec} />
                            <span>{datosPersonales.cargo.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</span>
                          <MdApartment className={styles.dpIconSec} style={{ marginLeft: 16 }} />
                            <span>{datosPersonales.departamento.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</span>
                        </div>
                      </div>
                    </div>
                    <hr className={styles.dpDivider} />
                    <div className={styles.dpRow}>
                      <FiCalendar className={styles.dpIconSec} />
                      <span><b>Fecha de Ingreso:</b> {datosPersonales.fecha_ing?.split('T')[0]}</span>
                    </div>
                    <div className={styles.dpRow}>
                      <FiCalendar className={styles.dpIconSec} />
                      <span><b>Fecha de Nacimiento:</b> {datosPersonales.fecha_nac?.split('T')[0]}</span>
                    </div>
                    <div className={styles.dpRow}>
                      <FiCreditCard className={styles.dpIconSec} />
                      <span><b>Cédula:</b> {datosPersonales.ci}</span>
                      <FiCreditCard className={styles.dpIconSec} style={{ marginLeft: 16 }} />
                      <span><b>RIF:</b> {datosPersonales.rif}</span>
                    </div>
                    <div className={styles.dpRow}>
                      <FiUser className={styles.dpIconSec} />
                      <span><b>Estado Civil:</b> {{
                          S: "Soltero",
                          C: "Casado",
                          D: "Divorciado",
                          V: "Viudo"
                        }[datosPersonales.edo_civ] || "Desconocido"
                      }</span>
                    </div>
                    <hr className={styles.dpDivider} />
                    <div className={styles.dpRow}>
                      <FiMail className={styles.dpIconSec} />
                        <span>
                        <b>Email: </b> 
                        <a 
                          href={`mailto:${datosPersonales.correo_e}`} 
                          onClick={(e) => {
                          e.preventDefault();
                          navigator.clipboard.writeText(datosPersonales.correo_e);
                            toast.success('Correo copiado al portapapeles');
                          }}
                        >
                          {datosPersonales.correo_e}
                        </a>
                        </span>
                    </div>
                    <div className={styles.dpRow}>
                      <FiPhone className={styles.dpIconSec} />
                      <span><b>Teléfono:</b> {datosPersonales.telefono}</span>
                    </div>
                    <div className={styles.dpRow}>
                      <FiMapPin className={styles.dpIconSec} />
                      <span><b>Dirección de Habitación:</b> </span><span>{datosPersonales.direccion}</span>
                    </div>
                  </div>
                ) : 
                  <Alert variant="info" className={styles.alertShadow}>
                    No hay datos personales
                  </Alert>
                }
                <h4 className={styles.SubtituloRRHH}>Solicitudes de Cambio de Datos</h4>
                <p>Aquí puedes ver todas las peticiones de cambio de datos realizadas por el empleado.
                 <br/> Puedes aprobar o rechazar cada solicitud según corresponda. Las solicitudes aprobadas se reflejarán en los datos personales del empleado.</p>
                {solicitudes.length === 0 ? (
                  <Alert variant="info" className={styles.alertShadow}>
                    No hay solicitudes
                  </Alert>
                ) : (
                  <table className={styles.tableRRHH}>
                    <thead>
                      <tr>
                        <th className={styles.thRRHH}>Etiqueta</th>
                        <th className={styles.thRRHH}>Solicitud</th>
                        <th className={styles.thRRHH}>Estatus</th>
                        <th className={styles.thRRHH} style={{ width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitudes.map((sol, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? '' : styles.tdAltRRHH}>
                          <td className={styles.tdRRHH}>{sol.etiqueta}</td>
                          <td className={styles.tdRRHH}>
                            {sol.etiqueta === "Estado Civil" 
                              ? {
                                  S: "Soltero",
                                  C: "Casado",
                                  D: "Divorciado",
                                  V: "Viudo"
                                }[sol.solicitud] || "Desconocido"
                              : sol.solicitud}
                          </td>
                          
                          <td className={styles.tdRRHH}><EstadoSolicitud status={sol.status} /></td>
                          <td className={styles.menuCellRRHH}>
                            <span
                              className={`${styles.menuRRHH} ${openMenuSolicitud === idx ? 'open' : ''}`}
                              onClick={e => {
                                e.stopPropagation();
                                setOpenMenuSolicitud(openMenuSolicitud === idx ? null : idx);
                              }}
                            >
                              {sol.status === 0 && (
                                <button className={styles.menuBtnRRHH} tabIndex={-1} title="Acciones">⋮</button>
                              )}
                              <div
                                className={styles.dropdownRRHH}
                                style={{ display: openMenuSolicitud === idx ? 'block' : 'none' }}
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  className={styles.dropdownItemRRHH}
                                  style={{ borderBottom: '1px solid #f0f0f0' }}
                                  onClick={() => handleAprobarSolicitud(sol)}
                                >
                                  ✅ Aprobar
                                </button>
                                <button
                                  className={`${styles.dropdownItemRRHH} ${styles.reject}`}
                                  onClick={() => handleRechazarSolicitud(sol)}
                                >
                                  ❌ Rechazar
                                </button>
                              </div>               
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <br />
                <h4 className={styles.SubtituloRRHH} style={{display:'flex',alignItems:'center', gap: '8px'}}> <FaRoute/>  Rutograma
                </h4>
                {rutas.length === 0 ? (
                  <Alert variant="info" className={styles.alertShadow}>
                    El empleado no ha cargado un rutograma.
                  </Alert>
                ) : (
                  <div className={styles.cardDatosPersonales} style={{padding: '1rem'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                      <p style={{ margin: 0, fontWeight: 500 }}>El empleado ha registrado su rutograma.</p>
                      {rutogramaEstado && (
                        rutogramaEstado === 'Aprobado' ? (
                          <span className={`${styles.estadoRRHH} ${styles.estadoAprobado}`}>Aprobado</span>
                        ) : rutogramaEstado === 'Pendiente' ? (
                          <span className={`${styles.estadoRRHH} ${styles.estadoPendiente}`}>Pendiente</span>
                        ) : rutogramaEstado === 'Devuelto' ? (
                          <span className={`${styles.estadoRRHH} ${styles.estadoRechazado}`}>Devuelto</span>
                        ) : (
                          <span className={styles.estadoRRHH}>Desconocido</span>
                        )
                      )}
                    </div>
                    
                    {/* Contenedor para mostrar información del revisor */}
                    {(rutogramaEstado === 'Aprobado' || rutogramaEstado === 'Devuelto') && rutogramaData?.global?.nombre_completo_revisor && (
                      <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '8px', borderLeft: '3px solid #003391', paddingLeft: '10px' }}>
                        Revisado por: <strong>{rutogramaData.global.nombre_completo_revisor}</strong>
                        {rutogramaData.global.fecha_aprobacion && ` el ${new Date(rutogramaData.global.fecha_aprobacion).toLocaleDateString()}`}
                        {rutogramaData.global.fechaEnvio && ` el ${new Date(rutogramaData.global.fechaEnvio).toLocaleDateString()}`}
                      </div>
                    )}

                    <div style={{marginTop: '1rem'}}>
                      <Button variant="primary" onClick={handleVerRutograma}>
                        Ver y Gestionar Rutograma
                      </Button>
                      {/* BOTÓN PARA VISTA PREVIA PDF */}
                      {rutogramaEstado === 'Aprobado' &&
                      <Button
                        variant="success"
                        onClick={handlePreviewPdf}
                        style={{ marginLeft: '10px' }}
                      >
                        Vista Previa (PDF)
                      </Button>
                      }
                    </div>
                  </div>
                )}
                <h4 className={styles.SubtituloRRHH}>Archivos</h4>
                {archivosLoading ? (
                  <div className={styles.archivosLoadingRRHH}>
                    <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="medium" text="" textColor="#0d1bff" />
                    <span className={styles.archivosLoadingTextRRHH}>Cargando archivos...</span>
                  </div>
                ) : archivos.length === 0 ? (
                  <Alert variant="info" className={styles.alertShadow}>
                    No hay archivos
                  </Alert>
                ) : (
                  <table className={styles.tableRRHH}>
                    <thead>
                      <tr>
                        <th className={styles.thRRHH}>Tipo de documento</th>
                        <th className={styles.thRRHH}>Nombre</th>
                        <th className={styles.thRRHH}>Fecha de carga</th>
                        <th className={styles.thRRHH}>Fecha de vencimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivos.map((arch, idx) => {
                        const { tipo, fechaCarga, fechaVencimiento, nombreArchivo } = parseArchivoNombre(arch.name);
                        return (
                          <tr key={arch.id} className={idx % 2 === 0 ? '' : styles.tdAltRRHH}>
                            <td className={styles.tdRRHH}>
                              <a
                                href={`https://drive.google.com/file/d/${arch.id}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.linkArchivoRRHH}
                              >
                                {palabrasClaveDict[tipo] || tipo || 'Desconocido'}
                              </a>
                            </td>
                            <td className={styles.tdRRHH}>{nombreArchivo}</td>
                            <td className={styles.tdRRHH}>{fechaCarga || '-'}</td>
                            <td className={styles.tdRRHH}>{fechaVencimiento || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
      {/* 4. RENDERIZAR EL COMPONENTE DE REPORTE SI HAY DATOS */}
        {pdfReportData && (
        <Modal
          show={!!pdfReportData}
          onHide={() => setPdfReportData(null)}
          centered
          size="xl"
          /* dialogClassName={styles.modalContent} */
          /* contentClassName={styles.modalContent} */
          backdrop="static"
        >
          <Modal.Header closeButton className={styles.modalHeader}>

            <Modal.Title className={styles.modalTitle}>
              Vista Previa Rutograma PDF
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className={styles.modalBody}>
            <ReporteRutograma
              rutogramaData={pdfReportData}
              tiposTransporte={tiposTransporte}
              tiposActividad={tiposActividad}
            />
          </Modal.Body>
        </Modal>
      )}
      {showRutogramaModal && (
        <ModalVerRutogramaRRHH
          show={showRutogramaModal}
          onHide={() => setShowRutogramaModal(false)}
          rutogramaData={rutogramaData}
          onApprove={handleApproveRutograma}
          onReturn={handleReturnRutograma}
          empleadoNombre={empleadoSeleccionado?.nombre_completo || ''}
          tiposTransporte={tiposTransporte}
          tiposActividad={tiposActividad}
          refreshRutograma={() => {
            if (empleadoSeleccionado) 
              cargarRutograma(empleadoSeleccionado.cod_emp);
             cargarDatos();
          }}
        />
      )}
    </>
  );
};

export default RRHHExpedientes;