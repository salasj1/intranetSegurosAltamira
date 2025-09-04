import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { format, addDays, parseISO } from 'date-fns';
import stylesLoading from "../css/loading.module.css";
import { Mosaic } from "react-loading-indicators";
import axios from 'axios';
interface Permiso {
  PermisosID: number;
  cod_emp: string;
  Fecha_inicio: string;
  Fecha_Fin: string;
  Titulo: string;
  Motivo: string;
  Estado: string;
  descontable: boolean;
  ci: string;
  nombres: string;
  apellidos: string;
  descripcion: string;
  departamento: string;
  cargo: string;
}

interface ModalConfirmacionPermisoProps {
  show: boolean;
  onHide: () => void;
  onConfirm: (setError: (message: string) => void) => Promise<void>;
  permiso: Permiso | null;
  action: 'approve' | 'reject';
  error: string | null;
  setError: (message: string) => void;
}

const ModalConfirmacionPermiso: React.FC<ModalConfirmacionPermisoProps> = ({ show, onHide, onConfirm, permiso, action, error, setError }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado de carga

  if (!permiso) return null;

  const handleConfirm = async () => {
    setIsLoading(true); // Activar el estado de carga
    try {
      await onConfirm(setError);
    } catch (error) {
      let errorMessage = 'Error al solicitar permiso';
      if (axios.isAxiosError(error) && error.response?.data) {
        console.error(error.response.data);
        errorMessage = typeof error.response.data === 'string'
          ? error.response.data
          : error.response.data.message || errorMessage;
      }
      setError(errorMessage); // Establecer el mensaje de error como string
      console.error('Error al confirmar:', error);
    } finally {
      setIsLoading(false); // Desactivar el estado de carga
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{action === 'approve' ? 'Aprobar Permiso' : 'Rechazar Permiso'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? ( // Mostrar el estado de carga si isLoading es true
          <div className={stylesLoading.loadingDocument} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', textAlign: 'center' }}>
            <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="small" text="" textColor="#0d1bff" />
            <h5>Procesando su solicitud, por favor espere un momento.</h5>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {typeof error === 'string' ? error : (error as any).message || 'Ocurrió un error inesperado'}
              </Alert>
            )}
            <Alert variant={action === 'approve' ? 'primary' : 'secondary'}>
              <p><strong>ID Permiso:</strong> {permiso.PermisosID}</p>
              <p><strong>Cédula:</strong> {permiso.ci}</p>
              <p><strong>Empleado:</strong> {permiso?.nombres + " " + permiso?.apellidos}</p>
              <p><strong>Departamento:</strong> {permiso?.departamento}</p>
              <p><strong>Cargo:</strong> {permiso?.cargo}</p>
              <p><strong>Título:</strong> {permiso.Titulo}</p>
              <p><strong>Fecha Inicio:</strong> {format(addDays(parseISO(permiso.Fecha_inicio.toString()), 1), 'dd/MM/yyyy')}</p>
              <p><strong>Fecha Fin:</strong> {format(addDays(parseISO(permiso.Fecha_Fin.toString()), 1), 'dd/MM/yyyy')}</p>
              <p><strong>Descontable:</strong> {permiso.descontable ? 'Si' : 'No'}</p>
            </Alert>
            <p>¿Está seguro que desea {action === 'approve' ? 'aprobar' : 'rechazar'} el siguiente permiso?</p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!isLoading && ( // Ocultar botones si está cargando
          <>
            <Button variant="secondary" onClick={onHide}>
              Cancelar
            </Button>
            <Button variant={action === 'approve' ? 'primary' : 'danger'} onClick={handleConfirm}>
              Confirmar
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ModalConfirmacionPermiso;