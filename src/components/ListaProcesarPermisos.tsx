import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Form, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faFilter, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import stylesLoading from '../css/loading.module.css';
import styles from '../css/AprobarVacaciones.module.css';
import '../css/Tables.css';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import { Permiso } from '../routes/ProcesarPermisos';
import { format, parseISO, addDays } from 'date-fns';
import ModalDescripcionPermiso from './ModalDescripcionPermiso';
import ModalConfirmacion from './ModalConfirmacion';
import DateRangePicker from './DateRangePicker';
import { useAuth } from '../auth/AuthProvider';
import { ToastContainer, toast } from 'react-toastify';
import { Mosaic } from 'react-loading-indicators';
import 'react-toastify/dist/ReactToastify.css';

const apiUrl = import.meta.env.VITE_API_URL;

const ListaProcesarPermisos: React.FC = () => {
  // ── Data y paginación ─────────────────────────────────────
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;

  // ── Filtros de fecha + descontable (fetch inmediato) ──────
  const [fechaInicioDesde, setFechaInicioDesde] = useState<Date | null>(null);
  const [fechaInicioHasta, setFechaInicioHasta] = useState<Date | null>(null);
  const [fechaFinDesde, setFechaFinDesde] = useState<Date | null>(null);
  const [fechaFinHasta, setFechaFinHasta] = useState<Date | null>(null);
  const [searchDescontable, setSearchDescontable] = useState('');

  // ── Filtros de texto (debounce 2000 ms) ──────────────────
  const [searchPermisosID, setSearchPermisosID] = useState('');
  const [searchCi, setSearchCi] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchTitulo, setSearchTitulo] = useState('');
  const [searchEstado, setSearchEstado] = useState('');

  // ── Ordenamiento (client-side sobre la página actual) ────
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'PermisosID', direction: 'desc' });

  // ── Modales ───────────────────────────────────────────────
  const [showDescripcion, setShowDescripcion] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState<Permiso | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [error, setError] = useState<string | null>(null);

  const { cod_emp } = useAuth();

  const fetchIdRef = useRef(0);

  const filtersRef = useRef({
    fechaInicioDesde: null as Date | null,
    fechaInicioHasta: null as Date | null,
    fechaFinDesde: null as Date | null,
    fechaFinHasta: null as Date | null,
    searchDescontable: '',
    searchPermisosID: '',
    searchCi: '',
    searchNombre: '',
    searchTitulo: '',
    searchEstado: '',
  });
  filtersRef.current = {
    fechaInicioDesde, fechaInicioHasta, fechaFinDesde, fechaFinHasta,
    searchDescontable, searchPermisosID, searchCi, searchNombre, searchTitulo, searchEstado,
  };

  const prevTextFiltersRef = useRef({
    searchPermisosID: '', searchCi: '', searchNombre: '', searchTitulo: '', searchEstado: '',
  });

  // ── Fetch principal ───────────────────────────────────────
  const fetchPermisos = useCallback(async (page: number, signal?: AbortSignal) => {
    const fetchId = ++fetchIdRef.current;
    setIsLoading(true);
    try {
      const {
        fechaInicioDesde, fechaInicioHasta, fechaFinDesde, fechaFinHasta,
        searchDescontable, searchPermisosID, searchCi, searchNombre, searchTitulo, searchEstado,
      } = filtersRef.current;

      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (fechaInicioDesde) params.append('fechaInicioDesde', format(fechaInicioDesde, 'yyyy-MM-dd'));
      if (fechaInicioHasta) params.append('fechaInicioHasta', format(fechaInicioHasta, 'yyyy-MM-dd'));
      if (fechaFinDesde)    params.append('fechaFinDesde',    format(fechaFinDesde,    'yyyy-MM-dd'));
      if (fechaFinHasta)    params.append('fechaFinHasta',    format(fechaFinHasta,    'yyyy-MM-dd'));
      if (searchDescontable) params.append('searchDescontable', searchDescontable);
      if (searchPermisosID)  params.append('searchID',          searchPermisosID);
      if (searchCi)          params.append('searchCI',          searchCi.replace(/\./g, ''));
      if (searchNombre)      params.append('searchNombre',      searchNombre);
      if (searchTitulo)      params.append('searchTitulo',      searchTitulo);
      if (searchEstado)      params.append('searchEstado',      searchEstado);

      const response = await axios.get(`${apiUrl}/permisos/aprobadosProcesadosPaginado?${params}`, { signal });

      if (fetchId !== fetchIdRef.current) return;

      setPermisos(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
      setCurrentPage(page);
    } catch (error) {
      if (axios.isCancel(error)) return;
      if (fetchId !== fetchIdRef.current) return;
      console.error('Error fetching permisos:', error);
      toast.error('Error al cargar los permisos');
    } finally {
      if (fetchId !== fetchIdRef.current) return;
      setIsLoading(false);
    }
  }, []);

  // Fechas y descontable → fetch inmediato con AbortController
  useEffect(() => {
    const controller = new AbortController();
    fetchPermisos(1, controller.signal);
    return () => controller.abort();
  }, [fechaInicioDesde, fechaInicioHasta, fechaFinDesde, fechaFinHasta, searchDescontable, fetchPermisos]);

  // Texto → debounce 2000 ms
  useEffect(() => {
    const prev = prevTextFiltersRef.current;
    const hasChanged =
      prev.searchPermisosID !== searchPermisosID ||
      prev.searchCi         !== searchCi         ||
      prev.searchNombre     !== searchNombre      ||
      prev.searchTitulo     !== searchTitulo      ||
      prev.searchEstado     !== searchEstado;
    prevTextFiltersRef.current = { searchPermisosID, searchCi, searchNombre, searchTitulo, searchEstado };
    if (!hasChanged) return;
    const controller = new AbortController();
    const t = setTimeout(() => fetchPermisos(1, controller.signal), 2000);
    return () => { clearTimeout(t); controller.abort(); };
  }, [searchPermisosID, searchCi, searchNombre, searchTitulo, searchEstado, fetchPermisos]);

  // ── Ordenamiento client-side ──────────────────────────────
  const sortedData = [...permisos].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key as keyof Permiso] ?? '';
    const bVal = b[sortConfig.key as keyof Permiso] ?? '';
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ── Acciones ──────────────────────────────────────────────
  const handleRowClick = (permiso: Permiso) => {
    setSelectedPermiso(permiso);
    setShowDescripcion(true);
  };

  const handleAction = (permiso: Permiso, a: 'approve' | 'reject', e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPermiso(permiso);
    setAction(a);
    setShowConfirm(true);
  };

  const handleConfirm = async (setModalError: (message: string) => void) => {
    if (!selectedPermiso) return;
    const toastId = toast.loading('Procesando solicitud...');
    try {
      if (action === 'approve') {
        await axios.put(`${apiUrl}/permisos/${selectedPermiso.PermisosID}/process`, { cod_RRHH: cod_emp });
        toast.update(toastId, { render: '¡Permiso procesado satisfactoriamente!', type: 'success', isLoading: false, autoClose: 4000 });
      } else {
        await axios.put(`${apiUrl}/permisos/${selectedPermiso.PermisosID}/reject2`, { cod_supervisor: cod_emp });
        toast.update(toastId, { render: '¡Permiso rechazado satisfactoriamente!', type: 'success', isLoading: false, autoClose: 4000 });
      }
      fetchPermisos(currentPage);
      setShowConfirm(false);
    } catch (err) {
      let errorMessage = 'Error al procesar el permiso';
      if (axios.isAxiosError(err) && err.response?.data) {
        errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.data.message || errorMessage;
      }
      setModalError(errorMessage);
      toast.update(toastId, { render: errorMessage, type: 'error', isLoading: false, autoClose: 4000 });
      setShowConfirm(false);
    }
  };

  // ── Limpiar filtros ───────────────────────────────────────
  const handleLimpiarFiltros = () => {
    setFechaInicioDesde(null); setFechaInicioHasta(null);
    setFechaFinDesde(null);    setFechaFinHasta(null);
    setSearchDescontable('');
    setSearchPermisosID('');   setSearchCi('');
    setSearchNombre('');       setSearchTitulo('');
    setSearchEstado('');
  };

  const hayFiltrosActivos = !!(
    fechaInicioDesde || fechaInicioHasta || fechaFinDesde || fechaFinHasta ||
    searchDescontable || searchPermisosID || searchCi || searchNombre || searchTitulo || searchEstado
  );

  // ── Paginación ────────────────────────────────────────────
  const getPaginationItems = () => {
    const items: (number | 'ellipsis')[] = [];
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) range.push(i);
    if (range[0] > 1) { items.push(1); if (range[0] > 2) items.push('ellipsis'); }
    items.push(...range);
    if (range[range.length - 1] < totalPages) {
      if (range[range.length - 1] < totalPages - 1) items.push('ellipsis');
      items.push(totalPages);
    }
    return items;
  };

  // ── Icono de ordenamiento ─────────────────────────────────
  const SortIcon = ({ col }: { col: string }) =>
    sortConfig.key === col
      ? <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} style={{ marginLeft: 5 }} />
      : null;

  return (
    <>
      <ToastContainer closeOnClick autoClose={4000} pauseOnFocusLoss={false} theme="colored" style={{ zIndex: 9999 }} />

      {/* ══════════════════════════════════════════════════════
          PANEL DE FILTROS
      ══════════════════════════════════════════════════════ */}
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <span style={panelTitleStyle}>
            <FontAwesomeIcon icon={faFilter} style={{ marginRight: 7, fontSize: '0.8rem' }} />
            Filtros
            {hayFiltrosActivos && (
              <span style={activeBadgeStyle}>{contarFiltrosActivos(
                fechaInicioDesde, fechaInicioHasta, fechaFinDesde, fechaFinHasta,
                searchDescontable, searchPermisosID, searchCi, searchNombre, searchTitulo, searchEstado,
              )}</span>
            )}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={countStyle}>{totalCount} registro{totalCount !== 1 ? 's' : ''}</span>
            {hayFiltrosActivos && (
              <Button variant="outline-secondary" size="sm" onClick={handleLimpiarFiltros} style={clearBtnStyle}>
                Limpiar todo
              </Button>
            )}
          </div>
        </div>

        <div style={rowStyle}>
          <FilterInput label="ID Permiso"       placeholder="Buscar ID..."      value={searchPermisosID} onChange={v => { setIsLoading(true); setSearchPermisosID(v); }}  width={110} />
          <FilterInput label="Cédula"           placeholder="Buscar cédula..."  value={searchCi}         onChange={v => { setIsLoading(true); setSearchCi(v); }}           width={130} />
          <FilterInput label="Nombre empleado"  placeholder="Buscar nombre..."  value={searchNombre}     onChange={v => { setIsLoading(true); setSearchNombre(v); }}        width={240} />
          <FilterInput label="Título"           placeholder="Buscar título..."  value={searchTitulo}     onChange={v => { setIsLoading(true); setSearchTitulo(v); }}        width={180} />
          <DateRangePicker
            label="Fecha Inicio"
            fromDate={fechaInicioDesde}
            toDate={fechaInicioHasta}
            onRangeChange={(from, to) => { setIsLoading(true); setFechaInicioDesde(from); setFechaInicioHasta(to); }}
          />
          <DateRangePicker
            label="Fecha Fin"
            fromDate={fechaFinDesde}
            toDate={fechaFinHasta}
            onRangeChange={(from, to) => { setIsLoading(true); setFechaFinDesde(from); setFechaFinHasta(to); }}
          />
          <FilterInput label="Estado"           placeholder="Buscar estado..."  value={searchEstado}     onChange={v => { setIsLoading(true); setSearchEstado(v); }}        width={140} />
          {/* Select de Descontable */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Descontable
            </span>
            <Form.Select
              value={searchDescontable}
              onChange={e => { setIsLoading(true); setSearchDescontable(e.target.value); }}
              style={{ width: 140, fontSize: '0.82rem', height: 34, borderRadius: 8, borderColor: '#cbd5e1' }}
            >
              <option value="">Todos</option>
              <option value="1">Sí</option>
              <option value="0">No</option>
            </Form.Select>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TABLA
      ══════════════════════════════════════════════════════ */}
      {isLoading ? (
        <div className={stylesLoading.loadingDocument} style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Mosaic color={['#003391', '#1A5FFA', '#33CCCC', '#1A3FFA']} size="medium" text="" textColor="#0d1bff" />
        </div>
      ) : (
        <div className="tablaAprobar">
          <Table striped bordered hover responsive>
            <thead className={styles.stickyHead}>
              <tr>
                <th id={styles.headTable} onClick={() => requestSort('PermisosID')} className="titulo" style={{ cursor: 'pointer' }}>
                  ID Permiso <SortIcon col="PermisosID" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('ci')} className="titulo" style={{ cursor: 'pointer' }}>
                  Cédula <SortIcon col="ci" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('nombres')} className="titulo" style={{ cursor: 'pointer' }}>
                  Nombres <SortIcon col="nombres" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('apellidos')} className="titulo" style={{ cursor: 'pointer' }}>
                  Apellidos <SortIcon col="apellidos" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('Titulo')} className="titulo" style={{ cursor: 'pointer' }}>
                  Título <SortIcon col="Titulo" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('Fecha_inicio')} className="titulo" style={{ cursor: 'pointer' }}>
                  Fecha Inicio <SortIcon col="Fecha_inicio" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('Fecha_Fin')} className="titulo" style={{ cursor: 'pointer' }}>
                  Fecha Fin <SortIcon col="Fecha_Fin" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('Estado')} className="titulo" style={{ cursor: 'pointer' }}>
                  Estado <SortIcon col="Estado" />
                </th>
                <th id={styles.headTable} className="titulo" style={{ width: 110 }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted" style={{ padding: '28px' }}>
                    No se encontraron registros
                  </td>
                </tr>
              ) : (
                sortedData.map(item => (
                  <tr key={item.PermisosID} onClick={() => handleRowClick(item)} style={{ cursor: 'pointer' }}>
                    <td>{item.PermisosID}</td>
                    <td>{item.ci}</td>
                    <td>{item.nombres}</td>
                    <td>{item.apellidos}</td>
                    <td>
                      {item.Titulo}
                      {item.descontable && (
                        <span style={{
                          display: 'inline-block', marginLeft: 6,
                          background: '#f59e0b', color: '#fff',
                          borderRadius: 4, fontSize: '0.65rem', fontWeight: 700,
                          padding: '1px 6px', verticalAlign: 'middle',
                        }}>
                          Descontable
                        </span>
                      )}
                    </td>
                    <td>{format(addDays(parseISO(item.Fecha_inicio.toString()), 1), 'dd/MM/yyyy')}</td>
                    <td>{format(addDays(parseISO(item.Fecha_Fin.toString()), 1), 'dd/MM/yyyy')}</td>
                    <td>{item.Estado}</td>
                    <td onClick={e => e.stopPropagation()}>
                      {item.Estado === 'Aprobada' ? (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={e => handleAction(item, 'approve', e)}
                            title="Procesar permiso"
                            style={{ padding: '3px 9px', display: 'inline-flex', alignItems: 'center' }}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={e => handleAction(item, 'reject', e)}
                            title="Rechazar permiso"
                            style={{ padding: '3px 9px', display: 'inline-flex', alignItems: 'center' }}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </Button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* ── Paginación ── */}
      {!isLoading && totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          <Pagination className="mb-0">
            <Pagination.First onClick={() => fetchPermisos(1)} disabled={currentPage === 1} />
            <Pagination.Prev  onClick={() => fetchPermisos(currentPage - 1)} disabled={currentPage === 1} />
            {getPaginationItems().map((item, idx) =>
              item === 'ellipsis' ? (
                <Pagination.Ellipsis key={`e-${idx}`} disabled />
              ) : (
                <Pagination.Item
                  key={item}
                  active={item === currentPage}
                  onClick={() => item !== currentPage && fetchPermisos(item)}
                >
                  {item}
                </Pagination.Item>
              )
            )}
            <Pagination.Next onClick={() => fetchPermisos(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => fetchPermisos(totalPages)}      disabled={currentPage === totalPages} />
          </Pagination>
          <small className="text-muted">
            Página {currentPage} de {totalPages} — {totalCount} registros
          </small>
        </div>
      )}

      {/* ── Modal de descripción (se abre al hacer clic en la fila) ── */}
      <ModalDescripcionPermiso
        show={showDescripcion}
        onHide={() => { setShowDescripcion(false); setError(null); }}
        permiso={selectedPermiso}
        fetchPermisos={() => fetchPermisos(currentPage)}
        context="procesar"
        error={error}
        setError={(msg: string) => setError(msg)}
      />

      {/* ── Modal de confirmación (se abre al hacer clic en check/x) ── */}
      <ModalConfirmacion
        show={showConfirm}
        onHide={() => { setShowConfirm(false); setError(null); }}
        onConfirm={handleConfirm}
        permiso={selectedPermiso}
        action={action}
        error={error}
        setError={(msg: string) => setError(msg)}
      />
    </>
  );
};

// ── Subcomponente: input de filtro con label ──────────────
interface FilterInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  width?: number;
}
const FilterInput: React.FC<FilterInputProps> = ({ label, placeholder, value, onChange, width = 150 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </span>
    <Form.Control
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width, fontSize: '0.82rem', height: 34, borderRadius: 8, borderColor: '#cbd5e1' }}
    />
  </div>
);

// ── Estilos del panel ─────────────────────────────────────
const panelStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: '14px 18px',
  marginBottom: 16,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  width: '100%',
  alignSelf: 'stretch',
  boxSizing: 'border-box',
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 12,
};

const panelTitleStyle: React.CSSProperties = {
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  display: 'flex',
  alignItems: 'center',
};

const activeBadgeStyle: React.CSSProperties = {
  marginLeft: 8,
  background: '#003391',
  color: '#fff',
  borderRadius: '50%',
  fontSize: '0.65rem',
  fontWeight: 700,
  width: 18,
  height: 18,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const countStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  color: '#94a3b8',
  fontWeight: 500,
};

const clearBtnStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  padding: '3px 10px',
  borderRadius: 6,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px 16px',
  alignItems: 'flex-end',
  marginBottom: 10,
};

function contarFiltrosActivos(...args: (Date | string | null)[]): number {
  return args.filter(Boolean).length;
}

export default ListaProcesarPermisos;
