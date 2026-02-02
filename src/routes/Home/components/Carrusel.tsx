import Carousel from 'react-bootstrap/Carousel';
import styles from '../styles/Carrusel.module.css';
import bienvenida from '@/assets/webp/32anos.webp';
import { Link } from 'react-router-dom';

interface CarruselProps {
  nombres: string | null;
  sexo: string | null;
}

function getPrimerNombre(nombres: string | null): string {
  if (!nombres) return '';
  const primerNombre = nombres.trim().split(' ')[0];
  return primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();
}

function Carrusel({ nombres, sexo='M' }: CarruselProps) {
  const nombre = getPrimerNombre(nombres);

  return (
    <Carousel className={styles.Carrusel} pause={'hover'}>
      <Carousel.Item>
        <div className={styles.divDegradado2}>
          <img
            className={`${styles.imagenCarrusel} ${styles.imagenCarruselGrande}`}
            src={bienvenida}
            alt='bienvenida'
            about='Bienvenida'
            width={100}
            height={50}
            loading='eager'
          />
        </div>
        <Carousel.Caption>
          <div>
            <h1 className={styles.caption1}>
              ¡Bienvenid{sexo === 'F' ? 'a' : 'o'}{nombre ? ',' : ''} {nombre}!
            </h1>
            <p
              className={styles.captionP}
              style={{
              textShadow: '2px 2px 6px rgba(0,0,0,0.6)',
              }}
            >
              Nos alegra tenerte en la Intranet de Seguros Altamira.
            </p>
          </div>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <div className={styles.divDegradado}>
          <img
            className={`${styles.imagenCarrusel} ${styles.imagenCarruselGrande}`}
            src='https://www.segurosaltamira.com/wp-content/uploads/2024/03/seg-fina.webp'
            alt='Imagen1'
          />
        </div>
        <Carousel.Caption>
          <h1 className={styles.caption1}>¡Bienvenid{sexo === 'F' ? 'a' : 'o'} a la Intranet de Seguros Altamira!</h1>
          <p className={styles.captionP}>Aquí podrás consultar información relevante y solicitar peticiones como empleado</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <div className={styles.divDegradado}>
          <img
            className={`${styles.imagenCarrusel} ${styles.imagenCarruselGrande}`}
            src='https://www.segurosaltamira.com/wp-content/uploads/2024/06/fon-patri.webp'
            alt='Imagen2'
          />
        </div>
        <Carousel.Caption>
          <h1 className={styles.caption1}>Consulta toda tu información</h1>
          <p className={styles.captionP}>Aqui podrás consultar todo referente a tus Recibos de Pago, movimientos de Prestaciones, permisos, ARC y mucho más</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <div className={styles.divDegradado}>
          <img
            className={`${styles.imagenCarrusel} ${styles.imagenCarruselGrande}`}
            src='https://www.segurosaltamira.com/wp-content/uploads/2024/03/ban-hosa.webp'
            alt='Imagen3'
          />
        </div>
        <Carousel.Caption>
          <h1 className={styles.caption1}>Solicita los permisos y vacaciones</h1>
          <p className={styles.captionP}>
            En este medio podrás solicitar tus permisos y vacaciones de manera rápida y sencilla
          </p>
          <div className={styles.buttonContainer}>
            <Link to="/SolicitarVacaciones" className={styles.carouselBtn}>
              🏖️ Solicitar Vacaciones
            </Link>
            <Link to="/SolicitarPermisos" className={styles.carouselBtn}>
              <img  src="https://img.icons8.com/color/48/visa-stamp.png" alt="visa-stamp" style={{width:'30px', height:'30px'}}/> Solicitar Permisos
            </Link>
          </div>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default Carrusel;