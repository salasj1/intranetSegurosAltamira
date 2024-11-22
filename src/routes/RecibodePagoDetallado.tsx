import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import { Worker, Viewer } from '@react-pdf-viewer/core';

import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { Button, Card, Alert, Form } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import NavbarEmpresa from '../components/NavbarEmpresa';
import generatePDF from '../components/FormatoRecibodePago';
import styles from '../css/RecibodePagoDetallado.module.css';

function RecibodePagoDetallado() {
  const { reci_num } = useParams<{ reci_num: string }>();
  const reciNum = reci_num || '';
  const [reciboData, setReciboData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [reciboNotFound, setReciboNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { cod_emp, email} = useAuth();
  const [correoSecundario, setCorreoSecundario] = useState<string>('');
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    console.log('EMAIL ' + email);
    const fetchReciboData = async () => {
      if (!cod_emp) {
        console.error('cod_emp es null');
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/recibo/${reciNum}/${cod_emp}`);
        const codEmpFromResponse = response.data[0].cod_emp.trim();
        const codEmpFromAuth = cod_emp.trim();

        if (codEmpFromResponse !== codEmpFromAuth) {
          setIsAuthorized(false);
        } else {
          response.data[0].cod_emp = response.data[0].cod_emp.substring(3);
          setReciboData(response.data);
          setShowAlert(true);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching recibo data:', error);
        if (axios.isAxiosError(error) ) {
          if(error.response?.status === 500)
            setError('Error al obtener los datos. Intentelo más tarde');
          else {
            setError('Error de conexion. Intentelo más tarde');
          }
        }
        setReciboNotFound(true);
        setIsLoading(false);
      }
    };

    fetchReciboData();
  }, [reciNum, cod_emp, email]);

  useEffect(() => {
    setCorreoSecundario(email || ''); // Inicializar con el valor de email o una cadena vacía
  }, [email]);

  const pdfBlob = useMemo(() => {
    if (reciboData) {
      const pdf = generatePDF(reciboData);
      return pdf.output('blob');
    }
    return null;
  }, [reciboData]);

  const handleDownload = () => {
    if (reciboData) {
      const pdf = generatePDF(reciboData);
      pdf.save(`Recibo_de_Pago_${reciNum}.pdf`);
    }
  };

  const handleSendEmail = async () => {
    if (reciboData && pdfBlob) {
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `Recibo_de_Pago_${reciNum}.pdf`);
      formData.append('reci_num', reciNum);
      formData.append('cod_emp', cod_emp ?? '');

      try {
        const response = await axios.post(`${apiUrl}/send-recibo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          alert('Correo enviado exitosamente');
        } else {
          alert('Error enviando el correo');
        }
      } catch (error) {
        console.error('Error enviando el correo:', error);
        alert('Error enviando el correo');
      }
    }
  };

  const handleSendSecondaryEmail = async () => {
    if (reciboData && pdfBlob && correoSecundario) {
      const formData = new FormData();
      formData.append('pdf', pdfBlob);
      formData.append('reci_num', reciNum);
      formData.append('cod_emp', cod_emp || '');
      formData.append('correo_secundario', correoSecundario);

      try {
        const response = await axios.post(`${apiUrl}/send-recibo-secundario`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          alert('Correo enviado exitosamente');
        } else {
          alert('Error enviando el correo');
          console.error('Error sending secondary email:', response.data.message);
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
       
      
        <h1 className={styles.h1Recibo}>Recibo de Pago Nº {reciNum} </h1>
        <div style={{ width: "100%" }}>
          {isLoading ? (
            <h2>Cargando detalle PDF...</h2>
          ) : (
            <>
              {reciboNotFound ? (
                 <Card bg="primary" border="primary" className={styles.Tarjeta}>
                        <Card.Header style={{ color: 'white', textAlign: "center", fontWeight: 500 }}>Error</Card.Header>
                        <Card.Body className={styles['card-body-buttons']}>
                        <Alert variant='danger' style={{ fontSize: "29.5px", paddingInline: "75px" }}>     
                        </Alert>
                        </Card.Body>
                        <Card.Header/>
                  </Card> 
              ) : (
                <>
                  {reciboData && isAuthorized ? (
                    <>
                      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                        {isPdfLoading && <h2>Cargando detalle PDF...</h2>}
                        <div className={styles['pdf-viewer-container']}>
                          {pdfBlob && (
                            <>
                            <div className={styles.botonesZoom}>
                              <zoomPluginInstance.ZoomIn>
                                {({ onClick }) => (
                                  <Button style={{ marginBottom: "2px",backgroundColor:"#013897" }} variant="secondary" onClick={onClick}>+</Button>
                                )}
                              </zoomPluginInstance.ZoomIn>
                              <zoomPluginInstance.ZoomOut>
                                {({ onClick }) => (
                                  <Button style={{backgroundColor:"#013897" }} variant="secondary" onClick={onClick}>-</Button>
                                )}
                              </zoomPluginInstance.ZoomOut>
                            </div>
                            <Viewer
                              fileUrl={URL.createObjectURL(pdfBlob)}
                              defaultScale={1}
                              onDocumentLoad={() => setIsPdfLoading(false)}
                              plugins={[ zoomPluginInstance]}
                            />
                            </>
                          )}
                        </div>
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
                              timeout={800}
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
                                <Button variant='warning' onClick={handleSendEmail} className={styles['pdf-botton-download2']} style={{ display: 'none' }}>Enviar al correo</Button>
                            </div>
                            <div className={styles['button-group']}>
                            <Form.Control
                              size="lg"
                              type="text"
                              placeholder="Escriba un correo"
                              value={correoSecundario} // Usar solo correoSecundario
                              onChange={(e) => setCorreoSecundario(e.target.value)} // Manejar el cambio de valor
                            />
                            <Button variant='warning' onClick={handleSendSecondaryEmail} className={styles['pdf-botton-download3']}>Enviar al correo</Button>
                          </div>
                          </>
                          )}
                        </Card.Body>
                      </Card>
                    </>
                  ) : (
                    <Card bg="primary" border="primary" className={styles.Tarjeta}>
                      <Card.Header style={{ color: 'white', textAlign: "center", fontWeight: 500 }}>Ver PDF</Card.Header>
                      <Card.Body className={styles['card-body-buttons']}>
                        <Alert variant='danger' style={{ fontSize: "29.5px", paddingInline: "75px" }}>
                          Recibo de pago no autorizado.
                        </Alert>
                      </Card.Body>
                    </Card>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default RecibodePagoDetallado;