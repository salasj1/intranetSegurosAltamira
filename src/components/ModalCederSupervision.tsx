import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Alert, Spinner, Collapse } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const apiUrl = import.meta.env.VITE_API_URL;

interface Empleado {
  cod_emp: string;
  nombre_completo: string;
  cedula_empleado: string;
  nombres_empleado: string;
  apellidos_empleado: string;
  cod_supervisor: string;
  nombres_supervisor: string;
  apellidos_supervisor: string;
  ID_SUPERVISION: number;
  Tipo?: string;
}

interface Supervisor {
  cod_emp: string;
  nombre_completo: string;
}

interface TipoSupervision {
  tipo: string;
  nombre: string;
}

interface Props {
  show: boolean;
  handleClose: () => void;
  fetchEmpleados: () => void;
}

const ModalCederSupervision: React.FC<Props> = ({ show, handleClose, fetchEmpleados }) => {
  const [supervisores, setSupervisores] = useState<Supervisor[]>([]);
  const [supervisorOrigen, setSupervisorOrigen] = useState<Supervisor | null>(null);
  const [empleadosOrigen, setEmpleadosOrigen] = useState<Empleado[]>([]);
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState<number[]>([]);
  const [supervisoresDestino, setSupervisoresDestino] = useState<Supervisor[]>([]);
  const [empleadosDestino, setEmpleadosDestino] = useState<Empleado[]>([]);
  const [mostrarDestino, setMostrarDestino] = useState(false);
  const [tiposSupervision, setTiposSupervision] = useState<TipoSupervision[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [supervisorExpandido, setSupervisorExpandido] = useState<string | null>(null);
  // Cargar supervisores y tipos de supervisión
  useEffect(() => {
    if (show) {
      axios.get(`${apiUrl}/empleados`)
        .then(res => setSupervisores(res.data))
        .catch(() => setSupervisores([]));
      axios.get(`${apiUrl}/empleados/tipos-supervision`)
        .then(res => setTiposSupervision(res.data))
        .catch(() => setTiposSupervision([]));
      setSupervisorOrigen(null);
      setSupervisoresDestino([]);
      setEmpleadosOrigen([]);
      setEmpleadosDestino([]);
      setEmpleadosSeleccionados([]);
      setError(null);
      setMostrarDestino(false);
    }
  }, [show]);

  // Cargar empleados del supervisor origen
  useEffect(() => {
    if (supervisorOrigen) {
      setLoading(true);
      axios.get(`${apiUrl}/empleados/control`)
        .then(res => {
          const supervisados = res.data.filter((e: Empleado) => e.cod_supervisor === supervisorOrigen.cod_emp);
          setEmpleadosOrigen(supervisados);
        })
        .catch(() => setEmpleadosOrigen([]))
        .finally(() => setLoading(false));
      setEmpleadosSeleccionados([]);
    }
  }, [supervisorOrigen]);

  // Cargar empleados de los supervisores destino (opcional, solo si quieres mostrar la lista)
  useEffect(() => {
    if (supervisoresDestino.length > 0) {
      setLoading(true);
      axios.get(`${apiUrl}/empleados/control`)
        .then(res => {
          // Filtra solo los empleados de los supervisores seleccionados
          const supervisados = res.data.filter((e: Empleado) =>
            supervisoresDestino.some(sup => sup.cod_emp === e.cod_supervisor)
          );
          setEmpleadosDestino(supervisados);
        })
        .catch(() => setEmpleadosDestino([]))
        .finally(() => setLoading(false));
    } else {
      setEmpleadosDestino([]);
    }
  }, [supervisoresDestino]);

  const handleSelectEmpleado = (idSupervision: number) => {
    setEmpleadosSeleccionados(prev =>
      prev.includes(idSupervision)
        ? prev.filter(id => id !== idSupervision)
        : [...prev, idSupervision]
    );
  };

  const handleMover = async () => {
    if (supervisoresDestino.length === 0 || empleadosSeleccionados.length === 0) {
      const msg = "Selecciona empleados y al menos un supervisor destino.";
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.put(`${apiUrl}/empleados/supervision/cambiar-supervisor`, {
        ID_SUPERVISION: empleadosSeleccionados,
        cod_emp: supervisoresDestino.map(s => s.cod_emp)
      });
  
      if (response.data.status && response.data.status !== 0) {
        const msg = response.data.message || "Error al mover empleados.";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
  
      setError(null);
      fetchEmpleados();
      setSupervisorOrigen(null);
      setSupervisoresDestino([]);
      setEmpleadosSeleccionados([]);
      setEmpleadosOrigen([]);
      setEmpleadosDestino([]);
      handleClose();
    } catch (e: any) {
      const msg = e.response?.data?.error || "Error al mover empleados.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (empleadosOrigen.length === empleadosSeleccionados.length) {
      setEmpleadosSeleccionados([]);
    } else {
      setEmpleadosSeleccionados(empleadosOrigen.map(e => e.ID_SUPERVISION));
    }
  };

  return (
    <>
    <ToastContainer position="top-right" autoClose={4000} style={{ zIndex: 9999 }}/>
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Transferencia de Supervisión de Empleados</Modal.Title>
      </Modal.Header>
      <Modal.Body>

        
        <div style={{ marginBottom: 20 }}>
          <DotLottieReact
            src="/assets/woman.lottie"
            loop
            autoplay
            style={{ margin: "-10% 0 -10% 0" }}
          />
          <h3>Instrucciones</h3>
          <p style={{ fontSize: 16 }}>
            Utiliza este formulario para <b>mover empleados seleccionados</b> de un supervisor origen a uno o varios supervisores destino.<br />
            Selecciona el supervisor origen, marca los empleados que deseas transferir y elige los supervisores destino.<br />
            Al confirmar, los empleados seleccionados pasarán a estar bajo la supervisión de los nuevos supervisores elegidos.
          </p>
          <hr />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label><b>Buscar Supervisor Origen</b></label>
          <Select
            options={supervisores.map(s => ({
              value: s.cod_emp,
              label: s.nombre_completo
            }))}
            value={supervisorOrigen ? { value: supervisorOrigen.cod_emp, label: supervisorOrigen.nombre_completo } : null}
            onChange={option => {
              const sup = supervisores.find(s => s.cod_emp === option?.value) || null;
              setSupervisorOrigen(sup);
              setMostrarDestino(false);
            }}
            placeholder="Seleccione un supervisor"
            isClearable
          />
        </div>
        {loading && <Spinner animation="border" />}
        {supervisorOrigen && (
          <>
            <b>Empleados supervisados:</b>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={empleadosOrigen.length > 0 && empleadosOrigen.every(e => empleadosSeleccionados.includes(e.ID_SUPERVISION))}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Tipo de Supervisión</th>
                </tr>
              </thead>
              <tbody>
                {empleadosOrigen.map(emp => (
                  <tr key={emp.ID_SUPERVISION}>
                    <td>
                      <input
                        type="checkbox"
                        checked={empleadosSeleccionados.includes(emp.ID_SUPERVISION)}
                        onChange={() => handleSelectEmpleado(emp.ID_SUPERVISION)}
                      />
                    </td>
                    <td>{emp.cedula_empleado}</td>
                    <td>{emp.nombres_empleado}</td>
                    <td>{emp.apellidos_empleado}</td>
                    <td>
                      {tiposSupervision.find(t => t.tipo === emp.Tipo)?.nombre || emp.Tipo || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {!mostrarDestino && (
              <Button
                variant="primary"
                disabled={empleadosSeleccionados.length === 0}
                style={{ marginBottom: 10 }}
                onClick={() => setMostrarDestino(true)}
              >
                Mover
              </Button>
            )}
          </>
        )}
        {mostrarDestino && empleadosSeleccionados.length > 0 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label><b>Buscar Supervisores Destino</b></label>
              <Select
                isMulti
                options={supervisores
                  .filter(s => s.cod_emp !== supervisorOrigen?.cod_emp)
                  .map(s => ({
                    value: s.cod_emp,
                    label: s.nombre_completo
                  }))}
                value={supervisoresDestino.map(s => ({
                  value: s.cod_emp,
                  label: s.nombre_completo
                }))}
                onChange={options => {
                  const seleccionados = Array.isArray(options)
                    ? options.map(opt => supervisores.find(s => s.cod_emp === opt.value)!).filter(Boolean)
                    : [];
                  setSupervisoresDestino(seleccionados);
                }}
                placeholder="Seleccione uno o varios supervisores"
                isClearable
              />
            </div>
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {supervisoresDestino.length > 0 && (
              <>
                
                <b>Empleados que ya supervisan:</b>
                {supervisoresDestino.map(supervisor => (
                  <div key={supervisor.cod_emp} style={{ marginBottom: 20 }}>
                    <Button
                      variant="link"
                      onClick={() =>
                        setSupervisorExpandido(
                          supervisorExpandido === supervisor.cod_emp ? null : supervisor.cod_emp
                        )
                      }
                      aria-controls={`collapse-supervisor-${supervisor.cod_emp}`}
                      aria-expanded={supervisorExpandido === supervisor.cod_emp}
                    >
                      {supervisorExpandido === supervisor.cod_emp ? "Ocultar" : "Mostrar"} empleados de {supervisor.nombre_completo}
                    </Button>
                    
                    <Collapse in={supervisorExpandido === supervisor.cod_emp}>
                      <div id={`collapse-supervisor-${supervisor.cod_emp}`}>
                        <Table striped bordered hover size="sm">
                          <thead>
                            <tr>
                              <th>Cédula</th>
                              <th>Nombres</th>
                              <th>Apellidos</th>
                              <th>Tipo de Supervisión</th>
                            </tr>
                          </thead>
                          <tbody>
                            {empleadosDestino
                              .filter(emp => emp.cod_supervisor === supervisor.cod_emp)
                              .map(emp => (
                                <tr key={emp.ID_SUPERVISION}>
                                  <td>{emp.cedula_empleado}</td>
                                  <td>{emp.nombres_empleado}</td>
                                  <td>{emp.apellidos_empleado}</td>
                                  <td>
                                    {tiposSupervision.find(t => t.tipo === emp.Tipo)?.nombre || emp.Tipo || ""}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </Table>
                      </div>
                    </Collapse>
                  </div>
                ))}
              </>
            )}
            <Button
              variant="success"
              onClick={handleMover}
              disabled={loading || supervisoresDestino.length === 0}
            >
              Confirmar Movimiento
            </Button>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  </> 
  );
};

export default ModalCederSupervision;