import { useEffect, useState } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import { useAuth } from '../auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faArrowDown, faArrowUp, faEye } from '@fortawesome/free-solid-svg-icons';
import { addDays, format, parseISO } from 'date-fns';
import axios from 'axios';
import styles from '../css/ListaAprobacionPermisos.module.css'; 
import ModalConfirmacion from './ModalConfirmacion';
import ModalDescripcionPermiso from './ModalDescripcionPermiso';

interface Permiso {
  PermisosID: number;
  cod_emp: string;
  Fecha_inicio: string;
  Fecha_Fin: string;
  Titulo: string;
  Motivo: string;
  Estado: string | string[];
  descripcion: string;
  ci: string;
  nombres: string;
  apellidos: string;
}

interface ListaPermisosProps {
  permisos: Permiso[];
  fetchPermisos: () => void;
}

const ListaProcesarPermisos: React.FC<ListaPermisosProps> = ({ permisos, fetchPermisos }) => {
  const { cod_emp } = useAuth();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });
  const [searchPermisosID, setSearchPermisosID] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchApellido, setSearchApellido] = useState('');
  const [searchCi, setSearchCi] = useState('');
  const [searchTitulo, setSearchTitulo] = useState('');
  const [searchFechaInicio, setSearchFechaInicio] = useState('');
  const [searchFechaFin, setSearchFechaFin] = useState('');
  const [searchEstado, setSearchEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState<Permiso | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [showDescripcion, setShowDescripcion] = useState(false);
  const [error, setError] = useState<string | null>('');

  useEffect(() => {
    fetchPermisos();
  }, []);

  useEffect(() => {
    console.log('Permisos:', permisos); // Verificar los datos recibidos
  }, [permisos]);

  const sortedData = [...permisos].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key as keyof Permiso];
      const bValue = b[sortConfig.key as keyof Permiso];

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
    const estadoString = Array.isArray(item.Estado) ? [...new Set(item.Estado)].join(' ') : item.Estado;
    return (
      item.PermisosID?.toString().includes(searchPermisosID) &&
      format(addDays(parseISO(item.Fecha_inicio?.toString()), 1), 'dd/MM/yyyy').includes(searchFechaInicio) &&
      format(addDays(parseISO(item.Fecha_Fin?.toString()), 1), 'dd/MM/yyyy').includes(searchFechaFin) &&
      (typeof estadoString === 'string' && estadoString.toLowerCase().includes(searchEstado.toLowerCase())) &&
      item.ci?.toLowerCase().includes(searchCi.toLowerCase()) &&
      item.nombres?.toLowerCase().includes(searchNombre.toLowerCase()) &&
      item.apellidos?.toLowerCase().includes(searchApellido.toLowerCase()) &&
      item.Titulo?.toLowerCase().includes(searchTitulo.toLowerCase()) &&
      estadoString?.toLowerCase() !== 'borrado'
    );
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAction = (permiso: Permiso, action: 'approve' | 'reject') => {
    setSelectedPermiso(permiso);
    setAction(action);
    setShowModal(true);
  };

  const handleLeerDescripcion = (permiso: Permiso) => {
    setSelectedPermiso(permiso);
    setShowDescripcion(true);
  };

  const handleConfirm = async (setError: (message: string) => void) => {
    if (!selectedPermiso) return;
  
    try {
      if (action === 'approve') {
        await axios.put(`/api/permisos/${selectedPermiso.PermisosID}/process`, {
          cod_RRHH: cod_emp
        });
      } else {
        await axios.put(`/api/permisos/${selectedPermiso.PermisosID}/reject`, {
          cod_supervisor: cod_emp
        });
      }
      fetchPermisos();
      setShowModal(false);
    } catch (error) {
      console.error(`Error ${action === 'approve' ? 'procesando' : 'rechazando'} permiso`);
      if (axios.isAxiosError(error)) {
        setError(`Error ${action === 'approve' ? 'procesando' : 'rechazando'} permiso: ${error.response?.data.message || error.message}`);
      } else if (error instanceof Error) {
        setError(`Error ${action === 'approve' ? 'procesando' : 'rechazando'} permiso: ${error.message}`);
      } else {
        setError(`Error ${action === 'approve' ? 'procesando' : 'rechazando'} permiso: ${String(error)}`);
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
                  value={searchPermisosID}
                  onChange={(e) => setSearchPermisosID(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Cédula..."
                  value={searchCi}
                  onChange={(e) => setSearchCi(e.target.value)}
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
                  placeholder="Buscar Apellidos..."
                  value={searchApellido}
                  onChange={(e) => setSearchApellido(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Título..."
                  value={searchTitulo}
                  onChange={(e) => setSearchTitulo(e.target.value)}
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
                  placeholder="Buscar Estado..."
                  value={searchEstado}
                  onChange={(e) => setSearchEstado(e.target.value)}
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <thead>
            <tr>
              <th id={styles.headTable} onClick={() => requestSort('PermisosID')} className='titulo'>
                ID Permiso
                {sortConfig.key === 'PermisosID' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('ci')} className='titulo'>
                Cédula
                {sortConfig.key === 'ci' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('nombres')} className='titulo'>
                Nombres
                {sortConfig.key === 'nombres' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('apellidos')} className='titulo'>
                Apellidos
                {sortConfig.key === 'apellidos' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('Titulo')} className='titulo'>
                Título
                {sortConfig.key === 'Titulo' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('Fecha_inicio')} className='titulo'>
                Fecha Inicio
                {sortConfig.key === 'Fecha_inicio' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
                )}
              </th>
              <th id={styles.headTable} onClick={() => requestSort('Fecha_Fin')} className='titulo'>
                Fecha Fin
                {sortConfig.key === 'Fecha_Fin' && (
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
            {filteredData.map((permiso) => (
              <tr key={permiso.PermisosID}>
                <td>{permiso.PermisosID}</td>
                <td>{permiso.ci}</td>
                <td>{permiso.nombres}</td>
                <td>{permiso.apellidos}</td>
                <td>{permiso.Titulo}</td>
                <td>{format(addDays(parseISO(permiso.Fecha_inicio.toString()), 1), 'dd/MM/yyyy')}</td>
                <td>{format(addDays(parseISO(permiso.Fecha_Fin.toString()), 1), 'dd/MM/yyyy')}</td>
                <td>{Array.isArray(permiso.Estado) ? [...new Set(permiso.Estado)].join(' ') : permiso.Estado}</td>
                <td>
                  <div className={styles.acciones}>
                    <Button variant="primary" onClick={() => handleLeerDescripcion(permiso)}>
                      <FontAwesomeIcon icon={faEye} color='white' />
                    </Button>
                    {permiso.Estado === 'Pendiente' && (
                      <>
                        <Button variant="success" onClick={() => handleAction(permiso, 'approve')}><FontAwesomeIcon icon={faCheck} /></Button>
                        <Button variant="danger" onClick={() => handleAction(permiso, 'reject')}><FontAwesomeIcon icon={faTimes} /></Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      <ModalDescripcionPermiso
        show={showDescripcion}
        onHide={() => setShowDescripcion(false)}
        permiso={selectedPermiso}
        fetchPermisos={fetchPermisos}
        context="procesar" 
        error={error}
        setError={setError}
      />

      <ModalConfirmacion
        show={showModal}
        onHide={() => setShowModal(false)}
        onConfirm={handleConfirm}
        permiso={selectedPermiso}
        action={action}
        error={error}
        setError={setError} // Pasar setError como prop
      />
    </>
  );
};

export default ListaProcesarPermisos;