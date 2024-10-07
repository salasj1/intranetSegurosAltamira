import { useEffect, useState } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import { useAuth } from '../auth/AuthProvider';
import { addDays, format, parseISO } from 'date-fns';
import axios from 'axios';
import styles from '../css/ListaAprobacionPermisos.module.css'; // Importar los estilos
import ModalConfirmacion from './ModalConfirmacion';
import ModalDescripcion from './ModalDescripcion';

interface Permiso {
  PermisosID: number;
  Fecha_inicio: string;
  Fecha_Fin: string;
  Estado: string;
  ci: string;
  Titulo: string;
  descripcion: string;
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
  const [searchCodEmp, setSearchCodEmp] = useState('');
  const [searchFechaInicio, setSearchFechaInicio] = useState('');
  const [searchFechaFin, setSearchFechaFin] = useState('');
  const [searchEstado, setSearchEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState<Permiso | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [showDescripcion, setShowDescripcion] = useState(false);

  useEffect(() => {
    fetchPermisos();
  }, []);

  const sortedData = [...permisos].sort((a, b) => {
    if (sortConfig.key) {
      let aValue = a[sortConfig.key as keyof Permiso];
      let bValue = b[sortConfig.key as keyof Permiso];

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

  const handleConfirm = async () => {
    if (!selectedPermiso) return;

    try {
      if (action === 'approve') {
        await axios.put(`/api/permisos/${selectedPermiso.PermisosID}/process`, {
          cod_supervisor: cod_emp
        });
      } else {
        await axios.put(`/api/permisos/${selectedPermiso.PermisosID}/reject`, {
          cod_supervisor: cod_emp
        });
      }
      fetchPermisos();
      setShowModal(false);
    } catch (error) {
      console.error(`Error ${action === 'approve' ? 'aprobando' : 'rechazando'} permiso:`, error);
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
                  placeholder="Buscar Nombre..."
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
            </tr>
          </thead>
          <thead>
            <tr>
              <th id={styles.headTable} onClick={() => requestSort('PermisosID')} className='titulo'>
                ID Permiso
              </th>
              <th id={styles.headTable} onClick={() => requestSort('ci')} className='titulo'>
                Cédula
              </th>
              <th id={styles.headTable} onClick={() => requestSort('Titulo')} className='titulo'>
                Nombre
              </th>
              <th id={styles.headTable} onClick={() => requestSort('Fecha_inicio')} className='titulo'>
                Fecha Inicio
              </th>
              <th id={styles.headTable} onClick={() => requestSort('Fecha_Fin')} className='titulo'>
                Fecha Fin
              </th>
              <th id={styles.headTable} onClick={() => requestSort('Estado')} className='titulo'>
                Estado
              </th>
              <th id={styles.headTable} className='titulo'>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((permiso) => (
              <tr key={permiso.PermisosID}>
                <td>{permiso.PermisosID}</td>
                <td>{permiso.ci}</td>
                <td>{permiso.Titulo}</td>
                <td>{format(addDays(parseISO(permiso.Fecha_inicio.toString()), 1), 'dd/MM/yyyy')}</td>
                <td>{format(addDays(parseISO(permiso.Fecha_Fin.toString()), 1), 'dd/MM/yyyy')}</td>
                <td>{permiso.Estado}</td>
                <td className={styles.acciones}>
                  <Button variant="primary" onClick={() => handleAction(permiso, 'approve')}>Aprobar</Button>
                  <Button variant="danger" onClick={() => handleAction(permiso, 'reject')}>Rechazar</Button>
                  <Button variant="info" onClick={() => handleLeerDescripcion(permiso)}>Ver</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      <ModalDescripcion
        show={showDescripcion}
        onHide={() => setShowDescripcion(false)}
        permiso={selectedPermiso}
      />

      <ModalConfirmacion
        show={showModal}
        onHide={() => setShowModal(false)}
        onConfirm={handleConfirm}
        permiso={selectedPermiso}
        action={action}
      />
    </>
  );
};

export default ListaProcesarPermisos;