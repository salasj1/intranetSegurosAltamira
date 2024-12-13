import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import { Form, Button, Alert, Card, AlertHeading } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/FormularioVacaciones.css';
import ConfirmarSolicitudModal from './ConfirmarSolicitudModal';
import DatePicker from "react-widgets/DatePicker";
import 'react-widgets/styles.css';
import { parseISO,addDays } from 'date-fns';

const apiUrl = import.meta.env.VITE_API_URL;
interface FormularioVacacionesProps {
  fetchVacaciones: () => void;
  hasPreviousRequest: boolean;
  checkPreviousRequest: () => void;
}

const FormularioVacaciones: React.FC<FormularioVacacionesProps> = ({ fetchVacaciones, hasPreviousRequest, checkPreviousRequest }) => {
  const { cod_emp } = useAuth();
  const [fechaInicio, setFechaInicio] = useState<string | null>(null);
  const [fechaFin, setFechaFin] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [diasCausados, setDiasCausados] = useState<number | null>(null);
  const [diasDisfrutados, setDiasDisfrutados] = useState<number | null>(null);
  const [diasHabiles, setDiasHabiles] = useState<number | null>(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [fechaMaximaFin, setFechaMaximaFin] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDiasVacaciones = async () => {
      try {
        const response = await axios.get(`${apiUrl}/vacaciones/dias/${cod_emp}`);
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
  }, [cod_emp]);

  useEffect(() => {
    if (diasCausados !== null && diasDisfrutados !== null) {
      setDiasHabiles(diasCausados - diasDisfrutados);
    }
  }, [diasCausados, diasDisfrutados]);

  const handleFechaInicioChange = async (date: Date | null | undefined) => {
    if (date) {
      setFechaInicio(date.toISOString());
      if (diasHabiles !== null) {
        try {
          const response = await axios.get(`${apiUrl}/vacaciones/fechaMaximaFin`, {
            params: {
              fechaInicio: date.toISOString(),
              diasDisfrutar: diasHabiles
            }
          });
          setFechaMaximaFin(response.data.fechaMaximaFin);
          setError(null);
        } catch (error) {
          console.error('Error al calcular la fecha máxima de fin de vacaciones:', error);
          setError('Error al calcular la fecha máxima de fin de vacaciones.');
        }
      }
    } else {
      setFechaInicio(null);
      setFechaMaximaFin(null);
    }
  };

  const handleSubmit = async (tipo: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const startDate = fechaInicio ? new Date(fechaInicio) : null;
    const endDate = fechaFin ? new Date(fechaFin) : null;

    if (!fechaInicio || !fechaFin) {
      setError('Debe llenar todos los campos.');
      setSuccess(null); 
      return;
    }
    
    
    if (startDate && (startDate < today)) {
      setError('La fecha de inicio no puede ser anterior a la fecha actual.');
      setSuccess(null); 
      return;
    }
    
    if (endDate && (endDate < today)) {
      setError('La fecha de fin no puede ser anterior a la fecha actual.');
      setSuccess(null); 
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      setSuccess(null); 
      return;
    }
    
    if (diasHabiles !== null ) {
      try {
        const response = await axios.post(`${apiUrl}/vacaciones/revisionRangoCalendario`, {
          fechaInicio: startDate,
          fechaFin: endDate,
          cod_emp: cod_emp
        });
        const { status, resultado } = response.data;
        console.log(status, resultado);
        if (status === 0) {
          setError(resultado);
          setSuccess(null);
          return;
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setError(error.response.data.resultado || 'Error revisando los días disponibles.');
        } else {
          setError('Error revisando los días disponibles. Intente de nuevo');
        }
        setSuccess(null);
        return;
      }
    }
    
    if(diasHabiles === null) {
      setError('Cargando días hábiles disponibles...');
      setSuccess(null);
      return;
    }
    
    if(tipo==='solicitada'){
      try {
        const response = await axios.get(`${apiUrl}/vacaciones/id/${cod_emp}`);
        const hasRequest = response.data.some((vacacion: any) => vacacion.Estado === 'solicitada');
        if (hasRequest) {
          setError('Ya tiene una solicitud de vacaciones pendiente. 1');
          setSuccess(null);
          return;
        }
      } catch (error) {
        console.error('Error al verificar solicitudes previas:', error);
        setError('Error al verificar solicitudes previas.');
        setSuccess(null);
        return;
      }
    }

    try {
      await axios.post(`${apiUrl}/vacaciones`, {
        cod_emp,
        FechaInicio: fechaInicio,
        FechaFin: fechaFin,
        Estado: tipo
      });
      
      setFechaInicio('');
      setFechaFin('');
      setSuccess(`Vacaciones ${tipo} exitosamente`);
      setFechaMaximaFin(null);
      setError(null);
      fetchVacaciones(); 
      if (tipo === 'solicitada') {
        setShowConfirmModal(false);
        await checkPreviousRequest();
      }
    } catch (error) {
      console.error(`Error ${tipo} vacaciones:`, error);
      setError(`Error ${tipo} vacaciones`);
      setSuccess(null); 
    }
  };

const handleConfirmSolicitar = async () => {
  await handleSubmit('solicitada');
  await checkPreviousRequest();
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
                <DatePicker
                  placeholder="dd/mm/yyyy"
                  value={fechaInicio ? parseISO(fechaInicio) : null}
                  valueFormat={{day:"numeric", month: "numeric", year: "numeric" }}
                  onChange={handleFechaInicioChange}
                  min={new Date()}
                  parse={(str) => {
                    if (!str) return undefined; 
                    const [day, month, year] = str.split('/').map(Number);
                    const today = new Date();
                    const parsedDate = new Date(
                      year || today.getFullYear(),
                      (month ? month - 1 : today.getMonth()),
                      day
                    );
                    const startDate = fechaInicio ? parseISO(fechaInicio) : today;
                    if (parsedDate < startDate) {
                      return startDate;
                    }
                    return parsedDate;
                }}
                />
              {fechaMaximaFin && (
                <>
                <br/>
                <Alert variant="warning">
                  Limite de fecha fin: {addDays(parseISO((fechaMaximaFin)),1).toLocaleDateString()}
                </Alert>
                </>
              )}
            </Form.Group>
            {!fechaMaximaFin && (
              <br/>
            )}
            <Form.Group controlId="fechaFin">
              <Form.Label>Fecha Fin:</Form.Label>
              <DatePicker 
                placeholder='dd/mm/yyyy'
                value={fechaFin ? new Date(fechaFin) : null}
                onChange={(date: Date | null | undefined) => {
                  setFechaFin(date ? date.toISOString() : null);
                }}
                valueFormat={{day:"numeric", month: "numeric", year: "numeric" }}
                min={fechaInicio ? new Date(fechaInicio) : new Date()}
                max={fechaMaximaFin ? addDays(new Date(fechaMaximaFin),1) : undefined} 
                parse={(str) => {
                  if (!str) return undefined; 
                  const [day, month, year] = str.split('/').map(Number);
                  const today = new Date();
                  const parsedDate = new Date(
                    year || today.getFullYear(),
                    (month ? month - 1 : today.getMonth()),
                    day
                  );
                  const startDate = fechaInicio ? new Date(fechaInicio) : today;
                  if (parsedDate < startDate) {
                    return startDate;
                  }
                  return parsedDate;
                }}
              />
            </Form.Group>
            <div className="button-group">
              <Button variant="primary" onClick={() => handleSubmit('emitida')} style={hasPreviousRequest ? { width: "100%" } : {}}>Emitir</Button>
              {!hasPreviousRequest && (
              <>
                {(!fechaInicio || !fechaFin) ? (
                <Button variant="warning" onClick={() => setError('Debe llenar todos los campos.')}>Solicitar</Button>
                ) : (
                <>
                  <Button variant="warning" onClick={() => setShowConfirmModal(true)}>Solicitar</Button>
                </>
                )}
              </>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <ConfirmarSolicitudModal
        show={showConfirmModal}
        handleClose={() => setShowConfirmModal(false)}
        handleConfirm={handleConfirmSolicitar}
        cod_emp={cod_emp}
        error={error}
        setError={setError}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
      />

    </>
  );

};

export default FormularioVacaciones;