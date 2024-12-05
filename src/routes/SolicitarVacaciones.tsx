import  { useState, useEffect } from 'react';
import ListaVacaciones from "../components/ListaVacaciones";
import NavbarEmpresa from "../components/NavbarEmpresa";
import styles from '../css/SolicitarVacaciones.module.css';
import FormularioVacaciones from "../components/FormularioVacaciones";
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import { Alert, AlertHeading } from 'react-bootstrap';

const apiUrl = import.meta.env.VITE_API_URL;
export interface Vacacion {
  VacacionID: number;
  FechaInicio: Date;
  FechaFin: Date;
  Estado: string;
}

function SolicitarVacaciones() {
  const { cod_emp } = useAuth();
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasPreviousRequest, setHasPreviousRequest] = useState<boolean>(false);

  useEffect(() => {
    if (cod_emp) {
      fetchVacaciones();
      checkPreviousRequest();
    }
  }, [cod_emp]);
  const fetchVacaciones = async () => {
    try {
      const response = await axios.get(`${apiUrl}/vacaciones/id/${cod_emp}`);
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
      setError('Error al cargar datos los de las vacaciones');
    }
  };

  const checkPreviousRequest = async () => {
    try {
      const response = await axios.get(`${apiUrl}/vacaciones/id/${cod_emp}`);
      const hasRequest = response.data.some((vacacion: any) => vacacion.Estado === 'solicitada' || vacacion.Estado === 'Aprobada');
      setHasPreviousRequest(hasRequest);
    } catch (error) {
      console.error('Error al verificar solicitudes previas:', error);
    }
  };

  return (
    <>
      <NavbarEmpresa />
      <div className={styles.canvas}>
        <h1>Solicitar Vacaciones</h1>
        <br/>
        {error && <Alert variant="danger" onClose={()=> setError(null)}  dismissible><AlertHeading>Error <hr/></AlertHeading>{error}</Alert>}
        <FormularioVacaciones fetchVacaciones={fetchVacaciones} hasPreviousRequest={hasPreviousRequest} checkPreviousRequest={checkPreviousRequest} />
        <br/>
        <h2>Lista de Vacaciones</h2>
        <ListaVacaciones vacaciones={vacaciones} fetchVacaciones={fetchVacaciones} hasPreviousRequest={hasPreviousRequest} checkPreviousRequest={checkPreviousRequest} />
      </div>
    </>
  );
}

export default SolicitarVacaciones;