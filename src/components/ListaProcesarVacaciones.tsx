import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../css/AprobarVacaciones.module.css';
import '../css/Tables.css';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import { Vacacion } from '../routes/ProcesarVacaciones';
import { format, parseISO, addDays } from 'date-fns';
import AprobarVacacionesModal from './AprobarVacacionesModal';
import { useAuth } from '../auth/AuthProvider';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



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
  const [searchEstado, setSearchEstado] = useState('');
  const [searchNombreSupervisor, setSearchNombreSupervisor] = useState('');
  const [searchApellidoSupervisor, setSearchApellidoSupervisor] = useState('');
  const [searchdiasDisfrutar, setDiasDisfrutar] = useState('');
  const [searchdiasPagar, setDiasPagar] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVacacion, setSelectedVacacion] = useState<Vacacion | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const { cod_emp } = useAuth();
  const [error, setError] = useState<string | null>('');
 
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

    const isFilterActive = 
      searchVacacionID || 
      searchFechaInicio || 
      searchFechaFin || 
      searchCodEmp || 
      searchApellido || 
      searchNombre || 
      searchdiasDisfrutar || 
      searchdiasPagar || 
      searchEstado || 
      searchNombreSupervisor || 
      searchApellidoSupervisor;

    return (
      (item.Estado === 'Aprobada' || item.Estado === 'Procesada') &&
      (!isFilterActive || (
        item.VacacionID.toString().includes(searchVacacionID) &&
        fechaInicioFormateada.includes(searchFechaInicio) &&
        fechaFinFormateada.includes(searchFechaFin) &&
        item.ci.toLowerCase().includes(searchCodEmp.toLowerCase()) &&
        item.apellidos_empleado.toLowerCase().includes(searchApellido.toLowerCase()) &&
        item.nombres_empleado.toLowerCase().includes(searchNombre.toLowerCase()) &&
        item.diasDisfrutar.toString().includes(searchdiasDisfrutar) &&
        item.diasPagar.toString().includes(searchdiasPagar) &&
        item.Estado.toLowerCase().includes(searchEstado.toLowerCase()) &&
        (item.nombres_supervisor?.toLowerCase().includes(searchNombreSupervisor.toLowerCase()) || (!isFilterActive && item.nombres_supervisor === null)) &&
        (item.apellidos_supervisor?.toLowerCase().includes(searchApellidoSupervisor.toLowerCase()) || (!isFilterActive && item.apellidos_supervisor === null))
      ))
    );
  });

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

  const handleProcess = async (vacacion: Vacacion) => {
    const toastId = toast.loading('Procesando solicitud...');
    try {
      await axios.put(`${apiUrl}/vacaciones/${vacacion.VacacionID}/process`, {
        cod_RRHH: cod_emp,
        sCod_emp: vacacion.cod_emp,
        sdDesde: vacacion.FechaInicio,
        sdHasta: vacacion.FechaFin
      });
      fetchVacaciones();
      toast.update(toastId, {
        render: '¡Vacaciones procesadas satisfactoriamente!',
        type: 'success',
        isLoading: false,
        autoClose: 4000,
      });
    } catch (error) {
      console.error('Error procesando vacaciones:', error);
      setError('Error procesando vacaciones');
      toast.update(toastId, {
        render: 'Error al procesar las vacaciones.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
      if (axios.isAxiosError(error)) {
        if (error.request?.response === 'La vacación ya ha sido procesada') {
          setError('Error procesando vacaciones: La vacación ya ha sido procesada');
        }
        if (error.response?.data.message === 'La vacación ya ha sido emitida') {
          setError('Error procesando vacaciones: La vacación ya ha sido emitida');
        }
      }
    }
  };

    const handleConfirm = async () => {
    if (!selectedVacacion) return;
    const toastId = toast.loading('Procesando solicitud...');
    try {
      if (action === 'approve') {
        await axios.put(`${apiUrl}/vacaciones/${selectedVacacion.VacacionID}/approve`, {
          cod_supervisor: cod_emp
        });
        toast.update(toastId, {
          render: '¡Vacaciones aprobadas satisfactoriamente!',
          type: 'success',
          isLoading: false,
          autoClose: 4000,
        });
      } else {
        await axios.put(`${apiUrl}/vacaciones/${selectedVacacion.VacacionID}/reject2`, {
          cod_RRHH: cod_emp
        });
        toast.update(toastId, {
          render: '¡Vacaciones rechazadas satisfactoriamente!',
          type: 'success',
          isLoading: false,
          autoClose: 4000,
        });
      }
      fetchVacaciones();
      setError('');
      setShowModal(false);
    } catch (error) {
      setShowModal(false);
      toast.update(toastId, {
        render: 'Error al procesar la solicitud.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
      if (axios.isAxiosError(error)) {
        if (error.request?.response === 'La vacación ya ha sido procesada') {
          setError(`Error ${action === 'approve' ? 'procesando' : 'devolviendo'} vacaciones: La vacación ya ha sido procesada`);
        } else if (error.request?.response === 'La vacación ya ha sido rechazada') {
          setError(`Error ${action === 'approve' ? 'procesando' : 'devolviendo'} vacaciones: La vacación ya ha sido rechazada`);
        } else {
          setError(`Error ${action === 'approve' ? 'procesando' : 'devolviendo'} vacaciones: ${error.message}`);
        }
      }
    }
  };

  return (
    <>
        <ToastContainer
        closeOnClick
        autoClose={4000}
        pauseOnFocusLoss={false}
        theme="colored"
        style={{ zIndex: 9999 }}
      />
      <div className='tablaAprobar'>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <strong>Error:</strong> {error}
          </Alert>)
        }
        <Table striped bordered hover responsive>
          <thead >
            <tr>
              {/* ID Vacación */}
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar ID..."
                  value={searchVacacionID}
                  onChange={(e) => setSearchVacacionID(e.target.value)}
                />
              </th>
              {/* Cédula */}
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar código..."
                  value={searchCodEmp}
                  onChange={(e) => setSearchCodEmp(e.target.value)}
                />
              </th>
              {/* Nombres */}
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Nombre..."
                  value={searchNombre}
                  onChange={(e) => setSearchNombre(e.target.value)}
                />
              </th>
              {/* Apellidos */}
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Apellido..."
                  value={searchApellido}
                  onChange={(e) => setSearchApellido(e.target.value)}
                />
              </th>
              {/* Nombres del Supervisor */}
              <th className={styles.stickyHead}>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Nombre Supervisor..."
                  value={searchNombreSupervisor}
                  onChange={(e) => setSearchNombreSupervisor(e.target.value)}
                />
              </th>
              {/* Apellido del Supervisor */}
              <th className={styles.stickyHead}>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Apellido Supervisor..."
                  value={searchApellidoSupervisor}
                  onChange={(e) => setSearchApellidoSupervisor(e.target.value)}
                />
              </th>
              {/* Fecha de Inicio */}
              <th >
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Fecha Inicio..."
                  value={searchFechaInicio}
                  onChange={(e) => setSearchFechaInicio(e.target.value)}
                />
              </th>
              {/* Fecha Fin */}
              <th >
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Fecha Fin..."
                  value={searchFechaFin}
                  onChange={(e) => setSearchFechaFin(e.target.value)}
                />
              </th>
              {/* Fecha de Retorno */}
              <th >
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Fecha Retorno..."
                  value={searchFechaRetorno}
                  onChange={(e) => setSearchFechaRetorno(e.target.value)}
                />
              </th>
              {/* Días a Disfrutar */}
              <th >
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar por Cantidad de días..."
                  value={searchdiasDisfrutar}
                  onChange={(e) => setDiasDisfrutar(e.target.value)}
                />
              </th>
              {/* Días a Pagar */}
              <th >
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar por Cantidad de días..."
                  value={searchdiasPagar}
                  onChange={(e) => setDiasPagar(e.target.value)}
                />
              </th>
              {/* Estado */}
              <th >
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Estado..."
                  value={searchEstado}
                  onChange={(e) => setSearchEstado(e.target.value)}
                />
              </th>
              {/* Acciones */}
              <th ></th>
            </tr>
          </thead>
          <thead className={styles.stickyHead}>
            <tr>
              {/* ID Vacación */}
              <th id={styles.headTable} onClick={() => requestSort('VacacionID')} className='titulo'>
                ID Vacación
                {sortConfig.key === 'VacacionID' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }} />
                )}
              </th>
              {/* Cédula */}
              <th id={styles.headTable} onClick={() => requestSort('ci')} className='titulo'>
                Cédula
                {sortConfig.key === 'ci' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              {/* Nombres */}
              <th id={styles.headTable} onClick={() => requestSort('nombres_empleado')} className='titulo' style={{ marginLeft:"5px" }}>
                Nombres
                {sortConfig.key === 'nombres_empleado' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              {/* Apellidos */}
              <th id={styles.headTable} onClick={() => requestSort('apellidos_empleado')} className='titulo' style={{ marginLeft:"5px" }}>
                Apellidos
                {sortConfig.key === 'apellidos_empleado' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }} />
                )}
              </th>
              {/* Nombres del Supervisor */}
              <th id={styles.headTable} onClick={() => requestSort('nombres_supervisor')} className='titulo' style={{ marginLeft:"5px" }}>
                Nombres del Supervisor
                {sortConfig.key === 'nombres_supervisor' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              {/* Apellidos del Supervisor */}
              <th id={styles.headTable} onClick={() => requestSort('apellidos_supervisor')} className='titulo' style={{ marginLeft:"5px" }}>
                Apellidos del Supervisor
                {sortConfig.key === 'apellidos_supervisor' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              {/* Fecha de Inicio */}
              <th id={styles.headTable} onClick={() => requestSort('FechaInicio')} className='titulo' style={{ marginLeft:"5px" }}>
                Fecha Inicio
                {sortConfig.key === 'FechaInicio' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              {/* Fecha Fin */}
              <th id={styles.headTable} onClick={() => requestSort('FechaFin')} className='titulo' style={{ marginLeft:"5px" }}>
                Fecha Fin
                {sortConfig.key === 'FechaFin' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              {/* Fecha de Retorno */}
              <th id={styles.headTable} onClick={() => requestSort('FechaRetorno')} className='titulo' style={{ marginLeft:"5px" }}>
                Fecha Retorno
                {sortConfig.key === 'FechaRetorno' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              {/* Días a Disfrutar */}
              <th id={styles.headTable} onClick={() => requestSort('diasDisfrutar')} className='titulo' style={{ marginLeft:"5px" }}>
                Cantidad días a Disfrutar
                {sortConfig.key === 'diasDisfrutar' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              {/* Días a Pagar */}
              <th id={styles.headTable} onClick={() => requestSort('diasPagar')} className='titulo' style={{ marginLeft:"5px" }}>
                Cantidad días a Pagar
                {sortConfig.key === 'diasPagar' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              {/* Estado */}
              <th id={styles.headTable} onClick={() => requestSort('Estado')} className='titulo' style={{ marginLeft:"5px" }}>
                Estado
                {sortConfig.key === 'Estado' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft:"5px" }}/>
                )}
              </th>
              {/* Acciones */}
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map(item => (
              <tr key={item.VacacionID}>
                <td>{item.VacacionID}</td>
                <td>{item.ci}</td>
                <td>{item.nombres_empleado}</td>
                <td>{item.apellidos_empleado}</td>
                <td>{item.nombres_supervisor}</td>
                <td>{item.apellidos_supervisor}</td>
                <td>{format(addDays(parseISO(item.FechaInicio.toString()), 1), 'dd/MM/yyyy')}</td>
                <td>{format(addDays(parseISO(item.FechaFin.toString()), 1), 'dd/MM/yyyy')}</td>
                <td>
                  {item.FechaRetorno
                    ? format(addDays(parseISO(item.FechaRetorno.toString()), 1), 'dd/MM/yyyy')
                    : 'Sin definir'}
                </td>
                <td>{item.diasDisfrutar}</td>
                <td>{item.diasPagar}</td>
                <td>{item.Estado}</td>
                <td>
                  {
                    item.Estado === 'Aprobada' && (
                      <div className={styles.acciones}>
                        <Button variant="success" onClick={() => handleProcess(item)}>
                          <FontAwesomeIcon icon={faCheck} />
                        </Button>
                        <Button variant="danger" onClick={() => handleAction(item, 'reject')}>
                          <FontAwesomeIcon icon={faTimes} />
                        </Button>
                      </div>
                    )
                  }
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
          DiasVacaciones={selectedVacacion.diasDisfrutar}
          vacacionID={selectedVacacion.VacacionID}
          nombreEmpleado={`${selectedVacacion.nombres_empleado} ${selectedVacacion.apellidos_empleado}`}
          ci={selectedVacacion.ci}
          departamento={selectedVacacion.departamento}
          cargo={selectedVacacion.cargo}
          fechaInicio={format(addDays(parseISO(selectedVacacion.FechaInicio.toString()), 1), 'dd/MM/yyyy')}
          fechaFin={format(addDays(parseISO(selectedVacacion.FechaFin.toString()), 1), 'dd/MM/yyyy')}
          error={error}
          setError={setError}
        />
      )}
    </>
  );
};

export default ListaProcesarVacacaciones;