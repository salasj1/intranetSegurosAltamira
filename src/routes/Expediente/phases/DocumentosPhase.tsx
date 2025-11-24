import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert, Collapse } from "react-bootstrap";
import { IoDocumentText } from "react-icons/io5";
import { Mosaic } from 'react-loading-indicators';
import ErrorPhase from '../components/ErrorPhase';


export interface TiposDocumento {
  id: number;
  nombre: string;
  estatus: string;
  fechaVencimiento?: boolean | number;
  label?: string;
}


type DocumentosPhaseProps = {
  selectedDocument: string | null;
  setSelectedDocument: (v: string | null) => void;

  handlePreviousPhase: () => void;
  cod_emp: string | '';
  datosPersonales: any;
  showToast: (msg: string, type?: "success" | "error") => void;
  apiUrl: string;
};

const DocumentosPhase: React.FC<DocumentosPhaseProps> = ({
  selectedDocument,
  setSelectedDocument,
  cod_emp,
  datosPersonales,
  showToast,
  apiUrl,
}) => {
  // Estados y refs locales
  const [tiposDocumentos, setTiposDocumentos] = useState<TiposDocumento[]>([]);
  const [tiposConVencimiento, setTiposConVencimiento] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileInputs, setFileInputs] = useState<number[]>([0]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [driveFile, setDriveFile] = useState<any>(null);
  const [checkingDrive, setCheckingDrive] = useState(false);
  const [fechaVencimiento, setFechaVencimiento] = useState<string>("");
  const [showActualizarArchivo, setShowActualizarArchivo] = useState<{ [key: number]: boolean }>({});
  const [validatedFiles, setValidatedFiles] = useState(false);
  const [, setUploading] = useState(false);
  const [driveCache, setDriveCache] = useState<Record<string, { name: string, webContentLink: string } | null>>({});
  const [errorLoading, setErrorLoading] = useState(false); 
  useEffect(() => {
    const fetchTiposDocumentos = async () => {
      try {
        const res = await axios.get(`${apiUrl}/google-drive/tiposDocumentos/Empleado/${cod_emp}`);
        setTiposDocumentos(res.data || []);
        setTiposConVencimiento((res.data || []).filter((t: any) => t.fechaVencimiento === true || t.fechaVencimiento === 1).map((t: any) => t.nombre));
        
      } catch (error) {
        console.error('Error fetching tipos de documentos:', error);
        setErrorLoading(true);
      }
    };
    fetchTiposDocumentos();
    }, [cod_emp]);

  if (errorLoading) {
    return <ErrorPhase />;
  }


  // Buscar documento en Drive
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

  // Subir archivos
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const selectedFiles = [...files];
    if (event.target.files && event.target.files.length > 0) {
      selectedFiles[index] = event.target.files[0];
      setFiles(selectedFiles);
    }
  };

  const handleUploadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!files.length || !cod_emp) {
      alert('Por favor, selecciona los archivos.');
      return;
    }
    if (selectedDocument && tiposConVencimiento.includes(selectedDocument) && (!fechaVencimiento || fechaVencimiento.trim() === "")) {
      showToast("Debe seleccionar la fecha de vencimiento para este documento.", "error");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('archivos', file);
    });
    formData.append('cod_emp', cod_emp ?? "");
    if (datosPersonales?.cedula) {
      formData.append('cedula', datosPersonales.cedula);
    }
    if (selectedDocument) {
      formData.append('tipo_documento', selectedDocument);
    }
    if (selectedDocument && tiposConVencimiento.includes(selectedDocument) && fechaVencimiento) {
      formData.append('fecha_vencimiento', fechaVencimiento);
    }
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
        fileInputRefs.current.forEach(input => {
          if (input) input.value = '';
        });
        // Refrescar el archivo subido y mostrarlo en la alerta
        if (datosPersonales?.cedula && selectedDocument) {
          setCheckingDrive(true);
          try {
            const cedulaLimpia = datosPersonales.cedula.replace(/\D/g, '');
            const res = await fetch(`${apiUrl}/google-drive/buscar-documento?cedula=${cedulaLimpia}&tipo_documento=${selectedDocument}`);
            const data = await res.json();
            if (data && data.found) {
              setDriveFile({
                name: data.file.name,
                webContentLink: data.file.webContentLink,
                id: data.file.id
              });
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
        showToast('Error al subir los archivos: ' + (result.error || ''), 'error');
      }
    } catch (error) {
      showToast('Error al subir los archivos.', 'error');
    }
    setValidatedFiles(true);
    setUploading(false);
  };

  // Actualizar archivo
  const handleActualizarArchivo = async (index: number) => {
    if (!files[index] || !datosPersonales?.cedula || !selectedDocument || !driveFile) {
      showToast('Faltan datos para actualizar el archivo.', 'error');
      return;
    }
    if (tiposConVencimiento.includes(selectedDocument) && (!fechaVencimiento || fechaVencimiento.trim() === "")) {
      showToast("Debe seleccionar la fecha de vencimiento para este documento.", "error");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('archivo', files[index]);
    formData.append('cedula', datosPersonales.cedula);
    formData.append('tipo_documento', selectedDocument);
    if (driveFile.id) {
      formData.append('fileIdViejo', driveFile.id);
    } else {
      showToast('No se encontró el archivo anterior en Google Drive.', 'error');
      setUploading(false);
      return;
    }
    if (tiposConVencimiento.includes(selectedDocument) && fechaVencimiento) {
      formData.append('fecha_vencimiento', fechaVencimiento);
    }
    formData.append('cod_emp', cod_emp);
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
            const res = await fetch(`${apiUrl}/google-drive/buscar-documento?cedula=${cedulaLimpia}&tipo_documento=${selectedDocument}`);
            const data = await res.json();
            if (data && data.found) {
              setDriveFile({
                name: data.file.name,
                webContentLink: data.file.webContentLink,
                id: data.file.id,
                updatedAt: Date.now()
              });
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
    }
    setUploading(false);
  };
  
  return (
    <Form className="container" noValidate validated={validatedFiles} onSubmit={handleUploadSubmit}  >
      <Card border="primary" className="mb-3" style={{ padding: '20px', boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)' }}>
        <h2 style={{display:'flex',alignItems:'center', color: 'rgb(3, 76, 185)'}}><IoDocumentText /> Documentos</h2>
        <hr/>
        <Form.Group controlId="formFile" className="mb-3" style={{  color: 'rgb(255, 255, 255)' , background:'rgb(3, 76, 185)',fontWeight: 'bold',boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: '10px'}} >
          <Form.Label><h4>Seleccionar Documento</h4></Form.Label>
          <Form.Select id="SeleccionDocumento" aria-label="Default select example" className="mb-3" onChange={e => {handleDocumentChange(e);}}>
            <option value="">Seleccione un documento</option>
            {tiposDocumentos.map((tipo) => (
              <option key={tipo.id} value={tipo.nombre}>
                {tipo.label || tipo.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        {selectedDocument && (
          <Form.Group controlId="formFileUpload" className="mb-3" >
            <br/>
            <Form.Label style={{  color: 'rgb(51, 51, 51)' , fontWeight: 'bold'}}>{tiposDocumentos.find(tipo => tipo.nombre === selectedDocument)?.label || selectedDocument}</Form.Label>
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
                    {/* Solo permitir actualizar si NO es Otros Documentos*/}
                    {selectedDocument !== "DocumentosOtros" && selectedDocument !== "Otros Documentos" && (
                      <>
                        <Button
                          variant="outline-primary"
                          style={{ marginBottom: '10px' }}
                          onClick={() =>
                            setShowActualizarArchivo((prev: { [key: number]: boolean }) => ({
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
            {selectedDocument === "OTROS ARCHIVOS" && 
              <Button variant="secondary" onClick={() => setFileInputs([...fileInputs, fileInputs.length])}>
                Agregar otro archivo
              </Button>
            }
          </Form.Group>
        )}
      </Card>
    </Form>
  );
};

export default DocumentosPhase;
