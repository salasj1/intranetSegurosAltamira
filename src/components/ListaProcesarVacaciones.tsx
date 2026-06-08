import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Form, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faFilter, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from '../css/AprobarVacaciones.module.css';
import stylesLoading from '../css/loading.module.css';
import '../css/Tables.css';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import { Vacacion } from '../routes/ProcesarVacaciones';
import { format, parseISO, addDays } from 'date-fns';
import DetalleVacacionModal from './DetalleVacacionModal';
import DateRangePicker from './DateRangePicker';
import { useAuth } from '../auth/AuthProvider';
import { ToastContainer, toast } from 'react-toastify';
import { Mosaic } from 'react-loading-indicators';
import 'react-toastify/dist/ReactToastify.css';

const apiUrl = import.meta.env.VITE_API_URL;

const ListaProcesarVacacaciones: React.FC = () => {
  // ── Data y paginación ─────────────────────────────────────
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;

  // ── Filtros de fecha (disparan fetch inmediato) ───────────
  const [fechaInicioDesde, setFechaInicioDesde] = useState<Date | null>(null);
  const [fechaInicioHasta, setFechaInicioHasta] = useState<Date | null>(null);
  const [fechaRetornoDesde, setFechaRetornoDesde] = useState<Date | null>(null);
  const [fechaRetornoHasta, setFechaRetornoHasta] = useState<Date | null>(null);

  // ── Filtros de texto (debounce 400 ms) ───────────────────
  const [searchVacacionID, setSearchVacacionID] = useState('');
  const [searchCodEmp, setSearchCodEmp] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchEstado, setSearchEstado] = useState('');
  const [searchdiasDisfrutar, setDiasDisfrutar] = useState('');
  const [searchdiasPagar, setDiasPagar] = useState('');

  // ── Ordenamiento (client-side sobre la página actual) ────
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'VacacionID', direction: 'desc' });

  // ── Modal ─────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [selectedVacacion, setSelectedVacacion] = useState<Vacacion | null>(null);

  const { cod_emp } = useAuth();

  // Cada nueva petición incrementa este contador; las respuestas con ID viejo se descartan.
  const fetchIdRef = useRef(0);

  // Ref que siempre tiene los últimos valores de filtros — permite que fetchVacaciones
  // tenga deps vacíos (función estable) y no cause re-ejecución de effects innecesarios.
  const filtersRef = useRef({
    fechaInicioDesde: null as Date | null,
    fechaInicioHasta: null as Date | null,
    fechaRetornoDesde: null as Date | null,
    fechaRetornoHasta: null as Date | null,
    searchVacacionID: '', searchCodEmp: '', searchNombre: '',
    searchEstado: '', searchdiasDisfrutar: '', searchdiasPagar: '',
  });
  filtersRef.current = {
    fechaInicioDesde, fechaInicioHasta, fechaRetornoDesde, fechaRetornoHasta,
    searchVacacionID, searchCodEmp, searchNombre, searchEstado, searchdiasDisfrutar, searchdiasPagar,
  };

  // Ref para comparar cambios reales en filtros de texto (evita disparo extra de StrictMode)
  const prevTextFiltersRef = useRef({ searchVacacionID: '', searchCodEmp: '', searchNombre: '', searchEstado: '', searchdiasDisfrutar: '', searchdiasPagar: '' });

  // ── Fetch principal ───────────────────────────────────────
  const fetchVacaciones = useCallback(async (page: number, signal?: AbortSignal) => {
    const fetchId = ++fetchIdRef.current;
    setIsLoading(true);
    try {
      const {
        fechaInicioDesde, fechaInicioHasta, fechaRetornoDesde, fechaRetornoHasta,
        searchVacacionID, searchCodEmp, searchNombre, searchEstado, searchdiasDisfrutar, searchdiasPagar,
      } = filtersRef.current;

      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (fechaInicioDesde) params.append('fechaInicioDesde', format(fechaInicioDesde, 'yyyy-MM-dd'));
      if (fechaInicioHasta) params.append('fechaInicioHasta', format(fechaInicioHasta, 'yyyy-MM-dd'));
      if (fechaRetornoDesde) params.append('fechaRetornoDesde', format(fechaRetornoDesde, 'yyyy-MM-dd'));
      if (fechaRetornoHasta) params.append('fechaRetornoHasta', format(fechaRetornoHasta, 'yyyy-MM-dd'));
      if (searchVacacionID) params.append('searchID', searchVacacionID);
      if (searchCodEmp) params.append('searchCI', searchCodEmp.replace(/\./g, ''));
      if (searchNombre) params.append('searchNombre', searchNombre);
      if (searchEstado) params.append('searchEstado', searchEstado);
      if (searchdiasDisfrutar) params.append('searchDiasDisfrutar', searchdiasDisfrutar);
      if (searchdiasPagar) params.append('searchDiasPagar', searchdiasPagar);

      const response = await axios.get(`${apiUrl}/vacacionesaprobadas?${params}`, { signal });

      if (fetchId !== fetchIdRef.current) return;

      setVacaciones(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
      setCurrentPage(page);
    } catch (error) {
      if (axios.isCancel(error)) return;
      if (fetchId !== fetchIdRef.current) return;
      console.error('Error fetching vacaciones:', error);
      toast.error('Error al cargar las vacaciones');
    } finally {
      if (fetchId !== fetchIdRef.current) return;
      setIsLoading(false);
    }
  }, []);

  // Filtros de fecha → fetch inmediato. AbortController cancela requests obsoletos
  // (incluyendo el doble-mount de React.StrictMode en desarrollo).
  useEffect(() => {
    const controller = new AbortController();
    fetchVacaciones(1, controller.signal);
    return () => controller.abort();
  }, [fechaInicioDesde, fechaInicioHasta, fechaRetornoDesde, fechaRetornoHasta, fetchVacaciones]);

  // Filtros de texto → debounce 2000ms. Compara valores reales para no disparar en el
  // segundo mount de StrictMode (donde el ref ya tiene los mismos valores).
  useEffect(() => {
    const prev = prevTextFiltersRef.current;
    const hasChanged =
      prev.searchVacacionID !== searchVacacionID ||
      prev.searchCodEmp !== searchCodEmp ||
      prev.searchNombre !== searchNombre ||
      prev.searchEstado !== searchEstado ||
      prev.searchdiasDisfrutar !== searchdiasDisfrutar ||
      prev.searchdiasPagar !== searchdiasPagar;
    prevTextFiltersRef.current = { searchVacacionID, searchCodEmp, searchNombre, searchEstado, searchdiasDisfrutar, searchdiasPagar };
    if (!hasChanged) return;
    const controller = new AbortController();
    const t = setTimeout(() => fetchVacaciones(1, controller.signal), 2000);
    return () => { clearTimeout(t); controller.abort(); };
  }, [searchVacacionID, searchCodEmp, searchNombre, searchEstado, searchdiasDisfrutar, searchdiasPagar, fetchVacaciones]);

  // ── Ordenamiento client-side ──────────────────────────────
  const sortedData = [...vacaciones].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key as keyof Vacacion] ?? '';
    const bVal = b[sortConfig.key as keyof Vacacion] ?? '';
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
  const handleRowClick = (vacacion: Vacacion) => { setSelectedVacacion(vacacion); setShowModal(true); };

  const handleProcess = async (vacacion: Vacacion) => {
    const id = toast.loading('Procesando solicitud...');
    await axios.put(`${apiUrl}/vacaciones/${vacacion.VacacionID}/process`, {
      cod_RRHH: cod_emp, sCod_emp: vacacion.cod_emp,
      sdDesde: vacacion.FechaInicio, sdHasta: vacacion.FechaFin,
    });
    fetchVacaciones(currentPage);
    toast.update(id, { render: '¡Vacaciones procesadas satisfactoriamente!', type: 'success', isLoading: false, autoClose: 4000 });
  };

  const handleReject = async (vacacion: Vacacion) => {
    const id = toast.loading('Procesando solicitud...');
    await axios.put(`${apiUrl}/vacaciones/${vacacion.VacacionID}/reject2`, { cod_RRHH: cod_emp });
    fetchVacaciones(currentPage);
    toast.update(id, { render: '¡Vacaciones rechazadas satisfactoriamente!', type: 'success', isLoading: false, autoClose: 4000 });
  };

  // ── Limpiar filtros ───────────────────────────────────────
  const handleLimpiarFiltros = () => {
    setFechaInicioDesde(null); setFechaInicioHasta(null);
    setFechaRetornoDesde(null); setFechaRetornoHasta(null);
    setSearchVacacionID(''); setSearchCodEmp('');
    setSearchNombre(''); setSearchEstado('');
    setDiasDisfrutar(''); setDiasPagar('');
  };

  const hayFiltrosActivos = !!(
    fechaInicioDesde || fechaInicioHasta || fechaRetornoDesde || fechaRetornoHasta ||
    searchVacacionID || searchCodEmp || searchNombre || searchEstado || searchdiasDisfrutar || searchdiasPagar
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
          PANEL DE FILTROS UNIFICADO
      ══════════════════════════════════════════════════════ */}
      <div style={panelStyle}>
        {/* Encabezado del panel */}
        <div style={panelHeaderStyle}>
          <span style={panelTitleStyle}>
            <FontAwesomeIcon icon={faFilter} style={{ marginRight: 7, fontSize: '0.8rem' }} />
            Filtros
            {hayFiltrosActivos && (
              <span style={activeBadgeStyle}>{contarFiltrosActivos(
                fechaInicioDesde, fechaInicioHasta, fechaRetornoDesde, fechaRetornoHasta,
                searchVacacionID, searchCodEmp, searchNombre, searchEstado, searchdiasDisfrutar, searchdiasPagar,
              )}</span>
            )}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={countStyle}>
              {totalCount} registro{totalCount !== 1 ? 's' : ''}
            </span>
            {hayFiltrosActivos && (
              <Button variant="outline-secondary" size="sm" onClick={handleLimpiarFiltros} style={clearBtnStyle}>
                Limpiar todo
              </Button>
            )}
          </div>
        </div>

        {/* Fila 1: ID · Cédula · Nombre */}
        <div style={rowStyle}>
          <FilterInput label="ID Vacación" placeholder="Buscar ID..." value={searchVacacionID} onChange={v => { setIsLoading(true); setSearchVacacionID(v); }} width={110} />
          <FilterInput label="Cédula" placeholder="Buscar cédula..." value={searchCodEmp} onChange={v => { setIsLoading(true); setSearchCodEmp(v); }} width={130} />
          <FilterInput label="Nombre del empleado" placeholder="Buscar nombre..." value={searchNombre} onChange={v => { setIsLoading(true); setSearchNombre(v); }} width={240} />
          <DateRangePicker
            label="Fecha Inicio"
            fromDate={fechaInicioDesde}
            toDate={fechaInicioHasta}
            onRangeChange={(from, to) => { setIsLoading(true); setFechaInicioDesde(from); setFechaInicioHasta(to); }}
          />
          <DateRangePicker
            label="Fecha Retorno"
            fromDate={fechaRetornoDesde}
            toDate={fechaRetornoHasta}
            onRangeChange={(from, to) => { setIsLoading(true); setFechaRetornoDesde(from); setFechaRetornoHasta(to); }}
          />
          <FilterInput label="Estado" placeholder="Buscar estado..." value={searchEstado} onChange={v => { setIsLoading(true); setSearchEstado(v); }} width={140} />
          <FilterInput label="Días a disfrutar" placeholder="Ej: 15" value={searchdiasDisfrutar} onChange={v => { setIsLoading(true); setDiasDisfrutar(v); }} width={120} />
          <FilterInput label="Días a pagar" placeholder="Ej: 20" value={searchdiasPagar} onChange={v => { setIsLoading(true); setDiasPagar(v); }} width={120} />
        </div>

        {/* Fila 2: Date pickers */}
        {/* <div style={rowStyle}>
          <DateRangePicker
            label="Fecha Inicio"
            fromDate={fechaInicioDesde}
            toDate={fechaInicioHasta}
            onRangeChange={(from, to) => { setFechaInicioDesde(from); setFechaInicioHasta(to); }}
          />
          <DateRangePicker
            label="Fecha Retorno"
            fromDate={fechaRetornoDesde}
            toDate={fechaRetornoHasta}
            onRangeChange={(from, to) => { setFechaRetornoDesde(from); setFechaRetornoHasta(to); }}
          />
        </div> */}

        {/* Fila 3: Estado · Días disfrutar · Días pagar */}
        {/* <div style={rowStyle}>
          <FilterInput label="Estado" placeholder="Buscar estado..." value={searchEstado} onChange={v => { setIsLoading(true); setSearchEstado(v); }} width={140} />
          <FilterInput label="Días a disfrutar" placeholder="Ej: 15" value={searchdiasDisfrutar} onChange={v => { setIsLoading(true); setDiasDisfrutar(v); }} width={120} />
          <FilterInput label="Días a pagar" placeholder="Ej: 20" value={searchdiasPagar} onChange={v => { setIsLoading(true); setDiasPagar(v); }} width={120} />
        </div> */}
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
                <th id={styles.headTable} onClick={() => requestSort('VacacionID')} className="titulo" style={{ cursor: 'pointer' }}>
                  ID Vacación <SortIcon col="VacacionID" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('ci')} className="titulo" style={{ cursor: 'pointer' }}>
                  Cédula <SortIcon col="ci" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('nombres_empleado')} className="titulo" style={{ cursor: 'pointer' }}>
                  Nombre Empleado <SortIcon col="nombres_empleado" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('FechaInicio')} className="titulo" style={{ cursor: 'pointer' }}>
                  Fecha Inicio <SortIcon col="FechaInicio" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('FechaFin')} className="titulo" style={{ cursor: 'pointer' }}>
                  Fecha Fin <SortIcon col="FechaFin" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('FechaRetorno')} className="titulo" style={{ cursor: 'pointer' }}>
                  Fecha Retorno <SortIcon col="FechaRetorno" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('diasDisfrutar')} className="titulo" style={{ cursor: 'pointer' }}>
                  Días a Disfrutar <SortIcon col="diasDisfrutar" />
                </th>
                <th id={styles.headTable} onClick={() => requestSort('diasPagar')} className="titulo" style={{ cursor: 'pointer' }}>
                  Días a Pagar <SortIcon col="diasPagar" />
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
                  <td colSpan={10} className="text-center text-muted" style={{ padding: '28px' }}>
                    No se encontraron registros
                  </td>
                </tr>
              ) : (
                sortedData.map(item => (
                  <tr key={item.VacacionID} onClick={() => handleRowClick(item)} style={{ cursor: 'pointer' }}>
                    <td>{item.VacacionID}</td>
                    <td>{item.ci?.replace(/\./g, '')}</td>
                    <td>{item.nombres_empleado} {item.apellidos_empleado}</td>
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
                    <td onClick={e => e.stopPropagation()}>
                      {item.Estado === 'Aprobada' ? (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleProcess(item)}
                            title="Procesar vacación"
                            style={{ padding: '3px 9px', display: 'inline-flex', alignItems: 'center' }}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(item)}
                            title="Rechazar vacación"
                            style={{ padding: '3px 9px', display: 'inline-flex', alignItems: 'center' }}
                          >
                            <FontAwesomeIcon icon={faXmark} />
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
            <Pagination.First onClick={() => fetchVacaciones(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => fetchVacaciones(currentPage - 1)} disabled={currentPage === 1} />
            {getPaginationItems().map((item, idx) =>
              item === 'ellipsis' ? (
                <Pagination.Ellipsis key={`e-${idx}`} disabled />
              ) : (
                <Pagination.Item
                  key={item}
                  active={item === currentPage}
                  onClick={() => item !== currentPage && fetchVacaciones(item)}
                >
                  {item}
                </Pagination.Item>
              )
            )}
            <Pagination.Next onClick={() => fetchVacaciones(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => fetchVacaciones(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
          <small className="text-muted">
            Página {currentPage} de {totalPages} — {totalCount} registros
          </small>
        </div>
      )}

      {/* ── Modal ── */}
      {selectedVacacion && (
        <DetalleVacacionModal
          show={showModal}
          handleClose={() => { setShowModal(false); setSelectedVacacion(null); }}
          vacacion={selectedVacacion}
          onProcess={handleProcess}
          onReject={handleReject}
        />
      )}
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

// ── Helpers de estilo del panel ───────────────────────────
const panelStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: '14px 18px',
  marginBottom: 16,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  width: '100%',           // mismo ancho que la tabla (que también es 100%)
  alignSelf: 'stretch',    // anula el align-items: center del .canvas
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

// ── Contador de filtros activos ───────────────────────────
function contarFiltrosActivos(...args: (Date | string | null)[]): number {
  return args.filter(Boolean).length;
}

export default ListaProcesarVacacaciones;
