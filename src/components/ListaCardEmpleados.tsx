import { useEffect, useState } from 'react';
import { Card, Container, Row, Col, Form, Button, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import logoEmpresa from '../assets/icono.png';
import styles from '../css/ListaCardEmpleados.module.css';
import { useAuth } from '../auth/AuthProvider';
import Select from 'react-select';

const apiUrl = import.meta.env.VITE_API_URL;

interface Empleado {
  cod_emp: string;
  nombres: string;
  apellidos: string;
  des_depart: string;
  des_cargo: string;
  correo_e: string;
  nombre_completo: string;
  tlf_oficina?: string;
}

const ListaCardEmpleados: React.FC = () => {
  const { cod_emp: authCodEmp } = useAuth();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [filtros, setFiltros] = useState({
    nombre: '',
    cargo: '',
    departamento: '',
    correo: ''
  });
  const [empleadosParaEliminar, setEmpleadosParaEliminar] = useState<number[]>([]);
  const [telefono, setTelefono] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/empleados`)
      .then(response => response.json())
      .then(data => setEmpleados(data))
      .catch(error => console.error('Error fetching empleados:', error));
  }, []);

  const handleFiltroChange = (_: any, actionMeta: any) => {
    const { name, value } = actionMeta;
    setFiltros({
      ...filtros,
      [name]: value
    });

    // Añadir todos los empleados actuales a la lista de eliminación
    setEmpleadosParaEliminar(empleados.map((_, index) => index));

    // Después de la animación, actualizar los empleados filtrados
    setTimeout(() => {
      setEmpleadosParaEliminar([]);
    }, 250); // Duración de la animación
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefono(e.target.value);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^02\d{2}-\d{7}$/;
    return phoneRegex.test(phone);
  };

  const handleTelefonoSubmit = async () => {
    if (selectedEmpleado) {
      if (!validatePhoneNumber(telefono)) {
        setError('El número de teléfono debe tener el formato 02XX-XXXXXXX');
        return;
      }
      try {
        await axios.put(`${apiUrl}/empleados/${selectedEmpleado.cod_emp}/telefono`, { tlf_oficina: telefono });
        setEmpleados(empleados.map(emp => emp.cod_emp === selectedEmpleado.cod_emp ? { ...emp, tlf_oficina: telefono } : emp));
        setTelefono('');
        setShowModal(false);
        setError(null);
      } catch (error) {
        console.error('Error actualizando el número de teléfono:', error);
        setError('Error actualizando el número de teléfono');
      }
    }
  };

/*************  ✨ Codeium Command ⭐  *************/
  /**
   * Elimina el número de teléfono de un empleado.
   * Se utiliza en el modal de edición de teléfono.
   * @function
   */
/******  5ee6eb7d-8103-471a-82e6-4f7496a7691b  *******/
  const handleTelefonoDelete = async () => {
    if (selectedEmpleado) {
      try {
        await axios.delete(`${apiUrl}/empleados/${selectedEmpleado.cod_emp}/telefono`);
        setEmpleados(empleados.map(emp => emp.cod_emp === selectedEmpleado.cod_emp ? { ...emp, tlf_oficina: '' } : emp));
        setShowModal(false);
        setError(null);
      } catch (error) {
        console.error('Error eliminando el número de teléfono:', error);
        setError('Error eliminando el número de teléfono');
      }
    }
  };

  const handleEditClick = (empleado: Empleado) => {
    setSelectedEmpleado(empleado);
    setTelefono(empleado.tlf_oficina || '');
    setShowModal(true);
  };

  const empleadosFiltrados = empleados.filter(empleado =>
    empleado.nombre_completo?.toLowerCase().includes(filtros.nombre.toLowerCase()) &&
    empleado.des_cargo?.toLowerCase().includes(filtros.cargo.toLowerCase()) &&
    empleado.des_depart?.toLowerCase().includes(filtros.departamento.toLowerCase()) &&
    (empleado.correo_e?.toLowerCase() || '').includes(filtros.correo.toLowerCase())
  );

  const hayFiltrosActivos = Object.values(filtros).some(filtro => filtro !== '');

  const nombresUnicos = Array.from(new Set(empleados
    .filter(empleado => 
      (!filtros.cargo || empleado.des_cargo === filtros.cargo) &&
      (!filtros.departamento || empleado.des_depart === filtros.departamento) &&
      (!filtros.correo || empleado.correo_e === filtros.correo)
    )
    .map(empleado => empleado.nombre_completo)
  )).sort((a, b) => a.localeCompare(b));

  const cargosUnicos = Array.from(new Set(empleados
    .filter(empleado => 
      (!filtros.nombre || empleado.nombre_completo === filtros.nombre) &&
      (!filtros.departamento || empleado.des_depart === filtros.departamento) &&
      (!filtros.correo || empleado.correo_e === filtros.correo)
    )
    .map(empleado => empleado.des_cargo)
  )).sort((a, b) => a.localeCompare(b));

  const departamentosUnicos = Array.from(new Set(empleados
    .filter(empleado => 
      (!filtros.nombre || empleado.nombre_completo === filtros.nombre) &&
      (!filtros.cargo || empleado.des_cargo === filtros.cargo) &&
      (!filtros.correo || empleado.correo_e === filtros.correo)
    )
    .map(empleado => empleado.des_depart)
  )).sort((a, b) => a.localeCompare(b));

  const correosUnicos = Array.from(new Set(empleados
    .filter(empleado => 
      (!filtros.nombre || empleado.nombre_completo === filtros.nombre) &&
      (!filtros.cargo || empleado.des_cargo === filtros.cargo) &&
      (!filtros.departamento || empleado.des_depart === filtros.departamento)
    )
    .map(empleado => empleado.correo_e)
  )).sort((a, b) => (a || '').localeCompare(b || ''));

  return (
    <>
      <div className='canvasEmpleados'>
        <Container className='containerEmpleados'>
          <Form>
            <Row className='formRow'>
              
              <Col >
                <Form.Group controlId="filtroDepartamento">
                  <Form.Label>Departamento</Form.Label>
                  <Select
                    name="departamento"
                    value={filtros.departamento ? { label: filtros.departamento, value: filtros.departamento } : null}
                    onChange={(selectedOption) => handleFiltroChange(selectedOption, { name: 'departamento', value: selectedOption?.value || '' })}
                    options={departamentosUnicos.map(departamento => ({ label: departamento, value: departamento }))}
                    isClearable
                    placeholder="Seleccionar"
                  />
                </Form.Group>
              </Col>
              <Col lg={3} >
                <Form.Group controlId="filtroNombre">
                  <Form.Label>Nombre completo</Form.Label>
                  <Select
                    name="nombre"
                    value={filtros.nombre ? { label: filtros.nombre, value: filtros.nombre } : null}
                    onChange={(selectedOption) => handleFiltroChange(selectedOption, { name: 'nombre', value: selectedOption?.value || '' })}
                    options={nombresUnicos.map(nombre => ({ label: nombre, value: nombre }))}
                    isClearable
                    placeholder="Seleccionar"
                  />
                </Form.Group>
              </Col>
              <Col >
                <Form.Group controlId="filtroCargo">
                  <Form.Label>Cargo</Form.Label>
                  <Select
                    name="cargo"
                    value={filtros.cargo ? { label: filtros.cargo, value: filtros.cargo } : null}
                    onChange={(selectedOption) => handleFiltroChange(selectedOption, { name: 'cargo', value: selectedOption?.value || '' })}
                    options={cargosUnicos.map(cargo => ({ label: cargo, value: cargo }))}
                    isClearable
                    placeholder="Seleccionar"
                  />
                </Form.Group>
              </Col>
              <Col lg={4}>
                <Form.Group controlId="filtroCorreo">
                  <Form.Label>Correo</Form.Label>
                  <Select
                  name="correo"
                  value={filtros.correo ? { label: filtros.correo, value: filtros.correo } : null}
                  onChange={(selectedOption) => handleFiltroChange(selectedOption, { name: 'correo', value: selectedOption?.value || '' })}
                  options={correosUnicos.map(correo => ({ label: correo || 'No disponible', value: correo }))}
                  isClearable
                  placeholder="Seleccionar"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
          {hayFiltrosActivos && (
            <Row>
              {empleadosFiltrados.map((empleado, index) => (
                <Col key={index} sm={12} md={6} lg={4}>
                  <Card
                    bg="primary"
                    border="primary"
                    className={`${styles.cardEmpleado} ${empleadosParaEliminar.includes(index) ? styles.fadeOut : ''}`}
                  >
                    <Card.Header>
                      <Card.Title className='cardHeaderEmpleado'>
                        <img src={logoEmpresa} alt="icono" className='cardImgEmpleado' />{`${empleado.nombres} ${empleado.apellidos}`}
                      </Card.Title>
                    </Card.Header>
                    <Card.Body className='cardBodyEmpleado'>
                      <Card.Text className='cardTextEmpleado'>
                        <strong>Cargo:</strong> {empleado.des_cargo}<br />
                        <strong>Departamento:</strong> {empleado.des_depart}<br />
                        <strong>Correo:</strong> {empleado.correo_e}<br />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <strong>Teléfono:</strong> {empleado.tlf_oficina || 'No disponible'}
                        {empleado.cod_emp === authCodEmp && (
                          <>
                            <Button variant="primary" onClick={() => handleEditClick(empleado)}>Editar</Button>
                          </>
                        )}
                        </div>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Teléfono</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group controlId="telefono">
              <Form.Label>El telfono debe tener el siguiente formato: Ej 0212-1234567</Form.Label>
              <Form.Control
                type="text"
                placeholder="Actualizar teléfono"
                value={telefono}
                onChange={handleTelefonoChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleTelefonoDelete}>Eliminar</Button>
          <Button variant="success" onClick={handleTelefonoSubmit}>Actualizar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ListaCardEmpleados;