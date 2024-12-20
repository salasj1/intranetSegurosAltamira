import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faEdit } from '@fortawesome/free-solid-svg-icons';
import styles from '../css/AprobarVacaciones.module.css';
import '../css/Tables.css';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import { Vacacion } from '../routes/RetornoVacaciones';
import { format, parseISO, addDays, isValid } from 'date-fns';
import AprobarVacacionesModal from './AprobarVacacionesModal';
import { useAuth } from '../auth/AuthProvider';
import ModalRetonarDias from './ModalRetonarDias';

interface ListaVacacionesProps {
  vacaciones: Vacacion[];
  fetchVacaciones: () => void;
}

const apiUrl = import.meta.env.VITE_API_URL;

const ListaProcesarVacacaciones: React.FC<ListaVacacionesProps> = ({ vacaciones, fetchVacaciones }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });
  const [searchVacacionID, setSearchVacacionID] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchApellido, setSearchApellido] = useState('');
  const [searchCodEmp, setSearchCodEmp] = useState('');
  const [searchFechaInicio, setSearchFechaInicio] = useState('');
  const [searchFechaFin, setSearchFechaFin] = useState('');
  const [searchFechaRetorno, setSearchFechaRetorno] = useState('');
  const [searchCedula, setSearchCedula] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVacacion, setSelectedVacacion] = useState<Vacacion | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const { cod_emp } = useAuth();
  const [error, setError] = useState<string | null>('');
  useEffect(() => {
    fetchVacaciones();
  }, []);

  const sortedData = [...vacaciones].sort((a: Vacacion, b: Vacacion) => {
    if (sortConfig.key) {
      let aValue = a[sortConfig.key as keyof Vacacion];
      let bValue = b[sortConfig.key as keyof Vacacion];

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
    const fechaInicioFormateada = format(addDays(parseISO(item.FechaInicio.toString()), 1), 'dd/MM/yyyy');
    const fechaFinFormateada = format(addDays(parseISO(item.FechaFin.toString()), 1), 'dd/MM/yyyy');
    const fechaRetornoFormateada = item.FechaRetorno && isValid(parseISO(item.FechaRetorno.toString())) 
      ? format(addDays(parseISO(item.FechaRetorno.toString()), 1), 'dd/MM/yyyy') 
      : '';
    return (
      item.VacacionID.toString().includes(searchVacacionID) &&
      fechaInicioFormateada.includes(searchFechaInicio) &&
      fechaFinFormateada.includes(searchFechaFin) &&
      fechaRetornoFormateada.includes(searchFechaRetorno) &&
      item.cod_emp.toLowerCase().includes(searchCodEmp.toLowerCase()) &&
      item.cedula.toLowerCase().includes(searchCedula.toLowerCase()) &&
      item.nombres_empleado.toLowerCase().includes(searchNombre.toLowerCase()) &&
      item.apellidos_empleado.toLowerCase().includes(searchApellido.toLowerCase()) 
    );
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAction = (vacacion: Vacacion) => {
    setSelectedVacacion(vacacion);
    setAction(action);
    setShowModal(true);
  };

  const handleConfirm = async (vacacion: Vacacion) => {
    try {
      await axios.put(`${apiUrl}/retornoVacaciones`, {
        VacacionID: vacacion.VacacionID,
        FechaRetorno:addDays(vacacion.FechaRetorno,-1)
      });
      fetchVacaciones();
      setShowModal(false);
    } catch (error) {
      console.error('Error devolviendo vacaciones:'+error);
      if (axios.isAxiosError(error)) {
        setError(`Error devolviendo vacaciones: ${error.message}`);
      }
      
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVacacion(null);
  };

  return (
    <>
      <div className='tablaAprobar'>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <strong>Error:</strong> {error}
          </Alert>)
        }
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar ID..."
                  value={searchVacacionID}
                  onChange={(e) => setSearchVacacionID(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar código..."
                  value={searchCodEmp}
                  onChange={(e) => setSearchCodEmp(e.target.value)}
                />
              </th>
              <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar Cedula..."
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
                placeholder="Buscar Fecha Inicio..."
                value={searchFechaInicio}
                onChange={(e) => setSearchFechaInicio(e.target.value)}
              />
              </th>
              <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar Fecha Fin..."
                value={searchFechaFin}
                onChange={(e) => setSearchFechaFin(e.target.value)}
              />
              </th>
              <th>
                <Form.Control
                    className={styles.search}
                    type="text"
                    placeholder="Buscar Fecha Retorno..."
                    value={searchFechaRetorno}
                    onChange={(e) => setSearchFechaRetorno(e.target.value)}
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <thead>
            <tr>
              
              <th id={styles.headTable} onClick={() => requestSort('VacacionID')} className='titulo'>
                ID Vacación
                {sortConfig.key === 'VacacionID' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('cod_emp')} className='titulo'>
                Codigo del Empleado
                {sortConfig.key === 'cod_emp' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('cedula')} className='titulo'>
                Cédula
                {sortConfig.key === 'cedula' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('nombres_empleado')} className='titulo' style={{ marginLeft:"5px" }}>
                Nombres
                {sortConfig.key === 'nombres_empleado' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('apellidos_empleado')} className='titulo' style={{ marginLeft:"5px" }}>
                Apellidos
                {sortConfig.key === 'apellidos_empleado' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('FechaInicio')} className='titulo' style={{ marginLeft:"5px" }}>
                Fecha Inicio
                {sortConfig.key === 'FechaInicio' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('FechaFin')} className='titulo' style={{ marginLeft:"5px" }}>
                Fecha Fin
                {sortConfig.key === 'FechaFin' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('FechaRetorno')} className='titulo' style={{ marginLeft:"5px" }}>
                Fecha Retorno
                {sortConfig.key === 'FechaRetorno' && (
                    <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map(item => (
              <tr key={item.VacacionID}>
                <td>{item.VacacionID}</td>
                <td>{item.cod_emp}</td>
                <td>{item.cedula}</td>
                <td>{item.nombres_empleado}</td>
                <td>{item.apellidos_empleado}</td>
                <td>{format(addDays(parseISO(item.FechaInicio.toString()), 1), 'dd/MM/yyyy')}</td>
                <td>{format(addDays(parseISO(item.FechaFin.toString()), 1), 'dd/MM/yyyy')}</td>
                <td>{item.FechaRetorno && isValid(parseISO(item.FechaRetorno.toString())) ? format(addDays(parseISO(item.FechaRetorno.toString()), 1), 'dd/MM/yyyy') : ''}</td>
                <td>
                  {
                    <div className={styles.acciones}>
                    <Button variant="primary" onClick={() => handleAction(item)}>
                        <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    </div>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {selectedVacacion && (
        <ModalRetonarDias
          show={showModal}
          onClose={handleCloseModal}
          vacacion={selectedVacacion}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default ListaProcesarVacacaciones;