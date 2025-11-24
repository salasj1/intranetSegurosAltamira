import React from 'react';
import { Alert, Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { LuPencilLine } from "react-icons/lu";
import { MdInfoOutline } from "react-icons/md";
import { useDatosPersonalesPhase } from '../hooks/useDatosPersonalesPhase';
import style from '../styles/ExpedienteEmpleado.module.css';

type DatosPersonalesPhaseProps = {
  datosPersonales: any;
  setDatosPersonales: (v: any) => void;
  telefonoAdicional: string;
  setTelefonoAdicional: (v: string) => void;
  bloquearCambioDatos: boolean;
  handleAbrirModalConfirmar: () => void;
  handleNextPhase: () => void;
};

const DatosPersonalesPhase: React.FC<DatosPersonalesPhaseProps> = ({
  datosPersonales,
  setDatosPersonales,
  telefonoAdicional,
  setTelefonoAdicional,
  bloquearCambioDatos,
  handleAbrirModalConfirmar,
  handleNextPhase,
}) => {
  const {
    // ...desestructura aquí lo que necesites del hook...
  } = useDatosPersonalesPhase({
    datosPersonales,
    setDatosPersonales,
    telefonoAdicional,
    setTelefonoAdicional,
    bloquearCambioDatos,
    handleAbrirModalConfirmar,
    handleNextPhase,
    // ...otros props...
  });

  const handleFieldChange = (field: keyof typeof datosPersonales, value: string) => {
    setDatosPersonales((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Form className="container">
      <Card bg="primary" className="mb-3" style={{ padding: '20px', color: 'white', boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)' }}>
        <h2 style={{display:'flex',alignItems:'end'}}><LuPencilLine />Datos Personales</h2>
        <hr/>
        {!bloquearCambioDatos ? (
          <Alert variant="info" style={{ display: 'flex', alignItems: 'center' }}>
            <MdInfoOutline style={{ width: "30px", height: "30px", marginRight: '10px' }} />
            <span>Por favor, revise y complete sus datos personales. En caso de que algún dato sea incorrecto, por favor, edítelo y solicite el cambio de datos.</span>
          </Alert>
        ) : (
          <Alert variant="warning" style={{ marginTop: '10px' }}>
            Ya existe una solicitud de cambio pendiente. No puedes solicitar otro cambio hasta que sea procesado por Recursos Humanos.
          </Alert>
        )}
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
                  disabled={bloquearCambioDatos}
                  value={datosPersonales?.cedula.replace(/\s/g, '') || ''}
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleFieldChange('cedula', e.target.value.replace(/\s/g, ''));
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
              <Form.Control
                type="text"
                placeholder="Nombres"
                defaultValue={datosPersonales?.nombres || ''}
                disabled={bloquearCambioDatos}
                style={{ textTransform: 'uppercase' }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleFieldChange('nombres', e.target.value.toUpperCase());
                }}
              />
            </Form.Group>
          </Col>
          <Col >
            <Form.Group controlId="formApellido">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control type="text" placeholder="Apellidos" defaultValue={datosPersonales?.apellidos || '' } 
                disabled={bloquearCambioDatos}
                style={{ textTransform: 'uppercase' }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleFieldChange('apellidos', e.target.value.toUpperCase());
                }} />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col lg={2}>
            <Form.Label>RIF</Form.Label>
            <Form.Group controlId="formRif">
              <InputGroup hasValidation>
                <InputGroup.Text style={{borderTopRightRadius:'0px', borderEndEndRadius :'0px' }}>V</InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="RIF" 
                  pattern="\d{1,9}" 
                  maxLength={9}
                  disabled={bloquearCambioDatos}
                  value={datosPersonales?.rif.slice(1).trim() || ''}
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleFieldChange('rif', 'V' + e.target.value.trim());
                  }}
                />
              </InputGroup>
            </Form.Group>
          </Col>
          <Col lg={3}>
            <Form.Group controlId="formEstadoCivil">
              <Form.Label>Estado Civil</Form.Label>
              <Form.Control as="select" value={datosPersonales?.estadoCivil} 
                disabled={bloquearCambioDatos}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleFieldChange('estadoCivil', e.target.value);
                }} >
                <option value={""} >Seleccione un estado civil</option>
                <option value={"S"}>Soltero</option>
                <option value={"C"}>Casado</option>
                <option value={"D"}>Divorciado</option>
                <option value={"V"}>Viudo</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col lg={4}>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Email" defaultValue={datosPersonales?.email || ''} disabled={bloquearCambioDatos} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleFieldChange('email', e.target.value);
              }} />
            </Form.Group>
          </Col>
          <Col lg={3}>
            <Form.Group controlId="formDireccion">
              <Form.Label>Fecha de Nacimiento</Form.Label>
              <Form.Control 
                type="date" 
                value={datosPersonales?.fechaNacimiento.split('T')[0] || ''} 
                disabled={bloquearCambioDatos}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleFieldChange('fechaNacimiento', e.target.value);
                }} 
              />
            </Form.Group>
          </Col>
        </Row>
        <br/>
        <Row>
          <Col lg={3}>
            <Form.Group controlId="formTelefono">
              <Form.Label>Teléfono Celular</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Teléfono" 
                value={datosPersonales?.telefonoCelular ? datosPersonales.telefonoCelular.replace(/\D/g, '') : ''} 
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                }}
                disabled={bloquearCambioDatos}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleFieldChange('telefonoCelular', e.target.value);
                }} 
              />
              {/* Nuevo campo para teléfono adicional */}
              <Form.Group controlId="formTelefonoAdicional" style={{ marginTop: '10px' }}>
                <Form.Label>Teléfono Adicional (Opcional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Teléfono adicional"
                  value={telefonoAdicional}
                  disabled={bloquearCambioDatos}
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelefonoAdicional(e.target.value)}
                />
              </Form.Group>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formDireccion">
              <Form.Label>Dirección de habitación de Hospedaje de la Vivienda Principal</Form.Label>
              <Form.Control type="text" disabled={bloquearCambioDatos} placeholder="Dirección" defaultValue={datosPersonales?.direccion || ''}
                style={{ textTransform: 'uppercase' }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleFieldChange('direccion', e.target.value.toUpperCase());
                }}  />
            </Form.Group>
          </Col>
        </Row>
        <br/>
        <div >
          <Button
            variant="primary" 
            onClick={handleAbrirModalConfirmar}
            hidden={bloquearCambioDatos}
            style={{ display: 'flex', justifySelf: 'center' }}
            className={style['btn-change-supervision']}
          >
            Solicitar Cambio de Datos
          </Button>
        </div>
      </Card>
{/*       <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <Button variant="primary" onClick={handleNextPhase}>
          Siguiente
        </Button>
      </div> */}
    </Form>
  );
};

export default DatosPersonalesPhase;
