import { useState, useEffect } from "react";
import ListaAutorizacionEmpleados from "../components/ListaAutorizacionEmpleados";
import NavbarEmpresa from "../components/NavbarEmpresa";
import styles from '../css/ControlAutorizacion.module.css';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
export interface Empleado {
  ID_SUPERVISION: number;
  cod_emp: number;
  cedula_empleado: string;
  nombres_empleado: string;
  apellidos_empleado: string;
  cod_supervisor:string;
  cedula_supervisor: string;
  nombres_supervisor: string,
  apellidos_supervisor: string, 
  Tipo: number;
  Nomina: string;
}

function ControlAutorizacion() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [error, setError] = useState<string | null>(null);
  const {  RRHH } = useAuth();
  const navigate = useNavigate();
    useEffect(() => {
        if (RRHH !== 1 ) {
        navigate('/home'); // Redirigir a la página de inicio si no tiene permisos
        }
    }, [RRHH,  navigate]);
  const fetchEmpleados = async () => {
    try {
      const response = await fetch('/api/empleados/control');
      const data = await response.json();
      setEmpleados(data);
    } catch (error) {
      console.error('Error fetching empleados:', error);
      setError('Error al cargar los datos de los empleados');
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);
  
  return (
    <>
      <div className={styles.canvas}>
      <NavbarEmpresa />
      <h1 className={styles.h1Titulo}>Control de Supervisión de los Empleados</h1>
      {error && <p>{error}</p>}
      <ListaAutorizacionEmpleados empleados={empleados} fetchEmpleados={fetchEmpleados} />
      </div>
    </>

  );
}

export default ControlAutorizacion;