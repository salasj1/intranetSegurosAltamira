import { addDays, format, parseISO } from 'date-fns';
import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

interface Permiso {
  PermisosID: number;
  Fecha_inicio: string;
  Fecha_Fin: string;
  Estado: string | string[];
  ci: string;
  Titulo: string;
  descripcion: string;
  nombres: string;
  apellidos: string;
  cod_emp: string;
  Motivo: string;
}

interface ModalConfirmacionProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  permiso: Permiso | null;
  action: 'approve' | 'reject';
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({ show, onHide, onConfirm, permiso, action }) => {
  if (!permiso) return null; // Verificar si permiso es null

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{action === 'approve' ? 'Procesar Permiso' : 'Rechazar Permiso'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <Alert variant={action === 'approve' ? 'primary' : 'secondary'}>
        <p><strong>ID Permiso:</strong> {permiso.PermisosID}</p>
        <p><strong>Empleado:</strong> {permiso.cod_emp}</p>
        <p><strong>Título:</strong> {permiso.Titulo}</p>
        <p><strong>Fecha Inicio:</strong> {format(addDays(parseISO(permiso.Fecha_inicio.toString()), 1), 'dd/MM/yyyy')}</p>
        <p><strong>Fecha Fin:</strong> {format(addDays(parseISO(permiso.Fecha_Fin.toString()), 1), 'dd/MM/yyyy')}</p>
      </Alert>
        <p>¿Está seguro que desea {action === 'approve' ? 'procesar' : 'rechazar'} el siguiente permiso?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant={action === 'approve' ? 'primary' : 'danger'} onClick={onConfirm}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalConfirmacion;