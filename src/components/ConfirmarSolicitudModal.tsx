import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

interface ConfirmarSolicitudModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  checkPreviousRequest: () => void; 
  error: string | null;
  vacacionID?: number; // Hacer vacacionID opcional
  fechaInicio: string;
  fechaFin: string;
}

const ConfirmarSolicitudModal: React.FC<ConfirmarSolicitudModalProps> = ({ show, handleClose, handleConfirm, checkPreviousRequest, error, vacacionID, fechaInicio, fechaFin }) => {
  const handleConfirmAndCheck = () => {
    handleConfirm();
    checkPreviousRequest();
    if (error !== null) {
      handleClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Solicitud</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Alert variant="primary">
          {vacacionID !== undefined && (
            <p><strong>ID de Vacaciones:</strong> {vacacionID}</p>
          )}
            <p><strong>Fecha de Inicio:</strong> {new Date(fechaInicio).toLocaleDateString('es-ES')}</p>
            <p><strong>Fecha de Fin:</strong> {new Date(fechaFin).toLocaleDateString('es-ES')}</p>
        </Alert>
        ¿Está seguro de que desea solicitar estas vacaciones?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleConfirmAndCheck}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmarSolicitudModal;