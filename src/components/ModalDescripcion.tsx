import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ModalDescripcionProps {
  show: boolean;
  onHide: () => void;
  permiso: any;
}

const ModalDescripcion: React.FC<ModalDescripcionProps> = ({ show, onHide, permiso }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Descripción del Permiso</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>ID Permiso:</strong> {permiso?.PermisosID}</p>
        <p><strong>Nombre:</strong> {permiso?.Titulo}</p>
        <p><strong>Descripción:</strong> {permiso?.descripcion}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalDescripcion;