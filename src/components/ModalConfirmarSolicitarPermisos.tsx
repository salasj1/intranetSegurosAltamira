import { Modal, Button } from 'react-bootstrap';
import { Mosaic } from 'react-loading-indicators';
import stylesLoading from '../css/loading.module.css';

interface ConfirmModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: () => Promise<void>; // Cambiar a una función asíncrona
  isLoading: boolean; // Nuevo estado para controlar la carga
}

function ModalConfirmarSolicitarPermisos({ show, handleClose, handleConfirm, isLoading }: ConfirmModalProps) {
  return (
    <Modal show={show} onHide={!isLoading ? handleClose : undefined}>
      <Modal.Header closeButton={!isLoading}>
        <Modal.Title>Confirmar Solicitud</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className={stylesLoading.loadingDocument}>
            <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="small" text="" textColor="#0d1bff" />
          </div>
        ) : (
          '¿Está seguro de que desea solicitar este permiso?'
        )}
      </Modal.Body>
      <Modal.Footer>
        {!isLoading && (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              Confirmar
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ModalConfirmarSolicitarPermisos;