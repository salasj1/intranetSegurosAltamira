import axios from 'axios';
import { addDays } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { RiInformationLine } from "react-icons/ri";
import stylesLoading from "../css/loading.module.css";
import { Mosaic } from "react-loading-indicators";

interface ConfirmarSolicitudModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: (tipoConfirmacion: number) => void;
  cod_emp: string | null;
  error: string | null;
  setError: (error: string | null) => void;
  vacacionID?: number; 
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
  const [isLoading, setIsLoading] = useState<boolean>(false); // Nuevo estado para controlar la carga

  useEffect(() => {
    if (error) {
      setSuccess(null);
      console.log(error);
      if (typeof error === 'object' && (error as any)?.response?.data?.message) {
        setError((error as any)?.response?.data?.message || 'Error desconocido');
      } else {
        setError(String(error));
      }
    }
  }, [error, setError]);

  useEffect(() => {
    if (show && vacacionID === undefined) {
      handleMensajeConfirmacion();
    }
  }, [show, vacacionID]);

  const handleMensajeConfirmacion = async () => {
    
    // Asegurarse de que fechaRetorno tenga la hora en 00:00
    const fechaInicioDate = new Date(fechaInicio || '');
    const fechaInicioT00 = fechaInicioDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
    console.log("fechaInicio", fechaInicioT00);
    console.log("fechaFin", fechaFin);
    console.log("fechaRetorno", fechaRetorno);

    try {
      const response = await axios.get(`${apiUrl}/vacaciones/InfoConfirmacionSolicitudVacaciones`, {
        params: {
          fechaInicio: fechaInicioT00,
          fechaFin: fechaFin,
          fechaRetorno: fechaRetorno ,
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
    setIsLoading(true); // Activar el estado de carga
    try {
      const response = await axios.get(`${apiUrl}/vacaciones/id/${cod_emp}`);
      const hasRequest = response.data.some((vacacion: any) => vacacion.Estado === 'solicitada' || vacacion.Estado === 'Aprobada');
      if (hasRequest) {
        setError('Ya tiene una solicitud de vacaciones pendiente.');
        setIsLoading(false); // Desactivar el estado de carga en caso de error
        return;
      }

      if (!hasRequest || error === null) {
        if (vacacionID === undefined) {
          if (tipoConfirmacion !== null) {
            try {
              await handleConfirm(tipoConfirmacion);
            } catch (confirmError) {
              console.error('Error al confirmar la solicitud:', confirmError);
              setError((confirmError as any)?.response?.data?.message );
            }
          }
        }
      }
    } catch (error) {
      setError((error as any)?.response?.data?.message || 'Error al verificar solicitudes');
    } finally {
      setIsLoading(false); // Desactivar el estado de carga al finalizar
    }
  };

  return (
    <Modal show={show} onHide={() => { handleClose(); setError(''); setSuccess(null); }} >
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Solicitud</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? ( // Mostrar el estado de carga si isLoading es true
          <div className={stylesLoading.loadingDocument} style={{display: 'flex',flexDirection:'column', alignItems: 'center',justifyContent: 'center', gap:'15px', textAlign:'center'}}>
            <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="small" text="" textColor="#0d1bff" />
            <h5>Procesando su solicitud, por favor espere un momento y no recargue la página.</h5>
          </div>
        ) : (
          <>
            {error && <Alert variant="danger" onClose={() => { setError('') }} dismissible>{error}</Alert>}
            <Alert variant="primary">
              <h3>Disfrute de Vacaciones</h3>
              <p><strong>Desde:</strong> {fechaInicio ? new Date(fechaInicio).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</p>
              <p><strong>Hasta:</strong> {fechaRetorno ? addDays(new Date(fechaRetorno), -1).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</p>
              {fechaRetorno && <p><strong>Fecha de Retorno:</strong> {new Date(fechaRetorno).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>}
              {diasDisfrutar && diasDisfrutar !== 0 && <p><strong>Días hábiles a disfrutar:</strong> {diasDisfrutar} {diasDisfrutar === 1 ? 'día' : 'días'}</p>}
            </Alert>
            <Alert variant="primary">
              <h3>Vacaciones Pagadas</h3>
              <p><strong>Desde:</strong> {fechaInicio ? new Date(fechaInicio).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</p>
              <p><strong>Hasta:</strong> {fechaFin ? addDays(new Date(fechaFin), 1).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</p>
            </Alert>

            {vacacionID === undefined && (
              <Alert variant='warning' style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <RiInformationLine size={mensaje?.includes('permiso') ? 160 : 80} style={{ marginRight: '10px'}} />
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
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!isLoading && ( // Ocultar botones si está cargando
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            {/* !success && ( */
              <Button variant="primary" onClick={handleConfirmAndCheck}>
                Confirmar
              </Button>
            /* ) */}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmarSolicitudModal;