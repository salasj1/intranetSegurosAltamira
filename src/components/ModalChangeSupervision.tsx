import { Alert, Modal } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { AiOutlineUserDelete } from "react-icons/ai";
import { GoPersonAdd } from "react-icons/go";
import { AiOutlineUserSwitch } from "react-icons/ai";
import style from '../css/ControlAutorizacion.module.css';
const apiUrl = import.meta.env.VITE_API_URL;

interface ChangeSupervisionModalProps {
  show: boolean;
  cod_supervisor: string;
  cod_emp: string;
  handleClose: () => void;
  handleChange: (ID_SUPERVISION: number, supervisors: string[]) => void;
  idSupervision: number;
}

interface Empleado {
  cod_emp: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  des_depart: string;
  des_cargo: string;
}

interface Supervision {
  ID_SUPERVISION: number;
  cod_emp: string;
  cedula_empleado: string;
  nombre_empleado: string;
  departamento_empleado: string;
  cargo_empleado: string;
  cod_supervisor: string;
  cedula_supervisor: string;
  nombre_supervisor: string;
  departamento_supervisor: string;
  cargo_supervisor: string;
  Tipo: string;
}

const ModalChangeSupervision: React.FC<ChangeSupervisionModalProps> = ({ cod_emp, cod_supervisor, show, handleClose, handleChange, idSupervision }) => {
  const [supervisionData, setSupervisionData] = useState<Supervision | null>(null);
  const [opcionesSupervisores, setOpcionesSupervisores] = useState<Empleado[]>([]);
  const [selectedSupervisores, setSelectedSupervisores] = useState<{ supervisor: Empleado | null }[]>([
    { supervisor: null },
  ]);
  const [selectedDepartamento, setSelectedDepartamento] = useState<string | null>(null);
  const [selectedCargo, setSelectedCargo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSupervisores([{ supervisor: null }]);
    setSelectedDepartamento(null);
    setSelectedCargo(null);
    setError(null);
    const fetchSupervisionData = async () => {
    
      try {
        const response = await axios.get(`${apiUrl}/empleados/supervision?cod_emp=${cod_emp}&cod_supervisor=${cod_supervisor}`);
        setSupervisionData(response.data);
      } catch (error) {
        console.error('Error fetching supervision data:', error);
        setError('Error al cargar los datos de supervisión');
      }
    };
  
    const fetchSupervisores = async () => {
      try {
        const response = await axios.get(`${apiUrl}/empleados`);
        setOpcionesSupervisores(response.data);
      } catch (error) {
        console.error('Error fetching supervisores:', error);
        setError('Error al cargar los supervisores');
      }
    };

    fetchSupervisionData();
    fetchSupervisores();
  }, [cod_emp, cod_supervisor]);

  const handleAddSupervisor = () => {
    setSelectedSupervisores([...selectedSupervisores, { supervisor: null }]);
  };

  const handleSupervisorChange = (index: number, selectedOption: Empleado | null) => {
    const newSupervisores = [...selectedSupervisores];
    newSupervisores[index].supervisor = selectedOption;
    setSelectedSupervisores(newSupervisores);
  };

  const handleDeleteSupervisor = (index: number) => {
    const newSupervisores = selectedSupervisores.filter((_, i) => i !== index);
    setSelectedSupervisores(newSupervisores);
  };

  const handleSave = async () => {
    const selectedSupervisorIds = selectedSupervisores
      .filter((s) => s.supervisor)
      .map((s) => s.supervisor!.cod_emp);

    if (selectedSupervisorIds.length === 0) {
      setError('Debe seleccionar al menos un supervisor.');
      return;
    }

    try {
      await axios.put(`${apiUrl}/empleados/supervision/supervisor`, {
        ID_SUPERVISION: idSupervision,
        cod_emp: selectedSupervisorIds,
      });
      handleChange(idSupervision, selectedSupervisorIds);
      handleClose();
    } catch (error) {
      console.error('Error saving supervision:', error);
      setError('Error al guardar los cambios de la supervisión');
    }
  };

  const getFilteredOptions = (index: number) => {
    const selectedIds = selectedSupervisores
      .filter((_, i) => i !== index)
      .map((s) => s.supervisor?.cod_emp);

    return opcionesSupervisores
      // No mostrar el empleado supervisado como opción
      .filter((supervisor) => supervisor.cod_emp !== supervisionData?.cod_emp)
      .filter((supervisor) => !selectedIds.includes(supervisor.cod_emp))
      .filter(
        (supervisor) =>
          (!selectedDepartamento || supervisor.des_depart === selectedDepartamento) &&
          (!selectedCargo || supervisor.des_cargo === selectedCargo)
      )
      .map((supervisor) => ({
        value: supervisor.cod_emp,
        label: `${supervisor.nombres} ${supervisor.apellidos} - ${supervisor.des_cargo}`,
      }));
  };

  const getFilteredCargos = () => {
    return [...new Set(
      opcionesSupervisores
        .filter((s) => !selectedDepartamento || s.des_depart === selectedDepartamento)
        .map((s) => s.des_cargo)
    )].map((cargo) => ({
      value: cargo,
      label: cargo,
    }));
  };

  return (
    <Modal show={show} onHide={handleClose} autoFocus={true} centered size="lg" >
      <Modal.Header closeButton>
        <Modal.Title>Cambiar de Supervisor</Modal.Title>
      </Modal.Header>
      <Modal.Body>

        {error && <Alert variant="danger" onClose={() => setError('')}>{error}</Alert>}
        
            <h3 className="text-center mb-4">Asignar Nuevo Supervisor</h3>
            <h3 
              className="text-center mb-4" 
             
            >
              <AiOutlineUserSwitch size={110} />
            </h3>
        
        <p className="text-muted text-center" style={{ fontSize: '18px' }}>
            Esta sección permite cambiar el supervisor actual de un empleado. Puede seleccionar uno o más supervisores nuevos para reemplazar al actual, utilizando filtros por departamento y cargo para facilitar la búsqueda. Asegúrese de guardar los cambios una vez realizada la selección.
        </p>
        {/* Datos del Supervisor Actual y Supervisado */}
        {supervisionData && (
          <Alert variant="primary">
            <h3>Supervisor Actual</h3>
            <p><strong>Cédula: </strong>{supervisionData.cedula_supervisor}</p>
            <p><strong>Nombre: </strong>{supervisionData.nombre_supervisor}</p>
            <p><strong>Departamento: </strong>{supervisionData.departamento_supervisor}</p>
            <p><strong>Cargo: </strong>{supervisionData.cargo_supervisor}</p>
            <hr />
            <h3>Supervisado</h3>
            <p><strong>Cédula: </strong>{supervisionData.cedula_empleado}</p>
            <p><strong>Nombre: </strong>{supervisionData.nombre_empleado}</p>
            <p><strong>Departamento: </strong>{supervisionData.departamento_empleado}</p>
            <p><strong>Cargo: </strong>{supervisionData.cargo_empleado}</p>
            <hr />
            <h3>Tipo de Supervisión: {supervisionData.Tipo}</h3>
            
          </Alert>
        )}

        {/* Filtros de Departamento y Cargo */}
        <Alert variant='warning'>
        <div className="filters-section mb-4">
          
          <h4>Filtros</h4>
          <div className="filter-item mb-3">
            <label className="form-label"><strong>Departamento</strong></label>
            <Select
              options={[...new Set(opcionesSupervisores.map((s) => s.des_depart))].map((dep) => ({
                value: dep,
                label: dep,
              }))}
              value={
                selectedDepartamento
                  ? { value: selectedDepartamento, label: selectedDepartamento }
                  : null
              }
              onChange={(option) => 
              {setSelectedDepartamento(option?.value || null);
                setSelectedCargo(null); // Reset cargo when department changes
              }}
              placeholder="Seleccione un departamento"
              isClearable
            />
          </div>
          <div className="filter-item mb-3">
            <label className="form-label"><strong>Cargo</strong></label>
            <Select
              options={getFilteredCargos()}
              value={
                selectedCargo
                  ? { value: selectedCargo, label: selectedCargo }
                  : null
              }
              onChange={(option) => setSelectedCargo(option?.value || null)}
              placeholder="Seleccione un cargo"
              isClearable
            />
          </div>
        </div>
        <hr/>
        {/* Supervisores Nuevos */}
        <div className="supervisors-list">
          {selectedSupervisores.map((supervisorObj, index) => (
            <div key={index} className="supervisor-item mb-3 ">
              <label className="form-label"><strong>Supervisor {index + 1}</strong></label>
              <Select
                options={getFilteredOptions(index)}
                value={
                  supervisorObj.supervisor
                    ? {
                        value: supervisorObj.supervisor.cod_emp,
                        label: `${supervisorObj.supervisor.nombres} ${supervisorObj.supervisor.apellidos} - ${supervisorObj.supervisor.des_cargo}`,
                      }
                    : null
                }
                onChange={(option) =>
                  handleSupervisorChange(
                    index,
                    option
                      ? opcionesSupervisores.find((s) => s.cod_emp === option.value) || null
                      : null
                  )
                }
                placeholder="Seleccione un supervisor"
                isClearable
              />
              {selectedSupervisores.length > 1 && (
                <button
                  className="btn btn-danger mt-2"
                  onClick={() => handleDeleteSupervisor(index)}
                >
                  <AiOutlineUserDelete size={20} /> Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <button
            className="btn btn-primary"
            onClick={handleAddSupervisor}
            
          >
            <GoPersonAdd size={20} /> Agregar Otro Supervisor
          </button>
        </div>
        </Alert>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '20px',
          }}
        >
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancelar
          </button>
          <button className={`${style['btn-change-supervision']} btn btn-primary`} onClick={handleSave}>
            Guardar Cambios
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalChangeSupervision;