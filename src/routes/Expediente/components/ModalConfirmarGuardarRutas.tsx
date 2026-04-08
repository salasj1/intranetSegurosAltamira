import React from "react";
import { Modal, Button, Alert, Table, Spinner } from "react-bootstrap";
import Binoculares from "@/assets/binoculares.gif";
import { IRutogramaPayload, TipoTransporte, TipoActividad } from "@/types/rutograma.types";

interface ModalConfirmarGuardarRutasProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  resumenDatos: IRutogramaPayload;
  tiposTransporte: TipoTransporte[];
  tiposActividad: TipoActividad[];
  isSubmitting?: boolean;
}

const ModalConfirmarGuardarRutas: React.FC<ModalConfirmarGuardarRutasProps> = ({
  show,
  onHide,
  onConfirm,
  resumenDatos,
  tiposTransporte,
  tiposActividad,
  isSubmitting = false,
}) => {
  const { global = {}, ida = {}, regreso = {} } = resumenDatos || {};

  const {
    horarioTrabajoDesde,
    horarioTrabajoHasta,
    horaSalida,
    nombreReferencia,
    telefonoReferencia,
  } = global;

  const {
    rutas: rutasOficina = [],
    tiempoViaje,
    haceEscalas,
    numEscalas,
    haceActividadAntes,
    actividadesSeleccionadas = [],
    detallesActividades = {},
    tipoTransporteSeleccionado = [],
    medioTransporteOtro,
  } = ida;

  const {
    rutas: rutasCasa = [],
    tiempoViaje: tiempoViajeRegreso,
    haceEscalas: haceEscalasRegreso,
    numEscalas: numEscalasRegreso,
    haceActividadAntes: haceActividadAntesRegreso,
    actividadesSeleccionadas: actividadesSeleccionadasRegreso = [],
    detallesActividades: detallesActividadesRegreso = {},
    tipoTransporteSeleccionado: tipoTransporteSeleccionadoRegreso = [],
    medioTransporteOtro: medioTransporteOtroRegreso,
  } = regreso;

  // Utilidad para obtener el label del transporte
  const getTransporteLabel = (id: number, otroValor?: string) => {
    if (typeof id !== "number" || isNaN(id)) return "Desconocido";
    const t = tiposTransporte.find((tt) => Number(tt.IdTipo) === Number(id));
    if (t?.nombre === 'Otro' && otroValor) {
      return `${otroValor}`;
    }
    return t && t.nombre ? t.nombre : "Desconocido";
  };

  // Utilidad para obtener el nombre de la actividad
  const getActividadNombre = (id: number, otroValor?: string) => {
    if (typeof id !== "number" || isNaN(id)) return "Desconocida";
    const a = tiposActividad.find((ta) => Number(ta.id) === Number(id));
    if (a?.nombre === 'Otro' && otroValor) {
      return `${otroValor}`;
    }
    return a && a.nombre ? a.nombre : "Desconocida";
  };

  // Construir tabla de rutas
  const renderRutasTable = (rutas: string[], titulo: string) => (
    <div style={{ marginBottom: 16 }}>
      <b>{titulo}</b>
      <Table striped bordered size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Descripción de la ruta</th>
          </tr>
        </thead>
        <tbody>
          {rutas.filter(r => r.trim() !== "").map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{r}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  // Tabla de transportes
  const renderTransportesTable = (ids: number[], titulo: string, otroValor?: string) => (
    <div style={{ marginBottom: 16 }}>
      <b>{titulo}</b>
      <Table striped bordered size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Medio de transporte</th>
          </tr>
        </thead>
        <tbody>
          {ids.map((id, i) => (
            <tr key={id}>
              <td>{i + 1}</td>
              <td>{getTransporteLabel(id, otroValor)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  // Tabla de actividades previas

  
  const renderActividadesTable = (ids: number[], detalles: any, titulo: string) => {
    if (!ids || ids.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <b>{titulo}</b>
        <Table striped bordered size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Tiempo</th>
              <th style={{ minWidth: 180 }}>Descripción de la actividad</th>
              <th>Frecuencia</th>
            </tr>
          </thead>
          <tbody>
            {ids.map((id, i) => {
              const d = detalles[id] || {};
              return (
                <tr key={id}>
                  <td>{i + 1}</td>
                  <td>{getActividadNombre(id, d.otro)}</td>
                  <td>{d.ubicacion || ""}</td>
                  <td>{d.tiempo || ""}</td>
                  <td style={{ maxWidth: 300, wordBreak: "break-word" }}>{d.descripcion || d.otro || ""}</td>
                  <td>{d.frecuencia || ""}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            Confirmar Guardado de Rutograma
          </span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning">
          <img
            src={Binoculares}
            alt="Advertencia"
            style={{ width: "38px", height: "38px", marginRight: "10px" }}
          />
          <b>¡Atención!</b> Revise cuidadosamente los datos antes de guardar.
          <br />
          <span style={{ color: "#b30000" }}>
            No podrá editar el rutograma nuevamente hasta que Recursos Humanos
            procese su solicitud.
          </span>
        </Alert>
        {/* Rutas Ida */}
        {renderRutasTable(rutasOficina, "Rutas IDA (Domicilio → Trabajo)")}
        {/* Rutas Regreso */}
        {renderRutasTable(rutasCasa, "Rutas REGRESO (Trabajo → Domicilio)")}
        {/* Transportes Ida */}
        {renderTransportesTable(tipoTransporteSeleccionado, "Medios de transporte IDA", medioTransporteOtro)}
        {/* Transportes Regreso */}
        {renderTransportesTable(tipoTransporteSeleccionadoRegreso, "Medios de transporte REGRESO", medioTransporteOtroRegreso)}
        {/* Actividades Ida */}
        {haceActividadAntes && renderActividadesTable(actividadesSeleccionadas, detallesActividades, "Actividades previas IDA")}
        {/* Actividades Regreso */}
        {haceActividadAntesRegreso && renderActividadesTable(actividadesSeleccionadasRegreso, detallesActividadesRegreso, "Actividades previas REGRESO")}
        {/* Otros datos */}
        <div style={{ marginTop: 16 }}>
          <b>Otros datos</b>
          <ul>
            <li>
              Hora salida casa:{" "}
              {horaSalida || "N/D"}
            </li>
            <li>
              Horario trabajo:{" "}
              {`${horarioTrabajoDesde || ''} - ${horarioTrabajoHasta || ''}`}
            </li>
            <li>Tiempo viaje ida: {tiempoViaje || "N/D"}</li>
            <li>Tiempo viaje regreso: {tiempoViajeRegreso || "N/D"}</li>
            <li>
              Escalas ida:{" "}
              {haceEscalas === null
                ? "N/D"
                : haceEscalas
                ? "Sí"
                : "No"}{" "}
              {haceEscalas && " - Nº " + (numEscalas ?? "")}
            </li>
            <li>
              Escalas regreso:{" "}
              {haceEscalasRegreso === null
                ? "N/D"
                : haceEscalasRegreso
                ? "Sí"
                : "No"}{" "}
              {haceEscalasRegreso && " - Nº " + (numEscalasRegreso ?? "")}
            </li>
            <li>
              Actividades ida:{" "}
              {haceActividadAntes === null
                ? "N/D"
                : haceActividadAntes
                ? "Sí"
                : "No"}
            </li>
            <li>
              Actividades regreso:{" "}
              {haceActividadAntesRegreso === null
                ? "N/D"
                : haceActividadAntesRegreso
                ? "Sí"
                : "No"}
            </li>
            <li>
              Contacto referencia: {nombreReferencia} - {telefonoReferencia}
            </li>
          </ul>
        </div>
        <p>¿Está seguro que desea guardar este rutograma?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              {' '} Guardando...
            </>
          ) : (
            'Confirmar Guardado'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalConfirmarGuardarRutas;