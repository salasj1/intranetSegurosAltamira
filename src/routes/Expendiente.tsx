import React, { useState } from 'react';
import NavbarEmpresa from "../components/NavbarEmpresa";
import { Form, Button, Row, Col, Card, InputGroup } from "react-bootstrap";
import { useAuth } from '../auth/AuthProvider';
import { IoDocumentText } from "react-icons/io5";
import { LuPencilLine } from "react-icons/lu";

const apiUrl = import.meta.env.VITE_API_URL;

const Expendiente = () => {
  const [validatedFiles, setValidatedFiles] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileInputs, setFileInputs] = useState<number[]>([0]);

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
    setValidatedFiles(false); // Desactivar la validación
  };

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
    files.forEach((file, index) => {
      formData.append(`archivo${index + 1}`, file);
    });
    formData.append('cod_emp', cod_emp);

    try {
      const response = await fetch(`${apiUrl}/google-drive/subir-varios-archivos`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert('Archivos subidos con éxito.');
      } else {
        alert('Error al subir los archivos: ' + result.error);
      }
    } catch (error) {
      console.error('Error al subir los archivos:', error);
      alert('Error al subir los archivos.');
    }
    setValidatedFiles(true);
  };

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
              <InputGroup.Text id="inputGroupPrepend">J</InputGroup.Text>
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
              <option >Seleccione un estado civil</option>
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
          <option value="Cédula">Cédula</option>
          <option value="RIF">RIF</option>
          <option value="Recibo">Recibo de Pago</option>
          <option value="Otros Archivos">Otros Archivos</option>
        </Form.Select>
        </Form.Group>
        
        {selectedDocument && (
          <Form.Group controlId="formFileUpload" className="mb-3" >
            <Form.Label style={{  color: 'rgb(51, 51, 51)' , fontWeight: 'bold'}}>{selectedDocument}</Form.Label>
            
            <br/>
            {selectedDocument === 'Otros Archivos' && "Por favor, selecciona uno o más archivos."}
            {fileInputs.map((index) => (
              <div key={index}>
                <Form.Control style={{marginBottom: '10px'}}
                  type="file"
                  required
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, index)}
                  accept=".pdf"
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, selecciona un archivo.
                </Form.Control.Feedback>
              </div>
            ))}
            {selectedDocument=== "Otros Archivos" && <Button variant="secondary" onClick={addFileInput}>
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