import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AcordionPermisos from '../components/AcordionPermisos';
import AcordionSolicitarPermiso from '../components/AcordionSolicitarPermisos';
import NavbarEmpresa from '../components/NavbarEmpresa';
import styles from '../css/SolicitarProcesos.module.css';
import DeViaje from '../assets/a-day-off-animate.svg?react';
import { BsFillInfoSquareFill } from "react-icons/bs";
function SolicitarPermisos() {
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();
  const [showSuggestion, setShowSuggestion] = useState(true);

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <>
      <NavbarEmpresa />
      <div className={styles.canvas}>
        <h1 className={styles.h1}>Solicitar Permisos / Restos de días de vacaciones pendientes </h1>
        
        {/* CONTENEDOR PRINCIPAL: Limita el ancho máximo para que todo se vea ordenado */}
        <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* --- FILA SUPERIOR: Información + Alerta --- */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            gap: '20px',
            flexWrap: 'wrap' // Permite que baje en móviles
          }}>
            
            {/* 1. TEXTO EXPLICATIVO (Izquierda) */}
            <div style={{ 
              flex: '1', // Ocupa el espacio restante
              minWidth: '300px', // Ancho mínimo antes de bajar
              backgroundColor: '#e6f7ff', 
              borderLeft: '5px solid #1890ff', 
              padding: '20px', 
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              textAlign: 'left'
            }}>
              <h5 style={{ margin: '0 0 10px 0', color: '#0050b3', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px', fontSize: '22px' }}><BsFillInfoSquareFill size={30} /></span> Información del Módulo
              </h5>
              <div style={{ margin: 0, fontSize: '15px', color: '#444', lineHeight: '1.6' }}>
              Este módulo está destinado exclusivamente para:
              <ul style={{ marginTop: '5px', marginBottom: '10px', paddingLeft: '20px' }}>
                <li>Solicitar <strong>Permisos</strong> (Citas médicas, diligencias, etc.).</li>
                <li>Tomar el resto de días de <strong>vacaciones pendientes</strong> (días que ya fueron pagados previamente de un periodo tomado pero no disfrutados).</li>
              </ul>
            <span style={{ display: 'block', marginTop: '10px', color: '#003a8c', fontWeight: '500', backgroundColor: 'rgba(24, 144, 255, 0.1)', padding: '8px', borderRadius: '4px' }}>
                👉 <strong>Nota:</strong> Si requiere la segunda opción, debe elegir el motivo: <em>"Días de Vacaciones No disfrutados"</em> en el formulario.
              </span>
              

              
              <span style={{ display: 'block', marginTop: '10px', color: '#003a8c', fontWeight: '500', backgroundColor: 'rgba(24, 144, 255, 0.1)', padding: '8px', borderRadius: '4px' }}>
                👉 <strong>Nota 2:</strong> Por política de la empresa, los restos de días pendientes de vacaciones deben tomarse como días <strong>completos</strong> (no se permiten fracciones).
              </span>
              </div>
            </div>

            {/* 2. ALERTA SUGERENCIA (Derecha) */}
            {showSuggestion && (
              <div
                className="animate__animated animate__fadeInRight"
                style={{
                  width: '300px', // Ancho fijo
                  flexShrink: 0,
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <button 
                  onClick={() => setShowSuggestion(false)}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#999' }}
                  title="Cerrar sugerencia"
                >✕</button>
                
                <DeViaje className="animated" style={{ width: '100px', marginBottom: '10px' }} />
                <h5 style={{ color: '#389e0d', margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>
                  ¿Buscas Vacaciones Regulares?
                </h5>
                <p style={{ color: '#555', textAlign: 'center', marginBottom: '15px', fontSize: '13px', lineHeight: '1.4' }}>
                  Si deseas solicitar vacaciones de tus <strong>periodos cumplidos</strong> (para pago y disfrute estándar), este no es el módulo correcto.
                </p>
                <button
                  style={{
                    background: '#389e0d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => navigate('/SolicitarVacaciones')}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  Ir a Solicitar Vacaciones
                </button>
              </div>
            )}
          </div>
            
          {/* --- FILA INFERIOR: Formulario (Centrado y Ancho Completo) --- */}
          <div style={{ width: '100%' }}>
            <AcordionSolicitarPermiso onRefresh={handleRefresh} />
          </div>

        </div>

        <br />
        <br />
        <h3 className={styles.h3}>Permisos Solicitados</h3>
        {/* --- NUEVO DISEÑO DE ESTADOS (Reemplazando el bloque de texto anterior) --- */}
        
        <AcordionPermisos refresh={refresh} />
        <br/>
            <h4>Estados de una solicitud de Permiso</h4>

        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            width: '100%', 
            marginBottom: '25px', 
            marginTop: '10px' 
        }}>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px', 
                width: '100%', 
                maxWidth: '1100px' 
            }}>
                
                {/* Tarjeta: Solicitada */}
                <div style={{ 
                    backgroundColor: '#fff7e6', 
                    border: '1px solid #f0f0f0', 
                    borderTop: '4px solid #faad14', 
                    borderRadius: '8px', 
                    padding: '15px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
                    transition: 'transform 0.2s'
                }}>
                    <h6 style={{ color: '#faad14', fontWeight: 'bold', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>⏳</span> Pendiente
                    </h6>
                    <p style={{ fontSize: '12px', color: '#1d1d1dff', margin: 0, lineHeight: '1.4' }}>
                        Enviada y en espera de revisión por su supervisor.
                    </p>
                </div>

                {/* Tarjeta: Aprobada */}
                <div style={{ 
                    backgroundColor: '#bcdfffff', 
                    border: '1px solid #f0f0f0', 
                    borderTop: '4px solid #1890ff', 
                    borderRadius: '8px', 
                    padding: '15px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04)'
                }}>
                    <h6 style={{ color: '#1890ff', fontWeight: 'bold', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>👍</span> Aprobado
                    </h6>
                    <p style={{ fontSize: '12px', color: '#1d1d1dff', margin: 0, lineHeight: '1.4' }}>
                        Aceptada por supervisor. En gestión de Capital Humano.
                    </p>
                </div>

                {/* Tarjeta: Procesada */}
                <div style={{ 
                    backgroundColor: '#d8ffc4ff', 
                    border: '1px solid #f0f0f0', 
                    borderTop: '4px solid #52c41a', 
                    borderRadius: '8px', 
                    padding: '15px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04)'
                }}>
                    <h6 style={{ color: '#52c41a', fontWeight: 'bold', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>✅</span> Procesada
                    </h6>
                    <p style={{ fontSize: '12px', color: '#1d1d1dff', margin: 0, lineHeight: '1.4' }}>
                        Registrada y completada por Capital Humano.
                    </p>
                </div>

                {/* Tarjeta: Rechazada */}
                <div style={{ 
                    backgroundColor: '#ffc0c1ff', 
                    border: '1px solid #f0f0f0', 
                    borderTop: '4px solid #ff4d4f', 
                    borderRadius: '8px', 
                    padding: '15px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04)'
                }}>
                    <h6 style={{ color: '#ff4d4f', fontWeight: 'bold', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>🚫</span> Rechazado
                    </h6>
                    <p style={{ fontSize: '12px', color: '#1d1d1dff', margin: 0, lineHeight: '1.4' }}>
                        Denegada por supervisor o Capital Humano.
                    </p>
                </div>

            </div>
        </div>
      </div>
    </>
  );
}

export default SolicitarPermisos;