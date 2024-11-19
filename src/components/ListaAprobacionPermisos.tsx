import React, { useState, useEffect } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faArrowDown, faArrowUp, faEye } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { format, addDays, parseISO } from 'date-fns';
import { useAuth } from '../auth/AuthProvider';
import styles from '../css/ListaAprobacionPermisos.module.css';
import '../css/Tables.css';
import ModalConfirmacionPermiso from './ModalConfirmacionPermiso';
import ModalDescripcionPermiso from './ModalDescripcionPermiso';

interface Permiso {
  PermisosID: number;
  cod_emp: string;
  Fecha_inicio: string;
  Fecha_Fin: string;
  Titulo: string;
  Motivo: string;
  Estado: string;
  descripcion: string;
  ci: string;
  nombres: string;
  apellidos: string;
  departamento: string;
  cargo: string;
}

interface ListaPermisosProps {
  permisos: Permiso[];
  fetchPermisos: () => void;
}

const ListaAprobacionPermisos: React.FC<ListaPermisosProps> = ({ permisos, fetchPermisos }) => {
  const { cod_emp } = useAuth();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });
  const [searchPermisosID, setSearchPermisosID] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCodEmp, setSearchCodEmp] = useState('');
  const [searchFechaInicio, setSearchFechaInicio] = useState('');
  const [searchFechaFin, setSearchFechaFin] = useState('');
  const [searchEstado, setSearchEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState<Permiso | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [showDescripcion, setShowDescripcion] = useState(false);
  const [error, setError] = useState<string | null>('');
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetchPermisos();
  }, []);

  const sortedData = [...permisos].sort((a: Permiso, b: Permiso) => {
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

  const filteredData = sortedData.filter(item =>
    item.PermisosID.toString().includes(searchPermisosID) &&
    format(addDays(parseISO(item.Fecha_inicio.toString()), 1), 'dd/MM/yyyy').includes(searchFechaInicio) &&
    format(addDays(parseISO(item.Fecha_Fin.toString()), 1), 'dd/MM/yyyy').includes(searchFechaFin) &&
    item.Estado.toLowerCase().includes(searchEstado.toLowerCase()) &&
    item.ci.toLowerCase().includes(searchCodEmp.toLowerCase()) &&
    item.Titulo.toLowerCase().includes(searchNombre.toLowerCase()) &&
    item.Estado.toLowerCase() !== 'borrado' 
  );

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
        await axios.put(`${apiUrl}/permisos/${selectedPermiso.PermisosID}/approve`, {
          cod_supervisor: cod_emp
        });
      } else {
        await axios.put(`${apiUrl}/permisos/${selectedPermiso.PermisosID}/reject1`, {
          cod_supervisor: cod_emp
        });
      }
      fetchPermisos();
      setShowModal(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error ${action === 'approve' ? 'aprobando' : 'rechazando'} permiso:`, error.response?.data);
        setError(`Error ${action === 'approve' ? 'aprobando' : 'rechazando'} permiso: ${error.response?.data}`);
      } else {
        console.error(`Error ${action === 'approve' ? 'aprobando' : 'rechazando'} permiso:`, error);
        setError(`Error ${action === 'approve' ? 'aprobando' : 'rechazando'} permiso: ${error}`);
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
                  value={searchCodEmp}
                  onChange={(e) => setSearchCodEmp(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Nombres..."
                  value={searchNombre}
                  onChange={(e) => setSearchNombre(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Apellidos..."
                  value={searchNombre}
                  onChange={(e) => setSearchNombre(e.target.value)}
                />
              </th>
              <th>
                <Form.Control
                  className={styles.search}
                  type="text"
                  placeholder="Buscar Título..."
                  value={searchNombre}
                  onChange={(e) => setSearchNombre(e.target.value)}
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
              <th id={styles.headTable} onClick={() => requestSort('cod_emp')} className='titulo'>
                Cédula
                {sortConfig.key === 'cod_emp' && (
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
            {filteredData.map(item => (
              <tr key={item.PermisosID}>
                <td>{item.PermisosID}</td>
                <td>{item.ci}</td>
                <td>{item.nombres}</td>
                <td>{item.apellidos}</td>
                <td>{item.Titulo}</td>
                <td>{format(addDays(parseISO(item.Fecha_inicio.toString()), 1), 'dd/MM/yyyy')}</td>
                <td>{format(addDays(parseISO(item.Fecha_Fin.toString()), 1), 'dd/MM/yyyy')}</td>
                <td>{item.Estado}</td>
                <td>
                <div className={styles.acciones}>
                    <Button variant="primary" onClick={() => handleLeerDescripcion(item)}>
                      <FontAwesomeIcon icon={faEye} color='white' />
                    </Button>
                  {item.Estado === 'Pendiente' && (
                    <>
                    
                      <Button variant="success" onClick={() => handleAction(item, 'approve')}>
                        <FontAwesomeIcon icon={faCheck} />
                      </Button>
                      <Button variant="danger" onClick={() => handleAction(item, 'reject')}>
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
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
        context="aprobacion" 
        error={error}
        setError={setError}
      />

      <ModalConfirmacionPermiso
        show={showModal}
        onHide={() => { setShowModal(false); setError(''); }}
        onConfirm={handleConfirm}
        permiso={selectedPermiso}
        action={action}
        error={error}
        setError={setError}
      />
    </>
  );
};

export default ListaAprobacionPermisos;