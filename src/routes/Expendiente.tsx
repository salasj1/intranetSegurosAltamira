import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Collapse, Form, InputGroup, Row/*, Tooltip, TooltipProps*/ } from "react-bootstrap";
/*import { FaRegTrashAlt } from "react-icons/fa";
import { FaRoute } from "react-icons/fa6";*/
import { IoDocumentText } from "react-icons/io5";
import { LuPencilLine } from "react-icons/lu";
import { MdInfoOutline } from "react-icons/md";
import { Mosaic } from 'react-loading-indicators';
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useAuth } from '../auth/AuthProvider';
import ModalConfirmarCambioDatos from "../components/ModalConfirmarCambioDatos";
import ModalConfirmarGuardarRutas from "../components/ModalConfirmarGuardarRutas.tsx"; // Verify this path exists
import NavbarEmpresa from "../components/NavbarEmpresa";
import style from '../css/ExpedienteEmpleado.module.css';
import stylesLoading from "../css/loading.module.css";
/*import { identity } from 'lodash';*/

export interface TiposDocumento {
  id: number;
  nombre: string;
  estatus: string;
  fechaVencimiento?: boolean | number;
}

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
}

const apiUrl = import.meta.env.VITE_API_URL;

const phaseRoutes = [
  "/expediente/datos",
  // "/expediente/rutas", // Ignorado temporalmente
  "/expediente/documentos"
];

const Expendiente = () => {
  const [validatedFiles, setValidatedFiles] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [tiposDocumentos, setTiposDocumentos] = useState<TiposDocumento[]>([]);
  const [tiposConVencimiento, setTiposConVencimiento] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileInputs, setFileInputs] = useState<number[]>([0]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [phase, setPhase] = useState(1); // Estado para controlar la fase actual
  const [datosPersonales, setDatosPersonales] = useState<DatosPersonales | null>(null);
  const [prefRIF, setPrefRIF] = useState<string>('J');
  const [rutaACasa, setRutaACasa] = useState<string[]>(['']);
  const [rutaAOficina, setRutaAOficina] = useState<string[]>(['']);
  const { cod_emp } = useAuth();
  const [loading, setLoading] = useState(true);
  const [driveFile, setDriveFile] = useState<{ name: string, webContentLink: string, id?: string, updatedAt?: number } | null>(null);
  const [checkingDrive, setCheckingDrive] = useState(false);
  const [driveCache, setDriveCache] = useState<Record<string, { name: string, webContentLink: string } | null>>({});
  const [bloquearCambioDatos, setBloquearCambioDatos] = useState(false);
  const [telefonoOriginal, setTelefonoOriginal] = useState<string>('');
  const [showModalConfirmar, setShowModalConfirmar] = useState(false);
  const [showModalGuardarRutas, setShowModalGuardarRutas] = useState(false);
  const [telefonoAdicional, setTelefonoAdicional] = useState<string>(''); // Nuevo estado para teléfono adicional
  const [telefonoAdicionalOriginal, setTelefonoAdicionalOriginal] = useState<string>(''); // Guardar original
  const [fechaVencimiento, setFechaVencimiento] = useState<string>(""); // Nueva variable para fecha de vencimiento
  const [showActualizarArchivo, setShowActualizarArchivo] = useState<{ [key: number]: boolean }>({});
  const [uploading, setUploading] = useState(false); // Estado para loading de subida/actualización de archivos
  const navigate = useNavigate();
  const location = useLocation();

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

  const palabrasClave: Record<string, string> = {
    CertificadoAdministracionRiesgo: "Certificado de Administración de Riesgos",
    ImpuestoSobreRenta: "Impuesto Sobre la Renta (ISLR)",
    Rif: "RIF",
    Cedula: "Cédula",
    DocumentosOtros: "Otros Documentos",
    ConstanciaResidencia: "Constancia de Residencia"
};
  
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
            setDatosPersonales({
              ...response.data.expediente,
              telefonoCelular: telefonoPrincipal
            });
            setTelefonoAdicional(telefonoAdic);
            setPrefRIF(response.data.expediente.rif.charAt(0));
            setTelefonoOriginal(telefonoPrincipal);
            // Bloquear si estatusSolicitudCambio existe y es 0
            console.log('Estatus Solicitud Cambio:', response.data.expediente.estatusSolicitudCambio);
            setBloquearCambioDatos(
              typeof response.data.expediente.estatusSolicitudCambio !== "undefined" &&
              response.data.expediente.estatusSolicitudCambio === 1
            );
            return response;
          });

        await axios.get(`${apiUrl}/expediente/getDatostRutas/Ida/${cod_emp}`).
        then((response) =>
          {setRutaACasa(response.data.expediente.RutaaCasa); return response;}
        );

        await axios.get(`${apiUrl}/expediente/getDatosRutas/Regreso/${cod_emp}`).
        then((response) =>
          {setRutaAOficina(response.data.expediente.RutaaOficina); return response;}
        );  
      } catch (error) {
        console.error('Error fetching datos personales:', error);
      }
      finally{
        setLoading(false);
      }
    };

    const fetchTiposDocumentos = async () => {
      try {
        const res = await axios.get(`${apiUrl}/google-drive/tiposDocumentos`);
        setTiposDocumentos(res.data || []);
        setTiposConVencimiento((res.data || []).filter((t: any) => t.fechaVencimiento === true || t.fechaVencimiento === 1).map((t: any) => t.nombre));
      } catch (error) {
        console.error('Error fetching tipos de documentos:', error);
      }
    };

    fetchDatosPersonales();
    fetchTiposDocumentos();
  }, [cod_emp]);

  

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const selectedFiles = [...files];
    if (event.target.files && event.target.files.length > 0) {
      selectedFiles[index] = event.target.files[0];
      setFiles(selectedFiles);
    }
  };

  const handleDocumentChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDocument(event.target.value);
    setFiles([]);
    setFileInputs([0]);
    setValidatedFiles(false);
    setDriveFile(null);
  
    if (!event.target.value || !datosPersonales) return;
  
    // Quita espacios de la cédula
    const cedulaLimpia = datosPersonales.cedula.replace(/\D/g, '');
    const cacheKey = `${cedulaLimpia}_${event.target.value}`;
  
    // Si ya está en caché, úsalo
    if (driveCache[cacheKey] !== undefined) {
      setDriveFile(driveCache[cacheKey]);
      return;
    }
  
    setCheckingDrive(true);
    try {
      const res = await axios.get(`${apiUrl}/google-drive/buscar-documento`, {
        params: {
          cedula: cedulaLimpia,
          tipo_documento: event.target.value,
          correo: datosPersonales.email, // Asegúrate de enviar el correo si es necesario
          cod_emp: cod_emp // Asegúrate de enviar el código de empleado si es necesario
        }
      });
      if (res.data && res.data.found) {
        setDriveFile({
          name: res.data.file.name,
          webContentLink: res.data.file.webContentLink,
          id: res.data.file.id
        });
        setDriveCache(prev => ({
          ...prev,
          [cacheKey]: {
            name: res.data.file.name,
            webContentLink: res.data.file.webContentLink
          }
        }));
      } else {
        setDriveFile(null);
        setDriveCache(prev => ({
          ...prev,
          [cacheKey]: null
        }));
      }
    } catch (err) {
      setDriveFile(null);
      setDriveCache(prev => ({
        ...prev,
        [cacheKey]: null
      }));
    } finally {
      setCheckingDrive(false);
    }
  };

  const addFileInput = () => {
    setFileInputs([...fileInputs, fileInputs.length]);
  };

  const handleUploadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!files.length || !cod_emp) {
      alert('Por favor, selecciona los archivos.');
      return;
    }

    // Validar fecha de vencimiento para CEDULA y RIF (obligatorio)
    if (selectedDocument && tiposConVencimiento.includes(selectedDocument) && (!fechaVencimiento || fechaVencimiento.trim() === "")) {
      showToast("Debe seleccionar la fecha de vencimiento para este documento.", "error");
      return;
    }

    setUploading(true); // <-- Inicia animación de loading

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('archivos', file);
    });
    if (cod_emp) {
        formData.append('cod_emp', cod_emp);
    } else {
        console.error('cod_emp is null or undefined.');
    }
    if (datosPersonales?.cedula) {
      formData.append('cedula', datosPersonales.cedula);
    }
    if (selectedDocument) {
      formData.append('tipo_documento', selectedDocument);
    }

    // Solo para CEDULA y RIF
    if (selectedDocument && (tiposConVencimiento.includes(selectedDocument) && fechaVencimiento)) {
      formData.append('fecha_vencimiento', fechaVencimiento);
    }
    
    
    
    console.log('formData:', formData.get('fecha_actualizacion'));
    try {
      const response = await fetch(`${apiUrl}/google-drive/subir-varios-archivos`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        showToast('Archivos subidos con éxito.', 'success');
        setFiles([]);
        setFileInputs([0]);
        // No limpiar selectedDocument, así se mantiene la selección y se puede mostrar la alerta
        fileInputRefs.current.forEach(input => {
          if (input) input.value = '';
        });

        // Refrescar el archivo subido y mostrarlo en la alerta
        if (datosPersonales?.cedula && selectedDocument) {
          setCheckingDrive(true);
          try {
            const cedulaLimpia = datosPersonales.cedula.replace(/\D/g, '');
            const res = await axios.get(`${apiUrl}/google-drive/buscar-documento`, {
              params: {
                cedula: cedulaLimpia,
                tipo_documento: selectedDocument
              }
            });
            if (res.data && res.data.found) {
              setDriveFile({
                name: res.data.file.name,
                webContentLink: res.data.file.webContentLink,
                id: res.data.file.id
              });
              // Actualiza el cache también
              const cacheKey = `${cedulaLimpia}_${selectedDocument}`;
              setDriveCache(prev => ({
                ...prev,
                [cacheKey]: {
                  name: res.data.file.name,
                  webContentLink: res.data.file.webContentLink
                }
              }));
            } else {
              setDriveFile(null);
            }
          } catch (err) {
            setDriveFile(null);
          } finally {
            setCheckingDrive(false);
          }
        }
      } else {
        if(result.error)
        showToast('Error al subir los archivos: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Error al subir los archivos:', error);
      showToast('Error al subir los archivos.', 'error');
    }
    setValidatedFiles(true);
    setUploading(false); // <-- Finaliza animación de loading
  };


  // Sincronizar fase con la ruta
  useEffect(() => {
    if (location.pathname.startsWith("/expediente/")) {
      if (location.pathname === phaseRoutes[0]) setPhase(1);
      // else if (location.pathname === phaseRoutes[1]) setPhase(2); // Ignorado
      else if (location.pathname === phaseRoutes[1]) setPhase(2);
      else if (location.pathname === phaseRoutes[2]) setPhase(3);
    }
  // eslint-disable-next-line
  }, [location.pathname]);

  // Cambiar ruta al cambiar de fase
  const goToPhase = (newPhase: number) => {
    setPhase(newPhase);
    navigate(phaseRoutes[newPhase - 1], { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPhase = () => {
    if (phase < 2) goToPhase(phase + 1); // Solo hay 2 fases: datos y documentos
  };

  const handlePreviousPhase = () => {
    if (phase > 1) goToPhase(phase - 1);
  };

/*   const handleCaminoAOficinaChange = (index: number, value: string) => {
    const updatedInputs = [...rutaAOficina];
    updatedInputs[index] = value;
    setRutaAOficina(updatedInputs);
    if (datosPersonales) {
      setDatosPersonales({
        ...datosPersonales,
        RutaaOficina: updatedInputs
      });
    }
  };

  const addCaminoAOficinaInput = () => {
    setRutaAOficina([...rutaAOficina, '']);
  };

  const clearCaminoAOficinaInputs = () => {
    setRutaAOficina(['']);
    if (datosPersonales) {
      setDatosPersonales({
        ...datosPersonales,
        RutaaOficina: ['']
      });
    }
  };

  const removeCaminoAOficinaInput = (index: number) => {
    const updatedInputs = rutaAOficina.filter((_, i) => i !== index);
    setRutaAOficina(updatedInputs);
    if (datosPersonales) {
      setDatosPersonales({
        ...datosPersonales,
        RutaaOficina: updatedInputs
      });
    }
  };

  const handleCaminoACasaChange = (index: number, value: string) => {
    const updatedInputs = [...rutaACasa];
    updatedInputs[index] = value;
    setRutaACasa(updatedInputs);
    if (datosPersonales) {
      setDatosPersonales({
        ...datosPersonales,
        RutaaCasa: updatedInputs
      });
    }
  };

  const addCaminoACasaInput = () => {
    setRutaACasa([...rutaACasa, '']);
  };

  const clearCaminoACasaInputs = () => {
    setRutaACasa(['']);
    if (datosPersonales) {
      setDatosPersonales({
        ...datosPersonales,
        RutaaCasa: ['']
      });
    }
  };

  const removeCaminoACasaInput = (index: number) => {
    const updatedInputs = rutaACasa.filter((_, i) => i !== index);
    setRutaACasa(updatedInputs);
    if (datosPersonales) {
      setDatosPersonales({
        ...datosPersonales,
        RutaaCasa: updatedInputs
      });
    }
  }; */

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
    const rutasOficinaValidas = rutaAOficina.filter(r => r.trim() !== "");
    const rutasCasaValidas = rutaACasa.filter(r => r.trim() !== "");

    try {
      const res = await axios.post(`${apiUrl}/expediente/guardarRutas`, {
        cod_emp,
        RutaaOficina: rutasOficinaValidas,
        RutaaCasa: rutasCasaValidas
      });
      if (res.data && res.data.success) {
        showToast('Rutas guardadas correctamente.', 'success');
      } else {
        showToast('No se pudieron guardar las rutas.', 'error');
      }
    } catch (error) {
      showToast('Error al guardar las rutas.', 'error');
      console.error(error);
    }
  };

  const handleActualizarArchivo = async (index: number) => {
    console.log('handleActualizarArchivo called with index:', index);
    console.log('datosPersonales:', datosPersonales);
    console.log('selectedDocument:', selectedDocument);
    console.log('driveFile:', driveFile);
    if (!files[index] || !datosPersonales?.cedula || !selectedDocument || !driveFile) {
      showToast('Faltan datos para actualizar el archivo.', 'error');
      return;
    }

    // Validar fecha de vencimiento para CEDULA y RIF (obligatorio al actualizar)
    if (tiposConVencimiento.includes(selectedDocument) && (!fechaVencimiento || fechaVencimiento.trim() === "")) {
      showToast("Debe seleccionar la fecha de vencimiento para este documento.", "error");
      return;
    }

    setUploading(true); // <-- Inicia animación de loading

    const formData = new FormData();
    
    formData.append('archivo', files[index]);
    formData.append('cedula', datosPersonales.cedula);
    formData.append('tipo_documento', selectedDocument);
    if ((driveFile as any).id) {
      formData.append('fileIdViejo', (driveFile as any).id);
    } else {
      showToast('No se encontró el archivo anterior en Google Drive.', 'error');
      setUploading(false);
      return;
    }
    // Enviar fecha de vencimiento si es Cedula o Rif
    if (tiposConVencimiento.includes(selectedDocument) && fechaVencimiento) {
      formData.append('fecha_vencimiento', fechaVencimiento);
    }
    if(cod_emp) {
      formData.append('cod_emp', cod_emp);
    }
    try {
      const response = await fetch(`${apiUrl}/google-drive/actualizar-archivo`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        showToast('Archivo actualizado con éxito.', 'success');
        setShowActualizarArchivo((prev) => ({ ...prev, [index]: false }));
        setFiles([]);
        setFileInputs([0]);
        // Refrescar el archivo actualizado y mostrarlo en la alerta
        if (datosPersonales?.cedula && selectedDocument) {
          setCheckingDrive(true);
          try {
            const cedulaLimpia = datosPersonales.cedula.replace(/\D/g, '');
            const res = await axios.get(`${apiUrl}/google-drive/buscar-documento`, {
              params: {
                cedula: cedulaLimpia,
                tipo_documento: selectedDocument
              }
            });
            if (res.data && res.data.found) {
              setDriveFile({
                name: res.data.file.name,
                webContentLink: res.data.file.webContentLink,
                id: res.data.file.id,
                updatedAt: Date.now()
              });
              // Actualiza el cache también
              const cacheKey = `${cedulaLimpia}_${selectedDocument}`;
              setDriveCache(prev => ({
                ...prev,
                [cacheKey]: {
                  name: res.data.file.name,
                  webContentLink: res.data.file.webContentLink
                }
              }));
            } else {
              setDriveFile(null);
            }
          } catch (err) {
            setDriveFile(null);
          } finally {
            setCheckingDrive(false);
          }
        }
      } else {
        showToast('Error al actualizar el archivo: ' + (result.error || ''), 'error');
      }
    } catch (error) {
      showToast('Error al actualizar el archivo.', 'error');
      console.error(error);
    }
    setUploading(false); // <-- Finaliza animación de loading
  };
  return (
    <>
      <NavbarEmpresa />
      <br />
      <br />
      <br />
      <br />
      <br />
      <h1 style={{marginBottom:'20px',marginLeft:'10rem', alignSelf:'center', display:'flex'}}>Expendiente</h1>
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
              {phase === 1 && datosPersonales && (
                <Form className="container">
                    <Card bg="primary" className="mb-3" style={{ padding: '20px', color: 'white', boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)' }}>
                      <h2 style={{display:'flex',alignItems:'end'}}><LuPencilLine />Datos Personales</h2>
                      <hr/>
                      {!bloquearCambioDatos ? (
                        <Alert variant="info" style={{ display: 'flex', alignItems: 'center' }}>
                          <MdInfoOutline style={{ width: "30px", height: "30px", marginRight: '10px' }} />
                          <span>Por favor, revise y complete sus datos personales. En caso de que algún dato sea incorrecto, por favor, edítelo y solicite el cambio de datos.</span>
                        </Alert>
                      ) : (
                        <Alert variant="warning" style={{ marginTop: '10px' }}>
                          Ya existe una solicitud de cambio pendiente. No puedes solicitar otro cambio hasta que sea procesado por Recursos Humanos.
                        </Alert>
                      )}
                      <Row className="mb-3">
                      <Col lg={3}> 
                          <Form.Label>Cédula de Identidad</Form.Label>
                          <Form.Group controlId="formCedula">
                            <InputGroup hasValidation>
                            <InputGroup.Text id="inputGroupPrepend">V</InputGroup.Text>
                            <Form.Control 
                              type="text" 
                              placeholder="Cédula de Identidad" 
                              pattern="\d{1,8}" 
                              maxLength={8} 
                              required 
                              disabled={bloquearCambioDatos}
                              value={datosPersonales?.cedula.replace(/\s/g, '') || ''}
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                              e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
                              }}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (datosPersonales) {
                                setDatosPersonales({
                                ...datosPersonales,
                                cedula: e.target.value.replace(/\s/g, '')
                                });
                              }
                              }}
                            />
                              <Form.Control.Feedback type="invalid">
                                Por favor, ingresa un número de cédula válido (hasta 8 dígitos).
                              </Form.Control.Feedback>
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col >
                          <Form.Group controlId="formNombre">
                          <Form.Label>Nombres</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nombres"
                            defaultValue={datosPersonales?.nombres || ''}
                            disabled={bloquearCambioDatos}
                            style={{ textTransform: 'uppercase' }}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (datosPersonales) {
                                setDatosPersonales({
                                  ...datosPersonales,
                                  nombres: e.target.value.toUpperCase()
                                });
                              }
                            }}
                          />
                        </Form.Group>
                        </Col>
                        <Col >
                          <Form.Group controlId="formApellido">
                            <Form.Label>Apellidos</Form.Label>
                            <Form.Control type="text" placeholder="Apellidos" defaultValue={datosPersonales?.apellidos || '' } 
                            disabled={bloquearCambioDatos}
                            style={{ textTransform: 'uppercase' }}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (datosPersonales) {
                                setDatosPersonales({
                                  ...datosPersonales,
                                  apellidos: e.target.value.toUpperCase()
                                });
                              }
                            }} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col lg={2}>
                          <Form.Label>RIF</Form.Label>
                          <Form.Group controlId="formRif">
                              <InputGroup hasValidation>
                              <InputGroup.Text style={{borderTopRightRadius:'0px', borderEndEndRadius :'0px' }}>{isNaN(parseInt(prefRIF)) ? prefRIF : 'V'}</InputGroup.Text>
                              <Form.Control 
                                type="text" 
                                placeholder="RIF" 
                                pattern="\d{1,9}" 
                                maxLength={9}
                                disabled={bloquearCambioDatos}
                                value={datosPersonales?.rif.slice(1).trim() || ''}
                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                }}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  if (datosPersonales) {
                                    setDatosPersonales({
                                      ...datosPersonales,
                                      rif: prefRIF + e.target.value.trim()
                                    });
                                  }
                                }}
                              />
                              </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col lg={3}>
                          <Form.Group controlId="formEstadoCivil">
                            <Form.Label>Estado Civil</Form.Label>
                            <Form.Control as="select" value={datosPersonales?.estadoCivil} 
                            disabled={bloquearCambioDatos}
                            
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                if (datosPersonales) {
                                  setDatosPersonales({
                                    ...datosPersonales,
                                    estadoCivil: e.target.value
                                  });
                                }
                              }} >
                              <option value={""} >Seleccione un estado civil</option>
                              <option value={"S"}>Soltero</option>
                              <option value={"C"}>Casado</option>
                              <option value={"D"}>Divorciado</option>
                              <option value={"V"}>Viudo</option>

                            </Form.Control>
                          </Form.Group>
                        </Col>
                        <Col lg={4}>
                          <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" placeholder="Email" defaultValue={datosPersonales?.email || ''} disabled={bloquearCambioDatos} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (datosPersonales) {
                                setDatosPersonales({
                                  ...datosPersonales,
                                  email: e.target.value
                                });
                              }
                            }} />
                          </Form.Group>
                        </Col>
                        <Col lg={3}>
                          <Form.Group controlId="formDireccion">
                            <Form.Label>Fecha de Nacimiento</Form.Label>
                            <Form.Control 
                              type="date" 
                              value={datosPersonales?.fechaNacimiento.split('T')[0] || ''} 
                              disabled={bloquearCambioDatos}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                if (datosPersonales) {
                                  setDatosPersonales({
                                    ...datosPersonales,
                                    fechaNacimiento: e.target.value
                                  });
                                }
                              }} 
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <br/>
                      <Row>
                        <Col lg={3}>
                            <Form.Group controlId="formTelefono">
                            <Form.Label>Teléfono Celular</Form.Label>
                            <Form.Control 
                              type="text" 
                              placeholder="Teléfono" 
                              value={datosPersonales?.telefonoCelular ? datosPersonales.telefonoCelular.replace(/\D/g, '') : ''} 
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                              e.target.value = e.target.value.replace(/\D/g, '');
                              }}
                              disabled={bloquearCambioDatos}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (datosPersonales) {
                              setDatosPersonales({
                              ...datosPersonales,
                              telefonoCelular: e.target.value
                              });
                              }
                              }} 
                            />
                            </Form.Group>
                            {/* Nuevo campo para teléfono adicional */}
                            <Form.Group controlId="formTelefonoAdicional" style={{ marginTop: '10px' }}>
                            <Form.Label>Teléfono Adicional (Opcional)</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Teléfono adicional"
                              value={telefonoAdicional}
                              disabled={bloquearCambioDatos}
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                e.target.value = e.target.value.replace(/\D/g, '');
                              }}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelefonoAdicional(e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group controlId="formDireccion">
                            <Form.Label>Dirección de habitación de Hospedaje de la Vivienda Principal</Form.Label>
                            <Form.Control type="text" disabled={bloquearCambioDatos} placeholder="Dirección" defaultValue={datosPersonales?.direccion || ''}
                            style={{ textTransform: 'uppercase' }}/* Con esto lo coloca en mayusculas */
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (datosPersonales) {
                                setDatosPersonales({
                                  ...datosPersonales,
                                  direccion: e.target.value.toUpperCase()
                                });
                              }
                            }}  />
                          </Form.Group>
                        </Col>
                      </Row>
                      <br/>
                      <div >
                        <Button
                          variant="primary" 
                          onClick={handleAbrirModalConfirmar}
                          hidden={bloquearCambioDatos}
                          style={{ display: 'flex', justifySelf: 'center' }}
                          className={style['btn-change-supervision']}
                        >
                          Solicitar Cambio de Datos
                        </Button>
                      </div>
                    </Card>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <Button variant="primary" onClick={handleNextPhase}>
                        Siguiente
                      </Button>
                    </div>
                  </Form>
                
              )}
              {/*
              {phase === 2 && datosPersonales && (
                    <Form className="container">
                      <Card bg="primary" className="mb-3" style={{ padding: '20px', color: 'white', boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)' }}>
                        <h2 style={{display:'flex',alignItems:'center'}}><FaRoute  style={{marginRight: "5px"}}/><span>  Rutograma</span> </h2>
                        <hr/>
                        <Alert style={{ boxShadow: "5px 5px 15px rgba(0, 0, 0, 0.1)" }}> Explique las rutas que habitualmente realiza de forma de detallada</Alert>
                        <Row>
                          <Form.Group controlId="formruta1" style={{ marginBottom: '20px' }}>
                            <Form.Label>Ruta habitual desde el lugar de hospedaje hasta la oficina</Form.Label>
                            <TransitionGroup>
                              {rutaAOficina.map((item, index) => (
                                <CSSTransition
                                  key={index}
                                  timeout={350}
                                  classNames={{
                                    enter: style['textarea-anim-enter'],
                                    enterActive: style['textarea-anim-enter-active'],
                                    exit: style['textarea-anim-exit'],
                                    exitActive: style['textarea-anim-exit-active'],
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <Form.Control 
                                      as="textarea" 
                                      className={style["animated-textarea"]}
                                      placeholder="Describe la ruta desde el lugar de hospedaje hasta la oficina" 
                                      value={item} 
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCaminoAOficinaChange(index, e.target.value)}
                                      style={{ marginRight: '10px', width: '100%' }}
                                      rows={3}
                                    />
                                    <CSSTransition
                                      in={rutaAOficina.length > 1}
                                      timeout={250}
                                      classNames={{
                                        enter: style['trash-anim-enter'],
                                        enterActive: style['trash-anim-enter-active'],
                                        exit: style['trash-anim-exit'],
                                        exitActive: style['trash-anim-exit-active'],
                                      }}
                                      unmountOnExit
                                    >
                                      <Button variant="danger" onClick={() => removeCaminoAOficinaInput(index)}>
                                        <FaRegTrashAlt />
                                      </Button>
                                    </CSSTransition>
                                  </div>
                                </CSSTransition>
                              ))}
                            </TransitionGroup>
                            <Button variant="secondary" onClick={addCaminoAOficinaInput}>
                              Agregar otra ruta
                            </Button>
                            <Button variant="danger" onClick={clearCaminoAOficinaInputs} style={{ marginLeft: '10px' }}>
                              Borrar todas las rutas
                            </Button>
                          </Form.Group>    
                          <Form.Group controlId="formruta2">
                          <Form.Label>Ruta habitual desde la oficina hasta el lugar de hospedaje</Form.Label>
                          <TransitionGroup>
                            {rutaACasa.map((item, index) => (
                              <CSSTransition
                                key={index}
                                timeout={350}
                                classNames={{
                                  enter: style['textarea-anim-enter'],
                                  enterActive: style['textarea-anim-enter-active'],
                                  exit: style['textarea-anim-exit'],
                                  exitActive: style['trash-anim-exit-active'],
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                  <Form.Control 
                                    as="textarea" 
                                    className={style["animated-textarea"]}
                                    placeholder="Describe la ruta desde la oficina hasta el lugar de hospedaje" 
                                    value={item} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCaminoACasaChange(index, e.target.value)}
                                    style={{ marginRight: '10px', width: '100%' }}
                                    rows={3}
                                  />
                                  <CSSTransition
                                    in={rutaACasa.length > 1}
                                    timeout={250}
                                    classNames={{
                                      enter: style['trash-anim-enter'],
                                      enterActive: style['trash-anim-enter-active'],
                                      exit: style['trash-anim-exit'],
                                      exitActive: style['trash-anim-exit-active'],
                                    }}
                                    unmountOnExit
                                  >
                                    <Button variant="danger" onClick={() => removeCaminoACasaInput(index)}>
                                      <FaRegTrashAlt />
                                    </Button>
                                  </CSSTransition>
                                </div>
                              </CSSTransition>
                            ))}
                          </TransitionGroup>
                          <Button variant="secondary" onClick={addCaminoACasaInput}>
                            Agregar otra ruta
                          </Button>
                          <Button variant="danger" onClick={clearCaminoACasaInputs} style={{ marginLeft: '10px' }}>
                            Borrar todas las rutas
                          </Button>
                        </Form.Group>
                          <div style={{ marginTop: '20px', justifyContent:'center', display: 'flex' }}>
                          <Button
                            variant="primary"
                            onClick={() => {
                              // Filtra rutas vacías
                              const rutasOficinaValidas = rutaAOficina.filter(r => r.trim() !== "");
                              const rutasCasaValidas = rutaACasa.filter(r => r.trim() !== "");

                              // Validación y mensajes
                              if (rutasOficinaValidas.length === 0) {
                                showToast("El campo 'Ruta destino' está vacío. Por favor, rellénalo.", "error");
                                return;
                              }
                              if (rutasCasaValidas.length === 0) {
                                showToast("El campo 'Ruta de regreso' está vacío. Por favor, rellénalo.", "error");
                                return;
                              }

                              // Si todo bien, actualiza los arrays y muestra el modal
                              setRutaAOficina(rutasOficinaValidas);
                              setRutaACasa(rutasCasaValidas);
                              setShowModalGuardarRutas(true);
                            }}
                            className={style['btn-change-supervision']}
                          >
                            Guardar Rutas
                          </Button>
                          </div>
                        </Row>
                        <br/>
                      </Card>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <Button variant="secondary" onClick={handlePreviousPhase}>
                      Anterior
                    </Button>
                    <Button variant="primary" onClick={handleNextPhase}>
                        Siguiente
                      </Button>
                  </div>
                    </Form>
                  )
              }
              */}
              {phase === 2 && (
                <Form className="container" noValidate validated={validatedFiles} onSubmit={handleUploadSubmit}>
                  <Card border="primary" className="mb-3" style={{ padding: '20px', boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)' }}>
                    <h2 style={{display:'flex',alignItems:'center', color: 'rgb(3, 76, 185)'}}><IoDocumentText /> Documentos</h2>
                    <hr/>
                    <Form.Group controlId="formFile" className="mb-3" style={{  color: 'rgb(255, 255, 255)' , background:'rgb(3, 76, 185)',fontWeight: 'bold',boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: '10px'}} >
                      <Form.Label><h4>Seleccionar Documento</h4></Form.Label>
                      <Form.Select id="SeleccionDocumento" aria-label="Default select example" className="mb-3" onChange={handleDocumentChange}>
                      <option value="">Seleccione un documento</option>
                      {tiposDocumentos.map((tipo) => (
                        <option key={tipo.id} value={tipo.nombre}>
                          {palabrasClave[tipo.nombre] || tipo.nombre}
                        </option>
                      ))}
                    </Form.Select>
                    </Form.Group>
                    {selectedDocument && (
                      <Form.Group controlId="formFileUpload" className="mb-3" >
                        <br/>
                        <Form.Label style={{  color: 'rgb(51, 51, 51)' , fontWeight: 'bold'}}>{palabrasClave[selectedDocument] || selectedDocument}</Form.Label>
                        <Row>
                          {tiposConVencimiento.includes(selectedDocument || '') && (!driveFile && !checkingDrive) && (
                            <Col lg={3}>
                              <Form.Label style={{ fontWeight: 'bold' }}>Fecha de Vencimiento</Form.Label>
                              <Form.Control
                                type="date"
                                required
                                value={fechaVencimiento}
                                onChange={e => setFechaVencimiento(e.target.value)}
                              />
                            </Col>
                          )}
                        </Row>
                        {fileInputs.map((index) => (
                        <div key={index}>
                          {checkingDrive ? (
                            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="small" text="" textColor="#0d1bff" />
                                <h3 style={{ color: "#003391", margin: 0 }}>Buscando en el sistema...</h3>
                            </div>
                          ) : driveFile ? (
                            <>
                              {driveFile && (
                                  <Alert
                                    key={(driveFile.id || '') + (driveFile.updatedAt || '')}
                                    variant="success"
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}
                                  >
                                    <IoDocumentText style={{ fontSize: '2.5rem', color: '#198754' }} />
                                    <div style={{paddingTop: '20px'}}>
                                      <span>
                                        <b>{driveFile.name}</b> ya está cargado en Google Drive.
                                      </span>
                                      <br />
                                      <a
                                        href={`https://drive.google.com/file/d/${driveFile.id}/view`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#0d6efd', textDecoration: 'underline', fontWeight: 500 }}
                                      >
                                        Ver archivo
                                      </a>
                                      <p>Recuerde que para verlo debe estar antes logueado en su cuenta empresarial en el navegador.</p>
                                    </div>
                                  </Alert>
                                )}
                              {/* Solo permitir actualizar si NO es Otros Documentos*/}
                              {selectedDocument !== "DocumentosOtros" && selectedDocument !== "Otros Documentos" && (
                              <>
                                <Button
                                  variant="outline-primary"
                                  style={{ marginBottom: '10px' }}
                                  onClick={() =>
                                    setShowActualizarArchivo((prev) => ({
                                      ...prev,
                                      [index]: !prev[index],
                                    }))
                                  }
                                  aria-controls={`collapse-actualizar-archivo-${index}`}
                                  aria-expanded={!!showActualizarArchivo[index]}
                                >
                                  {showActualizarArchivo[index] ? "Cancelar" : "Actualizar archivo"}
                                </Button>
                                <Collapse in={!!showActualizarArchivo[index]}>
                                  <div id={`collapse-actualizar-archivo-${index}`}>
                                    {tiposConVencimiento.includes(selectedDocument || '') && (
                                      <Col lg={3}>
                                        <Form.Label style={{ fontWeight: 'bold' }}>Fecha de Vencimiento</Form.Label>
                                        <Form.Control
                                          type="date"
                                          required
                                          value={fechaVencimiento}
                                          onChange={e => setFechaVencimiento(e.target.value)}
                                        />
                                      </Col>
                                    )}
                                    <Form.Label style={{ fontWeight: 'bold' }}>Selecciona el nuevo archivo</Form.Label>
                                    <Form.Control
                                      style={{ marginBottom: '10px' }}
                                      type="file"
                                      // required // Eliminado para que la validación sea solo manual
                                      ref={(el: HTMLInputElement | null) => fileInputRefs.current[index] = el}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, index)}
                                      accept=".pdf"
                                    />
                                    <Button
                                      variant="primary"
                                      style={{ marginBottom: '10px', backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}
                                      onClick={e => {
                                        e.preventDefault();
                                        handleActualizarArchivo(index);
                                      }}
                                    >
                                      Subir archivo actualizado
                                    </Button>
                                  </div>
                                </Collapse>
                              </>
                              )}
                            </>
                          ) : (
                            <>
                            <br />
                              <Form.Control style={{marginBottom: '10px'}}
                                type="file"
                                // required // Eliminado para que la validación sea solo manual
                                ref={(el: HTMLInputElement | null) => fileInputRefs.current[index] = el}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, index)}
                                accept=".pdf"
                              />
                              {!driveFile && (
                                <Form.Control.Feedback type="invalid">
                                  Por favor, selecciona un archivo.
                                </Form.Control.Feedback>
                              )}
                              <Button variant="primary" type="submit">
                                Subir Archivos
                              </Button>
                            </>
                          )}
                        </div>
                        
                      ))}
                        {selectedDocument=== "OTROS ARCHIVOS" && 
                          <Button variant="secondary" onClick={addFileInput}>
                            Agregar otro archivo
                          </Button>
                        }
                      </Form.Group>
                    )}
                  </Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <Button variant="secondary" onClick={handlePreviousPhase}>
                      Anterior
                    </Button>
                    
                  </div>
                </Form>
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

  <ModalConfirmarGuardarRutas
        show={showModalGuardarRutas}
        onHide={() => setShowModalGuardarRutas(false)}
        onConfirm={() => {
          setShowModalGuardarRutas(false);
          handleGuardarRutas();
        } } rutasOficina={rutaAOficina || []} rutasCasa={rutaACasa || []}  />
  </>
);
};

export default Expendiente;