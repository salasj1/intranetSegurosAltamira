import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

interface ConfirmarSolicitudModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  checkPreviousRequest: () => void; // Nueva prop
  error: string | null; // Nueva prop para manejar errores
}

const ConfirmarSolicitudModal: React.FC<ConfirmarSolicitudModalProps> = ({ show, handleClose, handleConfirm, checkPreviousRequest, error }) => {
  const handleConfirmAndCheck = () => {
    handleConfirm();
    checkPreviousRequest(); // Llamar a la función después de confirmar
    if (error!==null) {
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