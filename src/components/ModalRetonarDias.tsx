import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { parseISO, addDays, isValid, format } from 'date-fns';
import { Vacacion } from '../routes/RetornoVacaciones';

interface ModalRetonarDiasProps {
  show: boolean;
  onClose: () => void;
  vacacion: Vacacion;
  onConfirm: (vacacion: Vacacion) => void;
}

const ModalRetonarDias: React.FC<ModalRetonarDiasProps> = ({ show, onClose, vacacion, onConfirm }) => {
  const formatoFechaRetorno = (fechaRetorno: Date) => {
    const dia = fechaRetorno.getDate().toString().padStart(2, '0');
    const mes = (fechaRetorno.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaRetorno.getFullYear().toString();
    return `${dia}/${mes}/${anio}`;
  };

  const [fechaRetorno, setFechaRetorno] = useState<Date | null>(null);

  useEffect(() => {
    if (vacacion.FechaRetorno && isValid(parseISO(vacacion.FechaRetorno.toString()))) {
      setFechaRetorno(parseISO(vacacion.FechaRetorno.toString()));
    } else if (vacacion.FechaFin && isValid(parseISO(vacacion.FechaFin.toString()))) {
      setFechaRetorno(parseISO(vacacion.FechaFin.toString() ));
    } else {
      setFechaRetorno(null);
    }
  }, [vacacion]);

  const handleDateChange = (date: Date | null | undefined) => {
    if (date === undefined) return;
    if (date) {
      setFechaRetorno(date);
      vacacion.FechaRetorno = date;
    }
  };

  const handleConfirm = () => {
    if (fechaRetorno) {
      vacacion.FechaRetorno = fechaRetorno;
      onConfirm(vacacion);
    }
  };

  return (
    <Modal show={show} onHide={onClose} >
      <Modal.Header closeButton>
        <Modal.Title>Retornar Días de Vacaciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formFechaRetorno">
            <Form.Label>Fecha de Retorno</Form.Label>
            <FloatingLabel controlId="floatingInput" label="Fecha de Retorno" className="mb-3">
            <Form.Control
              type="date"
              value={fechaRetorno ? format(fechaRetorno, 'yyyy-MM-dd') : ''}
              min={parseISO(vacacion.FechaInicio.toString()).toISOString().split('T')[0]}
              max={parseISO(vacacion.FechaFin.toString()).toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e.target.value ? addDays(new Date(e.target.value),1) : null)}
            />
            </FloatingLabel>
          </Form.Group>
        </Form>
        {fechaRetorno && (
          <>
          ¿Desea confirmar el retorno de los días de vacaciones?
          </>
        )}
        
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRetonarDias;