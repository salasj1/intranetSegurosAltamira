import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from '../css/ListaVacaciones.module.css';
import Table from 'react-bootstrap/Table';
import EditarVacacionesModal from './EditarVacacionesModal';
import ConfirmarSolicitudModal from './ConfirmarSolicitudModal';
import ConfirmarEliminacionModal from './ConfirmarEliminacionModal';
import axios from 'axios';
import { Vacacion } from '../routes/SolicitarVacaciones';
import { format, parseISO, addDays, isBefore, isEqual } from 'date-fns';
import { useAuth } from '../auth/AuthProvider';

const apiUrl = import.meta.env.VITE_API_URL;

interface ListaVacacionesProps {
  vacaciones: Vacacion[];
  fetchVacaciones: () => void;
  hasPreviousRequest: boolean;
  checkPreviousRequest: () => void;
}

const ListaVacaciones: React.FC<ListaVacacionesProps> = ({ vacaciones, fetchVacaciones, hasPreviousRequest, checkPreviousRequest }) => {
  const { cod_emp } = useAuth();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });
  const [searchVacacionID, setSearchVacacionID] = useState('');
  const [searchFechaInicio, setSearchFechaInicio] = useState('');
  const [searchFechaFin, setSearchFechaFin] = useState('');
  const [searchEstado, setSearchEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVacacion, setSelectedVacacion] = useState<Vacacion | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [vacacionToSolicitar, setVacacionToSolicitar] = useState<Vacacion | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vacacionToDelete, setVacacionToDelete] = useState<Vacacion | null>(null);

  const [error, setError] = useState<string | null>(null); 
  useEffect(() => {
    fetchVacaciones();
    
  }, [hasPreviousRequest]);
  
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
    item.Estado.toLowerCase() !== 'borrado'
  );

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleEdit = (vacacion: Vacacion) => {
    setSelectedVacacion(vacacion);
    setShowModal(true);
  };

  const handleDelete = (vacacion: Vacacion) => {
    setVacacionToDelete(vacacion);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (vacacionToDelete !== null) {
      try {
        await axios.put(`${apiUrl}/vacaciones/${vacacionToDelete.VacacionID}/delete`);
        fetchVacaciones();
      } catch (error) {
        console.error('Error eliminando vacaciones:', error);
      }
    }
    setShowDeleteModal(false);
  };

  const handleSolicitar = async (vacacion: Vacacion) => {
    fetchVacaciones();
    await checkPreviousRequest();
    setVacacionToSolicitar(vacacion);
    console.log('hasPreviousRequest:', hasPreviousRequest);
    if ( !hasPreviousRequest) { 
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSolicitar = async () => {
    if (vacacionToSolicitar) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      const startDate = addDays(parseISO(vacacionToSolicitar.FechaInicio.toString()),1);
      const endDate = addDays(parseISO(vacacionToSolicitar.FechaFin.toString()),1);
      console.log('startDate:', startDate);
      console.log('endDate:', endDate);
      if (isBefore(startDate, today) && !isEqual(startDate, today)) {
        setError('La fecha de inicio no puede ser anterior a la fecha actual.');
        return;
      }

      if (isBefore(endDate, today) && !isEqual(endDate, today)) {
        setError('La fecha de fin no puede ser anterior a la fecha actual.');
        return;
      }

      if (isBefore(endDate, startDate)) {
        setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
        return;
      }

      try {
        const response = await axios.post(`${apiUrl}/vacaciones/revisionRangoCalendario`, {
          fechaInicio: startDate,
          fechaFin: endDate,
          cod_emp: cod_emp
        });
        const { status, resultado } = response.data;
        console.log(status, resultado);
        if (status === 0) {
          setError(resultado);
          return;
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setError(error.response.data.resultado || 'Error revisando los días disponibles.');
        } else {
          setError('Error revisando los días disponibles. Intente de nuevo');
        }
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/vacaciones/id/${cod_emp}`);
        const hasRequest = response.data.some((vacacion: any) => vacacion.Estado === 'solicitada');
        if (hasRequest) {
          setError('Ya tiene una solicitud de vacaciones pendiente. 2');
          return;
        }
      } catch (error) {
        console.error('Error al verificar solicitudes previas:', error);
        setError('Error al verificar solicitudes previas.');
        return;
      }
      if(!hasPreviousRequest){
        try {
          await axios.put(`${apiUrl}/vacaciones/${vacacionToSolicitar.VacacionID}/solicitar`);
          fetchVacaciones();
          setError(null); 
          checkPreviousRequest();
        } catch (error) {
          console.error('Error solicitando vacaciones:', error);
          setError('Error solicitando vacaciones');
        }
      }
    }
  };

  const handleCloseModal = () => {
    
    if (error!==undefined) {
      setShowModal(false);
    }
    
    fetchVacaciones();
  };

  return (
    <>
    <div className= {styles.tableVacaciones}>

    
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar por ID..."
                value={searchVacacionID}
                onChange={(e) => setSearchVacacionID(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar por Fecha..."
                value={searchFechaInicio}
                onChange={(e) => setSearchFechaInicio(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar por Fecha..."
                value={searchFechaFin}
                onChange={(e) => setSearchFechaFin(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar por Estado..."
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
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('FechaInicio')} className='titulo'>
              Fecha Inicio
              {sortConfig.key === 'FechaInicio' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('FechaFin')} className='titulo'>
              Fecha Fin
              {sortConfig.key === 'FechaFin' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('Estado')} className='titulo'>
              Estado
              {sortConfig.key === 'Estado' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
              )}
            </th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map(item => (
            <tr key={item.VacacionID}>
              <td>{item.VacacionID}</td>
              <td>{format(addDays(parseISO(item.FechaInicio.toString()), 1), 'dd/MM/yyyy')}</td>
              <td>{format(addDays(parseISO(item.FechaFin.toString()), 1), 'dd/MM/yyyy')}</td>
              <td>{item.Estado}</td>
              <td>
                {item.Estado === 'emitida' && (
                  <div className={styles.acciones}>
                    {!hasPreviousRequest && (
                        <Button variant="success" onClick={() => handleSolicitar(item)}>
                          Solicitar
                        </Button>
                    )}
                    <Button variant="warning" onClick={() => handleEdit(item)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                    <Button variant="danger" onClick={() => handleDelete(item)}>
                      <FontAwesomeIcon icon={faTrash} />
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
        <EditarVacacionesModal
          show={showModal}
          handleClose={handleCloseModal}
          vacacion={selectedVacacion}
          fetchVacaciones={fetchVacaciones}
          cod_emp={cod_emp}
        />
      )}

      {vacacionToSolicitar && (
        <ConfirmarSolicitudModal
          show={showConfirmModal}
          handleClose={() => setShowConfirmModal(false)}
          handleConfirm={handleConfirmSolicitar}
          cod_emp={cod_emp}
          error={error}
          setError={setError}
          vacacionID={vacacionToSolicitar.VacacionID}
          fechaInicio={addDays(parseISO(vacacionToSolicitar.FechaInicio.toString()), 1).toISOString()}
          fechaFin={addDays(parseISO(vacacionToSolicitar.FechaFin.toString()), 1).toISOString()}
        />
      )}

      {vacacionToDelete && (
        <ConfirmarEliminacionModal
          show={showDeleteModal}
          handleClose={() => setShowDeleteModal(false)}
          handleConfirm={handleConfirmDelete}
          vacacionID={vacacionToDelete.VacacionID}
          fechaInicio={format(addDays(parseISO(vacacionToDelete.FechaInicio.toString()), 1), 'dd/MM/yyyy')}
          fechaFin={format(addDays(parseISO(vacacionToDelete.FechaFin.toString()), 1), 'dd/MM/yyyy')}
        />
      )}
    </>
  );
};

export default ListaVacaciones;