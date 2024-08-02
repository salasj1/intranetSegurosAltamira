import Carousel from 'react-bootstrap/Carousel';

import '../css/Carrusel.css';

function Carrusel() {
  return (
    <Carousel>
      <Carousel.Item>
        <div className='divDegradado'>
            <img className='imagenCarrusel imagenCarruselGrande' src='https://www.segurosaltamira.com/wp-content/uploads/2024/03/seg-fina.webp' alt='Imagen1'></img>
        </div>
        <Carousel.Caption>
          <h1 className='caption1'>¡Bienvenido a la Intranet de Seguros Altamira!</h1>
          <p>Aquí podrás consultar información relevante y solicitar peticiones como empleado</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <div className='divDegradado'>
            <img className='imagenCarrusel imagenCarruselGrande' src='https://www.segurosaltamira.com/wp-content/uploads/2024/06/fon-patri.webp' alt='Imagen2' />
        </div>
        <Carousel.Caption>
          <h1 className='caption1'>Consulta toda tu información</h1>
          <p>Aqui podrás consultar todo referente a tus Recibos de Pago, movimientos de Prestaciones, permisos, ARC y mucho más</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
      <div className='divDegradado'>
            <img className='imagenCarrusel imagenCarruselGrande' src='https://www.segurosaltamira.com/wp-content/uploads/2024/03/ban-hosa.webp' alt='Imagen3'></img>
        </div>
        <Carousel.Caption>
          <h1 className='caption1'>Solicita los permisos y vacaciones</h1>
          <p>
            En este medio podrás solicitar tus permisos y vacaciones de manera rápida y sencilla
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default Carrusel;