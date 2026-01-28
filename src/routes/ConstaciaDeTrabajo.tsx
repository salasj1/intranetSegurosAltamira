import { useEffect, useState} from 'react';
import { Alert, AlertHeading, Button, Form, Nav } from "react-bootstrap";
import axios from 'axios';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import styles from "../css/constanciaDeTrabajo.module.css";
import stylesLoading from "../css/loading.module.css";
import Card from 'react-bootstrap/Card';
import { CSSTransition } from 'react-transition-group';
import { useAuth } from '../auth/AuthProvider'; 
import NavbarEmpresa from '../components/NavbarEmpresa';
import generateConstanciaPDF from '../components/FormatoConstancia';
import Select from 'react-select';
import { Mosaic } from "react-loading-indicators";
import { toast, ToastContainer } from 'react-toastify';
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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [Respuesta, setRespuesta] = useState<number>(0);
  const [persona, setPersona] = useState<string>(''); 
  const anio= new Date().getFullYear();
  

  useEffect(() => {
    const fetchconstanciaData = async () => {
      if (!cod_emp) return;
      try {
        const response = await axios.get(`${apiUrl}/constancia/${cod_emp}?mostrarsueldo=${mostrarsueldo}`);
        setconstanciaData(response.data);
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



  const generatePdfBlob = () => {
    if (constanciaData) {
      const pdf = generateConstanciaPDF(constanciaData, persona, destinatario);
      const pdfBlob = pdf.output('blob');
      setPdfBlob(pdfBlob);
    }
  };
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
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Constancia_de_Trabajo_${cod_empSinEspacios}_${anio}.pdf`;
      link.click();
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
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
      formData.append('pdf', pdfBlob, `constancia_de_trabajo_${cod_empSinEspacios}_${anio}.pdf`);
      formData.append('cod_emp', cod_emp || '');
      formData.append('correo', correoSecundario);
      formData.append('fecha', new Date().toLocaleDateString('es-ES'));
  
      // Mostrar el toast de "esperando"
      const toastId = toast.loading('Enviando correo...');
  
      try {
        const response = await axios.post(`${apiUrl}/send-constancia-trabajo`, formData, {
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

  const handleEnviar = () => {
    generatePdfBlob();
    setCardDestinatario(true);
  };

  const zoomPluginInstance = zoomPlugin();

  return (
    <>
      <ToastContainer style={{ zIndex: 9999 }}/>
      <NavbarEmpresa />
      <div className={styles.canvas}>
        <h1 className={styles.h1Prestaciones}>Constancia de Trabajo</h1>
        {!cardDestinatario && <Card bg='light'  border="primary" className={styles.cardDestinatario}>
          <Card.Header style={{ background: "#013897", color: 'white', textAlign: "center", fontWeight: 500, fontSize:"22px", borderRadius: "auro" }}>Destino</Card.Header>
          <Card.Body >
            <Card.Text style={{color: "rgb(82, 82, 82)"}} >
              {Respuesta===0 && <><p>¿La constancia va dirigida a alguien?</p> 
              <div style={{ display: "flex", justifyContent: "end", gap: "10px" }}>
                <Button variant="primary" style={{ width:"100%"}} onClick={() => setRespuesta(1)}>Si</Button>
                <Button variant="primary" style={{ width:"100%"}} onClick={() => {setRespuesta(3); handleEnviar();}}>No</Button>
              </div>
              </>}
              {Respuesta===1 &&
              <>
              <p style={{marginBottom:"-4px"}}>¿Es una persona natural o jurídico?</p>
              <br />
              <div style={{ display: "flex", justifyContent: "center", gap: "10px"  }}>
                <Button variant="primary" style={{ width:"100%"}} onClick={() => {setRespuesta(2);setPersona('natural'); }}>Natural</Button>
                <Button variant="primary" style={{ width:"100%"}} onClick={() => {setRespuesta(2);setPersona('juridica');}}>Jurídico</Button>
              </div>
              </>
              }
              {Respuesta===2 &&
              <>
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
                  onClick={()=>handleEnviar()}
                  >
                  Enviar
                </Button>
              </div>
              </>
              }

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
                    
                    <div className={styles['pdf-viewer-container']}>
                    {isPdfLoading && (
                      <div className={stylesLoading.loadingDocument} >
                        <Mosaic  color={["#003391","#1A5FFA","#33CCCC","#1A3FFA"]} size="large" text="" textColor="#0d1bff" />
                        </div>
                      )}
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
                          {pdfUrl && (
                            <Viewer
                              fileUrl={pdfUrl}
                              defaultScale={1}
                              onDocumentLoad={() => setIsPdfLoading(false)}
                              plugins={[zoomPluginInstance]}
                            />
                          )}                 
                        </>
                      )}
                    </div>
                  </>
                )}
              </Worker>
              <div className={styles.divCards}>
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
                  <>
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
                  <div style={{display: "flex", justifyContent:'end', alignItems:'end', marginTop: "10px"}}> 
                      <Button
                        style={{ borderColor: "#013897",backgroundColor: "#013897", boxShadow: "0 3px 6px 0 rgba(0, 0, 0, .14)" }}
                        variant="primary"
                        onClick={handleEnviar}
                      >
                        Cambiar
                      </Button>
                    </div>
                  </>
                  )}
                  {navegador === 2 && (<>
                    <p style={{marginBottom:"-4px", color: "rgba(255, 255, 255, 0.7)"}}>Escriba el nombre de la persona a la que va dirigida la constancia de trabajo.</p>
                    <br />
                    <div style={{ display: "flex", justifyContent: "center" , flexDirection: "column", gap: "10px"}}>
                      <Form.Control
                        type="text"
                        placeholder="Destinatario"
                        value={destinatario}
                        onChange={(e) =>setDestinatario(e.target.value) }
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                        <div>
                          <p style={{color: 'white'}}>¿Que tipo de persona es?</p>
                          <Form.Check
                            inline
                            label="Natural"
                            name="group1"
                            type={'radio'}
                            id={`inline-radio-1`}
                            onChange={() => setPersona('natural')}
                            style={{color: 'white'}}
                            checked={persona === 'natural'}
                          />
                          <Form.Check
                            inline
                            label="Júridico"
                            name="group1"
                            type={'radio'}
                            id={`inline-radio-2`}
                            onChange={() => setPersona('juridica')}
                            style={{color: 'white'}}
                            checked={persona === 'juridica'}
                          />
                        </div>
                        <div style={{display: "flex", justifyContent:'end', alignItems:'end'}}> 
                          <Button
                            style={{ borderColor: "#013897",backgroundColor: "#013897", boxShadow: "0 3px 6px 0 rgba(0, 0, 0, .14)" }}
                            variant="primary"
                            onClick={handleEnviar}
                          >
                            Cambiar
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    </>)
                  }
                </Card.Body>
              </Card>
              </div>
            </>
          ) : (
            <div>
            <Card bg="danger" border="danger" className={styles.Tarjeta}>
              <Card.Header style={{ color: 'white', textAlign: "center", fontWeight: 500 }}>Error</Card.Header>
              <Card.Body>
                <Alert variant='danger' style={{ fontSize: "24.5px" }}>
                  {error ? error : "No hay Constancias de trabajo registradas"}
                </Alert>
              </Card.Body>
            </Card>
            </div>
          )}

        </div>
        }
      </div>
      
    </>
  );
}

export default ConstaciaDeTrabajo;