import { useEffect, useState, useMemo } from 'react';
import { Alert, AlertHeading, Button, Form, Nav } from "react-bootstrap";
import axios from 'axios';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import styles from "../css/constanciaDeTrabajo.module.css";
import Card from 'react-bootstrap/Card';
import { CSSTransition } from 'react-transition-group';
import { useAuth } from '../auth/AuthProvider'; 
import NavbarEmpresa from '../components/NavbarEmpresa';
import generateConstanciaPDF from '../components/FormatoConstancia';
import Select from 'react-select';

const apiUrl = import.meta.env.VITE_API_URL;

function ConstaciaDeTrabajo() {
  const [constanciaData, setconstanciaData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { cod_emp, email} = useAuth();
  const [correoSecundario, setCorreoSecundario] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [mostrarsueldo, setMostrarSueldo] = useState<string>('SI');
  const cod_empSinEspacios = cod_emp?.replace(/\s+/g, '');
  const [destinatario, setDestinatario] = useState<string>('');
  const [cardDestinatario, setCardDestinatario] = useState<boolean>(false);
  const [navegador, setNavegador] = useState<number>(1);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const anio= new Date().getFullYear();
  

  useEffect(() => {
    const fetchconstanciaData = async () => {
      if (!cod_emp) return;
      try {
        const response = await axios.get(`${apiUrl}/constancia/${cod_emp}?mostrarsueldo=${mostrarsueldo}`);
        setconstanciaData(response.data);
        console.log(response.data);
        setIsLoading(false);
        setShowAlert(true);
        
      } catch (error) {
        if ((error as any).message === "Failed to fetch data" && (error as any).response.status === 500) {
          setError("Error de conexión. Inténtelo más tarde.");
        } 
        setIsLoading(false);
      }
    };

    fetchconstanciaData();
  }, [cod_emp, mostrarsueldo]);

  useEffect(() => {
    setCorreoSecundario(email || ''); // Inicializar con el valor de email o una cadena vacía
  }, [email]);

  useEffect(() => {
    generatePdfBlob();
  }, [constanciaData, mostrarsueldo]);

  const generatePdfBlob = () => {
    if (constanciaData) {
      console.log('constanciaData:', constanciaData);
      const pdf = generateConstanciaPDF(constanciaData, destinatario);
      const pdfBlob = pdf.output('blob');
      setPdfBlob(pdfBlob);
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Constancia_de_Trabajo_${cod_empSinEspacios}_${anio}.pdf`;
      link.click();
    }
  };

  const handleSendEmail = async () => {
    if (constanciaData && pdfBlob) {
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
    if (constanciaData && pdfBlob && correoSecundario) {
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `prestaciones_${cod_empSinEspacios}_${anio}.pdf`);
      formData.append('cod_emp', cod_emp || '');
      formData.append('correo_secundario', correoSecundario);

      try {
        const response = await axios.post(`${apiUrl}/send-prestaciones-secundario`, formData, {
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
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 400 || error.response?.status === 404) {
            console.error(error)
          }
        }
      }
    }
  };

  const handleEnviar = () => {
    generatePdfBlob();
    setCardDestinatario(true);
  };

  const zoomPluginInstance = zoomPlugin();

  return (
    <>
      <NavbarEmpresa />
      <div className={styles.canvas}>
        <h1 className={styles.h1Prestaciones}>Constancia de Trabajo</h1>
        {!cardDestinatario && <Card bg='light'  border="primary" className={styles.cardDestinatario}>
          <Card.Header style={{ background: "#013897", color: 'white', textAlign: "center", fontWeight: 500, fontSize:"22px", borderRadius: "auro" }}>Destino</Card.Header>
          <Card.Body >
            <Card.Text style={{color: "rgb(82, 82, 82)"}} >
            <p style={{marginBottom:"-4px"}}>Escriba el nombre de la persona a la que va dirigida la constancia de trabajo.</p>
              <br />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Form.Control
                  type="text"
                  placeholder="Destinatario"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                />
                <Button
                  style={{ marginLeft: "10px", borderColor: "#013897",backgroundColor: "#013897", boxShadow: "0 3px 6px 0 rgba(0, 0, 0, .14)" }}
                  variant="primary"
                  onClick={handleEnviar}
                >
                  Enviar
                </Button>
              </div>
            </Card.Text>
          </Card.Body>
        </Card>
        }
        
        {cardDestinatario && 
        <div className={styles.divEspacio} style={{width:"100%"}}>
          {isLoading ? (
            <h2>Cargando Detalle...</h2>
          ) : constanciaData && constanciaData.length > 0 ? (
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
                          ¡Constancia de Trabajo generado exitosamente! Seleccione una opción para continuar.
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
              <Card bg="dark" border="darker" className={styles.TarjetaMostrarSueldo}  >
                <Card.Header style={{ color: 'white', textAlign: "center", fontWeight: 300, fontSize: "25px" }}>Configurar
                <Nav variant="underline" defaultActiveKey="#first">
                  <Nav.Item>
                  <Nav.Link eventKey="#first" style={{ color: "rgba(255, 255, 255, 0.7)" }} onClick={() => setNavegador(1)}>Mostrar sueldo</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                  <Nav.Link eventKey="#link" style={{ color: "rgba(255, 255, 255, 0.7)" }} onClick={() => setNavegador(2)}>Destino</Nav.Link>
                  </Nav.Item>
                </Nav>
                </Card.Header>
                <Card.Body >
                  {navegador === 1 && (
                  <Form.Group>
                    <Select
                    name="mostrarsueldo"
                    value={{ value: mostrarsueldo, label: mostrarsueldo }}
                    onChange={(selectedOption) => {
                      setMostrarSueldo(selectedOption?.value || ''); 
                    }}
                    isClearable
                    placeholder="Seleccionar"
                    defaultValue={{ value:'SI', label:'Si' }}
                    options={[
                      { value: 'SI', label: 'Si' },
                      { value: 'NO', label: 'No' }
                    ]}
                   />
                  </Form.Group>
                  )}
                  {navegador === 2 && (<>
                    <p style={{marginBottom:"-4px", color: "rgba(255, 255, 255, 0.7)"}}>Escriba el nombre de la persona a la que va dirigida la constancia de trabajo.</p>
                    <br />
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Form.Control
                        type="text"
                        placeholder="Destinatario"
                        value={destinatario}
                        onChange={(e) =>setDestinatario(e.target.value) }
                      />
                      <Button
                        style={{ marginLeft: "10px", borderColor: "#013897",backgroundColor: "#013897", boxShadow: "0 3px 6px 0 rgba(0, 0, 0, .14)" }}
                        variant="primary"
                        onClick={handleEnviar}
                      >
                        Cambiar
                      </Button>
                    </div>

                    </>)
                  }
                </Card.Body>
              </Card>
            </>
          ) : (
            <Card bg="danger" border="danger" className={styles.Tarjeta}>
              <Card.Header style={{ color: 'white', textAlign: "center", fontWeight: 500 }}>Error</Card.Header>
              <Card.Body>
                <Alert variant='danger' style={{ fontSize: "24.5px" }}>
                  {error ? error : "No hay Constancias de trabajo registradas"}
                </Alert>
              </Card.Body>
            </Card>
          )}
        </div>
        }
      </div>
      
    </>
  );
}

export default ConstaciaDeTrabajo;