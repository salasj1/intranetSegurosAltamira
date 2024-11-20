import { useEffect, useState, useMemo } from 'react';
import { Alert, AlertHeading, Button, Form } from "react-bootstrap";
import axios from 'axios';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import styles from "../css/RecibodePagoDetallado.module.css";
import Card from 'react-bootstrap/Card';
import { CSSTransition } from 'react-transition-group';
import { useAuth } from '../auth/AuthProvider'; 
import NavbarEmpresa from '../components/NavbarEmpresa';
import generatePrestacionesPDF from '../components/FormatoPrestaciones';

const apiUrl = import.meta.env.VITE_API_URL;

function Prestaciones() {
  const [prestacionesData, setPrestacionesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { cod_emp} = useAuth();
  const [correoSecundario, setCorreoSecundario] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

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

  const pdfBlob = useMemo(() => {
    if (prestacionesData) {
      const pdf = generatePrestacionesPDF(prestacionesData);
      return pdf.output('blob');
    }
    return 0;
  }, [prestacionesData]);

  const handleDownload = () => {
    if (prestacionesData) {
      const pdf = generatePrestacionesPDF(prestacionesData);
      pdf.save(`prestaciones.pdf`);
    }
  };

  const handleSendEmail = async () => {
    if (prestacionesData && pdfBlob) {
      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'prestaciones.pdf');
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
      formData.append('pdf', pdfBlob, 'prestaciones.pdf');
      formData.append('cod_emp', cod_emp || '');
      formData.append('correo_secundario', correoSecundario);

      try {
        const response = await axios.post(`${apiUrl}/send-prestaciones-secundario}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          setShowAlert(true);
          alert('Correo enviado exitosamente');
        } else {
          alert('Error enviando el correo secundario');
          console.error('Error sending secondary email');
        }
      } catch (error) {
        console.error('Error sending secondary email:', error);
      }
    }
  };

  const zoomPluginInstance = zoomPlugin();

  return (
    <>
      <NavbarEmpresa />
      <div className={styles.canvas}>
        <h1 style={{ textAlign: "center" }} className={styles.h1Prestaciones}>Movimientos de Prestaciones Sociales</h1>
        <div className={styles.divEspacio} style={{width:"100%"}}>
          {isLoading ? (
            <h2>Cargando Detalle...</h2>
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
                    {isPdfLoading && <h2>Cargando detalle PDF...</h2>}
                    <div className={styles['pdf-viewer-container']}>
                      {pdfBlob && (
                        <>
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
                          <Viewer
                            fileUrl={URL.createObjectURL(pdfBlob)}
                            defaultScale={1}
                            onDocumentLoad={() => setIsPdfLoading(false)}
                            plugins={[zoomPluginInstance]}
                          />
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
                          ¡Recibo de Pago generado exitosamente! Seleccione una opción para continuar.
                        </Alert>
                      </CSSTransition>
                      <div className={styles['button-group']}>
                        <Button variant='light' onClick={handleDownload} className={styles['pdf-botton-download']}>Descargar</Button>
                        <Button variant='warning' onClick={handleSendEmail} className={styles['pdf-botton-download2']}>Enviar al correo</Button>
                      </div>
                      <div className={styles['button-group']}>
                        <Form.Control
                          size="lg"
                          type="text"
                          placeholder="Escriba un correo"
                          value={correoSecundario}
                          onChange={(e) => setCorreoSecundario(e.target.value)}
                        />
                        <Button variant='warning' onClick={handleSendSecondaryEmail} className={styles['pdf-botton-download3']}>Enviar a un correo secundario</Button>
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