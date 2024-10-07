import { useEffect, useState } from 'react';
import { Card, Container, Row, Col, Form } from 'react-bootstrap';
import logoEmpresa from '../assets/icono.png';
import styles from '../css/ListaCardEmpleados.module.css';

interface Empleado {
  nombres: string;
  apellidos: string;
  des_depart: string;
  des_cargo: string;
  correo_e: string;
  nombre_completo: string;
}

const ListaCardEmpleados: React.FC = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [filtros, setFiltros] = useState({
    nombre: '',
    cargo: '',
    departamento: '',
    correo: ''
  });
  const [empleadosParaEliminar, setEmpleadosParaEliminar] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/empleados')
      .then(response => response.json())
      .then(data => setEmpleados(data))
      .catch(error => console.error('Error fetching empleados:', error));
  }, []);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
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
  ));

  const cargosUnicos = Array.from(new Set(empleados
    .filter(empleado => 
      (!filtros.nombre || empleado.nombre_completo === filtros.nombre) &&
      (!filtros.departamento || empleado.des_depart === filtros.departamento) &&
      (!filtros.correo || empleado.correo_e === filtros.correo)
    )
    .map(empleado => empleado.des_cargo)
  ));

  const departamentosUnicos = Array.from(new Set(empleados
    .filter(empleado => 
      (!filtros.nombre || empleado.nombre_completo === filtros.nombre) &&
      (!filtros.cargo || empleado.des_cargo === filtros.cargo) &&
      (!filtros.correo || empleado.correo_e === filtros.correo)
    )
    .map(empleado => empleado.des_depart)
  ));

  const correosUnicos = Array.from(new Set(empleados
    .filter(empleado => 
      (!filtros.nombre || empleado.nombre_completo === filtros.nombre) &&
      (!filtros.cargo || empleado.des_cargo === filtros.cargo) &&
      (!filtros.departamento || empleado.des_depart === filtros.departamento)
    )
    .map(empleado => empleado.correo_e)
  ));

  return (
    <>
      <div className='canvasEmpleados'>
        <Container className='containerEmpleados'>
          <Form>
            <Row className='formRow'>
              
              <Col>
                <Form.Group controlId="filtroDepartamento">
                  <Form.Label>Departamento</Form.Label>
                  <Form.Control
                    as="select"
                    name="departamento"
                    value={filtros.departamento}
                    onChange={handleFiltroChange as any}
                  >
                    <option value="">Seleccionar</option>
                    {departamentosUnicos.map((departamento, index) => (
                      <option key={index} value={departamento}>{departamento}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="filtroNombre">
                  <Form.Label>Nombre completo</Form.Label>
                    <Form.Control
                    as="select"
                    name="nombre"
                    value={filtros.nombre}
                    onChange={handleFiltroChange as any}
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, nombre: e.target.value })}
                    >
                    <option value="">Seleccionar</option>
                    {nombresUnicos.map((nombre, index) => (
                      <option key={index} value={nombre}>{nombre}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="filtroCargo">
                  <Form.Label>Cargo</Form.Label>
                  <Form.Control
                    as="select"
                    name="cargo"
                    value={filtros.cargo}
                    onChange={handleFiltroChange as any}
                  >
                    <option value="">Seleccionar</option>
                    {cargosUnicos.map((cargo, index) => (
                      <option key={index} value={cargo}>{cargo}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="filtroCorreo">
                  <Form.Label>Correo</Form.Label>
                  <Form.Control
                    as="select"
                    name="correo"
                    value={filtros.correo}
                    onChange={handleFiltroChange as any}
                  >
                    <option value="">Seleccionar</option>
                    {correosUnicos.map((correo, index) => (
                      <option key={index} value={correo}>{correo}</option>
                    ))}
                  </Form.Control>
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
                        <strong>Teléfono:</strong>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
    </>
  );
};

export default ListaCardEmpleados;