import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';
import axios from 'axios';
import styles from '../css/RRHHExpedientes.module.css';
import { Mosaic } from 'react-loading-indicators';
import Select from 'react-select';
import NavbarEmpresa from '../components/NavbarEmpresa';
import imagen from '../assets/inspect.webp';
import { FiUser, FiBriefcase,  FiMail, FiPhone, FiCalendar, FiMapPin, FiCreditCard, FiPrinter } from "react-icons/fi";
import { MdApartment } from "react-icons/md";
import { toast, ToastContainer } from 'react-toastify';
import {  Alert, Accordion } from 'react-bootstrap';
import { printExpediente } from '../utils/printExpediente';
import { printRutograma } from '../utils/printRutograma';
import AnimatedCounter from '../components/AnimatedCounter';

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

const apiUrl = import.meta.env.VITE_API_URL;

const RRHHExpedientes: React.FC = () => {
  const { RRHH } = useAuth();

  // Estados principales
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);
  const [solicitudes, setSolicitudes] = useState<SolicitudCambio[]>([]);
  const [datosPersonales, setDatosPersonales] = useState<DatosPersonales | null>(null);
  const [rutas, setRutas] = useState<RutaSolicitud[]>([]);
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [archivosLoading, setArchivosLoading] = useState(false);
  // Empleados con documentos vencidos (dinámico)
  const [empleadosVencidos, setEmpleadosVencidos] = useState<any[]>([]);
  const [loadingVencidos, setLoadingVencidos] = useState(false);
  const [tiposVencimiento, setTiposVencimiento] = useState<string[]>([]);
  const [filtroDocumentosVencidos, setFiltroDocumentosVencidos] = useState<string[]>([]);
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
  const empleadosVencidosFiltrados = filtroDocumentosVencidos.length === 0
    ? empleadosVencidos
    : empleadosVencidos.filter(emp => {
        // Verifica si el empleado tiene al menos un documento vencido del tipo seleccionado
        return filtroDocumentosVencidos.some(tipoSel => {
          return Object.keys(emp.documentosVencidos || {}).some(tipoDoc => {
            return (tiposVencimiento.find(t => t.toLowerCase() === tipoDoc) || tipoDoc) === tipoSel;
          });
        });
      });

  useEffect(() => {
    setLoadingVencidos(true);
    axios.get(`${apiUrl}/google-drive/empleados-documentos-vencidos-sheet`)
      .then(res => {
        setEmpleadosVencidos(res.data.empleados || []);
      })
      .catch(() => setEmpleadosVencidos([]))
      .finally(() => setLoadingVencidos(false));
  }, []);
  // Cargar tipos de documentos con fechaVencimiento=true
  useEffect(() => {
    axios.get(`${apiUrl}/google-drive/tiposDocumentos`).then(res => {
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
  const [openMenuRuta, setOpenMenuRuta] = useState<number | null>(null);

  // Cargar empleados al inicio
  useEffect(() => {
    if (RRHH !== 1) return;
    axios.get(`${apiUrl}/empleados/listar`)
      .then(res => setEmpleados(res.data))
      .catch(() => setEmpleados([]));
  }, [RRHH]);

  // Opciones para react-select
  const empleadoOptions = empleados.map(emp => ({
    value: emp.cod_emp,
    label: `${emp.nombre_completo} (${emp.cedula.replace(/\./g, '')})`,
    data: emp
  }));

  // Utilidad para obtener el nombre completo de un empleado por cod_emp para el accordion de vencidos
  const [nombresVencidos, setNombresVencidos] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!empleadosVencidos || empleadosVencidos.length === 0) {
      setNombresVencidos({});
      return;
    }
    const fetchNombres = async () => {
      const nuevosNombres: Record<string, string> = {};
      
     
      await Promise.all(
        empleadosVencidos.map(async (emp: any) => {
          // Buscar cod_emp de forma robusta
          const codEmp = emp.cod_emp || emp.COD_EMP || emp.cedula || emp.CEDULA;
          if (codEmp && !nuevosNombres[codEmp]) {
            try {
              const res = await axios.get(`${apiUrl}/empleados/nombre-completo/${codEmp}`);
              nuevosNombres[codEmp] = res.data.nombre_completo;
            } catch {
              nuevosNombres[codEmp] = emp.nombre_completo || emp.NOMBRE_COMPLETO || emp.cedula || emp.CEDULA || codEmp;
            }
          }
        })
      );
      setNombresVencidos(nuevosNombres);
    };
    fetchNombres();
  }, [empleadosVencidos]);
  // Empleados con solicitudes de cambio
  const [empleadosConSolicitudes, setEmpleadosConSolicitudes] = useState<any[]>([]);
  const [filtroSolicitudes, setFiltroSolicitudes] = useState<any | null>(null);
  const cargarEmpleadosConSolicitudes = () => {
    axios.get(`${apiUrl}/expediente/empleados-con-solicitudes-cambio`)
      .then(res => setEmpleadosConSolicitudes(res.data))
      .catch(() => setEmpleadosConSolicitudes([]));
  };
  useEffect(() => {
    cargarEmpleadosConSolicitudes();
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

  // Filtrar empleados según el mini-buscador
  const empleadosConSolicitudesFiltrados = filtroSolicitudes
    ? empleadosConSolicitudes.filter(emp => emp.cod_emp === filtroSolicitudes.value)
    : empleadosConSolicitudes;

  // Handler para seleccionar desde la tabla de solicitudes
  const handleSeleccionarDesdeTabla = (cod_emp: string) => {
    const emp = empleados.find(e => e.cod_emp === cod_emp);
    if (emp) handleSeleccionarEmpleado(emp);
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
    if (!empleado) return;
    setLoading(true);
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
        setLoading(false);
      })
      .catch(() => {
        setDatosPersonales(null);
        setArchivos([]);
        setArchivosLoading(false);
        setLoading(false);
      });

    axios.get(`${apiUrl}/expediente/rutas/${empleado.cod_emp}`)
      .then(res => setRutas(res.data.rutas))
      .catch(() => setRutas([]));
  };

  // Cierra el menú contextual si se hace click fuera
  useEffect(() => {
    const handleClick = () => {
      setOpenMenuSolicitud(null);
      setOpenMenuRuta(null);
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
      await axios.put(`${apiUrl}/expediente/actualizarDatosPersonales/${(solicitud as any).id}`);
      toast.success(`Solicitud aprobada correctamente`);
      // Refresca solicitudes y datos personales
      if (empleadoSeleccionado) {
        await cargarEmpleado(empleadoSeleccionado);
        // Si ya no quedan solicitudes pendientes, recargar la tabla de empleados con solicitudes
        const nuevasSolicitudes = await axios.get(`${apiUrl}/expediente/solicitudes-cambio/${empleadoSeleccionado.cod_emp}`);
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
      await axios.put(`${apiUrl}/expediente/rechazarSolicitud/${(solicitud as any).id }`);
      toast.success(`Solicitud rechazada correctamente`);
      // Refresca solicitudes y datos personales
      if (empleadoSeleccionado) {
        await cargarEmpleado(empleadoSeleccionado);
        // Si ya no quedan solicitudes pendientes, recargar la tabla de empleados con solicitudes
        const nuevasSolicitudes = await axios.get(`${apiUrl}/expediente/solicitudes-cambio/${empleadoSeleccionado.cod_emp}`);
        const quedanPendientes = nuevasSolicitudes.data.some((s: any) => s.status === 0);
        if (!quedanPendientes) cargarEmpleadosConSolicitudes();
      }
    } catch (error) {
      toast.error('Error al rechazar la solicitud');
    }
    setOpenMenuSolicitud(null);
  };
  const handleAprobarRuta = (ruta: RutaSolicitud) => {
    toast.info(`Aprobar ruta: ${ruta.descripcion}`);
    setOpenMenuRuta(null);
  };
  const handleRechazarRuta = (ruta: RutaSolicitud) => {
    toast.info(`Rechazar ruta: ${ruta.descripcion}`);
    setOpenMenuRuta(null);
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
      <ToastContainer />
      <br /><br />
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
                </Accordion.Body>
              </Accordion.Item>
            {/* Accordion para empleados con documentos vencidos */}
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <span className={`${styles.SubtituloRRHH} ${styles.accordionTitle}`}>Empleados con Documentos Vencidos</span>
              </Accordion.Header>
              <Accordion.Body className={styles.accordionBodySolicitudesRRHH}>
                {/* Filtro de documentos vencidos */}
                <div style={{ marginBottom: 16 }}>
                  <Select
                    isMulti
                    options={opcionesDocumentosVencidos}
                    value={opcionesDocumentosVencidos.filter(opt => filtroDocumentosVencidos.includes(opt.value))}
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
                              {nombresVencidos[codEmp] || emp.nombre_completo || emp.NOMBRE_COMPLETO || emp.cedula || emp.CEDULA || codEmp}
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
                                  {docsFiltrados.map(([tipo, doc]: any) => (
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
                <h4 className={styles.SubtituloRRHH} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  Rutograma
                  { rutas.length > 0 && (
                  <button
                    onClick={() => printRutograma(rutas, datosPersonales ? `${datosPersonales.nombres} ${datosPersonales.apellidos}` : undefined)}
                    title="Imprimir rutograma"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#003391', marginLeft: 8 }}
                    >
                    <FiPrinter />
                  </button>)
                  }
                </h4>
                    {rutas.length === 0 ? (   
                  <Alert variant="info" className={styles.alertShadow}>
                    No hay rutas
                  </Alert>
                ) : (<>
                  <p>
                    Aquí puedes ver las rutas escritas por el empleado
                    <br /> Puedes aprobar o rechazar cada ruta según corresponda.
                  </p>
                  <table className={styles.tableRRHH}>
                    <thead>
                      <tr>
                        <th className={styles.thRRHH}>Tipo</th>
                        <th className={styles.thRRHH}>Descripción</th>
                        <th className={styles.thRRHH}>Estatus</th>
                        <th className={styles.thRRHH} style={{ width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rutas.map((ruta, idx) => (
                        <tr key={ruta.id} className={idx % 2 === 0 ? '' : styles.tdAltRRHH}>
                          <td className={styles.tdRRHH}>
                            {ruta.tipo === 'I' ? 'Destino a la oficina' : ruta.tipo === 'R' ? 'Regreso a la Casa' : 'Otro'}
                          </td>
                          <td className={styles.tdRRHH}>{ruta.descripcion}</td>
                          <td className={styles.tdRRHH}>{ruta.status}</td>
                          <td className={styles.menuCellRRHH}>
                            <span
                              className={`${styles.menuRRHH} ${openMenuRuta === idx ? 'open' : ''}`}
                              onClick={e => {
                                e.stopPropagation();
                                setOpenMenuRuta(openMenuRuta === idx ? null : idx);
                              }}
                            >
                              <button className={styles.menuBtnRRHH} tabIndex={-1} title="Acciones">⋮</button>
                              <div
                                className={styles.dropdownRRHH}
                                style={{ display: openMenuRuta === idx ? 'block' : 'none' }}
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  className={styles.dropdownItemRRHH}
                                  style={{ borderBottom: '1px solid #f0f0f0' }}
                                  onClick={() => handleAprobarRuta(ruta)}
                                >
                                  ✅ Aprobar
                                </button>
                                <button
                                  className={`${styles.dropdownItemRRHH} ${styles.reject}`}
                                  onClick={() => handleRechazarRuta(ruta)}
                                >
                                  ❌Rechazar
                                </button>
                              </div>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>)}
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
        {loading && <div>Cargando...</div>}
      </div>
    </>
  );
};

export default RRHHExpedientes;