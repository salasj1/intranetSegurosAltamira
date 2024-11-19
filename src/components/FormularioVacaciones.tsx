import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import { Form, Button, Alert, Card, AlertHeading } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/FormularioVacaciones.css';
import ConfirmarSolicitudModal from './ConfirmarSolicitudModal';
import DatePicker from "react-widgets/DatePicker";
import 'react-widgets/styles.css';
const apiUrl = import.meta.env.VITE_API_URL;
interface FormularioVacacionesProps {
  fetchVacaciones: () => void;
}

const FormularioVacaciones: React.FC<FormularioVacacionesProps> = ({ fetchVacaciones }) => {
  const { cod_emp } = useAuth();
  const [fechaInicio, setFechaInicio] = useState<string | null>(null);
  const [fechaFin, setFechaFin] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [diasCausados, setDiasCausados] = useState<number | null>(null);
  const [diasDisfrutados, setDiasDisfrutados] = useState<number | null>(null);
  const [diasHabiles, setDiasHabiles] = useState<number | null>(null);
  const [hasPreviousRequest, setHasPreviousRequest] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [fechaMaximaFin, setFechaMaximaFin] = useState<string | null>(null);

  const checkPreviousRequest = async () => {
    try {
      const response = await axios.get(`${apiUrl}/vacaciones/id/${cod_emp}`);
      const hasRequest = response.data.some((vacacion: any) => vacacion.Estado === 'solicitada' || vacacion.Estado === 'Aprobada');
      setHasPreviousRequest(hasRequest);
    } catch (error) {
      console.error('Error al verificar solicitudes previas:', error);
    }
  };

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
    checkPreviousRequest();
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
    console.log(fechaMaximaFin);
    if (fechaMaximaFin && (fechaFin >fechaMaximaFin)){
      setError('La fecha de fin no puede ser posterior a la fecha máxima de fin de vacaciones: ' + new Date( fechaMaximaFin).toLocaleDateString() + '.');
      setSuccess(null); 
      return;
    }
    console.log(startDate);
    console.log(today);
    if (startDate && (startDate < today)) {
      setError('La fecha de inicio no puede ser anterior a la fecha actual.');
      setSuccess(null); 
      return;
    }
    console.log(endDate);
    console.log(today);
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

    if (diasHabiles !== null && startDate && endDate && diasHabiles < (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1) {
      setError('No tiene suficientes días hábiles disponibles.');
      setSuccess(null);
      return;
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
    }

    try {
      await axios.post(`${apiUrl}//vacaciones`, {
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
                <DatePicker
                  placeholder="dd/mm/yyyy"
                  value={fechaInicio ? new Date(fechaInicio) : null}
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
                    const startDate = fechaInicio ? new Date(fechaInicio) : today;
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
                  Limite de fecha fin: {new Date(fechaMaximaFin).toLocaleDateString()}
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
                max={fechaMaximaFin ? new Date(fechaMaximaFin) : undefined} 
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
                  {fechaMaximaFin && (new Date(fechaFin) > new Date(fechaMaximaFin)) ? (
                    <Button variant="warning" onClick={() => setError('La fecha de fin no puede ser posterior a la fecha máxima de fin de vacaciones: ' + new Date( fechaMaximaFin).toLocaleDateString() + '.')}>Solicitar</Button>
                  ):(
                    <Button variant="warning" onClick={() => setShowConfirmModal(true)}>Solicitar</Button>
                  )}
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
        checkPreviousRequest={checkPreviousRequest}
        error={error}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
      />

    </>
  );

};

export default FormularioVacaciones;