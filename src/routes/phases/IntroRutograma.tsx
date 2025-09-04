import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaRoute } from 'react-icons/fa';
import style from '../../css/ExpedienteEmpleado.module.css';

interface IntroRutogramaProps {
  onStart: () => void;
  global: any;
  handlePreviousPhase: any;
}
  
const IntroRutograma: React.FC<IntroRutogramaProps> = ({
  onStart,
  global,
  handlePreviousPhase
}) => (
  <>
    <div className='container' style={{maxWidth:900}}>
      <Card style={{padding:'2.5rem 2rem', borderRadius:24, boxShadow:'0 10px 30px rgba(0,75,251,0.65)'}}>
        <h2 style={{display:'flex',alignItems:'center',gap:12,color:'#003f9e'}}><FaRoute/> Rutograma</h2>
        <p style={{fontSize:16, lineHeight:1.5, marginTop:16}}>Antes de comenzar, necesitaremos que describas detalladamente tus rutas de ida y regreso entre tu domicilio y el centro de trabajo, los medios de transporte y actividades que realizas. Podrás guardar un borrador y regresar luego.</p>
        <ul style={{fontSize:14, color:'#495057'}}>
          <li>Completa primero la sección de ida y luego continúa con la de regreso.</li>
          <li>Puedes alternar entre secciones sin perder la información (auto-guardado local en el navegador).</li>
          <li>Los campos con <span style={{color:'#dc3545'}}>*</span> son obligatorios.</li>
        </ul>
        <div style={{display:'flex', gap:12, marginTop:24, flexWrap:'wrap'}}>
          <Button size='lg' onClick={onStart}>Iniciar Formulario</Button>
        </div>
      </Card>
    </div>
    <div className={style.BotonesRutas}>
      <Button variant='secondary' onClick={handlePreviousPhase}>Anterior</Button>
      <Button variant='primary' onClick={global.handleNextPhase}>Siguiente</Button>
    </div>
  </>
);

export default IntroRutograma;
