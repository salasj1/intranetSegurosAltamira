import React, { useEffect, useState, useRef } from 'react';
import NavbarEmpresa from "../components/NavbarEmpresa";
import { Form, Button, Row, Col, Card, InputGroup, OverlayTrigger, Tooltip, TooltipProps } from "react-bootstrap";
import { useAuth } from '../auth/AuthProvider';
import { IoDocumentText } from "react-icons/io5";
import { LuPencilLine } from "react-icons/lu";
import axios from 'axios';
import DatePicker from "react-widgets/DatePicker";
import { FaCircleInfo } from "react-icons/fa6";

export interface TiposDocumento {
  id: number;
  nombre: string;
  estatus: string;
}

const apiUrl = import.meta.env.VITE_API_URL;

const Expendiente = () => {
  const [validatedFiles, setValidatedFiles] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [tiposDocumentos, setTiposDocumentos] = useState<TiposDocumento[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileInputs, setFileInputs] = useState<number[]>([0]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { cod_emp } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const selectedFiles = [...files];
    if (event.target.files && event.target.files.length > 0) {
      selectedFiles[index] = event.target.files[0];
      setFiles(selectedFiles);
    }
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDocument(event.target.value);
    setFiles([]);
    setFileInputs([0]);
    setValidatedFiles(false);
  };

  useEffect(() => {
    const fetchTiposDocumentos = async () => {
      try {
        const response = await axios.get(`${apiUrl}/google-drive/tiposDocumentos`);
        setTiposDocumentos(response.data);
      } catch (error) {
        console.error('Error fetching tipos de documentos:', error);
      }
    };

    fetchTiposDocumentos();
  }, []);

  const addFileInput = () => {
    setFileInputs([...fileInputs, fileInputs.length]);
  };

  const handleUploadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!files.length || !cod_emp) {
      alert('Por favor, selecciona los archivos.');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('archivos', file); // Asegúrate de que el nombre del campo sea 'archivos'
    });
    formData.append('cod_emp', cod_emp);
    if (selectedDocument) {
      formData.append('tipo_documento', selectedDocument);
    }
    
    try {
      const response = await fetch(`${apiUrl}/google-drive/subir-varios-archivos`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert('Archivos subidos con éxito.');
        setFiles([]);
        setFileInputs([0]);
        setSelectedDocument('');
        fileInputRefs.current.forEach(input => {
          if (input) input.value = '';
        });
      } else {
        if(result.error)
        alert('Error al subir los archivos: ' + result.error);
      }
    } catch (error) {
      console.error('Error al subir los archivos:', error);
      alert('Error al subir los archivos.');
    }
    setValidatedFiles(true);
  };

  const renderTooltip = (props: TooltipProps) => (
    <div {...props} style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', padding: '2px 10px', color: 'white', borderRadius: 3 }}>
       <Tooltip id="button-tooltip" {...props}>
        Simple tooltip
        </Tooltip>

    </div>
   
  );

  return (
    <>
      <NavbarEmpresa />
      <br />
      <br />
      <br />
      <br />
      <br />
      <h1>Expendiente</h1>
      <br />
      <Form className="container" >
        <Card bg="primary" className="mb-3" style={{ padding: '20px', color: 'white', boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)' }}>
        <h2 style={{display:'flex',alignItems:'end'}}><LuPencilLine />Datos Personales</h2>
        <hr/>
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
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
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
              <Form.Control type="text" placeholder="Nombres" />
            </Form.Group>
          </Col>
          <Col >
            <Form.Group controlId="formApellido">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control type="text" placeholder="Apellidos" />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col lg={2}>
              <Form.Label>RIF</Form.Label>
            <Form.Group controlId="formRif">
              <InputGroup hasValidation>
              <InputGroup.Text style={{borderTopRightRadius:'0px', borderEndEndRadius :'0px' }}>J</InputGroup.Text>
              <Form.Control 
              type="text" 
              placeholder="RIF" 
              pattern="\d{1,9}" 
              maxLength={9}
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
              }}
              />
              </InputGroup>
            </Form.Group>
          </Col>
          <Col lg={3}>
            <Form.Group controlId="formEstadoCivil">
              <Form.Label>Estado Civil</Form.Label>
              <Form.Control as="select">
              <option value={""} >Seleccione un estado civil</option>
              <option value={"Soltero"}>Soltero</option>
              <option value={"Casado"}>Casado</option>
              <option value={"Divorciado"}>Divorciado</option>
              <option value={"Viudo"}>Viudo</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col lg={4}>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Email" />
            </Form.Group>
          </Col>
          <Col lg={3}>
            <Form.Group controlId="formDireccion">
              <Form.Label>Fecha de Nacimiento</Form.Label>
              <Form.Control type="Date" />
            </Form.Group>
          </Col>
        </Row>
        <br/>
        <Row>
        <Col lg={3}>
            <Form.Group controlId="formTelefono">
              <Form.Label>Teléfono Celular</Form.Label>
              <Form.Control type="text" placeholder="Teléfono" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formDireccion">
              <Form.Label>Dirección</Form.Label>
              <Form.Control type="text" placeholder="Dirección" />
            </Form.Group>
          </Col>
        </Row>
        <br/>
        <Row>
          <Col lg={3}>
            <Form.Group controlId="formTelefono">
              <Form.Label>Teléfono de Casa</Form.Label>
              <Form.Control type="text" placeholder="Teléfono" />
            </Form.Group>
          </Col>
        </Row>
        <br/>
        <Button variant="primary" type="submit">
            Solicitar Cambios de los Datos Personales
        </Button>
        </Card>
      </Form>
      
      <Form className="container" noValidate validated={validatedFiles} onSubmit={handleUploadSubmit}>
      
        <Card border="primary" className="mb-3" style={{ padding: '20px', boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)' }}>
        <h2 style={{display:'flex',alignItems:'center', color: 'rgb(3, 76, 185)'}}><IoDocumentText /> Documentos</h2>
        <hr/>
        <Form.Group controlId="formFile" className="mb-3" style={{  color: 'rgb(255, 255, 255)' , background:'rgb(3, 76, 185)',fontWeight: 'bold',boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: '10px'}} >
        
        <Form.Label><h4>Seleccionar Documento</h4></Form.Label>
        <Form.Select id="SeleccionDocumento" aria-label="Default select example" className="mb-3 " style={{ width:'600px'}} onChange={handleDocumentChange}>
          <option value="">Seleccione un documento</option>
          {tiposDocumentos.map((tipo) => (
            <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>
          ))}
        </Form.Select>
        </Form.Group>
        
        {selectedDocument && (
          <Form.Group controlId="formFileUpload" className="mb-3" >
            <Form.Label style={{  color: 'rgb(51, 51, 51)' , fontWeight: 'bold'}}>{selectedDocument}</Form.Label>
            
            <br/>
            
            <Row>
            {(selectedDocument === 'CEDULA' || selectedDocument=== 'RIF')&& 
            <Col lg={3}>
                <Form.Label style={{ fontWeight: 'bold' }}>Fecha de Vencimiento 
                <OverlayTrigger
                placement='right'
                delay={{ show: 250, hide: 400 }}
                overlay={renderTooltip}
                >
                  <span style={{ display: 'inline-block', marginTop: '10px' }}><FaCircleInfo /></span>
                </OverlayTrigger>
                  </Form.Label>
              <DatePicker
                placeholder="dd/mm/yyyy"
                valueFormat={{day:"2-digit", month: "2-digit", year: "numeric" }}
                dropUp={true}
              />
            </Col>

            }
            {!(selectedDocument === 'CEDULA' || selectedDocument=== 'RIF' || selectedDocument=== '')&&
            <Col lg={4}>
              <Form.Label style={{ fontWeight: 'bold' }}>Periodo de Actualización del documento</Form.Label>
              <div style={{display:"flex",flexDirection:"row", gap: "10px", alignItems:"center", flexWrap:"nowrap"}}>
              <Form.Control 
              type="number" 
              min="1" 
              max="180" 
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
                if (parseInt(e.target.value) > 180) e.target.value = '180';
              }}
              />
              días

              </div>
              
            </Col>}
            </Row>
            <br/>
            {selectedDocument === 'OTROS ARCHIVOS'? "Por favor, selecciona uno o más archivos.": "Por favor, selecciona un archivo."}
            
            {fileInputs.map((index) => (
              
              <div key={index}>
              
                <Form.Control style={{marginBottom: '10px'}}
                  type="file"
                  required
                  ref={el => fileInputRefs.current[index] = el}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, index)}
                  accept=".pdf"
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, selecciona un archivo.
                </Form.Control.Feedback>
              </div>
            ))}
            
            {selectedDocument=== "OTROS ARCHIVOS" && 
            <Button variant="secondary" onClick={addFileInput}>
              Agregar otro archivo
            </Button>}
            
          </Form.Group>
        )}
        <Button variant="primary" type="submit" >
          Subir Archivos
        </Button>
        
        </Card>
       
      </Form>
      <br />
    </>
  );
};

export default Expendiente;