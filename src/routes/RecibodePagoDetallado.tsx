import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import { Worker, Viewer, ScrollMode } from '@react-pdf-viewer/core';
import { scrollModePlugin } from '@react-pdf-viewer/scroll-mode';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { Button, Card, Alert, Form } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import NavbarEmpresa from '../components/NavbarEmpresa';
import generatePDF from '../components/FormatoRecibodePago';

function RecibodePagoDetallado() {
  const { reci_num } = useParams<{ reci_num: string }>();
  const reciNum = reci_num || '';
  const [reciboData, setReciboData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [reciboNotFound, setReciboNotFound] = useState<boolean>(false);
  const { cod_emp } = useAuth();
  const [correoSecundario, setCorreoSecundario] = useState<string>('');

  useEffect(() => {
    const fetchReciboData = async () => {
      if (!cod_emp) {
        console.error('cod_emp es null');
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/recibo/${reciNum}`);
        
        const codEmpFromResponse = response.data[0].cod_emp.trim();
        const codEmpFromAuth = cod_emp.trim();

        if (codEmpFromResponse !== codEmpFromAuth) {
          setIsAuthorized(false);
        } else {
          setReciboData(response.data);
          setShowAlert(true);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching recibo data:', error);
        setReciboNotFound(true);
        setIsLoading(false);
      }
    };

    fetchReciboData();
  }, [reciNum, cod_emp]);

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
        const response = await axios.post('/api/send-recibo', formData, {
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
        const response = await axios.post('/api/send-recibo-secundario', formData, {
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

  const scrollModePluginInstance = scrollModePlugin();
  const zoomPluginInstance = zoomPlugin();

  useEffect(() => {
    scrollModePluginInstance.switchScrollMode(ScrollMode.Vertical);
  }, []);

  return (
    <>
      <NavbarEmpresa />
      <div className="canvas">
        <h1 style={{ textAlign: "center" }}>Recibo de Pago Nº {reciNum} </h1>
        <div style={{ width: "100%" }}>
          {isLoading ? (
            <h2>Cargando detalle PDF...</h2>
          ) : (
            <>
              {reciboNotFound ? (
                <Alert variant='danger' style={{ fontSize: "29.5px", paddingInline: "75px" }}>
                  Recibo no encontrado.
                </Alert>
              ) : (
                <>
                  {reciboData && isAuthorized ? (
                    <>
                      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                        {isPdfLoading && <h2>Cargando detalle PDF...</h2>}
                        <div className="pdf-viewer-container">
                          {pdfBlob && (
                            <Viewer
                              fileUrl={URL.createObjectURL(pdfBlob)}
                              defaultScale={1}
                              onDocumentLoad={() => setIsPdfLoading(false)}
                              plugins={[scrollModePluginInstance, zoomPluginInstance]}
                            />
                          )}
                        </div>
                      </Worker>
                      {!isPdfLoading ? (
                        <div className='botonesZoom'>
                          <zoomPluginInstance.ZoomIn>
                            {({ onClick }) => (
                              <Button style={{ marginBottom: "2px" }} variant="secondary" onClick={onClick}>+</Button>
                            )}
                          </zoomPluginInstance.ZoomIn>
                          <zoomPluginInstance.ZoomOut>
                            {({ onClick }) => (
                              <Button variant="secondary" onClick={onClick}>-</Button>
                            )}
                          </zoomPluginInstance.ZoomOut>
                        </div>
                      ) : null}
                      <Card bg="primary" border="primary" className='Tarjeta'>
                        <Card.Header style={{ color: 'white', textAlign: "center", fontWeight: 500 }}>Ver PDF</Card.Header>
                        <Card.Body className="card-body-buttons">
                          {isPdfLoading ? (
                            <Alert variant='warning' style={{ fontSize: "24.5px", paddingInline: "148px" }}>
                              Cargando detalle PDF...
                            </Alert>
                          ) : (
                            <>
                              <CSSTransition
                                in={showAlert}
                                timeout={800}
                                classNames="alert"
                                unmountOnExit
                              >
                                <Alert variant='primary' style={{ fontSize: "24.5px" }}>
                                  ¡Recibo de Pago generado exitosamente! Seleccione una opción para continuar.
                                </Alert>
                              </CSSTransition>
                              <div className="button-group">
                                <Button variant='light' onClick={handleDownload} id='pdf-botton-download'>Descargar</Button>
                                <Button variant='warning' onClick={handleSendEmail} id='pdf-botton-download2'>Enviar al correo</Button>
                              </div>
                              <div className="button-group">
                                <Form.Control
                                  size="lg"
                                  type="text"
                                  placeholder="Escriba un correo"
                                  value={correoSecundario}
                                  onChange={(e) => setCorreoSecundario(e.target.value)}
                                />
                                <Button variant='warning' onClick={handleSendSecondaryEmail} id='pdf-botton-download3'>Enviar a un correo secundario</Button>
                              </div>
                            </>
                          )}
                        </Card.Body>
                      </Card>
                    </>
                  ) : (
                    <Card bg="primary" border="primary" className='Tarjeta'>
                      <Card.Header style={{ color: 'white', textAlign: "center", fontWeight: 500 }}>Ver PDF</Card.Header>
                      <Card.Body className="card-body-buttons">
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