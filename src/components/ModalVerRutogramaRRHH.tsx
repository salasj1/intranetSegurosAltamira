import React, { useState } from "react";
import { Modal, Button, Table, Form, Alert } from "react-bootstrap";
import { IRutogramaPayload, TipoTransporte, TipoActividad } from "../types/rutograma.types";

interface ModalVerRutogramaRRHHProps {
  show: boolean;
  onHide: () => void;
  onApprove: () => void;
  onReturn: (comentarios: string) => void;
  rutogramaData: IRutogramaPayload | null;
  tiposTransporte: TipoTransporte[];
  tiposActividad: TipoActividad[];
  empleadoNombre: string;
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
}) => {
  const [comentarios, setComentarios] = useState("");
  const [errorComentario, setErrorComentario] = useState(false);

  if (!rutogramaData) return null;

  const { ida, regreso } = rutogramaData;

  const handleReturn = () => {
    if (!comentarios.trim()) {
      setErrorComentario(true);
      return;
    }
    onReturn(comentarios);
  };

  // Reutilizamos las funciones de renderizado del modal original si es posible
  // (Aquí se asume que se pueden copiar/pegar o refactorizar a un archivo de utilidades)
  const getTransporteLabel = (id: number, otroValor?: string) => {
    const t = tiposTransporte.find((tt) => Number(tt.IdTipo) === Number(id));
    console.log(t?.nombre);
    if (t?.nombre === 'Otro' && otroValor) return otroValor;
    return t?.nombre || "Desconocido";
  };

  const getActividadNombre = (id: number) => tiposActividad.find((ta) => ta.id === id)?.nombre || "Desconocida";

  const renderTable = (title: string, headers: string[], data: (string|number)[][]) => (
    <div style={{ marginBottom: 16 }}>
      <b>{title}</b>
      <Table striped bordered size="sm" responsive>
        <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{data.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell || '-'}</td>)}</tr>)}</tbody>
      </Table>
    </div>
  );

  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Rutograma de: {empleadoNombre}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Ruta de Ida</h4>
        {renderTable("Rutas (Domicilio → Trabajo)", ["#", "Descripción"], (ida.rutas || []).map((r, i) => [i + 1, r]))}
        {renderTable("Transporte", ["#", "Medio"], (ida.tipoTransporteSeleccionado || []).map((id, i) => [i + 1, getTransporteLabel(id, ida.medioTransporteOtro)]))}
        {ida.haceActividadAntes && Array.isArray(ida.detallesActividades) && renderTable("Actividades", ["Actividad", "Ubicación", "Tiempo", "Descripción"], ida.detallesActividades.map((detalle, index) => {
            const actividadId = ida.actividadesSeleccionadas[index];
            return [getActividadNombre(actividadId), detalle.ubicacion, detalle.tiempo, detalle.descripcion];
        }))}
        
        <h4>Ruta de Regreso</h4>
        {renderTable("Rutas (Trabajo → Domicilio)", ["#", "Descripción"], (regreso.rutas || []).map((r, i) => [i + 1, r]))}
        {renderTable("Transporte", ["#", "Medio"], (regreso.tipoTransporteSeleccionado || []).map((id, i) => [i + 1, getTransporteLabel(id, regreso.medioTransporteOtro)]))}
        {regreso.haceActividadAntes && Array.isArray(regreso.detallesActividades) && renderTable("Actividades", ["Actividad", "Ubicación", "Tiempo", "Descripción"], regreso.detallesActividades.map((detalle, index) => {
            const actividadId = regreso.actividadesSeleccionadas[index];
            return [getActividadNombre(actividadId), detalle.ubicacion, detalle.tiempo, detalle.descripcion];
        }))}

        <hr />
        <h4>Acciones</h4>
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
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="warning" onClick={handleReturn}>Devolver con Comentarios</Button>
        <Button variant="success" onClick={onApprove}>Aprobar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalVerRutogramaRRHH;
