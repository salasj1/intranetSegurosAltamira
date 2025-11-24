import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/FormularioVacaciones.css';
import ConfirmarSolicitudModal from './ConfirmarSolicitudModal';
import DatePicker from "react-widgets/DatePicker";
import 'react-widgets/styles.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { IoCalendarSharp } from "react-icons/io5";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import stylesLoading from "../css/loading.module.css";
import { Mosaic } from "react-loading-indicators";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import ICON from '../assets/confetti.json';
import { Player } from '@lordicon/react';
import { PiProhibitFill } from "react-icons/pi";
import { useNavigate } from 'react-router-dom';



const apiUrl = import.meta.env.VITE_API_URL;
dayjs.extend(utc);
dayjs.extend(timezone);
interface FormularioVacacionesProps {
  fetchVacaciones: () => void;
  previousRequestStatus: string | null; // CAMBIO: Recibimos el estado específico
  checkPreviousRequest: () => void;
}

interface Periodos {
  ID_Periodo: number;
  AÑO: number;
  DIAS: number;
  DIAS_DIPONIBLES: number;
  ETIQUETA: string;
}

const FormularioVacaciones: React.FC<FormularioVacacionesProps> = ({ fetchVacaciones, previousRequestStatus, checkPreviousRequest }) => {
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
  const [fechaProlongada, setfechaProlongada] = useState<string | null>(null);
  const [periodos, setPeriodos] = useState<Periodos[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingDocument, setLoadingDocument] = useState<boolean>(true);
  const playerRef = useRef<Player>(null);
  const [selectedPeriodos, setSelectedPeriodos] = useState<any>([]);
  const [errorPeriodos, setErrorPeriodos] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    playerRef.current?.playFromBeginning();
  }, [success]);



  useEffect(() => {
    if (fechaInicio) {
      handleFechaInicioChange(dayjs(fechaInicio).toDate(), selectedPeriodos);
    }
  }, [fechaInicio]);
  useEffect(() => {
    const fetchDiasVacaciones = async () => {
      setLoadingDocument(true);
      try {    
        const response = await axios.get(`${apiUrl}/vacaciones/dias/${cod_emp}`);
        const causados = response.data.causados;
        const disfrutados = response.data.disfrutados;
        setDiasCausados(causados);
        setDiasDisfrutados(disfrutados);
        setDiasHabiles(causados - disfrutados);
        console.log(response.data);
        console.log(causados - disfrutados);
        setLoadingDocument(false);
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
  
  useEffect(() => {
    const fetchPeriodos = async () => {
      try {
        const response = await axios.get(`${apiUrl}/vacaciones/periodos/id/${cod_emp}`);
        setPeriodos(response.data as Periodos[]);
      } catch (error) {
        console.error('Error al cargar los periodos:', error);
      }
    };

    fetchPeriodos();
  }, [cod_emp]);

  async function calcularFechaMaximaFin(date: Date | null | undefined, selectedOptions: any): Promise<{ fechaMaximaFin: Date | null, totalDias: number }> {
    try {
      const totalDias = selectedOptions.reduce((acc: number, option: any) => acc + option.value, 0);
      const response = await axios.get(`${apiUrl}/vacaciones/fechaMaximaFin`, {
        params: {
          fechaInicio: date ? date.toISOString() : null,
          diasDisfrutar: totalDias
        }
      });
      setError(null);
      setLoading(false);
      return { fechaMaximaFin: response.data.fechaMaximaFin, totalDias };
    } catch (error) {
      console.error('Error al calcular la fecha máxima de fin de vacaciones:', error);
      setError('Error al calcular la fecha fin de vacaciones.');
      setLoading(true);
      return { fechaMaximaFin: null, totalDias: 0 };
    }
  }
  
  async function calcularFechaProlongada(fechaInicio: string, totalDias: number): Promise<Date | null> {
    try {

      const response = await axios.get(`${apiUrl}/vacaciones/fechaMaximaFin`, {
        params: {
          fechaInicio,
          diasDisfrutar: totalDias + 6
        }
      });
      setError(null);
      setLoading(false);
      return response.data.fechaMaximaFin;
    } catch (error) {
      console.error('Error al calcular la fecha prolongada:', error);
      setError('Error al calcular la fecha prolongada.');
      return null;
    }
  }
  
  const handleFechaInicioChange = async (date: Date | null | undefined, selectedOptions: any) => {
    setFechaInicio(date ? dayjs(date).format('') : null);
    setFechaFin(null); // Colocar en blanco la fecha de retorno

    if (date && selectedOptions.length > 0) {
      setLoading(true);
      const { fechaMaximaFin, totalDias } = await calcularFechaMaximaFin(dayjs(date).toDate(), selectedOptions);
      const fechaMaxFinLocal = fechaMaximaFin ? dayjs(fechaMaximaFin).add(4, 'hour') : null;
      console.log('Fecha máxima local:', fechaMaxFinLocal ? fechaMaxFinLocal.format('DD/MM/YYYY') : null);
      setFechaMaximaFin(fechaMaxFinLocal ? fechaMaxFinLocal.format('YYYY-MM-DD') : null);

      if (fechaMaximaFin) {
        const fechaProlongada = await calcularFechaProlongada(dayjs(date).format(), totalDias);
        setfechaProlongada(fechaProlongada ? dayjs(fechaProlongada).format('YYYY-MM-DD') : null);
      }
    }
  };
  
  const handlePeriodChange = async(selectedOptions: any) => {
    if (selectedOptions.length === 0 ) {
      setSelectedPeriodos([]);
      setFechaMaximaFin(null);
      setFechaFin(null);
      setErrorPeriodos(null);
      return;
    }
    if (fechaInicio === null) {
      setSelectedPeriodos([]);
      return;
    }
    setSelectedPeriodos(selectedOptions);
    const totalDias = selectedOptions.reduce((acc: number, option: any) => acc + option.value, 0);
    setDiasHabiles(totalDias);
    setFechaFin(null);

    // Verificar los periodos seleccionados
    try {
      const response = await axios.post(`${apiUrl}/vacaciones/revisionPeriodo`, {
        cod_emp,
        periodos: selectedOptions.map((option: any) => option.id)
      });
      console.log(response.data);
      if (response.data.status === 1) {
        setErrorPeriodos(null);
      } else {
        setErrorPeriodos(response.data.resultado);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorPeriodos(error.response.data.resultado || 'Error revisando los periodos seleccionados.');
      } else {
        setErrorPeriodos('Error revisando los periodos seleccionados.');
      }
    }



    if (fechaInicio) {
      handleFechaInicioChange(dayjs(fechaInicio).toDate(), selectedOptions);
    }
  };

  useEffect(() => {
    if (fechaInicio) {
      handleFechaInicioChange(dayjs(fechaInicio).toDate(), []);
    }
  }, [diasHabiles]);

  function SuccessMessage() {
    playerRef.current?.play();
    setSuccess('¡Genial! Has solicitado tus días de vacaciones con éxito.');
    return (
      <div className="flex flex-col w-full" style={{ display: 'flex', alignItems: 'center', marginBottom: '-20px' }}>
      <div style={{ flex: 1 }}>
        <strong><h2 className='' >¡Genial!</h2></strong>
        <p>Has solicitado tus días de vacaciones con éxito.</p>
      </div>
      <Player
        ref={playerRef}
        icon={ICON}
        size={80}
        onComplete={() => playerRef.current?.playFromBeginning()}
      />
      </div>
    );
  }

  function ErrorMessage({ data }: { data: string }) {
    return (
      <div className="flex flex-col w-full">
        <strong><h4 className='' >¡Oh no!</h4></strong>
        <p className="text-sm">Ocurrió un error al solicitar las vacaciones, intentelo de nuevo </p>
        {data &&(
          <p >Detalle: <br/>{data}</p>
        )}
        
      </div>
    );
  }

  const handleConfirmSolicitar = async (tipoConfirmacion: number) => {
    await handleSubmit('solicitada', tipoConfirmacion);
    await checkPreviousRequest();
  };

/*   const handleMensajeConfirmacion = () => {
    playerRef.current?.play();
    return toast.success(<SuccessMessage />);
  }; */
  
  const handleSubmit = async (tipo: string, tipoConfirmacion: number) => {
    const today = dayjs().startOf('day');
    const startDate = fechaInicio ? dayjs(fechaInicio).startOf('day') : null;
    const endDate = fechaFin ? dayjs(fechaFin).startOf('day') : null;

    if (!fechaInicio || !fechaFin) {
      alert('Debe llenar todos los campos.');
      setSuccess(null);
      return;
    }

    if (startDate && startDate.isBefore(today, 'day') && !startDate.isSame(today, 'day')) {
      alert('La fecha de inicio no puede ser anterior a la fecha actual o el día de hoy.');
      setSuccess(null);
      return;
    }

    if (endDate && endDate.isBefore(today, 'day') && !endDate.isSame(today, 'day')) {
      alert('La fecha de fin no puede ser anterior a la fecha actual o el día de hoy.');
      setSuccess(null);
      return;
    }

    if (startDate && endDate && endDate.isBefore(startDate, 'day')) {
      alert('La fecha de fin no puede ser anterior a la fecha de inicio.');
      setSuccess(null);
      return;
    }
    if (diasHabiles !== null ) {
      try {
        const response = await axios.post(`${apiUrl}/vacaciones/revisionRangoCalendario`, {
          fechaInicio: startDate,
          fechaFin: endDate,
          cod_emp: cod_emp,
          tipo: tipoConfirmacion
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

  
    setLoading(true);
    
    
  // Mostrar el toast.pending
  const toastId = toast.loading('Enviando solicitud...');

  try {
    const response = await axios.post(`${apiUrl}/vacaciones`, {
      cod_emp,
      fechaInicio,
      fechaFin: fechaMaximaFin,
      fechaRetorno: endDate,
      tipoConfirmacion,
    });

    // Actualizar el toast.pending a success
    toast.update(toastId, {
      render: <SuccessMessage />,
      type: 'success',
      isLoading: false,
      autoClose: 5000,
    });

    setLoading(false);
    setFechaInicio('');
    setFechaFin('');
    setFechaMaximaFin(null);
    setError(null);
    /* console.log('Solicitud de vacaciones enviada:', response.data.emailError); */
    // Verificar si hubo un error al enviar el correo
    if (response.data.emailError) {
      toast.error('No se logró enviar el correo automáticamente. Por favor, notifique a su supervisor.');
      setError('No se logró enviar el correo automáticamente. Por favor, notifique a su supervisor.');
    } 
  } catch (error) {
    let errorMessage = 'Error al solicitar permiso';
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message ;
    } 
    // Actualizar el toast.pending a error
    toast.update(toastId, {
      render: () => <ErrorMessage data={errorMessage } />,
      type: 'error',
      isLoading: false,
      autoClose: 5000,
    });

    setLoading(false);
    setError((error as any)?.response?.data?.message || 'Error al solicitar vacaciones. Intente de nuevo.');
  }

    fetchVacaciones();
    if (tipo === 'solicitada') {
      setShowConfirmModal(false);
      await checkPreviousRequest();
    }
  };

  const animatedComponents = makeAnimated();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
      {/* Formulario centrado */}
      <div style={{ flex: '0 1 600px', zIndex: 1 }}>
        <ToastContainer
          closeOnClick
          autoClose={8000}
          pauseOnFocusLoss={false}
          theme="colored"
        />
        {!loadingDocument ? (
        <Card bg="light" className='form-container' border='dark'>
          {!previousRequestStatus && diasHabiles ?
            (<>
            <Card.Header><h2> Solicita tus vacaciones aquí</h2></Card.Header>
              <br />
              </>
            ):
            previousRequestStatus ? ( 
              (<Alert variant='primary'  style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%', textAlign: 'center' }}>
              <DotLottieReact
              src="/assets/relojArena.json"
              loop
              autoplay
              width={'auto'}
              height={150}
              speed={0.5}
              style={{marginTop:'-50px'}}
              />
              
              {/* LÓGICA DE MENSAJES DIFERENCIADA */}
              <div style={{ marginTop: '-50px', textAlign: 'center' }}>
                
                {previousRequestStatus === 'Solicitada' && (
                    <>
                        <h4>Actualmente tienes una solicitud de vacaciones en Aprobación</h4>
                        <hr style={{ width: '100%', marginTop: '-5px' }} />
                        <p style={{ marginTop: '-5px', marginBottom: '0' }}>
                            Por favor espera la aprobación de tu <strong>Supervisor</strong>.
                        </p>
                    </>
                )}

                {previousRequestStatus === 'Aprobada' && (
                    <>
                        <h4>Actualmente tienes una solicitud de vacaciones en Proceso</h4>
                        <hr style={{ width: '100%', marginTop: '-5px' }} />
                        <p style={{ marginTop: '-5px', marginBottom: '0' }}>
                            Tu supervisor ya aprobó. Por favor espera que lo procese <strong>Capital Humano</strong>.
                        </p>
                    </>
                )}

              </div>
              </Alert>)):(<Alert variant='danger'  style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%', textAlign: 'center' }}>
                <PiProhibitFill size={80}/>
              <h4>Lamentablemente no tienes vacaciones disponibles en este momento.</h4>
            
              </Alert>)

          }
          
          

          {!previousRequestStatus && diasHabiles ? (
          <Card.Body>
            <div className="vacation-days">
              <Alert variant='primary' style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%', textAlign: 'center' }}>
                <IoCalendarSharp size={80} />
                <br />
                <h4>Selecciona el rango de fechas para tus vacaciones</h4>
              </Alert>
            </div>
            <hr />
            { (diasHabiles !== null && periodos) && (
              <Form>
                <Form.Group controlId="fechaInicio">
                  <Form.Label>Fecha Inicio:</Form.Label>
                  <DatePicker
                    placeholder="dd/mm/yyyy"
                    value={fechaInicio ? dayjs(fechaInicio).toDate() : null}
                    valueFormat={{ day: "numeric", month: "numeric", year: "numeric" }}
                    onChange={(date) => handleFechaInicioChange(date, [])}
                    min={dayjs().toDate()}
                    parse={(str) => {
                      if (!str) return undefined;
                      const [day, month, year] = str.split('/').map(Number);
                      const today = dayjs();
                      const parsedDate = dayjs(`${year || today.year()}-${month || today.month() + 1}-${day || today.date()}`, 'YYYY-M-D').toDate();
                      const startDate = fechaInicio ? dayjs(fechaInicio).toDate() : today.toDate();
                      if (dayjs(parsedDate).isBefore(dayjs(startDate))) {
                        return startDate;
                      }
                      return parsedDate;
                    }}
                  />
                </Form.Group>

                <br />
                
                
                <Form.Group>
                  <Form.Label>Periodo a tomar:</Form.Label>
                  <Select
                    key={JSON.stringify(periodos)}
                    isMulti
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    placeholder='Seleccione el periodo'
                    value={selectedPeriodos}
                    options={periodos ? periodos.map((periodo: Periodos) => ({ id:periodo.ID_Periodo,value: periodo.DIAS, label: periodo.ETIQUETA + ' (' + periodo.DIAS +  ' días)' })) : []}
                    onChange={handlePeriodChange}
                    menuPlacement="top"

                  />
                </Form.Group>
                {!errorPeriodos && fechaMaximaFin && diasHabiles > 0 && fechaInicio ? (
                  <>
                  <div className={`alert ${errorPeriodos ? 'alert-exit' : 'alert-enter'}`}>
                      <Alert variant="warning">
                        Fecha Fin del periodo de Vacaciones: {fechaMaximaFin ? dayjs(fechaMaximaFin).format('DD/MM/YYYY') : ''}
                      </Alert>
                  </div>
                  </>
                ) : (
                  errorPeriodos ? (
                    <div className={`alert ${errorPeriodos ? 'alert-enter' : 'alert-exit'}`}>
                      <Alert variant="danger">{errorPeriodos}</Alert>
                    </div>
                  ):(<br/>)
                )}
                {!loading ? (
                  <Form.Group controlId="fechaFin">
                    <Form.Label>Fecha de Retorno:</Form.Label>
                    <DatePicker
                      placeholder='dd/mm/yyyy'
                      value={fechaFin ? dayjs(fechaFin).toDate() : null}
                      onChange={(date: Date | null | undefined) => {
                        setFechaFin(date ? dayjs(date).toISOString() : null);
                      }}
                      valueFormat={{ day: "numeric", month: "numeric", year: "numeric" }}
                      min={fechaInicio ? dayjs(fechaInicio).add(1, 'day').toDate() : undefined}
                      max={fechaMaximaFin && fechaProlongada ? dayjs(fechaProlongada).add(1, 'day').toDate() : undefined}
                      parse={(str) => {
                        if (!str) return undefined;
                        const [day, month, year] = str.split('/').map(Number);
                        const today = dayjs();
                        const parsedDate = dayjs(`${year || today.year()}-${month || today.month() + 1}-${day || today.date()}`, 'YYYY-M-D').toDate();
                        const startDate = fechaInicio ? dayjs(fechaInicio).add(1, 'day').toDate() : today.toDate();
                        const maxDate = fechaMaximaFin && fechaProlongada ? dayjs(fechaProlongada).add(1, 'day').toDate() : undefined;
                        if (dayjs(parsedDate).isBefore(dayjs(startDate))) {
                          return startDate;
                        }
                        if (maxDate && dayjs(parsedDate).isAfter(dayjs(maxDate))) {
                          return maxDate;
                        }
                        return parsedDate;
                    }}
                      disabled={fechaMaximaFin === null || !diasHabiles || !fechaInicio || errorPeriodos!==null}
                    />
                  </Form.Group>
                ) : (
                  <div className={stylesLoading.loadingDocument}>
                    <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="small" text="" textColor="#0d1bff" />
                  </div>
                )}
                <div className="button-group">
                  {!previousRequestStatus && diasHabiles !== null && (
                    <>
                      {(!fechaInicio || !fechaFin) ? (
                        <>
                          <Button variant="primary" onClick={() => alert('Debe llenar todos los campos.')} style={{ width: "100%" }}>Solicitar</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="primary" onClick={() => setShowConfirmModal(true)} style={{ width: "100%" }}>Solicitar</Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </Form>
            )}
          </Card.Body>
        ) : null}
        </Card>):(
          <div className={stylesLoading.loadingContainer2}><Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="large" text="" textColor="#0d1bff" /></div>
        )}

        <ConfirmarSolicitudModal
        show={showConfirmModal}
        handleClose={() => setShowConfirmModal(false)}
        handleConfirm={handleConfirmSolicitar}
        cod_emp={cod_emp}
        error={error}
        setError={setError}
        fechaInicio={fechaInicio}
        fechaFin={fechaMaximaFin}
        fechaRetorno={fechaFin }
      />

      
      </div>
      {!loadingDocument && (
        // Alerta a la derecha
        <div
          style={{
            position: 'absolute',
            right: '-340px',
            top: '40px',
            width: '320px',
            background: '#ff8902ff',
            border: '1px solid #fc7a00ff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px #00339122',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <h5 style={{ color: '#ffffffff', marginBottom: '10px', fontWeight: 700, fontSize: '1.25rem' }}>¡Atención!</h5>
            <p style={{ color: '#333', textAlign: 'center', marginBottom: '16px' }}>
            <strong style={{ color: '#032461ff' }}>¿Tienes días pendientes por disfrutar de un periodo vacacional ya pagado?</strong><br/> Para disfrutar únicamente los días restantes, realiza la solicitud como Permiso especial.
            </p>
          <button
            style={{
              background: '#003391',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 18px',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/SolicitarPermisos')}
          >
            Solicitar Permiso
          </button>
        </div>
      )}
    </div>
  );
};

export default FormularioVacaciones;