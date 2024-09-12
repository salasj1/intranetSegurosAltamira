import { Modal, Button, Alert } from 'react-bootstrap';


interface AprobarVacacionesModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  action: 'approve' | 'reject';
  vacacionID: number;
  nombreEmpleado: string;
  fechaInicio: string;
  fechaFin: string;
}

const AprobarVacacionesModal: React.FC<AprobarVacacionesModalProps> = ({ show, handleClose, handleConfirm, action, vacacionID, nombreEmpleado, fechaInicio, fechaFin }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{action === 'approve' ? 'Aprobar Vacaciones' : 'Devolver Vacaciones'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>        
        <Alert variant={action==='approve'? "primary" : "secondary"}>
        <p><strong>ID de Vacaciones:</strong> {vacacionID}</p>
        <p><strong>Nombre del Empleado:</strong> {nombreEmpleado}</p>
        <p><strong>Fecha de Inicio:</strong> {fechaInicio}</p>
        <p><strong>Fecha de Fin:</strong> {fechaFin}</p>
        </Alert>
        <p>{action === 'approve' ? '¿Está seguro que desea aprobar estas vacaciones?' : '¿Está seguro que desea devolver estas vacaciones?'}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant={action==='approve'? "primary":"danger"} onClick={handleConfirm}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AprobarVacacionesModal;