import { Button, Form, Table } from "react-bootstrap";
import styles from '../css/AprobarVacaciones.module.css';
import '../css/Tables.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";
import { Empleado } from "../routes/ControlAutorizacion";
import AgregarSupervisionModal from "./AgregarSupervisionModal";

interface ListaVacacionesProps {
  empleados: Empleado[];
  fetchEmpleados: () => void;
}

const ListaAutorizacionEmpleados: React.FC<ListaVacacionesProps> = ({ empleados, fetchEmpleados }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });
  const [searchCedula, setSearchCedula] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchApellido, setSearchApellido] = useState('');
  const [searchCedula_supervisor, setSearchCedula_supervisor] = useState('');
  const [searchNombreSupervisor, setSearchNombreSupervisor] = useState('');
  const [searchApellidoSupervisor, setSearchApellidoSupervisor] = useState('');
  const [searchTipo, setSearchTipo] = useState('');
  const [searchNomina, setSearchNomina] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...empleados].sort((a: Empleado, b: Empleado) => {
    if (sortConfig.key) {
      let aValue = a[sortConfig.key as keyof Empleado];
      let bValue = b[sortConfig.key as keyof Empleado];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredData = sortedData.filter(item => {
    return (
      item.cedula_empleado?.toString().includes(searchCedula) &&
      item.nombres_empleado?.toLowerCase().includes(searchNombre.toLowerCase()) &&
      item.apellidos_empleado?.toLowerCase().includes(searchApellido.toLowerCase()) &&
      item.cedula_supervisor?.toString().includes(searchCedula_supervisor) &&
      item.nombres_supervisor?.toLowerCase().includes(searchNombreSupervisor.toLowerCase()) &&
      item.apellidos_supervisor?.toLowerCase().includes(searchApellidoSupervisor.toLowerCase()) &&
      item.Tipo?.toString().includes(searchTipo) &&
      item.Nomina?.toLowerCase().includes(searchNomina.toLowerCase())
    );
  });

  const handleSaveSupervision = async (supervisor: string, supervisados: string[], tipo: string) => {
    try {
      await fetch('/api/empleados/supervision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ supervisor, supervisados, tipo }),
      });
      fetchEmpleados();
    } catch (error) {
      console.error('Error agregando supervisión:', error);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={() => setShowModal(true)}>Agregar Nueva Supervisión</Button>
      <AgregarSupervisionModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleSaveSupervision}
        empleadosLista={empleados}
      />
      <div className='tablaAprobar'>
        <Table striped bordered hover responsive>
          <thead>
            <tr>              
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar cedula..."
                  value={searchCedula_supervisor}
                  onChange={(e) => setSearchCedula_supervisor(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Nombre..."
                  value={searchNombreSupervisor}
                  onChange={(e) => setSearchNombreSupervisor(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Apellido..."
                  value={searchApellidoSupervisor}
                  onChange={(e) => setSearchApellidoSupervisor(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar cedula..."
                  value={searchCedula}
                  onChange={(e) => setSearchCedula(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Nombre..."
                  value={searchNombre}
                  onChange={(e) => setSearchNombre(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Apellido..."
                  value={searchApellido}
                  onChange={(e) => setSearchApellido(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Tipo de Nivel..."
                  value={searchTipo}
                  onChange={(e) => setSearchTipo(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Nomina..."
                  value={searchNomina}
                  onChange={(e) => setSearchNomina(e.target.value)}
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <thead>
            <tr>
              
              <th id={styles.headTable} onClick={() => requestSort('cedula_supervisor')} className='titulo' style={{ marginLeft: "5px" }}>
                Cédula Supervisor
                {sortConfig.key === 'cedula_supervisor' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft: "5px" }} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('nombres_supervisor')} className='titulo' style={{ marginLeft: "5px" }}>
                Nombre Supervisor
                {sortConfig.key === 'nombres_supervisor' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft: "5px" }} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('apellidos_supervisor')} className='titulo' style={{ marginLeft: "5px" }}>
                Apellido Supervisor
                {sortConfig.key === 'apellidos_supervisor' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft: "5px" }} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('cedula')} className='titulo'>
                Cédula Empleado
                {sortConfig.key === 'cedula' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft: "5px" }} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('nombres_empleado')} className='titulo' style={{ marginLeft: "5px" }}>
                Nombre Empleado
                {sortConfig.key === 'nombres_empleado' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft: "5px" }} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('apellidos_empleado')} className='titulo' style={{ marginLeft: "5px" }}>
                Apellido Empleado
                {sortConfig.key === 'apellidos_empleado' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft: "5px" }} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('Tipo')} className='titulo' style={{ marginLeft: "5px" }}>
                Tipo
                {sortConfig.key === 'Tipo' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft: "5px" }} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('Nomina')} className='titulo' style={{ marginLeft: "5px" }}>
                Nomina
                {sortConfig.key === 'Nomina' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft: "5px" }} />
                )}
              </th>
              
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item, index) => (
              <tr key={`${item.cod_emp}-${index}`}>
                
                <td>{item.cedula_supervisor}</td>
                <td>{item.nombres_supervisor}</td>
                <td>{item.apellidos_supervisor}</td>
                <td>{item.cedula_empleado}</td>
                <td>{item.nombres_empleado}</td>
                <td>{item.apellidos_empleado}</td>
                <td>{item.Tipo}</td>
                <td>{item.Nomina}</td>
                <td>
                  {/* Aquí puedes añadir botones de acción */}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default ListaAutorizacionEmpleados;