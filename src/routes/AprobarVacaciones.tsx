import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import ListaAprobacionVacacaciones from "../components/ListaAprobacionVacacaciones";
import NavbarEmpresa from "../components/NavbarEmpresa";
import axios from "axios";
import { Alert, AlertHeading } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Mosaic } from "react-loading-indicators";
import stylesLoading from "../css/loading.module.css";

const apiUrl = import.meta.env.VITE_API_URL;

export interface Vacacion {
  VacacionID: number;
  DiasVacaciones: number;
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
  const { cod_emp, canApproveVacations } = useAuth();
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [showSuggestion, setShowSuggestion] = useState(true); // Estado para la alerta

  useEffect(() => {
    if (!canApproveVacations)  {
      navigate('/home');
    } else {
      fetchVacaciones();
    }
  }, [canApproveVacations, navigate]);

  const fetchVacaciones = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/vacaciones/supervisor/${cod_emp}`);
      setVacaciones(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching vacaciones:', error.message);
      } else {
        console.error('Error:', error);
      }
      setError('Error al cargar los datos de las vacaciones');
    }
    setIsLoading(false);
  };

  return (
    <>
      <NavbarEmpresa />
      <div className="canvas">
        <h1>Aprobar Vacaciones</h1>
        
        {/* CONTENEDOR DE INFORMACIÓN Y ALERTA */}
        <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          
          {/* INFORMACIÓN DEL MÓDULO */}
          <div style={{ 
            flex: '1', 
            minWidth: '300px', 
            backgroundColor: '#fff7e6', // Un tono naranja suave para diferenciar de permisos
            borderLeft: '5px solid #fa8c16', 
            padding: '20px', 
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            textAlign: 'left'
          }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#d46b08', fontSize: '18px', fontWeight: 'bold' }}>
              🏖️ Información del módulo
            </h5>
            <p style={{ margin: 0, fontSize: '14px', color: '#444', lineHeight: '1.6' }}>
              En este módulo usted podrá gestionar las solicitudes de <strong>Vacaciones Regulares</strong>.
              <br/>
              Estas corresponden a los periodos anuales cumplidos por el trabajador para su disfrute y pago estándar.
            </p>
          </div>

          {/* ALERTA DE REDIRECCIÓN A PERMISOS */}
          {showSuggestion && (
            <div className="animate__animated animate__fadeInRight" style={{
              width: '300px', flexShrink: 0, background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <button onClick={() => setShowSuggestion(false)} style={{ position: 'absolute', top: '5px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#999' }}>✕</button>
              
              <div style={{ fontSize: '30px', marginBottom: '5px' }}><img  src="https://img.icons8.com/color/48/visa-stamp.png" alt="visa-stamp" style={{width:'45px', height:'45px'}}/></div>
              
              <h6 style={{ color: '#0050b3', margin: '0 0 5px 0', fontWeight: 'bold', textAlign: 'center' }}>¿Buscas Aprobar Permisos?</h6>
              <p style={{ fontSize: '12px', textAlign: 'center', marginBottom: '10px', color: '#555' }}>Para permisos especiales o descontados a cuenta de días de vacaciones restantes.</p>
              
              <button
                style={{ background: '#1890ff', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 15px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                onClick={() => navigate('/AprobarPermisos')}
              >
                Ir a Aprobar Permisos
              </button>
            </div>
          )}
        </div>

        {error && <Alert variant="danger" onClose={()=> setError(null)}  dismissible><AlertHeading>Error <hr/></AlertHeading>{error}</Alert>}
        {isLoading ? (
          <div className={stylesLoading.loadingDocument}>
            <Mosaic color={["#003391","#1A5FFA","#33CCCC","#1A3FFA"]} size="large" text="" textColor="#0d1bff" />
          </div>
        ) : (
          <ListaAprobacionVacacaciones vacaciones={vacaciones} fetchVacaciones={fetchVacaciones} />
        )}
      </div>
    </>
  );
}

export default AprobarVacaciones;