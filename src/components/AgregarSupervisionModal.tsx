import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
import { values } from 'lodash';
import { Empleado } from '../routes/ControlAutorizacion';
interface AgregarSupervisionModalProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (supervisor: string, supervisados: string[], tipo: string) => void;
  empleadosLista: Empleado[];
}

interface EmpleadoOption {
  value: string;
  label: string;
}

const AgregarSupervisionModal: React.FC<AgregarSupervisionModalProps> = ({ show, handleClose, handleSave ,empleadosLista}) => {
  const [supervisor, setSupervisor] = useState<EmpleadoOption | null>(null);
  const [supervisados, setSupervisados] = useState<EmpleadoOption[]>([{ value: '', label: '' }]);
  const [tipo, setTipo] = useState<string>('0');
  const [empleados, setEmpleados] = useState<EmpleadoOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await axios.get('/api/empleados');
        const empleadosData = response.data.map((empleado: any) => ({
          value: empleado.cod_emp,
          label: `${empleado.nombres} ${empleado.apellidos}`
        }));
        setEmpleados(empleadosData);
      } catch (error) {
        console.error('Error fetching empleados:', error);
      }
    };

    fetchEmpleados();
  }, []);

  const handleAddSupervisado = () => {
    setSupervisados([...supervisados, { value: '', label: '' }]);
  };

  const handleSupervisadoChange = (index: number, selectedOption: EmpleadoOption | null) => {
    const newSupervisados = [...supervisados];
    if (selectedOption) {
      newSupervisados[index] = selectedOption;
    } else {
      newSupervisados[index] = { value: '', label: '' };
    }
    setSupervisados(newSupervisados);
  };

  const handleDeleteSupervisado = (index: number) => {
    const newSupervisados = supervisados.filter((_, i) => i !== index);
    setSupervisados(newSupervisados);
  };

  const handleSaveClick = () => {
    if (!supervisor) {
      setError('Debe seleccionar un supervisor.');
      return;
    }
  
    if (supervisados.some(s => !s.value)) {
      setError('Todos los campos de supervisados deben estar completos.');
      return;
    }
    if (tipo === '0') {
      setError('Debe seleccionar un tipo de supervisión.');
      return;
    }
    
    const supervisorValue = supervisor.value;
    const supervisadosValues = supervisados.map(s => s.value);
    handleSave(supervisorValue, supervisadosValues, tipo);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Nueva Supervisión</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        <Form>
          <Form.Group controlId="formSupervisor">
            <Form.Label style={{fontWeight: "bold", fontSize: "18px"}}>Supervisor</Form.Label>
            <Select
              options={empleados}
              value={supervisor}
              onChange={setSupervisor}
              placeholder="Seleccione el supervisor"
              isClearable
            />
          </Form.Group>
          <Form.Group controlId="formSupervisados">
            <Form.Label style={{marginTop: "10px",fontWeight: "bold", fontSize: "18px"}}>Supervisados</Form.Label>
            {supervisados.map((supervisado, index) => (
              <Row key={index} className="mb-3">
                <Col>
                <Select
                  options={empleados}
                  value={supervisado.value ? supervisado : null}
                  onChange={(selectedOption) => handleSupervisadoChange(index, selectedOption)}
                  placeholder="Seleccione el supervisado"
                  isClearable
                />
                </Col>
                {
                  supervisados.length > 1 && (
                    <Col xs="auto">
                        <Button variant="danger" onClick={() => handleDeleteSupervisado(index)}>
                            Eliminar
                        </Button>
                    </Col>
                  )
                }
                
              </Row>
            ))}
            <Button onClick={handleAddSupervisado} style={{ marginTop: '5px', backgroundColor: "#013897" }}>
              Agregar Supervisado
            </Button>
          </Form.Group>
          <Form.Group controlId="formTipo">
            <Form.Label style={{marginTop: "10px",fontWeight: "bold", fontSize: "18px"}}>Tipo de Supervisión</Form.Label>
            <Form.Control
              as="select"
              value={tipo}
              defaultValue={values("0")}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value={"0"}>Seleccione un tipo</option>
              <option value={"1"}>Tipo 1</option>
              <option value={"2"}>Tipo 2</option>
              <option value={"3"}>Tipo 3</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSaveClick}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AgregarSupervisionModal;