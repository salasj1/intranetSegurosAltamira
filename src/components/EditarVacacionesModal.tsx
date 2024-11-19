import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Vacacion } from '../routes/SolicitarVacaciones';
import { format, parseISO, addDays } from 'date-fns';
const apiUrl = import.meta.env.VITE_API_URL;
interface EditarVacacionesModalProps {
  show: boolean;
  handleClose: () => void;
  vacacion: Vacacion | null;
  fetchVacaciones: () => void;
}

const EditarVacacionesModal: React.FC<EditarVacacionesModalProps> = ({ show, handleClose, vacacion, fetchVacaciones }) => {
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    if (vacacion) {
      setFechaInicio(format(addDays(parseISO(vacacion.FechaInicio.toString()), 1), 'yyyy-MM-dd'));
      setFechaFin(format(addDays(parseISO(vacacion.FechaFin.toString()), 1), 'yyyy-MM-dd'));
    }
  }, [vacacion]);

  const handleSubmit = async () => {
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
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
      handleClose();
      fetchVacaciones();
    } catch (error) {
      setSuccess(null);
      console.error('Error actualizando vacaciones:', error);
      setError('Error actualizando vacaciones');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} style={{ position: "fixed" }}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Vacaciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group controlId="fechaInicio">
            <Form.Label>Fecha Inicio:</Form.Label>
            <Form.Control
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="fechaFin">
            <Form.Label>Fecha Fin:</Form.Label>
            <Form.Control
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
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