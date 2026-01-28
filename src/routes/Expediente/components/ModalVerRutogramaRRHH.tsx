import React, { useState } from "react";
import { Modal, Button, Table, Form, Collapse, Alert } from "react-bootstrap";
import { Mosaic } from 'react-loading-indicators';
import axios from "axios";
import { IRutogramaPayload, TipoTransporte, TipoActividad, RutaFormState } from "@/types/rutograma.types";
import styles from '../styles/ModalRutograma.module.css';
import { useAuth } from "@/auth/AuthProvider";
interface ModalVerRutogramaRRHHProps {
  show: boolean;
  onHide: () => void;
  onApprove: () => void;
  onReturn: (comentarios: string) => void;
  rutogramaData: IRutogramaPayload | null;
  tiposTransporte: TipoTransporte[];
  tiposActividad: TipoActividad[];
  empleadoNombre: string;
  refreshRutograma: () => void;
}

const ModalVerRutogramaRRHH: React.FC<ModalVerRutogramaRRHHProps> = ({
  show,
  onHide,
  onApprove,
  onReturn,
  rutogramaData,
  tiposTransporte,
  tiposActividad,
  empleadoNombre,
  refreshRutograma
}) => {
  const [comentarios, setComentarios] = useState("");
  const [errorComentario, setErrorComentario] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [loadingDevolucion, setLoadingDevolucion] = useState(false);
  const { cod_emp } = useAuth();
  if (!rutogramaData) return null;

  const { global = {}, ida = {}, regreso = {} } = rutogramaData;
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleReturn = async () => {
    if (!comentarios.trim()) {
      setErrorComentario(true);
      return;
    }
    setLoadingDevolucion(true);
    
    try {
      await axios.put(`${apiUrl}/expediente/rutograma-devolver`, {
        id_rutograma: global.id,
        comentarios_revision: comentarios,
        cod_revisor: cod_emp || null
      });
      setLoadingDevolucion(false);
      setShowComments(false);
      setComentarios("");
      refreshRutograma();
      if (typeof onReturn === "function") onReturn(comentarios);
    } catch (err) {
      setLoadingDevolucion(false);
      setErrorComentario(true);
    }
  };

  // Formateador seguro para valores de tiempo (Dayjs o string)
  const formatTime = (timeValue: any) => {
    if (!timeValue) return 'N/A';
    if (typeof timeValue.format === 'function') {
      return timeValue.format('HH:mm');
    }
    return String(timeValue);
  };

  // Reutilizamos las funciones de renderizado del modal original si es posible
  // (Aquí se asume que se pueden copiar/pegar o refactorizar a un archivo de utilidades)
  const getTransporteLabel = (id: number, otroValor?: string) => {
    const t = tiposTransporte.find((tt) => Number(tt.IdTipo) === Number(id));
    if (t?.nombre === 'Otro' && otroValor) return `Otro: ${otroValor}`;
    return t?.nombre || "Desconocido";
  };

  const getActividadNombre = (id: number, otroValor?: string) => {
    const actividad = tiposActividad.find((ta) => ta.id === id);
    if (actividad?.nombre === 'Otro' && otroValor) {
      return `Otro: ${otroValor}`;
    }
    return actividad ? actividad.nombre : "Desconocida";
  };

  const renderTable = (title: string, headers: string[], data: (string|number)[][]) => (
    <div style={{ marginBottom: 16 }}>
      <b className={styles.sectionTitle}>{title}</b>
      <Table striped bordered size="sm" responsive className={styles.table}>
        <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{data.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell || '-'}</td>)}</tr>)}</tbody>
      </Table>
    </div>
  );

  const renderTravelDetails = (segment: Partial<RutaFormState>) => {
    const tiempoViajeMap: { [key: string]: string } = {
      '0-30': 'De 0 a 30 min',
      '30-60': 'De 30 a 60 min',
      '60-90': 'De 60 a 90 min',
      '90-120': 'De 90 a 120 min',
      'mas-120': 'Más de 120 min'
    };

    return (
      <div style={{ marginBottom: 16 }}>
        <b className={styles.sectionTitle}>Detalles del Viaje</b>
        <Table striped bordered size="sm" responsive className={styles.table}>
          <tbody>
            <tr>
              <td><strong>Tiempo de viaje</strong></td>
              <td>{tiempoViajeMap[segment.tiempoViaje || ''] || 'No especificado'}</td>
            </tr>
            <tr>
              <td><strong>Escalas</strong></td>
              <td>{segment.haceEscalas ? `Sí, ${segment.numEscalas || 0} escala(s)` : 'No'}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  };

  const renderActividades = (segment: Partial<RutaFormState>, direccion: string) => {
    if (!segment.haceActividadAntes) {
      return (
        <div style={{ marginBottom: 16 }}>
          <b className={styles.sectionTitle}>Actividades</b>
          <p style={{ padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>No se realizan actividades {direccion === 'ida' ? 'antes' : 'después'} de este trayecto.</p>
        </div>
      );
    }

    if (!segment.actividadesSeleccionadas || segment.actividadesSeleccionadas.length === 0) {
      return (
        <div style={{  marginBottom: '16rem' }}>
          <b className={styles.sectionTitle}>Actividades</b>
          <p style={{ padding: '0.5rem', background: '#fffbe6', borderRadius: '4px', border: '1px solid #ffe58f' }}>El empleado indicó que realiza actividades, pero no especificó cuáles.</p>
        </div>
      );
    }
    const data = segment.actividadesSeleccionadas.map(id => {
      const detalle = segment.detallesActividades?.[id];
      if (!detalle) return null;
      return [
        getActividadNombre(id, detalle.otro),
        detalle.ubicacion,
        detalle.tiempo,
        detalle.descripcion,
        detalle.frecuencia
      ];
    }).filter(Boolean) as (string|number)[][];

    if (data.length === 0) return null;

    return renderTable("Actividades", ["Actividad", "Ubicación", "Tiempo", "Descripción", "Frecuencia"], data);
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="xl" contentClassName={styles.modalContent} >
        {loadingDevolucion ? (
          <div style={{ minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="large" />
            <div style={{ marginTop: 18, color: '#003391', fontWeight: 600, fontSize: 18 }}>Enviando devolución de Rutograma...</div>
          </div>
        ) : (
        <>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle} style={{justifyContent: 'space-around'}}>Rutograma de: {empleadoNombre}</Modal.Title>
          {global.estado && (
            global.estado === 'Aprobado' ? (
              <span className={`${styles.estadoRRHH} ${styles.estadoAprobado}`} style={{marginLeft: 16, fontSize: '1rem'}} >Aprobado</span>
            ) : global.estado === 'Pendiente' ? (
              <span className={`${styles.estadoRRHH} ${styles.estadoPendiente}`} style={{marginLeft: 16, fontSize: '1rem'}} >Pendiente</span>
            ) : global.estado === 'Devuelto' ? (
              <span className={`${styles.estadoRRHH} ${styles.estadoRechazado}`} style={{marginLeft: 16, fontSize: '1rem'}} >Devuelto</span>
            ) : (
              <span className={styles.estadoRRHH} style={{marginLeft: 16, fontSize: '1rem'}}>Desconocido</span>
            )
          )}
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          {global.comentarios_revision && (
          <Alert variant="warning">
            <Alert.Heading>
              Comentarios de Revisión
            </Alert.Heading>
              <p style={{ whiteSpace: 'pre-wrap' }}>{global.comentarios_revision}</p>
          </Alert>
          )}
          <h4>Información General</h4>
          <Table striped bordered size="sm" responsive className={styles.table}>
            <tbody>
              <tr>
                <td><strong>Horario de Trabajo</strong></td>
                <td>{formatTime(global.horarioTrabajoDesde)} - {formatTime(global.horarioTrabajoHasta)}</td>
              </tr>
              <tr>
                <td><strong>Hora de Salida de Casa</strong></td>
                <td>{formatTime(global.horaSalida)}</td>
              </tr>
              <tr>
                <td><strong>Contacto de Emergencia</strong></td>
                <td>{global.nombreReferencia || 'N/A'} - {global.telefonoReferencia || 'N/A'}</td>
              </tr>
            </tbody>
          </Table>
          
          <hr />

          <h4>Ruta de Ida</h4>
          {renderTable("Rutas (Domicilio → Trabajo)", ["#", "Descripción"], (ida.rutas || []).map((r, i) => [i + 1, r]))}
          {renderTravelDetails(ida)}
          {renderTable("Transporte", ["#", "Medio"], (ida.tipoTransporteSeleccionado || []).map((id, i) => [i + 1, getTransporteLabel(id, ida.medioTransporteOtro)]))}
          {renderActividades(ida,"ida")}
          
          <hr />

          <h4>Ruta de Regreso</h4>
          {renderTable("Rutas (Trabajo → Domicilio)", ["#", "Descripción"], (regreso.rutas || []).map((r, i) => [i + 1, r]))}
          {renderTravelDetails(regreso)}
          {renderTable("Transporte", ["#", "Medio"], (regreso.tipoTransporteSeleccionado || []).map((id, i) => [i + 1, getTransporteLabel(id, regreso.medioTransporteOtro)]))}
          {renderActividades(regreso,"regreso")}

          <Collapse in={showComments}>
              <div id="comments-collapse">
              {/* El bloque de comentarios se mueve fuera del flujo scrollable */}
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />

              </div>
          </Collapse>
        </Modal.Body>
        {/* Nuevo bloque fijo para comentarios */}
        {showComments && (
          <div className={styles.comentarioFixed}>
            <Form.Group controlId="comentariosDevolucion">
              <Form.Label>Comentarios para devolución (obligatorio si se devuelve)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={comentarios}
                onChange={(e) => {
                  setComentarios(e.target.value);
                  if (e.target.value.trim()) setErrorComentario(false);
                }}
                isInvalid={errorComentario}
                placeholder="Especifique aquí las correcciones necesarias..."
              />
              <Form.Control.Feedback type="invalid">
                Debe ingresar un comentario para devolver el rutograma.
              </Form.Control.Feedback>
              <div className="mt-2" style={{justifySelf:'flex-end', gap:'8px', display:'flex'}}> 
                <Button variant="secondary" onClick={() => { setShowComments(false); setErrorComentario(false); }}>Ocultar</Button>
                <Button variant="primary" onClick={handleReturn} >Enviar Devolución</Button>
              </div>
            </Form.Group>
          </div>
        )}
        <Modal.Footer className={styles.modalFooter}>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          { !showComments && global.estado === 'Pendiente' &&
          <Button variant="success" onClick={onApprove}>Aprobar</Button>
          }
        </Modal.Footer>
        </>
        )}
      </Modal>
      {/* Botón fijo para devolver con comentarios */}
      {!showComments && show && !loadingDevolucion && global.estado === 'Pendiente' && (
        <button
          className={styles.fixedDevolverBtn}
          onClick={() => setShowComments(true)}
          type="button"
        >
          Devolver con Comentarios
        </button>
      )}
    </>
  );
};

export default ModalVerRutogramaRRHH;
