

import axios from 'axios';
import React, { useEffect } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

interface ConfirmarSolicitudModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  cod_emp: string | null;
  error: string | null;
  setError: (error: string | null) => void;
  vacacionID?: number; // Hacer vacacionID opcional
  fechaInicio: string | null;
  fechaFin: string | null;
  
}

const ConfirmarSolicitudModal: React.FC<ConfirmarSolicitudModalProps> = ({ show, handleClose, handleConfirm, error,setError,cod_emp, vacacionID, fechaInicio, fechaFin }) => {
  const [success, setSuccess] = React.useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    if (error) {
      setSuccess(null);
    }
  }, [error]);
  const handleConfirmAndCheck = async () => {
    try {
      
       const response = await axios.get(`${apiUrl}/vacaciones/id/${cod_emp}`);
      const hasRequest = response.data.some((vacacion: any) => vacacion.Estado === 'solicitada' || vacacion.Estado === 'Aprobada');
      if (hasRequest) {
        setError('Ya tiene una solicitud de vacaciones pendiente. 3');
        return;
      }
      if(!hasRequest || error === null){
        handleConfirm();
        setSuccess('Solicitud enviada con exito.');
      }
      
    } catch (error) {
      setError((error as any)?.message);
    }
  };

  return (
    <Modal show={show} onHide={() => { handleClose(); setError(''); setSuccess(null); }}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Solicitud</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        { success && <Alert variant="success" onClose={() => {} } dismissible>{success}</Alert>}
        {error && <Alert variant="danger" onClose={() => {}} dismissible>{error}</Alert>}
        <Alert variant="primary">
          {vacacionID !== undefined && (
            <p><strong>ID de Vacaciones:</strong> {vacacionID}</p>
          )}
            <p><strong>Fecha de Inicio:</strong> {fechaInicio ? new Date(fechaInicio).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</p>
            <p><strong>Fecha de Fin:</strong> {fechaFin ? new Date(fechaFin).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</p>
        </Alert>
        {success === null && 'Está seguro de que desea solicitar estas vacaciones?'}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        {!success && (
          <Button variant="primary" onClick={handleConfirmAndCheck}>
            Confirmar
          </Button>
        )}
        
        
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmarSolicitudModal;