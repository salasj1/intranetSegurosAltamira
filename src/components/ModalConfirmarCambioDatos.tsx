import React from "react";
import { Modal, Button, Alert, Table } from "react-bootstrap";
import Binoculares from "../assets/binoculares.gif"; // Ajusta la ruta si es necesario

// Cambia el nombre y agrega props para mostrar cambios
interface CambioDato {
  campo: string;
  anterior: string;
  nuevo: string;
}

interface Profesion {
  id: number;
  descripcion: string;
}

interface ModalConfirmarCambioDatosProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  cambios: CambioDato[];
  profesiones?: Profesion[]; // Añadir profesiones como prop opcional
}

const estadoCivilMap: Record<string, string> = {
  S: "Soltero",
  C: "Casado",
  D: "Divorciado",
  V: "Viudo"
};

const traducirCampo = (campo: string, valor: string, profesiones: Profesion[] = []) => {
  if (campo === "Estado Civil") {
    return estadoCivilMap[valor] || valor;
  }
  if (campo === "Profesión") {
    if (!valor) return "No especificada";
    const profesionEncontrada = profesiones.find(p => String(p.id) === valor);
    return profesionEncontrada ? profesionEncontrada.descripcion : valor;
  }
  return valor;
};

const ModalConfirmarCambioDatos: React.FC<ModalConfirmarCambioDatosProps> = ({
  show,
  onHide,
  onConfirm,
  cambios = [],
  profesiones = [], // Recibir profesiones
}) => (
  <Modal show={show} onHide={onHide} centered size="lg" >
    <Modal.Header closeButton>
      <Modal.Title>
        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          Confirmar Solicitud de Cambio de Datos
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
        <b>¡Atención!</b> Revise cuidadosamente los datos antes de confirmar.<br />
        <span style={{ color: "#b30000" }}>
          No podrá solicitar otro cambio hasta que Recursos Humanos procese su solicitud.
        </span>
      </Alert>
      <div>
        <b>Cambios detectados:</b>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th style={{ width: "40px", textAlign: "center" }}>#</th>
              <th>Campo</th>
              <th>Valor Anterior</th>
              <th>Nuevo Valor</th>
            </tr>
          </thead>
          <tbody>
            {cambios.map((cambio, idx) => {
              // Si el campo es Teléfono Celular y contiene "/", mostrar ambos
              let anterior = cambio.anterior;
              let nuevo = cambio.nuevo;
              if (cambio.campo === "Teléfono Celular") {
                // Si ya tiene "/", mostrar tal cual, si no, mostrar solo el valor
                anterior = cambio.anterior;
                nuevo = cambio.nuevo;
              }
              return (
                <tr key={idx}>
                  <td style={{ width: "40px", textAlign: "center" }}>{idx + 1}</td>
                  <td>{cambio.campo}</td>
                  <td>{traducirCampo(cambio.campo, anterior, profesiones)}</td>
                  <td>{traducirCampo(cambio.campo, nuevo, profesiones)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <p>¿Está seguro que desea solicitar estos cambios?</p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={onConfirm} disabled={cambios.length === 0}>
        Confirmar Solicitud
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ModalConfirmarCambioDatos;