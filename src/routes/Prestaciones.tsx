import { useEffect, useState, useMemo } from 'react';
import { Alert, AlertHeading, Button, Form } from "react-bootstrap";
import axios from 'axios';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import styles from "../routes/ReciboDePago/styles/RecibodePagoDetallado.module.css";
import Card from 'react-bootstrap/Card';
import { CSSTransition } from 'react-transition-group';
import { useAuth } from '../auth/AuthProvider'; 
import NavbarEmpresa from '../components/NavbarEmpresa';
import generatePrestacionesPDF from '../components/FormatoPrestaciones';
import stylesLoading from "../css/loading.module.css";
import { Mosaic } from "react-loading-indicators";
import { toast, ToastContainer } from 'react-toastify';
const apiUrl = import.meta.env.VITE_API_URL;

function Prestaciones() {
  const [prestacionesData, setPrestacionesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { cod_emp, email} = useAuth();
  const [correoSecundario, setCorreoSecundario] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const cod_empSinEspacios = cod_emp?.replace(/\s+/g, '');
  const anio= new Date().getFullYear();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  useEffect(() => {
    const fetchPrestacionesData = async () => {
      if (!cod_emp) return;
      try {
        console.log("cod_emp antes " + cod_emp);
        const response = await axios.get(`${apiUrl}/prestaciones/${cod_emp}`);
        response.data[0].cod_emp = response.data[0].cod_emp.substring(3);
        setPrestacionesData(response.data);
        
        setIsLoading(false);
        setShowAlert(true);
        
      } catch (error) {
        if ((error as any).message === "Failed to fetch data" && (error as any).response.status === 500) {
          setError("Error de conexión. Inténtelo más tarde.");
        } else {
          setError("Error al cargar la información de los movimientos de las prestaciones");
        }
        setIsLoading(false);
      }
    };

    fetchPrestacionesData();
  }, [cod_emp]);

  useEffect(() => {
    setCorreoSecundario(email || ''); // Inicializar con el valor de email o una cadena vacía
  }, [email]);
  const pdfBlob = useMemo(() => {
    if (prestacionesData) {
      const pdf = generatePrestacionesPDF(prestacionesData);
      return pdf.output('blob');
    }
    return null;
  }, [prestacionesData]);
    useEffect(() => {
      setIsPdfLoading(true);
    }, [pdfBlob]);

    useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfUrl(null);
    }
  }, [pdfBlob]);
  const handleDownload = () => {
    if (prestacionesData) {
      const pdf = generatePrestacionesPDF(prestacionesData);
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prestaciones_${cod_empSinEspacios}_${anio}.pdf`;
      link.click();
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    }
  };

  const handleSendEmail = async () => {
    if (prestacionesData && pdfBlob) {
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `prestaciones_${cod_empSinEspacios}_${anio}.pdf`);
      formData.append('cod_emp', cod_emp ?? '');

      try {
        const response = await axios.post(`${apiUrl}/send-prestaciones}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          alert('Correo enviado exitosamente');
        } else {
          alert('Error enviando el correo');
          console.error('Error enviando el correo secundario:', response.data.message);
        }
      } catch (error) {
        console.error('Error enviando el correo:', error);
        alert('Error enviando el correo');
      }
    }
  };

  
  const handleSendSecondaryEmail = async () => {
    if (prestacionesData && pdfBlob && correoSecundario) {
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `prestaciones_${cod_empSinEspacios}_${anio}.pdf`);
      formData.append('cod_emp', cod_emp || '');
      formData.append('correo_secundario', correoSecundario);
  
      // Mostrar el toast de "esperando"
      const toastId = toast.loading('Enviando correo...');
  
      try {
        const response = await axios.post(`${apiUrl}/send-prestaciones-secundario`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.data.success) {
          // Actualizar el toast a "satisfactorio"
          toast.update(toastId, {
            render: 'Correo enviado exitosamente',
            type: 'success',
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          // Actualizar el toast a "error"
          toast.update(toastId, {
            render: 'Error enviando el correo',
            type: 'error',
            isLoading: false,
            autoClose: 5000,
          });
          console.error('Error enviando el correo secundario:', response.data.message);
        }
      } catch (error) {
        console.error('Error enviando el correo:', error);
        // Actualizar el toast a "error"
        toast.update(toastId, {
          render: 'Error enviando el correo',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
      }
    }
  };

  const zoomPluginInstance = zoomPlugin();

  return (
    <>
    <ToastContainer />
      <NavbarEmpresa />
      <div className={styles.canvas}>
        <h1 style={{ textAlign: "center" }} className={styles.h1Prestaciones}>Movimientos de Prestaciones Sociales</h1>
        <div className={styles.divEspacio} style={{width:"100%"}}>
          {isLoading ? (
            <div className={stylesLoading.loadingDocument} >
                <Mosaic  color={["#003391","#1A5FFA","#33CCCC","#1A3FFA"]} size="large" text="" textColor="#0d1bff" />
            </div>
          ) : prestacionesData && prestacionesData.length > 0 ? (
            <>
              <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                {error ? (
                  <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    <AlertHeading>Error <hr /></AlertHeading>
                    {error}
                  </Alert>
                ) : (
                  <>
                    <div className={styles['pdf-viewer-container']}>
                      {pdfBlob && (
                        <>
                          {isPdfLoading && (
                            <div className={stylesLoading.loadingDocument} >
                              <Mosaic  color={["#003391","#1A5FFA","#33CCCC","#1A3FFA"]} size="large" text="" textColor="#0d1bff" />
                            </div>
                          )}
                          <div className={styles.botonesZoom}>
                            <zoomPluginInstance.ZoomIn>
                              {({ onClick }) => (
                                <Button style={{ marginBottom: "2px", backgroundColor: "#013897" }} variant="secondary" onClick={onClick}>+</Button>
                              )}
                            </zoomPluginInstance.ZoomIn>
                            <zoomPluginInstance.ZoomOut>
                              {({ onClick }) => (
                                <Button style={{ backgroundColor: "#013897" }} variant="secondary" onClick={onClick}>-</Button>
                              )}
                            </zoomPluginInstance.ZoomOut>
                          </div>
                          {
                            pdfUrl && (
                              <Viewer
                                fileUrl={pdfUrl}
                                defaultScale={0.8}
                                onDocumentLoad={() => setIsPdfLoading(false)}
                            plugins={[zoomPluginInstance]}
                          />
                            )
                          }
                        </>
                      )}
                    </div>
                  </>
                )}
              </Worker>
              <Card bg="primary" border="primary" className={styles.Tarjeta}>
                <Card.Header style={{ color: 'white', textAlign: "center", fontWeight: 500 }}>Ver PDF</Card.Header>
                <Card.Body className={styles['card-body-buttons']}>
                  {isPdfLoading ? (
                    <Alert variant='warning' style={{ fontSize: "24.5px", paddingInline: "148px" }}>
                      Cargando detalle PDF...
                    </Alert>
                  ) : (
                    <>
                      <CSSTransition
                        in={showAlert}
                        timeout={300}
                        classNames={{
                          enter: styles['alert-enter'],
                          enterActive: styles['alert-enter-active'],
                          exit: styles['alert-exit'],
                          exitActive: styles['alert-exit-active'],
                        }}
                        unmountOnExit
                      >
                        <Alert variant='primary' style={{ fontSize: "24.5px" }}>
                          ¡Movimientos de Prestaciones generado exitosamente! Seleccione una opción para continuar.
                        </Alert>
                      </CSSTransition>
                      <div className={styles['button-group']}>
                        <Button variant='light' onClick={handleDownload} className={styles['pdf-botton-download']}>Descargar</Button>
                        <Button variant='warning' onClick={handleSendEmail} className={styles['pdf-botton-download2']} style={{ display: 'none' }}>Enviar al correo</Button>
                      </div>
                      <div className={styles['button-group']}>
                      <Form.Control
                        size="lg"
                        type="text"
                        placeholder="Escriba un correo"
                        value={correoSecundario} 
                        onChange={(e) => setCorreoSecundario(e.target.value)} 
                      />
                      
                        <Button variant='warning' onClick={handleSendSecondaryEmail} className={styles['pdf-botton-download3']}>Enviar al correo</Button>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </>
          ) : (
            <Card bg="danger" border="danger" className={styles.Tarjeta}>
              <Card.Header style={{ color: 'white', textAlign: "center", fontWeight: 500 }}>Error</Card.Header>
              <Card.Body>
                <Alert variant='danger' style={{ fontSize: "24.5px" }}>
                  {error ? error : "No hay Prestaciones registradas"}
                </Alert>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export default Prestaciones;