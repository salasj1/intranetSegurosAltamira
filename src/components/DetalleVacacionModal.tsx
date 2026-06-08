import { useState } from 'react';
import { Modal, Button, Alert, Row, Col } from 'react-bootstrap';
import { Mosaic } from 'react-loading-indicators';
import { format, addDays, parseISO } from 'date-fns';
import { Vacacion } from '../routes/ProcesarVacaciones';
import stylesLoading from '../css/loading.module.css';

interface DetalleVacacionModalProps {
  show: boolean;
  handleClose: () => void;
  vacacion: Vacacion;
  onProcess: (vacacion: Vacacion) => Promise<void>;
  onReject: (vacacion: Vacacion) => Promise<void>;
}

const DetalleVacacionModal: React.FC<DetalleVacacionModalProps> = ({
  show,
  handleClose,
  vacacion,
  onProcess,
  onReject,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatFecha = (fecha: Date | null) => {
    if (!fecha) return 'Sin definir';
    return format(addDays(parseISO(fecha.toString()), 1), 'dd/MM/yyyy');
  };

  const handleProcess = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onProcess(vacacion);
      handleClose();
    } catch {
      setError('Error al procesar las vacaciones. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onReject(vacacion);
      handleClose();
    } catch {
      setError('Error al rechazar las vacaciones. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setError(null);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Vacación #{vacacion.VacacionID}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div
            className={stylesLoading.loadingDocument}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', textAlign: 'center' }}
          >
            <Mosaic color={['#003391', '#1A5FFA', '#33CCCC', '#1A3FFA']} size="small" text="" textColor="#0d1bff" />
            <h5>Procesando su solicitud, por favor espere un momento.</h5>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            <Alert variant="primary">
              <Row>
                <Col md={6}>
                  <p><strong>ID Vacación:</strong> {vacacion.VacacionID}</p>
                  <p><strong>Cédula:</strong> {vacacion.ci}</p>
                  <p><strong>Empleado:</strong> {vacacion.nombres_empleado} {vacacion.apellidos_empleado}</p>
                  <p><strong>Departamento:</strong> {vacacion.departamento}</p>
                  <p><strong>Cargo:</strong> {vacacion.cargo}</p>
                  <p><strong>Supervisor:</strong> {vacacion.nombres_supervisor} {vacacion.apellidos_supervisor}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Fecha Inicio:</strong> {formatFecha(vacacion.FechaInicio)}</p>
                  <p><strong>Fecha Fin:</strong> {formatFecha(vacacion.FechaFin)}</p>
                  <p><strong>Fecha Retorno:</strong> {formatFecha(vacacion.FechaRetorno)}</p>
                  <p><strong>Días a Disfrutar:</strong> {vacacion.diasDisfrutar}</p>
                  <p><strong>Días a Pagar:</strong> {vacacion.diasPagar}</p>
                  <p><strong>Período:</strong> {vacacion.labelPeriodo ?? 'No especificado'}</p>
                  <p><strong>Estado:</strong> {vacacion.Estado}</p>
                </Col>
              </Row>
            </Alert>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!isLoading && (
          <>
            <Button variant="secondary" onClick={handleModalClose}>
              Cerrar
            </Button>
            {vacacion.Estado === 'Aprobada' && (
              <>
                <Button variant="danger" onClick={handleReject}>
                  Rechazar
                </Button>
                <Button variant="success" onClick={handleProcess}>
                  Aprobar / Procesar
                </Button>
              </>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DetalleVacacionModal;
