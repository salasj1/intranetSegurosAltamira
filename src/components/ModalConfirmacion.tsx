import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ModalConfirmacionProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  permiso: any;
  action: 'approve' | 'reject';
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({ show, onHide, onConfirm, permiso, action }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar {action === 'approve' ? 'Aprobación' : 'Rechazo'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>¿Estás seguro de que deseas {action === 'approve' ? 'aprobar' : 'rechazar'} este permiso?</p>
        <p><strong>ID Permiso:</strong> {permiso?.PermisosID}</p>
        <p><strong>Nombre:</strong> {permiso?.Titulo}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={onConfirm}>Confirmar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalConfirmacion;