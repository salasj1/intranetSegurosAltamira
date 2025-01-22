import Accordion from 'react-bootstrap/Accordion';
import style from '../css/accordion.module.css';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { Button, Form, Card, Alert, FormCheck } from 'react-bootstrap';
import { ReactNode, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import ConfirmModal from './ModalConfirmarSolicitarPermisos';
import { MdKeyboardArrowDown } from "react-icons/md";
import { MdOutlineKeyboardArrowUp } from "react-icons/md";
const apiUrl = import.meta.env.VITE_API_URL;

interface CustomToggleProps {
  children: ReactNode;
  eventKey: string;
}

interface MotivoPermiso {
  id: number;
  tipo: string;
  activo: boolean;
}
interface AcordionSolicitarPermisoProps {
  onRefresh: () => void;
}

function CustomToggle({ children, eventKey }: CustomToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const decoratedOnClick = useAccordionButton(eventKey, () => {
    setIsOpen(!isOpen);
  });

  return (
    <Button
      type="button"
      className={style.botonSolicitar}
      onClick={decoratedOnClick}
    >
      {isOpen ? (
      <MdOutlineKeyboardArrowUp style={{ fontSize: '1.5em', marginRight:"5px" }} />
      ) : (
      <MdKeyboardArrowDown style={{ fontSize: '1.5em',  marginRight:"5px" }} />
      )}
      {isOpen ? 'Cancelar Permiso' :children}

      
    </Button>
  );
}

function AcordionSolicitarPermiso({ onRefresh }: AcordionSolicitarPermisoProps) {
  const { cod_emp } = useAuth();
  const [formData, setFormData] = useState({
    Fecha_inicio: '',
    Fecha_Fin: '',
    Motivo: '',
    descripcion: '',
    otroMotivo: '',
    descontable: false // Nuevo campo para el checkbox
  });
  const [showModal, setShowModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger' | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [otroMotivoError, setOtroMotivoError] = useState<string | null>(null); // Nuevo estado para errores específicos de otroMotivo
  const [diasNoDisfrutados, setDiasNoDisfrutados] = useState<number | null>(null);
  const [motivosPermiso, setMotivosPermiso] = useState<MotivoPermiso[]>([]);
  
  const descontableRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'otroMotivo') {
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount > 3) {
        setOtroMotivoError('El motivo no puede tener más de tres palabras'); 
      } else if (value.length > 50) {
        setOtroMotivoError('Mucha longitud');
      } else {
        setOtroMotivoError(null);
      }

    }

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const resetForm = () => {
    setFormData({
      Fecha_inicio: '',
      Fecha_Fin: '',
      Motivo: '',
      descripcion: '',
      otroMotivo: '',
      descontable: false // Resetear el nuevo campo
    });
    setOtroMotivoError(null); // Resetear el error específico de otroMotivo
  };

  const handleSubmit = async () => {
    if(formData.Motivo === 'Otro' && formData.otroMotivo) {
      formData.Motivo = formData.otroMotivo;
    }
    try {
      await axios.post(`${apiUrl}/permisos`, { ...formData, cod_emp });
      setAlertMessage('Permiso solicitado exitosamente');
      setAlertVariant('success');
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error al solicitar permiso:', error);
      setAlertMessage('Error al solicitar permiso');
      setAlertVariant('danger');
    } finally {
      setShowModal(false);
    }
  };

  const handleDiasNoDisfrutados = async () => {
    // Calcular dias no disfrutados
    try {
      const response = await axios.get(`${apiUrl}/vacaciones/CalculrDiasNoDisfrutadosVacaciones/${cod_emp}`);
      console.log(response.data);
      setDiasNoDisfrutados(response.data.diasNoDisfrutados);
    } catch (error) {
      console.error('Error al obtener los días no disfrutados:', error);
    }
  };

  const handleMotivosPermiso = async () => {
    try {
      const response = await axios.get(`${apiUrl}/permisos/motivos`);
      console.log(response.data);
      setMotivosPermiso(response.data);
    } catch (error) {
      console.error('Error al obtener los motivos de permiso:', error);
    }
  };

  useEffect(() => {
    handleDiasNoDisfrutados();
    handleMotivosPermiso();
  }, [cod_emp]);
  
  const handleConfirm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (!formData.Fecha_inicio) {
      newErrors.push('La fecha de inicio es requerida');
    }
    
    const startDate = new Date(formData.Fecha_inicio);
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(formData.Fecha_Fin);
    endDate.setDate(endDate.getDate() + 1);
    if (startDate < today) {
      newErrors.push('La fecha de inicio no puede ser anterior a la fecha actual');
    } else {
      console.log(new Date(formData.Fecha_inicio));
      console.log(today);
    }

    if (!formData.Fecha_Fin) {
      newErrors.push('La fecha de fin es requerida');
    }

    if (endDate < today) {
      newErrors.push('La fecha de fin no puede ser anterior a la fecha actual');
    }

    if (formData.Fecha_inicio && formData.Fecha_Fin && new Date(formData.Fecha_inicio) > new Date(formData.Fecha_Fin)) {
      newErrors.push('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    if (!formData.Motivo) {
      newErrors.push('El motivo es requerido');
    }

    if (formData.Motivo === 'Otro' && !formData.otroMotivo) {
      newErrors.push('El motivo adicional es requerido');
    }

    

    if (otroMotivoError) {
      newErrors.push(otroMotivoError);
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
    } else {
      setErrors([]);
      setShowModal(true);
    }
  };

  return (
    <>
      <Accordion defaultActiveKey={null} flush className={style.accordion}>
        <Card bg='primary' className={style.accordionItem} style={{borderRadius:'0px'}}>
          <Card.Header className={style.cardHeader}>
            <CustomToggle eventKey="0">Solicitar Permiso</CustomToggle>
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              {alertMessage && (
                <Alert variant={alertVariant?.toString() ?? 'info'} onClose={() => setAlertMessage(null)} dismissible>
                  {alertMessage}
                </Alert>
              )}
              {errors.length > 0 && (
                <Alert variant="danger" onClose={() => setErrors([])} dismissible>
                  <ul>
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))} 
                  </ul>
                </Alert>
              )}
              
              <Form onSubmit={handleConfirm}>
                <div className={style.formGroup}>
                  <Form.Group controlId="formFechas">
                    <Form.Label>Fecha de inicio</Form.Label>
                    <Form.Control
                      type="date"
                      name="Fecha_inicio"
                      value={formData.Fecha_inicio}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="formFechas">
                    <Form.Label>Fecha de fin</Form.Label>
                    <Form.Control
                      type="date"
                      name="Fecha_Fin"
                      value={formData.Fecha_Fin}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  
                </div>
                <br/>
                <Form.Group className="mb-3" controlId="formSelect">
                  <Form.Label>Razon del Motivo</Form.Label>
                  <div className={style.formControl}>
                    <Form.Control
                      as="select"
                      name="Motivo"
                      value={formData.Motivo}
                      onChange={handleChange}
                      placeholder='Seleccione una opción'
                      style={{color:'black'}}
                    >
                      <option value="">Seleccione una opción</option>
                      {motivosPermiso.map((motivo) => (
                        <option key={motivo.id} value={motivo.tipo} style={{color:'black'}}>
                          {motivo.tipo}
                      </option>
                      ))}
                    </Form.Control>
                    
                    {formData.Motivo === 'Otro' && (
                      <>
                        <Form.Control
                          type="text"
                          name="otroMotivo"
                          placeholder="Escriba el motivo en tres palabras o menos"
                          value={formData.otroMotivo}
                          onChange={handleChange}
                          className={style.otroMotivoInput}
                        />
                        {otroMotivoError && (
                          <div className={style.errorText}>{otroMotivoError}</div>
                        )}
                      </>
                    )}
                  </div>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formDiasNoDisfrutados">
                  {(diasNoDisfrutados !== null && diasNoDisfrutados > 0) && (
                    <FormCheck
                      ref={descontableRef}
                      label={`Descontarlo de los días no disfrutados en Vacaciones (${diasNoDisfrutados} días disponibles)`}
                      name="descontable"
                      checked={formData.descontable}
                      onChange={() => setFormData({ ...formData, descontable: descontableRef.current?.checked || false })}
                    />
                  )}
                </Form.Group>
                <Form.Group className="mb-3" controlId="formDescripcion">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="descripcion"
                    placeholder="Descripción"
                    className={style.textArea}
                    value={formData.descripcion}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className={style.botonSolicitar}>
                  Confirmar
                </Button>
              </Form>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
      <ConfirmModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleConfirm={handleSubmit}
      />
    </>
  );
}

export default AcordionSolicitarPermiso;