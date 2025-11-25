import { useState, useEffect } from 'react';
import NavbarEmpresa from '../components/NavbarEmpresa';
import ListaAprobacionPermisos from '../components/ListaAprobacionPermisos';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from "react-router-dom";
import palmTree from '../assets/palm tree-rafiki.svg'; // Asegúrate de importar la imagen
import { BsFillInfoSquareFill } from "react-icons/bs";
const apiUrl = import.meta.env.VITE_API_URL;

function AprobarPermisos() {
  const [permisos, setPermisos] = useState([]);
  const { cod_emp, canApprovePermits } = useAuth();
  const navigate = useNavigate();
  const [showSuggestion, setShowSuggestion] = useState(true); // Estado para la alerta

  useEffect(() => {
    if (!canApprovePermits) {
      navigate('/home');
    }
  }, [canApprovePermits, navigate]);

  const fetchPermisos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/permisos/supervisor/${cod_emp}`);
      setPermisos(response.data);
    } catch (error) {
      console.error('Error al obtener permisos:', error);
    }
  };

  useEffect(() => {
    fetchPermisos();
  }, []);

  return (
    <>
      <NavbarEmpresa />
      <div className="canvas">
        <h1>Aprobar Permisos</h1>

        {/* CONTENEDOR DE INFORMACIÓN Y ALERTA */}
        <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          
          {/* INFORMACIÓN DEL MÓDULO */}
          <div style={{ 
            flex: '1', 
            minWidth: '300px', 
            backgroundColor: '#e6f7ff', 
            borderLeft: '5px solid #1890ff', 
            padding: '20px', 
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            textAlign: 'left'
          }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#0050b3', fontSize: '18px', fontWeight: 'bold' }}>
               <BsFillInfoSquareFill size={30} style={{marginRight:'10px'}}/>Información del Módulo
            </h5>
            <p style={{ margin: 0, fontSize: '14px', color: '#444', lineHeight: '1.6' }}>
              En este módulo usted como supervisor podrá aprobar o rechazar solicitudes de:
              <ul style={{ marginTop: '5px', marginBottom: '0', paddingLeft: '20px' }}>
                <li><strong>Permisos Especiales:</strong> Citas médicas, diligencias personales, etc.</li>
                <li><strong>Días de Vacaciones No Disfrutados:</strong> Solicitud para descontar días de vacaciones ya pagados que el colaborador no utilizó.</li>
              </ul>
            </p>
            <div style={{ marginTop: '10px', color: '#003a8c', fontWeight: '500', backgroundColor: 'rgba(24, 144, 255, 0.05)', padding: '10px', borderRadius: '4px' }}>
                <strong>Estados de la solcitud de un permiso:</strong>
                <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px', color: '#444', fontWeight: '400' }}>
                <li><strong>Pendiente:</strong> La solicitud ha sido enviada para su revisión.</li>
                <li><strong>Aprobado:</strong> La solicitud fue aceptada por el supervisor directo.</li>
                <li><strong>Procesada:</strong> La solicitud fue registrada y completada por Capital Humano.</li>
                <li><strong>Rechazado:</strong> La solicitud fue denegada por el supervisor directo o Capital Humano.</li>
                </ul>
            </div>
          </div>

          {/* ALERTA DE REDIRECCIÓN A VACACIONES */}
          {showSuggestion && (
            <div className="animate__animated animate__fadeInRight" style={{
              width: '300px', flexShrink: 0, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <button onClick={() => setShowSuggestion(false)} style={{ position: 'absolute', top: '5px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#999' }}>✕</button>
              
              <img src={palmTree} alt="Vacaciones" style={{ width: '50px', marginBottom: '5px' }} />
              
              <h6 style={{ color: '#389e0d', margin: '0 0 5px 0', fontWeight: 'bold', textAlign: 'center' }}>¿Buscas Aprobar Vacaciones?</h6>
              <p style={{ fontSize: '12px', textAlign: 'center', marginBottom: '10px', color: '#555' }}>Para solicitudes de vacaciones regulares.</p>
              
              <button
                style={{ background: '#389e0d', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 15px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                onClick={() => navigate('/AprobarVacaciones')}
              >
                Ir a Aprobar Vacaciones
              </button>
            </div>
          )}
        </div>

        <ListaAprobacionPermisos permisos={permisos} fetchPermisos={fetchPermisos} />
      </div>
    </>
  );
}

export default AprobarPermisos;