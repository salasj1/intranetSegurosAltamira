import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
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
  departamento: string;
  cargo: string;
}

interface TipoSupervision {
  tipo: number;
  nombre: string;
}

const AgregarSupervisionModal: React.FC<AgregarSupervisionModalProps> = ({ show, handleClose, handleSave}) => {
  const [supervisor, setSupervisor] = useState<EmpleadoOption | null>(null);
  const [supervisados, setSupervisados] = useState<EmpleadoOption[]>([{ value: '', label: '', departamento: '', cargo: '' }]);
  const [tipo, setTipo] = useState<string>('0');
  const [empleados, setEmpleados] = useState<EmpleadoOption[]>([]);
  const [tiposSupervision, setTiposSupervision] = useState<TipoSupervision[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [departamentoSupervisor, setDepartamentoSupervisor] = useState<string | null>(null);
  const [departamentoSupervisado, setDepartamentoSupervisado] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await axios.get(`${apiUrl}/empleados`);
        const empleadosData = response.data.map((empleado: any) => ({
          value: empleado.cod_emp,
          label: `${empleado.nombres} ${empleado.apellidos} - ${empleado.des_cargo}`,
          departamento: empleado.des_depart,
          cargo: empleado.des_cargo
        }));
        setEmpleados(empleadosData);
      } catch (error) {
        console.error('Error fetching empleados:', error);
      }
    };

    const fetchTiposSupervision = async () => {
      try {
        const response = await axios.get(`${apiUrl}/empleados/tipos-supervision`);
        setTiposSupervision(response.data);
      } catch (error) {
        console.error('Error fetching tipos de supervision:', error);
      }
    };

    fetchEmpleados();
    fetchTiposSupervision();
  }, []);

  const handleAddSupervisado = () => {
    setSupervisados([...supervisados, { value: '', label: '', departamento: '', cargo: '' }]);
  };

  const handleSupervisadoChange = (index: number, selectedOption: EmpleadoOption | null) => {
    const newSupervisados = [...supervisados];
    if (selectedOption) {
      newSupervisados[index] = selectedOption;
    } else {
      newSupervisados[index] = { value: '', label: '', departamento: '', cargo: '' };
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

  const departamentos = Array.from(new Set(empleados.map(e => e.departamento)));

  const empleadosFiltradosSupervisor = empleados.filter(e => e.departamento === departamentoSupervisor && !supervisados.some(s => s.value === e.value));
  const empleadosFiltradosSupervisado = empleados.filter(e => e.departamento === departamentoSupervisado && e.value !== supervisor?.value && !supervisados.some(s => s.value === e.value));

 

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Nueva Supervisión</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        <Form>

          <Alert >
            <h3>Supervisor</h3> 
            <Form.Group controlId="formDepartamentoSupervisor">
              <Form.Label style={{ fontWeight: "bold", fontSize: "18px" }}>Departamento del Supervisor</Form.Label>
              <Select
                options={departamentos.map(dep => ({ value: dep, label: dep }))}
                value={departamentoSupervisor ? { value: departamentoSupervisor, label: departamentoSupervisor } : null}
                onChange={(selectedOption) => setDepartamentoSupervisor(selectedOption ? selectedOption.value : null)}
                placeholder="Seleccione el departamento"
                isClearable
              />
            </Form.Group>
            <Form.Group controlId="formSupervisor">
              <Form.Label style={{ fontWeight: "bold", fontSize: "18px" }}>Supervisor</Form.Label>
              <Select
                options={empleadosFiltradosSupervisor}
                value={supervisor}
                onChange={setSupervisor}
                placeholder="Seleccione el supervisor"
                isClearable
              />
            </Form.Group>
          </Alert>
        
          <Alert>
            <h3>Supervisados</h3>
          <Form.Group controlId="formDepartamentoSupervisado">
            <Form.Label style={{ fontWeight: "bold", fontSize: "18px" }}>Departamento del Supervisado</Form.Label>
            <Select
              options={departamentos.map(dep => ({ value: dep, label: dep }))}
              value={departamentoSupervisado ? { value: departamentoSupervisado, label: departamentoSupervisado } : null}
              onChange={(selectedOption) => setDepartamentoSupervisado(selectedOption ? selectedOption.value : null)}
              placeholder="Seleccione el departamento"
              isClearable
            />
          </Form.Group>
          <Form.Group controlId="formSupervisados">
            <Form.Label style={{ marginTop: "10px", fontWeight: "bold", fontSize: "18px" }}>Supervisados</Form.Label>
            {supervisados.map((supervisado, index) => (
              <Row key={index} className="mb-3">
                <Col>
                  <Select
                    options={empleadosFiltradosSupervisado}
                    value={supervisado.value ? supervisado : null}
                    onChange={(selectedOption) => handleSupervisadoChange(index, selectedOption)}
                    placeholder="Seleccione el supervisado"
                    isClearable
                  />
                </Col>
                {supervisados.length > 1 && (
                  <Col xs="auto">
                    <Button variant="danger" onClick={() => handleDeleteSupervisado(index)}>
                      Eliminar
                    </Button>
                  </Col>
                )}
              </Row>
            ))}
            <Button onClick={handleAddSupervisado} style={{ marginTop: '5px', backgroundColor: "#013897" }}>
              Agregar Supervisado
            </Button>
          </Form.Group>
          </Alert>
          
          <Form.Group controlId="formTipo">
            <Form.Label style={{ marginTop: "10px", fontWeight: "bold", fontSize: "18px" }}>Tipo de Supervisión</Form.Label>
            <Form.Control
              as="select"
              value={tipo}
              defaultValue={"0"}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value={"0"}>Seleccione un tipo</option>
              {tiposSupervision.map((tipo) => (
                <option key={tipo.tipo} value={tipo.tipo.toString()}>{tipo.nombre}</option>
              ))}
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