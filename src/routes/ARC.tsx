import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { Button, Card, Alert, Form } from 'react-bootstrap';
import NavbarEmpresa from '../components/NavbarEmpresa';
import generateARCPDF from '../components/FormatoARC';
import styles from '../css/ARC.module.css';

function ARC() {
  const [arcData, setArcData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [showPdf, setShowPdf] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const { cod_emp } = useAuth();
  const [correoSecundario, setCorreoSecundario] = useState<string>('');
  const [fechaARC, setFechaARC] = useState<string>('');
  const [tempFechaARC, setTempFechaARC] = useState<string>(''); 

  useEffect(() => {
    const isValidYear = /^\d{4}$/.test(fechaARC);
    if (fechaARC && !isValidYear) {
      setError('El dato escrito no es un año válido.');
      setArcData(null);
      setIsLoading(false);
      return;
    }

    if (cod_emp && fechaARC) {
      fetch(`/api/arc/${cod_emp}?fecha=${fechaARC}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (!data || data.length === 0) {
            setError('No se encontraron datos para la fecha seleccionada.');
            setArcData(null);
          } else {
            setArcData(data);
            setError(null);
          }
          setIsLoading(false);
        })
        .catch(error => {
          if (error.message === 'Network response was not ok') {
            setError('Error de conexion. Intentelo más tarde');
          } else {
            setError(error.message);
          }
          setIsLoading(false);
        });
    }
  }, [cod_emp, fechaARC]);

  const pdfBlob = useMemo(() => {
    if (arcData) {
      const pdf = generateARCPDF(arcData, fechaARC);
      return pdf.output('blob');
    }
    return null;
  }, [arcData, fechaARC]);
  
  const handleDownload = () => {
    if (arcData) {
      const pdf = generateARCPDF(arcData, fechaARC);
      pdf.save(`ARC.pdf`);
    }
  };

  const handleSendEmail = async () => {
    if (!pdfBlob) return;
    setIsPdfLoading(true);
    try {
        const formData = new FormData();
        formData.append('pdf', pdfBlob, 'ARC.pdf');
        formData.append('cod_emp', cod_emp || '');
        formData.append('fecha', fechaARC);

        const response = await fetch('/api/send-arc', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            setShowAlert(true);
        }
        if (result.success) {
          alert('Correo enviado exitosamente');
        } else {
          alert('Error enviando el correo');
          const responseData = await response.json();
          console.error('Error enviando el correo secundario:', responseData.message);
        }
    } catch (error) {
        console.error('Error sending ARC email:', error);
    } finally {
        setIsPdfLoading(false);
    }
};

const handleSendSecondaryEmail = async () => {
    if (!pdfBlob || !correoSecundario) return;
    setIsPdfLoading(true);
    try {
        const formData = new FormData();
        formData.append('pdf', pdfBlob, 'ARC.pdf');
        formData.append('cod_emp', cod_emp || '');
        formData.append('correo_secundario', correoSecundario);
        formData.append('fecha', fechaARC);

        const response = await fetch('/api/send-arc-secundario', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            setShowAlert(true);
        }
        if (result.success) {
          alert('Correo enviado exitosamente');
        } else {
          alert('Error enviando el correo');
          const responseData = await response.json();
          console.error('Error enviando el correo secundario:', responseData.message);
        }
    } catch (error) {
        console.error('Error sending ARC email to secondary email:', error);
    } finally {
        setIsPdfLoading(false);
    }
};


  const zoomPluginInstance = zoomPlugin();

  return (
    <>
      <NavbarEmpresa />
      <div className={styles.canvas}>
        <h1 style={{ textAlign: "center" }} className={styles.h1ARC}>Comprobante de Agente de Retención (ARC)</h1>
          <div className={styles.cajainput}>
            <Card className={styles.tarjeticaInput} bg='warning'>
              <Card.Body>
                <h4>Seleccione el año del ARC:</h4>
                <div style={{display:"flex",flexDirection:"row",alignItems:"center",gap:"10px"}}>
                <Form.Control
                    className={styles.inputARC}
                    type="number"
                    value={tempFechaARC}
                    onChange={(e) => setTempFechaARC(e.target.value)}
                    placeholder="AAAA"
                  />    
                  <Button variant='light' className={styles['pdf-botton-download']} onClick={() => { setFechaARC(tempFechaARC); setIsPdfLoading(true); setShowPdf(true); }}>Buscar</Button>
                </div>
              </Card.Body>
            </Card>
          </div>
          {error ? (
            <Card bg="danger" border="danger" className={styles.Tarjeta}>
              <Card.Header style={{ color: 'white', textAlign: "center", fontWeight: 500 }}>Error</Card.Header>
              <Card.Body>
                <Alert variant='danger' style={{ fontSize: "24.5px" }}>
                  {error}
                </Alert>
              </Card.Body>
            </Card>
          ) : showPdf && arcData ? (
            <>
              <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                {isPdfLoading && <h2>Cargando detalle PDF...</h2>}
                <div className={styles['pdf-viewer-container']}>
                  {pdfBlob && (
                    <>
                    <div className={styles.botonesZoom}>
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
                      <Alert variant='primary' style={{ fontSize: "24.5px" }}>
                        ¡ARC generado exitosamente! Seleccione una opción para continuar.
                      </Alert>
                      <div className={styles['button-group']}>
                        <Button variant='light' className={styles['pdf-botton-download']} onClick={handleDownload}>Descargar</Button>
                        <Button variant='warning' className={styles['pdf-botton-download2']} onClick={handleSendEmail}>Enviar al correo</Button>
                      </div>
                      <div className={styles['button-group']}>
                        <Form.Control
                          size="lg"
                          type="text"
                          placeholder="Escriba un correo"
                          value={correoSecundario}
                          onChange={(e) => setCorreoSecundario(e.target.value)}
                        />
                        <Button variant='warning' className={styles['pdf-botton-download3']} onClick={handleSendSecondaryEmail}>Enviar a un correo secundario</Button>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </>
          ) : null}
        </div>
    </>
  );
}

export default ARC;