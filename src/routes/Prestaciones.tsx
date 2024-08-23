import { useEffect, useState, useMemo } from 'react';
import { Alert, Button, Form } from "react-bootstrap";
import axios from 'axios';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { scrollModePlugin } from '@react-pdf-viewer/scroll-mode';
import { ScrollMode } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import "../css/RecibodePagoDetallado.css"
import Card from 'react-bootstrap/Card';
import { CSSTransition } from 'react-transition-group';
import { useAuth } from '../auth/AuthProvider'; // Asegúrate de importar useAuth
import NavbarEmpresa from '../components/NavbarEmpresa';
import generatePrestacionesPDF from '../components/FormatoPrestaciones';


function Prestaciones() {


  const [prestacionesData, setPrestacionesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { cod_emp, fecha_ing,des_depart } = useAuth();
  const [correoSecundario, setCorreoSecundario] = useState<string>('');

  useEffect(() => {
    const fetchPrestacionesData = async () => {
      if (!cod_emp) return;
      try {
        const response = await axios.get(`/api/prestaciones/${cod_emp}`);
        setPrestacionesData(response.data);
        console.log("cod_emp " +cod_emp)
        console.log("des_depart " +des_depart)
        console.log("fecha_ing " +fecha_ing)
        setIsLoading(false);
        setShowAlert(true);
      } catch (error) {
        console.error('Error fetching prestaciones data:', error);
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
    return null;
  }, [prestacionesData]);

  const handleDownload = () => {
    if (prestacionesData) {
      const pdf = generatePrestacionesPDF(prestacionesData);
      pdf.save(`prestaciones.pdf`);
    }
  };

  const handleSendEmail = async () => {
    if ( prestacionesData && pdfBlob) {
      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'prestaciones.pdf');
      formData.append('cod_emp', cod_emp ?? '');

      try {
        const response = await axios.post('/api/send-prestaciones', formData, {
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
        console.error('Error enviando el correo:', error);
        alert('Error enviando el correo');
      }
    }
  };

  const handleSendSecondaryEmail = async () => {
    if (prestacionesData &&pdfBlob && correoSecundario) {
      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'prestaciones.pdf');
      formData.append('cod_emp', cod_emp || '');
      formData.append('correo_secundario', correoSecundario);

      try {
        const response = await axios.post('/api/send-prestaciones-secundario', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          setShowAlert(true);
        } else {
          console.error('Error sending secondary email');
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
      <h1 style={{ textAlign: "center" }} className='h1Prestaciones' >Movimientos de Prestaciones Sociales</h1>
        <div style={{ width: "100%"}}>
          {prestacionesData ? (
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
              {!isPdfLoading?(<div className='botonesZoom'>
                  <zoomPluginInstance.ZoomIn >
                    {({ onClick }) => (
                      <Button style={{marginBottom:"2px"}} variant="secondary"  onClick={onClick}>+</Button>
                    )}
                  </zoomPluginInstance.ZoomIn>
                  <zoomPluginInstance.ZoomOut>
                    {({ onClick }) => (
                      <Button variant="secondary" onClick={onClick}>-</Button>
                    )}
                  </zoomPluginInstance.ZoomOut>
                </div>):null}
              <Card bg="primary" border="primary"  className='Tarjeta'>
                <Card.Header style={{color: 'white', textAlign:"center", fontWeight: 500}}>Ver PDF</Card.Header>
                <Card.Body className="card-body-buttons">
                  {isPdfLoading ? (
                    <Alert variant='warning' style={{fontSize:"24.5px",paddingInline:"148px"}}>
                      Cargando detalle PDF...
                    </Alert>
                  ) : (
                    <>
                      <CSSTransition
                        in={showAlert}
                        timeout={300}
                        classNames="alert"
                        unmountOnExit
                      >
                        <Alert variant='primary' style={{fontSize:"24.5px"}}>
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
            <h2>Cargando Detalle...</h2>
          )}
        </div>
      </div>
    </>
  );
}

export default Prestaciones;