import Carousel from 'react-bootstrap/Carousel';
import styles from '../styles/Carrusel.module.css';
import bienvenida from '@/assets/webp/32anos.webp';
// Placeholders: reemplaza estos imports con las imágenes definitivas
import cumpleanosImg from '@/assets/webp/32anos.webp';
import aniversarioImg from '@/assets/webp/32anos.webp';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';

interface CarruselProps {
  nombres: string | null;
  sexo: string | null;
}

function getPrimerNombre(nombres: string | null): string {
  if (!nombres) return '';
  const primerNombre = nombres.trim().split(' ')[0];
  return primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();
}

/**
 * Extrae año, mes (0-indexado) y día de un string de fecha ISO
 * sin conversión de zona horaria para evitar desfases de un día.
 */
function parseDateOnly(dateStr: string | null): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const datePart = dateStr.split('T')[0]; // "YYYY-MM-DD"
  const parts = datePart.split('-');
  if (parts.length !== 3) return null;
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10) - 1, // 0-indexed
    day: parseInt(parts[2], 10),
  };
}

function esCumpleanos(fecha_nac: string | null): boolean {
  const parts = parseDateOnly(fecha_nac);
  if (!parts) return false;
  const hoy = new Date();
  return hoy.getMonth() === parts.month && hoy.getDate() === parts.day;
}

function esAniversarioEmpresa(fecha_ing: string | null): boolean {
  const parts = parseDateOnly(fecha_ing);
  if (!parts) return false;
  const hoy = new Date();
  // Solo celebrar si lleva al menos 1 año en la empresa
  return (
    hoy.getMonth() === parts.month &&
    hoy.getDate() === parts.day &&
    hoy.getFullYear() > parts.year
  );
}

function calcularAnosEnEmpresa(fecha_ing: string | null): number {
  const parts = parseDateOnly(fecha_ing);
  if (!parts) return 0;
  return new Date().getFullYear() - parts.year;
}

function Carrusel({ nombres, sexo = 'M' }: CarruselProps) {
  const nombre = getPrimerNombre(nombres);
  const { fecha_nac, fecha_ing } = useAuth();

  const cumpleanos = esCumpleanos(fecha_nac);
  const aniversario = esAniversarioEmpresa(fecha_ing);
  const anos = calcularAnosEnEmpresa(fecha_ing);

  const renderPrimerSlide = () => {
    if (cumpleanos) {
      return (
        <Carousel.Item>
          <div className={styles.divDegradadoCumpleanos}>
            <img
              className={`${styles.imagenCarrusel} ${styles.imagenCarruselGrande}`}
              src={cumpleanosImg}
              alt='cumpleaños'
              width={100}
              height={50}
              loading='eager'
            />
          </div>
          <Carousel.Caption>
            <div>
              <h1 className={styles.caption1}>
                ¡Feliz Cumpleaños, {nombre}!
              </h1>
              <p
                className={styles.captionP}
                style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.6)' }}
              >
                Todo el equipo de Seguros Altamira te desea un día muy especial. 🎉
              </p>
            </div>
          </Carousel.Caption>
        </Carousel.Item>
      );
    }

    if (aniversario) {
      return (
        <Carousel.Item>
          <div className={styles.divDegradadoAniversario}>
            <img
              className={`${styles.imagenCarrusel} ${styles.imagenCarruselGrande}`}
              src={aniversarioImg}
              alt='aniversario en la empresa'
              width={100}
              height={50}
              loading='eager'
            />
          </div>
          <Carousel.Caption>
            <div>
              <h1 className={styles.caption1}>
                ¡Felices {anos} año{anos !== 1 ? 's' : ''} con nosotros, {nombre}!
              </h1>
              <p
                className={styles.captionP}
                style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.6)' }}
              >
                Gracias por tu dedicación y compromiso con Seguros Altamira. ¡Feliz aniversario!
              </p>
            </div>
          </Carousel.Caption>
        </Carousel.Item>
      );
    }

    return (
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
    );
  };

  return (
    <Carousel className={styles.Carrusel} pause={'hover'}>
      {renderPrimerSlide()}
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
              <img src="https://img.icons8.com/color/48/visa-stamp.png" alt="visa-stamp" style={{ width: '30px', height: '30px' }} /> Solicitar Permisos
            </Link>
          </div>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default Carrusel;
