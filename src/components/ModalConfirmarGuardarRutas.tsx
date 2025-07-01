import React from "react";
import { Modal, Button, Alert, Table } from "react-bootstrap";
import Binoculares from "../assets/binoculares.gif"; // Ajusta la ruta si es necesario

interface ModalConfirmarGuardarRutasProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  rutasOficina?: string[];
  rutasCasa?: string[];
}

const ModalConfirmarGuardarRutas: React.FC<ModalConfirmarGuardarRutasProps> = ({
  show,
  onHide,
  onConfirm,
  rutasOficina = [],
  rutasCasa = [],
}) => (
  <Modal show={show} onHide={onHide} centered size="lg">
    <Modal.Header closeButton>
      <Modal.Title>
        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          Confirmar Guardado de Rutas
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
        <b>¡Atención!</b> Revise cuidadosamente las rutas antes de guardar.<br />
        <span style={{ color: "#b30000" }}>
          No podrá editar las rutas nuevamente hasta que Recursos Humanos procese su solicitud.
        </span>
      </Alert>
      <div>
        <b>Rutas desde hospedaje hasta la oficina:</b>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th style={{ width: "40px", textAlign: "center" }}>#</th>
              <th>Ruta</th>
            </tr>
          </thead>
          <tbody>
            {rutasOficina.map((ruta, idx) => (
              <tr key={idx}>
                <td style={{ width: "40px", textAlign: "center" }}>{idx + 1}</td>
                <td >{ruta}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <b>Rutas desde la oficina hasta el hospedaje:</b>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th style={{ width: "40px", textAlign: "center" }}>#</th>
              <th>Ruta</th>
            </tr>
          </thead>
          <tbody>
            {rutasCasa.map((ruta, idx) => (
              <tr key={idx}>
                <td style={{ width: "40px", textAlign: "center" }}>{idx + 1}</td>
                <td>{ruta}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <p>¿Está seguro que desea guardar estas rutas?</p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={onConfirm}>
        Confirmar Guardado
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ModalConfirmarGuardarRutas;