import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import ListaAprobacionVacacaciones from "../components/ListaAprobacionVacacaciones";
import NavbarEmpresa from "../components/NavbarEmpresa";
import axios from "axios";
import { Alert, AlertHeading } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

export interface Vacacion {
  VacacionID: number;
  FechaInicio: Date;
  FechaFin: Date;
  Estado: string;
  cod_emp: string;
  nombre_completo: string;
  nombres: string;
  apellidos: string;
  cod_supervisor: string;
  ci:string;
  departamento: string;
  cargo: string;
}
function AprobarVacaciones() {
  const { cod_emp, tipo, RRHH } = useAuth();
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (RRHH !== 1 && tipo !== 'Supervisor') {
      navigate('/home'); // Redirigir a la página de inicio si no tiene permisos
    }
  }, [RRHH, tipo, navigate]);

  const fetchVacaciones = async () => {
    try {
      const response = await axios.get(`${apiUrl}/vacaciones/supervisor/${cod_emp}`);
      setVacaciones(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching vacaciones:', error.message);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          console.error('Request data:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
      } else {
        console.error('Error:', error);
      }
      setError('Error al cargar los datos de las vacaciones');
    }
  };

  useEffect(() => {
    fetchVacaciones();
  }, []);

  return (
    <>
      <NavbarEmpresa />
      <div className="canvas">
        <h1>Aprobar Vacaciones</h1>
        {error && <Alert variant="danger" onClose={()=> setError(null)}  dismissible><AlertHeading>Error <hr/></AlertHeading>{error}</Alert>}
        <ListaAprobacionVacacaciones vacaciones={vacaciones} fetchVacaciones={fetchVacaciones} />
      </div>
    </>
  );
}

export default AprobarVacaciones;