import React, { useState, useEffect } from 'react';
import { Form, Button, Modal, Alert} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../css/AprobarVacaciones.module.css';
import '../css/Tables.css'
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import { Vacacion } from '../routes/AprobarVacaciones';
import { format, parseISO, addDays } from 'date-fns';
import AprobarVacacionesModal from './AprobarVacacionesModal';
import { useAuth } from '../auth/AuthProvider';

interface ListaVacacionesProps {
  vacaciones: Vacacion[];
  fetchVacaciones: () => void;
}

const ListaAprobacionVacacaciones: React.FC<ListaVacacionesProps> = ({ vacaciones, fetchVacaciones }) => {
  const { cod_emp } = useAuth();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });
  const [searchVacacionID, setSearchVacacionID] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCodEmp, setSearchCodEmp] = useState('');
  const [searchFechaInicio, setSearchFechaInicio] = useState('');
  const [searchFechaFin, setSearchFechaFin] = useState('');
  const [searchEstado, setSearchEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVacacion, setSelectedVacacion] = useState<Vacacion | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [showAlreadyModal, setShowAlreadyModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const filteredData = sortedData.filter(item =>
    item.VacacionID.toString().includes(searchVacacionID) &&
    format(addDays(parseISO(item.FechaInicio.toString()), 1), 'dd/MM/yyyy').includes(searchFechaInicio) &&
    format(addDays(parseISO(item.FechaFin.toString()), 1), 'dd/MM/yyyy').includes(searchFechaFin) &&
    item.Estado.toLowerCase().includes(searchEstado.toLowerCase()) &&
    item.ci.toLowerCase().includes(searchCodEmp.toLowerCase()) &&
    item.apellidos.toLowerCase().includes(searchNombre.toLowerCase()) &&
    item.nombres.toLowerCase().includes(searchNombre.toLowerCase()) &&
    item.Estado.toLowerCase() !== 'borrado'
  );

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAction = (vacacion: Vacacion, action: 'approve' | 'reject') => {
    setSelectedVacacion(vacacion);
    setAction(action);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedVacacion) return;

    if (selectedVacacion.Estado.toLowerCase() === 'aprobada') {
      setShowAlreadyModal(true);
      setShowModal(false);
      return;
    }

    try {
      if (action === 'approve') {
        await axios.put(`/api/vacaciones/${selectedVacacion.VacacionID}/approve`, {
          cod_supervisor: cod_emp
        });
      } else {
        await axios.put(`/api/vacaciones/${selectedVacacion.VacacionID}/reject`);
      }
      fetchVacaciones();
      setError('');
      setShowModal(false);
    } catch (error) {
   
      if (axios.isAxiosError(error)) {
        console.error('Error:', error);
        const responseMessage = error.request?.response;
        if (responseMessage) {
          if (responseMessage.includes('ya ha sido aprobada')) {
            setShowModal(false);
            setShowAlreadyModal(true);
          } else if (responseMessage.includes('ya ha sido rechazada')) {
            setShowModal(false);
            setShowAlreadyModal(true);
            setAction('reject');
            setError(`Error ${action === 'approve' ? 'aprobando' : 'rechazando'} vacaciones: ${responseMessage}`);
          } else {
            setShowModal(false);
            setError(`Error ${action === 'approve' ? 'aprobando' : 'rechazando'} vacaciones: ${responseMessage}`);
          }
        } else {
          setShowModal(false);
          setError('Error desconocido al procesar la solicitud.');
        }
      
    }
    }
  };

  return (
    <>
    <div className='tablaAprobar'>
      
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
                type="select"
                placeholder='Buscar codigo...'
                value={searchCodEmp}
                onChange={(e) => setSearchCodEmp(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar Nombre..."
                value={searchFechaInicio}
                onChange={(e) => setSearchFechaInicio(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar Apellido..."
                value={searchNombre}
                onChange={(e) => setSearchNombre(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar Fecha ..."
                value={searchFechaInicio}
                onChange={(e) => setSearchFechaInicio(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar Fecha..."
                value={searchFechaFin}
                onChange={(e) => setSearchFechaFin(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar..."
                value={searchEstado}
                onChange={(e) => setSearchEstado(e.target.value)}
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
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('ci')} className='titulo'>
              Cédula
              {sortConfig.key === 'ci' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('nombres')} className='titulo'>
              Nombres
              {sortConfig.key === 'nombres' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('apellidos')} className='titulo'>
              Apellidos
              {sortConfig.key === 'apellidos' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('FechaInicio')} className='titulo'>
              Fecha Inicio
              {sortConfig.key === 'FechaInicio' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('FechaFin')} className='titulo'>
              Fecha Fin
              {sortConfig.key === 'FechaFin' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('Estado')} className='titulo'>
              Estado
              {sortConfig.key === 'Estado' && (
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
              <td>{item.ci}</td>
              <td>{item.nombres}</td>
              <td>{item.apellidos}</td>
              <td>{format(addDays(parseISO(item.FechaInicio.toString()), 1), 'dd/MM/yyyy')}</td>
              <td>{format(addDays(parseISO(item.FechaFin.toString()), 1), 'dd/MM/yyyy')}</td>
              <td>{item.Estado}</td>
              <td>
                {item.Estado === 'solicitada' && (
                  <div className={styles.acciones}>
                    <Button variant="success" onClick={() => handleAction(item, 'approve')}>
                      <FontAwesomeIcon icon={faCheck} />
                    </Button>
                    <Button variant="danger" onClick={() => handleAction(item, 'reject')}>
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      </div>

      {selectedVacacion && (
        <AprobarVacacionesModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          handleConfirm={handleConfirm}
          action={action}
          vacacionID={selectedVacacion.VacacionID}
          nombreEmpleado={`${selectedVacacion.nombres} ${selectedVacacion.apellidos}`}
          ci={selectedVacacion.ci}
          departamento={selectedVacacion.departamento}
          cargo={selectedVacacion.cargo}
          fechaInicio={format(addDays(parseISO(selectedVacacion.FechaInicio.toString()), 1), 'dd/MM/yyyy')}
          fechaFin={format(addDays(parseISO(selectedVacacion.FechaFin.toString()), 1), 'dd/MM/yyyy')}
          error={error}
          setError={setError}
        />
      )}
      
      <Modal show={showAlreadyModal} onHide={() => setShowAlreadyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Vacaciones ya {action === 'approve' ? 'aprobadas' : 'rechazadas'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            Estas vacaciones ya fueron {action === 'approve' ? 'aprobadas' : 'rechazadas'} anteriormente por otro supervisor. Cargue la página
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAlreadyModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ListaAprobacionVacacaciones;