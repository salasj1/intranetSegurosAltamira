import React,{ useState,  useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { FaRoute} from 'react-icons/fa';
import axios from 'axios';
import style from '../styles/ExpedienteEmpleado.module.css';
import ReporteRutograma from '../components/ReporteRutograma'; // Importa el componente


interface IntroRutogramaProps {
  onStart: () => void;
  global: any;
  handlePreviousPhase: any;
}

const getEstadoLabel = (estado: string | null) => {
  if (estado === "Pendiente") return { label: "Pendiente de revisión", color: "#ff9800", bg: "#fff7e6", border: "#ff9800" };
  if (estado === "Aprobado") return { label: "Aprobado", color: "#188648", bg: "#e6fff2", border: "#1bbf63" };
  if (estado === "Devuelto") return { label: "Devuelto para corrección", color: "#e53935", bg: "#ffeaea", border: "#e53935" };
  return { label: "Borrador", color: "#003f9e", bg: "#e6f0ff", border: "#003f9e" };
};

const IntroRutograma: React.FC<IntroRutogramaProps> = ({
  onStart,
  global
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const [tiposTransporte, setTiposTransporte] = useState<any[]>([]);
  const [tiposActividad, setTiposActividad] = useState<any[]>([]);
  const estado = global.globalState?.estado || global.rutogramaEstado || "Borrador";
  const comentario = global.globalState?.comentarios_revision || global.comentarioRutograma || null;
  const estadoInfo = getEstadoLabel(estado);


  // Datos necesarios para el PDF

const apiUrl = import.meta.env.VITE_API_URL;

useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    axios.get(`${apiUrl}/expediente/getTiposTransporte`)
      .then(res => {
        if (res.data?.success && res.data?.tiposTransporte) {
          setTiposTransporte(res.data.tiposTransporte);
        }
      });
    axios.get(`${apiUrl}/expediente/getTipoActividadesExtra`)
      .then(res => {
        if (res.data?.success && res.data?.tiposActividadesExtra) {
          setTiposActividad(res.data.tiposActividadesExtra);
        }
      });
  }, []);
  const handleVisualizarPDF = async () => {
    try {
      
      const rutogramaId = global.globalState?.id;
      if (!rutogramaId) return;
      const response = await axios.get(`${apiUrl}/expediente/rutograma/${rutogramaId}/preview-pdf`);
      if (response.data?.success && response.data?.data) {
        setPdfData(response.data.data);
        setShowPreview(true);
      } else {
        alert('No se pudo obtener el rutograma para visualizar.');
      }
    } catch (error) {
      alert('Error al obtener el PDF del rutograma.');
    }
  };

  if (showPreview && pdfData) {
    return (
      <>
        {/* Boton para colocarlo a la derecha y que no sea absolute */}
        <Button variant='secondary' onClick={() => setShowPreview(false)} style={{ position: 'relative', float: 'right',marginTop: 4 }}>Cerrar</Button>
        <ReporteRutograma
          rutogramaData={pdfData}
          tiposTransporte={tiposTransporte}
          tiposActividad={tiposActividad}
        />
      </>
    );
  }


  return (
    <>
      <div className='container' style={{maxWidth:900, position:'relative'}}>
        {/* Estado rutograma destacado */}
        <span
          style={{
            position: 'absolute',
            top: 18,
            right: 24,
            zIndex: 2,
            fontWeight: 600,
            fontSize: 18,
            padding: '6px 18px',
            borderRadius: 18,
            background: estadoInfo.bg,
            color: estadoInfo.color,
            border: `2px solid ${estadoInfo.border}`
          }}
        >
          {estadoInfo.label}
        </span>
        <Card style={{padding:'2.5rem 2rem', borderRadius:24, boxShadow:'0 10px 30px rgba(0,75,251,0.65)'}}>
          <h2 style={{display:'flex',alignItems:'center',gap:12,color:'#003f9e'}}><FaRoute width={'100%'} size={30}/> Rutograma</h2>
          <p style={{fontSize:16, lineHeight:1.5, marginTop:16}}>
            {estado === "Pendiente" && "Tu rutograma fue enviado y está pendiente de revisión por Recursos Humanos. Puedes visualizarlo pero no editarlo."}
            {estado === "Aprobado" && "¡Muy bien! Tu rutograma ha sido aprobado. El siguiente paso es descargarlo, imprimirlo y entregarlo firmado en el departamento de Recursos Humanos."}
            {estado === "Devuelto" && "Tu rutograma fue devuelto para corrección. Lee el comentario y realiza los cambios necesarios antes de reenviarlo."}
            {estado === "Borrador" && "Antes de comenzar, necesitaremos que describas detalladamente tus rutas de ida y regreso entre tu domicilio y el centro de trabajo, los medios de transporte y actividades que realizas. Podrás guardar un borrador y regresar luego."}
          </p>
          {(estado === "Borrador" || estado === "Devuelto" ) && (
            <ul style={{fontSize:14, color:'#495057'}}>
              <li>Completa primero la sección de ida y luego continúa con la de regreso.</li>
              <li>Puedes alternar entre secciones sin perder la información (auto-guardado local en el navegador).</li>
              <li>Los campos con <span style={{color:'#dc3545'}}>*</span> son obligatorios.</li>
            </ul>
          )}
          {/* Mostrar comentario si está Devuelto */}
          {estado === "Devuelto" && comentario && (
            <Alert variant="warning" style={{margin:'18px 0', padding:'12px 18px', borderRadius:8}}>
              <b>Comentario de revisión:</b>
              <div style={{whiteSpace:'pre-wrap'}}>{comentario}</div>
            </Alert>
          )}
          <div style={{display:'flex', gap:12, marginTop:24, flexWrap:'wrap'}}>
            {/* Botón para iniciar/revisar formulario */}
            {(estado === "Borrador"  || estado === "Devuelto") ? (
                <Button size='lg' onClick={onStart}>
                    {estado === "Devuelto" ? "Revisar Formulario" : "Iniciar Formulario"}
                </Button>
            ) : null}

            {/* Botón para visualizar (siempre que exista un ID) */}
            {(global.globalState?.id && (estado === "Pendiente" || estado === "Aprobado")) ? (
              <Button
                size='lg'
                style={{ background: '#ff9800', border: 'none', color: '#fff', fontWeight: 600 }}
                onClick={onStart}
              >
                Visualizar Rutograma
              </Button>
            ): null}

            {/* Botón para descargar (solo si está aprobado) */}
          {global.globalState?.id && (estado === "Aprobado") ? (
              <Button
                variant="primary"
                style={{ background: '#ff9800', border: 'none', color: '#fff', fontWeight: 600, fontSize: 20 }}
                onClick={handleVisualizarPDF}
              >
                Visualizar PDF
              </Button>
            ): null}
          </div>
        </Card>
      </div>
{/*       <div className={style.BotonesRutas}>
        <Button variant='secondary' onClick={handlePreviousPhase}>Anterior</Button>
        <Button variant='primary' onClick={global.handleNextPhase}>Siguiente</Button>
      </div> */}
    </>
  );
};

export default IntroRutograma;
