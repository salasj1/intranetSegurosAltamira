import { Modal, Button, Alert } from 'react-bootstrap';
import { useState } from 'react';
import stylesLoading from "../css/loading.module.css";
import { Mosaic } from "react-loading-indicators";

interface AprobarVacacionesModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: () => Promise<void>;
  action: 'approve' | 'reject';
  vacacionID: number;
  DiasVacaciones: number;
  nombreEmpleado: string;
  ci: string;
  departamento: string;
  cargo: string;
  fechaInicio: string;
  fechaFin: string;
  error: string | null;
  setError: (value: string | null) => void;
}

const AprobarVacacionesModal: React.FC<AprobarVacacionesModalProps> = ({
  show,
  handleClose,
  handleConfirm,
  action,
  vacacionID,
  DiasVacaciones,
  nombreEmpleado,
  fechaInicio,
  fechaFin,
  error,
  setError,
  ci,
  departamento,
  cargo,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado de carga

  const handleConfirmWithLoading = async () => {
    setIsLoading(true); // Activar el estado de carga
    try {
      await handleConfirm();
    } catch (err) {
      console.error('Error al confirmar:', err);
    } finally {
      setIsLoading(false); // Desactivar el estado de carga
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{action === 'approve' ? 'Aprobar Vacaciones' : 'Devolver Vacaciones'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? ( // Mostrar el estado de carga si isLoading es true
          <div
            className={stylesLoading.loadingDocument}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px',
              textAlign: 'center',
            }}
          >
            <Mosaic
              color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]}
              size="small"
              text=""
              textColor="#0d1bff"
            />
            <h5>Procesando su solicitud, por favor espere un momento.</h5>
          </div>
        ) : (
          <>
            {error && (
              <Alert
                variant="danger"
                onClose={() => setError(null)}
                dismissible
              >
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
              </Alert>
            )}
            <Alert variant={action === 'approve' ? 'primary' : 'secondary'}>
              <p><strong>ID de Vacaciones:</strong> {vacacionID}</p>
              <p><strong>Número de días de vacaciones: </strong>{DiasVacaciones}</p>
              <p><strong>Nombre del Empleado:</strong> {nombreEmpleado}</p>
              <p><strong>Cédula:</strong> {ci}</p>
              <p><strong>Departamento:</strong> {departamento}</p>
              <p><strong>Cargo:</strong> {cargo}</p>
              <p><strong>Fecha de Inicio:</strong> {fechaInicio}</p>
              <p><strong>Fecha de Fin:</strong> {fechaFin}</p>
            </Alert>
            <p>
              {action === 'approve'
                ? '¿Está seguro que desea aprobar estas vacaciones?'
                : '¿Está seguro que desea devolver estas vacaciones?'}
            </p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!isLoading && ( // Ocultar botones si está cargando
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              variant={action === 'approve' ? 'primary' : 'danger'}
              onClick={handleConfirmWithLoading}
            >
              Confirmar
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AprobarVacacionesModal;