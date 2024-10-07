import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

interface ConfirmarEliminacionModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  vacacionID: number;
  fechaInicio: string;
  fechaFin: string;
}

const ConfirmarEliminacionModal: React.FC<ConfirmarEliminacionModalProps> = ({ show, handleClose, handleConfirm, vacacionID, fechaInicio, fechaFin }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="secondary">
          <p><strong>ID de Vacaciones:</strong> {vacacionID}</p>
          <p><strong>Fecha de Inicio:</strong> {fechaInicio}</p>
          <p><strong>Fecha de Fin:</strong> {fechaFin}</p>
        </Alert>
        ¿Está seguro de que desea eliminar esta vacación?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmarEliminacionModal;