import { Alert, Button, Form, Table } from "react-bootstrap";
import styles from '../css/AprobarVacaciones.module.css';
import '../css/Tables.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";
import { Empleado } from "../routes/ControlAutorizacion";
import AgregarSupervisionModal from "./AgregarSupervisionModal";
import ModalEditSupervision from "./ModalEditSupervision";
import ModalDeleteSupervision from "./ModalDeleteSupervisor";
import { FaPencilAlt, FaTrash } from "react-icons/fa";

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
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [error, setError] = useState<string | null>('');
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
      const response=await fetch('/api/empleados/supervision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ supervisor, supervisados, tipo }),
      });
      setError('');
      if(response.status===500){
        setError('Error agregando supervisión');
        console.error('Error agregando supervisión:', response);
    
        return;
      }
      console.log(error);
      fetchEmpleados();
    } catch (error) {
      setError('Error agregando supervisión');
      console.error('Error agregando supervisión:', error);
    }
  };

  const handleModifySupervision = async (ID_SUPERVISION: number, Tipo: string) => {
    try {
      await fetch('/api/empleados/supervision/Tipo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ID_SUPERVISION, Tipo }),
      });
      fetchEmpleados();
    } catch (error) {
      console.error('Error modificando supervisión:', error);
    }
  };

  const handleDeleteSupervision = async (ID_SUPERVISION: number) => {
    try {
      await fetch('/api/empleados/supervision', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ID_SUPERVISION }),
      });
      fetchEmpleados();
    } catch (error) {
      console.error('Error eliminando supervisión:', error);
    }
  };

  const handleEditClick = (empleado: Empleado) => {
    setSelectedEmpleado(empleado);
    setShowModalEdit(true);
  };

  const handleDeleteClick = (empleado: Empleado) => {
    setSelectedEmpleado(empleado);
    setShowModalDelete(true);
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
        {error && (<><br /><Alert variant="danger"  onClose={() => setError('')}  dismissible>{error}</Alert></>)}
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
                  <div className="d-flex justify-content-center gap-2">
                    <Button variant="primary" onClick={() => handleEditClick(item)}>
                      <FaPencilAlt />
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteClick(item)}>
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {selectedEmpleado && (
        <ModalEditSupervision
          show={showModalEdit}
          handleClose={() => setShowModalEdit(false)}
          cod_supervisor={selectedEmpleado.cod_supervisor}
          cod_emp={selectedEmpleado.cod_emp.toString()}
          handleEdit={handleModifySupervision}
        />
      )}
      {selectedEmpleado && (
        <ModalDeleteSupervision
          show={showModalDelete}
          handleClose={() => setShowModalDelete(false)}
          cod_supervisor={selectedEmpleado.cod_supervisor}
          cod_emp={selectedEmpleado.cod_emp.toString()}
          handleDelete={handleDeleteSupervision}
        />
      )}
    </>
  );
}

export default ListaAutorizacionEmpleados;