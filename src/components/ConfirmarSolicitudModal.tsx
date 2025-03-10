import axios from 'axios';
import { addDays } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { RiInformationLine } from "react-icons/ri";

interface ConfirmarSolicitudModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: (tipoConfirmacion: number) => void;
  cod_emp: string | null;
  error: string | null;
  setError: (error: string | null) => void;
  vacacionID?: number; // Hacer vacacionID opcional
  fechaInicio: string | null;
  fechaFin: string | null;
  fechaRetorno: string | null;
}

const ConfirmarSolicitudModal: React.FC<ConfirmarSolicitudModalProps> = ({ show, handleClose, handleConfirm, error, setError, cod_emp, vacacionID, fechaInicio, fechaFin, fechaRetorno }) => {
  const [success, setSuccess] = React.useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [tipoConfirmacion, setTipoConfirmacion] = useState<number | null>(null);
  const [diasDisfrutar, setDiasDifrutar] = useState<number | null>(null);

  useEffect(() => {
    if (error) {
      setSuccess(null);
      setError(error);
    }
  }, [error, setError]);

  useEffect(() => {
    if (show && vacacionID === undefined) {
      handleMensajeConfirmacion();
    }
  }, [show, vacacionID]);

  const handleMensajeConfirmacion = async () => {
    try {
      const response = await axios.get(`${apiUrl}/vacaciones/InfoConfirmacionSolicitudVacaciones`, {
        params: {
          fechaInicio,
          fechaFin,
          fechaRetorno
        }
      });
      setMensaje(response.data.Mensaje);
      setDiasDifrutar(response.data.diasDisfrutar);
      setTipoConfirmacion(response.data.TipoResultado);
    } catch (error) {
      console.error(error);
      setError('Hubo un error al retornar la información');
    }
  };

  const handleConfirmAndCheck = async () => {
    try {
      const response = await axios.get(`${apiUrl}/vacaciones/id/${cod_emp}`);
      const hasRequest = response.data.some((vacacion: any) => vacacion.Estado === 'solicitada' || vacacion.Estado === 'Aprobada');
      if (hasRequest) {
        setError('Ya tiene una solicitud de vacaciones pendiente.');
        return;
      }

      if (!hasRequest || error === null) {
        if (vacacionID === undefined) {
          if (tipoConfirmacion !== null) {
            handleConfirm(tipoConfirmacion);
          }
        }
        setSuccess('Solicitud enviada con éxito.');
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
        {success && <Alert variant="success" onClose={() => { }} dismissible>{success}</Alert>}
        {error && <Alert variant="danger" onClose={() => { setError('') }} dismissible>{error}</Alert>}

        <Alert variant="primary">
          {vacacionID !== undefined && (
            <p><strong>ID de Vacaciones:</strong> {vacacionID}</p>
          )}
          <p><strong>Fecha de Inicio de Vacaciones: </strong> {fechaInicio ? new Date(fechaInicio).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</p>
          {fechaRetorno && <p><strong>Fecha de Retorno de Vacaciones:</strong> {addDays(fechaRetorno,1).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>}
          <p><strong>Fecha de Fin del periodo de Vacaciones:</strong> {fechaFin ? addDays((fechaFin), 1).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</p>
          {diasDisfrutar && diasDisfrutar!==0 && <p><strong>Número de días hábiles a Disfrutar: </strong> {diasDisfrutar}  {diasDisfrutar === 1 ? 'día' : 'días'}</p>}
        </Alert>

        {vacacionID === undefined && (
          <Alert variant='warning' style={{ flex: 1,  }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RiInformationLine size={tipoConfirmacion && tipoConfirmacion == 2 ? 140 : 80} style={{ marginRight: '10px' }} />
              {mensaje && mensaje.split('@').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>
          </Alert>
        )}

        {success === null && vacacionID !== undefined && 'Está seguro de que desea solicitar estas vacaciones?'}
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