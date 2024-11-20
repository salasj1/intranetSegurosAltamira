

import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

interface ConfirmarSolicitudModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  checkPreviousRequest: () => void; 
  error: string | null;
  setError: (error: string | null) => void;
  vacacionID?: number; // Hacer vacacionID opcional
  fechaInicio: string | null;
  fechaFin: string | null;
  
}

const ConfirmarSolicitudModal: React.FC<ConfirmarSolicitudModalProps> = ({ show, handleClose, handleConfirm, checkPreviousRequest, error,setError, vacacionID, fechaInicio, fechaFin }) => {
  const [success, setSuccess] = React.useState<string | null>(null);
  const handleConfirmAndCheck = () => {
    handleConfirm();
    checkPreviousRequest();
    console.log('error', error);
    if (error === null) {
      setSuccess('Solicitud enviada exitosamente');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Solicitud</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" onClose={() => {setError('')}} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => {setSuccess('')}} dismissible>{success}</Alert>}
        <Alert variant="primary">
          {vacacionID !== undefined && (
            <p><strong>ID de Vacaciones:</strong> {vacacionID}</p>
          )}
            <p><strong>Fecha de Inicio:</strong> {fechaInicio ? fechaInicio: 'N/A'}</p>
            <p><strong>Fecha de Fin:</strong> {fechaFin ? fechaFin : 'N/A'}</p>
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