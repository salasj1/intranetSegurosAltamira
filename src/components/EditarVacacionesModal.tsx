import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Vacacion } from '../routes/SolicitarVacaciones';
import { format, parseISO, addDays, isBefore, isEqual} from 'date-fns';
import DatePicker from "react-widgets/DatePicker";
const apiUrl = import.meta.env.VITE_API_URL;

interface EditarVacacionesModalProps {
  show: boolean;
  handleClose: () => void;
  vacacion: Vacacion | null;
  fetchVacaciones: () => void;
  cod_emp: string | null;
}

const EditarVacacionesModal: React.FC<EditarVacacionesModalProps> = ({ show, handleClose, vacacion, fetchVacaciones, cod_emp }) => {
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [diasCausados, setDiasCausados] = useState<number | null>(null);
  const [diasDisfrutados, setDiasDisfrutados] = useState<number | null>(null);
  const [diasHabiles, setDiasHabiles] = useState<number | null>(null);
  const [fechaMaximaFin, setFechaMaximaFin] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setSuccess(null);
    if (vacacion) {
      const inicio = format(parseISO(vacacion.FechaInicio.toString()), 'yyyy-MM-dd');
      setFechaInicio(inicio);
      setFechaFin(format(addDays(parseISO(vacacion.FechaFin.toString()), 1), 'yyyy-MM-dd'));
    }
    if (!fechaMaximaFin && fechaInicio) {
      handleFechaInicioChange(new Date(fechaInicio)); 
    }
    const fetchDiasVacaciones = async () => {
      try {
        const response = await axios.get(`${apiUrl}/vacaciones/dias/${cod_emp}`);
        const causados = response.data.causados;
        const disfrutados = response.data.disfrutados;
        setDiasCausados(causados);
        setDiasDisfrutados(disfrutados);
        setDiasHabiles(causados - disfrutados);
      } catch (error) {
        console.error('Error al cargar los dias disponibles:', error);
      }
    };

    fetchDiasVacaciones();
    
  }, [vacacion, cod_emp]);

  useEffect(() => {
    if (diasCausados !== null && diasDisfrutados !== null) {
      setDiasHabiles(diasCausados - diasDisfrutados);
    }
  }, [diasCausados, diasDisfrutados]);
  useEffect(() => {
    if(error) {
      setSuccess(null);
    }
  }, [error]);
  // Nuevo useEffect para ejecutar handleFechaInicioChange cuando fechaInicio cambie
  useEffect(() => {
    if (fechaInicio) {
      handleFechaInicioChange(new Date(fechaInicio));
    }
  }, [fechaInicio]);

  const handleSubmit = async () => {
    const today = new Date();
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    if (isBefore(fechaInicio, today) && !isEqual(fechaInicio, today)) {
      setError('La fecha de inicio no puede ser anterior a la fecha actual o el dia de hoy.');
      return;
    }

    if (isBefore(fechaFin, today) && !isEqual(fechaFin, today)) {
      setError('La fecha de fin no puede ser anterior a la fecha actual o el dia de hoy.');
      return;
    }

    if (isBefore(fechaFin, fechaInicio)) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }
    console.log(fechaInicio, fechaFin, cod_emp);
    try {
      const response = await axios.post(`${apiUrl}/vacaciones/revisionRangoCalendario`, {
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        cod_emp: cod_emp
      });
      const { status, resultado } = response.data;
      console.log(status, resultado);
      if (status === 0) {
        setError(resultado);
        return;
      }
    } catch (error) {
      console.error('Error revisando los dias disponibles:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.resultado || 'Error revisando los días disponibles.');
      } else {
        setError('Error revisando los días disponibles. Intente de nuevo');
      }
      return;
    }

    try {
      // Enviar las fechas originales sin el día extra al endpoint
      await axios.put(`${apiUrl}/vacaciones/${vacacion?.VacacionID}`, {
        FechaInicio: format(parseISO(fechaInicio), 'yyyy-MM-dd'),
        FechaFin: format(parseISO(fechaFin), 'yyyy-MM-dd')
      });

      setSuccess('Vacaciones actualizadas exitosamente');
      setError(null);
      
      fetchVacaciones();
    } catch (error) {
      setSuccess(null);
      console.error('Error actualizando vacaciones:', error);
      setError('Error actualizando vacaciones');
    }
  };

  const handleFechaInicioChange = async (date: Date | null | undefined) => {
    if (date) {
      const newFechaInicio = date.toISOString();
      console.log(newFechaInicio);
      setFechaInicio(newFechaInicio);
      if (diasHabiles !== null) {
        try {
          const response = await axios.get(`${apiUrl}/vacaciones/fechaMaximaFin`, {
            params: {
              fechaInicio: newFechaInicio,
              diasDisfrutar: diasHabiles
            }
          });
          setFechaMaximaFin(response.data.fechaMaximaFin);
          console.log(response.data.fechaMaximaFin);
          setError(null);
        } catch (error) {
          console.error('Error al calcular la fecha máxima de fin de vacaciones:', error);
          setError('Error al calcular la fecha máxima de fin de vacaciones.');
        }
      }
    } else {
      setFechaInicio('');
      setFechaMaximaFin('');
    }
  };

  const handleFechaFinChange = (date: Date | null | undefined) => {
    if (date) {
      setFechaFin(new Date(date).toISOString());
    } else {
      setFechaFin('');
    }
  };

  const handleCancel = () => {
    setFechaInicio('');
    setFechaFin('');
    setFechaMaximaFin('');
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleCancel} style={{ position: "fixed" }}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Vacaciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {fechaMaximaFin && (
          <>
            <br/>
            <Alert variant="warning">
              
              Limite de fecha fin: {fechaMaximaFin ? addDays(new Date(fechaMaximaFin),1).toLocaleDateString() : ''}
            </Alert>
          </>
        )}
        {success && <Alert variant="success" onClose={() => { setSuccess('') }} dismissible>{success}</Alert>}
        {error && <Alert variant="danger" onClose={() => { setError('') }} dismissible>{error}</Alert>}
        
        <Form>
          <Form.Group controlId="fechaInicio">
            <Form.Label>Fecha Inicio:</Form.Label>
            <DatePicker
              placeholder="dd/mm/yyyy"
              value={ parseISO(fechaInicio)}
              valueFormat={{ day: "numeric", month: "numeric", year: "numeric" }}
              onChange={handleFechaInicioChange}
              min={  new Date() }
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
          <Form.Group controlId="fechaFin">
            <Form.Label>Fecha Fin:</Form.Label>
            <DatePicker
              placeholder='dd/mm/yyyy'
              value={fechaFin ? parseISO(fechaFin) : null}
              onChange={handleFechaFinChange}
              valueFormat={{ day: "numeric", month: "numeric", year: "numeric" }}
              min={ new Date(fechaInicio) }
              /* max={ fechaMaximaFin ? parseISO(fechaMaximaFin) : undefined } */
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditarVacacionesModal;