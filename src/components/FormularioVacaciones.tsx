import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import { Form, Button, Alert, Card, AlertHeading } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/FormularioVacaciones.css';
import { isBefore, isEqual, parseISO } from 'date-fns';
import ConfirmarSolicitudModal from './ConfirmarSolicitudModal';

interface FormularioVacacionesProps {
  fetchVacaciones: () => void;
}

const FormularioVacaciones: React.FC<FormularioVacacionesProps> = ({ fetchVacaciones }) => {
  const { cod_emp } = useAuth();
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [diasCausados, setDiasCausados] = useState<number | null>(null);
  const [diasDisfrutados, setDiasDisfrutados] = useState<number | null>(null);
  const [diasHabiles, setDiasHabiles] = useState<number | null>(null);
  const [hasPreviousRequest, setHasPreviousRequest] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const checkPreviousRequest = async () => {
    try {
      const response = await axios.get(`/api/vacaciones/${cod_emp}`);
      const hasRequest = response.data.some((vacacion: any) => vacacion.Estado === 'solicitada' || vacacion.Estado === 'Aprobada');
      setHasPreviousRequest(hasRequest);
    } catch (error) {
      console.error('Error al verificar solicitudes previas:', error);
    }
  };

  useEffect(() => {
    const fetchDiasVacaciones = async () => {
      try {
        const response = await axios.get(`/api/vacaciones/dias/${cod_emp}`);
        const causados = response.data.causados;
        const disfrutados = response.data.disfrutados;
        setDiasCausados(causados);
        setDiasDisfrutados(disfrutados);
        setDiasHabiles(causados - disfrutados);
        console.log(response.data);
        console.log(causados - disfrutados);
      } catch (error) {
        console.error('Error al cargar los dias disponibles:', error);
      }
    };

    fetchDiasVacaciones();
    checkPreviousRequest();
  }, [cod_emp]);

  useEffect(() => {
    if (diasCausados !== null && diasDisfrutados !== null) {
      setDiasHabiles(diasCausados - diasDisfrutados);
    }
  }, [diasCausados, diasDisfrutados]);

  const handleSubmit = async (tipo: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const startDate = parseISO(fechaInicio);
    const endDate = parseISO(fechaFin);

    if (fechaInicio === '' || fechaFin === '') {
      setError('Debe llenar todos los campos.');
      setSuccess(null); 
      return;
    }

    if (isBefore(startDate, today) && !isEqual(startDate, today)) {
      setError('La fecha de inicio no puede ser anterior a la fecha actual.');
      setSuccess(null); 
      return;
    }

    if (isBefore(endDate, today) && !isEqual(endDate, today)) {
      setError('La fecha de fin no puede ser anterior a la fecha actual.');
      setSuccess(null); 
      return;
    }

    if (isBefore(endDate, startDate)) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      setSuccess(null); 
      return;
    }

    if (diasHabiles !== null && diasHabiles < (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1) {
      setError('No tiene suficientes días hábiles disponibles.');
      setSuccess(null);
      return;
    }
    
    if(diasHabiles === null) {
      setError('Cargando días hábiles disponibles...');
      setSuccess(null);
      return;
    }

    try {
      const response = await axios.get(`/api/vacaciones/${cod_emp}`);
      const hasRequest = response.data.some((vacacion: any) => vacacion.Estado === 'solicitada');
      if (hasRequest) {
        setError('Ya tiene una solicitud de vacaciones pendiente.');
        setSuccess(null);
        return;
      }
    } catch (error) {
      console.error('Error al verificar solicitudes previas:', error);
      setError('Error al verificar solicitudes previas.');
      setSuccess(null);
      return;
    }

    try {
      await axios.post('/api/vacaciones', {
        cod_emp,
        FechaInicio: fechaInicio,
        FechaFin: fechaFin,
        Estado: tipo
      });
      
      setFechaInicio('');
      setFechaFin('');
      setSuccess(`Vacaciones ${tipo} exitosamente`);
      setError(null);
      fetchVacaciones(); 
      if (tipo === 'solicitada') {
        setShowConfirmModal(false);
        checkPreviousRequest();
      }
    } catch (error) {
      console.error(`Error ${tipo} vacaciones:`, error);
      setError(`Error ${tipo} vacaciones`);
      setSuccess(null); 
    }
  };

  const handleConfirmSolicitar = () => {
    handleSubmit('solicitada');
  };

  return (
    <>
      <Card bg="light" className='form-container' border='dark' >
        <Card.Header ><h3>Registrar/Solicitar Vacaciones</h3></Card.Header>
        <br/>
        {success && <Alert variant="success" onClose={() => setSuccess(null)}  dismissible>{success}</Alert>}
        {error && <Alert variant="danger" onClose={()=> setError(null)}  dismissible><AlertHeading>Error <hr/></AlertHeading>{error}</Alert>}
        <Card.Body>
          <div className="vacation-days">
            <Alert variant='primary'>
              <h5>Días de Vacaciones</h5>
              <hr />
              <p><strong>Causados:</strong> {diasCausados !== null ? diasCausados : 'Cargando...'}</p>
              <p><strong>Disfrutados:</strong> {diasDisfrutados !== null ? diasDisfrutados : 'Cargando...'}</p>
              <p><strong>Días hábiles disponibles:</strong> {diasHabiles !== null ? diasHabiles : 'Cargando...'}</p>
            </Alert>
          </div>
          <Form>
            <Form.Group controlId="fechaInicio">
              <Form.Label>Fecha Inicio:</Form.Label>
              <Form.Control 
                type="date" 
                value={fechaInicio} 
                onChange={(e) => setFechaInicio(e.target.value)} 
              />
              <br/>
            </Form.Group>
            <Form.Group controlId="fechaFin">
              <Form.Label>Fecha Fin:</Form.Label>
              <Form.Control 
                type="date" 
                value={fechaFin} 
                onChange={(e) => setFechaFin(e.target.value)} 
              />
            </Form.Group>
            <div className="button-group">
              <Button variant="primary" onClick={() => handleSubmit('emitida')} style={hasPreviousRequest ? { width: "100%" } : {}}>Emitir</Button>
              {!hasPreviousRequest && (
                <Button variant="warning" onClick={() => setShowConfirmModal(true)}>Solicitar</Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <ConfirmarSolicitudModal
        show={showConfirmModal}
        handleClose={() => setShowConfirmModal(false)}
        handleConfirm={handleConfirmSolicitar}
        checkPreviousRequest={checkPreviousRequest}
        error={error}
      />
    </>
  );
};

export default FormularioVacaciones;