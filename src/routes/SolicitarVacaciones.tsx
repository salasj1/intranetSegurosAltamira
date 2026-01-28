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
  FechaRetorno: Date;
  Estado: string;
  DiasDisfrutar: number;
  DiasPagar: number;
}

function SolicitarVacaciones() {
  const { cod_emp } = useAuth();
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previousRequestStatus, setPreviousRequestStatus] = useState<string | null>(null);

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
      // Buscamos si existe alguna solicitud activa
      const activeRequest = response.data.find((vacacion: any) => 
        vacacion.Estado === 'solicitada' || vacacion.Estado === 'Aprobada'
      );
      
      // Guardamos el estado si existe, si no, null
      setPreviousRequestStatus(activeRequest ? activeRequest.Estado : null);
    } catch (error) {
      console.error('Error al verificar solicitudes previas:', error);
    }
  };
  

  return (
    <>
      <NavbarEmpresa />
      <div className={styles.canvas}>
        <h1 id='tituloVacaciones' style={{alignSelf: 'flex-start', textAlign: 'left', width: '100%'}}>Solicitar Pago y Salida de Vacaciones</h1>
        <br/>
        <div style={{ width: '50%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap', marginBottom: '20px', marginTop: '10px' }}>
          
          {/* INFORMACIÓN DEL MÓDULO */}
          <div style={{ 
            flex: '1', 
            minWidth: '300px', 
            backgroundColor: '#fff7e6', 
            borderLeft: '5px solid #fa8c16', 
            padding: '20px', 
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            textAlign: 'left',
            marginBottom:'20px'
          }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#d46b08', fontSize: '18px', fontWeight: 'bold' }}>
              🏖️ Información de Solicitud de Vacaciones Regulares
            </h5>
            <p style={{ margin: 0, fontSize: '14px', color: '#444', lineHeight: '1.6' }}>
              Utilice este formulario para solicitar el disfrute y pago de sus <strong>periodos vacacionales cumplidos</strong>.
              <br/>
              Debe seleccionar la fecha de inicio de las vacaciones, el periodo mas antiguo disponible y su fecha de retorno al trabajo.
            <span style={{ display: 'block', marginTop: '10px',fontWeight: '500', backgroundColor: 'rgba(255, 155, 24, 0.21)', padding: '8px', borderRadius: '4px' }}>
              👉<strong>Nota:</strong> Por política de la empresa, los empleados que estan a punto de cumplir su primer periodo laboral deben estrictamente esperar a que cumpla su fecha de ingreso para solicitar vacaciones.
            </span>
            </p>
            
          </div>
        </div>
        {error && <Alert variant="danger" onClose={()=> setError(null)}  dismissible><AlertHeading>Error <hr/></AlertHeading>{error}</Alert>}
        <FormularioVacaciones 
          fetchVacaciones={fetchVacaciones} 
          previousRequestStatus={previousRequestStatus} 
          checkPreviousRequest={checkPreviousRequest} 
        />
        <br/>
        <h2>Lista de Vacaciones</h2>   
         {/* NUEVO DISEÑO DE ESTADOS */}
        
        <ListaVacaciones 
            vacaciones={vacaciones} 
            fetchVacaciones={fetchVacaciones} 
            hasPreviousRequest={!!previousRequestStatus} 
            checkPreviousRequest={checkPreviousRequest} 
        />
      </div>
      
      
    </>

  );
}

export default SolicitarVacaciones;