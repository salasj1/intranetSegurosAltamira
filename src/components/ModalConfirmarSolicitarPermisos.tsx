import { Modal, Button } from 'react-bootstrap';

interface ConfirmModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
}

function ModalConfirmarSolicitarPermisos({ show, handleClose, handleConfirm }: ConfirmModalProps) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Solicitud</Modal.Title>
      </Modal.Header>
      <Modal.Body>¿Está seguro de que desea solicitar este permiso?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalConfirmarSolicitarPermisos;