import Carousel from 'react-bootstrap/Carousel';
import styles from '../styles/Carrusel.module.css';
import bienvenida from '@/assets/webp/32anos.webp';
import cumpleanosImg from '@/assets/webp/imagen-torta.webp';
import podioImg from '@/assets/webp/podio.webp';
import trofeoImg from '@/assets/webp/trofeo.webp';
import worldcupImg from '@/assets/webp/worldcup.webp';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { useState, useEffect } from 'react';
import { Balloons, Confetti, Sparkles, BurstOverlay } from './Celebration';
import Liston from './Liston';
interface CarruselProps {
  nombres: string | null;
  sexo: string | null;
}

function getPrimerNombre(nombres: string | null): string {
  if (!nombres) return '';
  const primerNombre = nombres.trim().split(' ')[0];
  return primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();
}

function parseDateOnly(dateStr: string | null): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const datePart = dateStr.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length !== 3) return null;
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10) - 1,
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

  const [burstKey, setBurstKey] = useState(0);
  useEffect(() => {
    if (cumpleanos || aniversario) setBurstKey(k => k + 1);
  }, [cumpleanos, aniversario]);

  useEffect(() => {
    const target = new Date();
    target.setHours(1, 0, 0, 0);
    // Si ya pasó la 1 AM hoy, apuntar a mañana
    if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
    const timer = setTimeout(() => window.location.reload(), target.getTime() - Date.now());
    return () => clearTimeout(timer);
  }, []);

  const renderPrimerSlide = () => {
    // ✅ Si coinciden ambos el mismo día, gana el aniversario laboral
    if (aniversario) {
      return (
        <Carousel.Item>
          <div className={styles.divDegradadoAniversario}>
            {/* Fondo del podio */}
            <img
              className={styles.imagenPodio}
              src={podioImg}
              alt='podio aniversario'
              loading='eager'
            />
            {/* Spotlight detrás del trofeo */}
            <div className={styles.podioSpotlight} aria-hidden="true" />

            {/* Efectos */}
            <Sparkles count={20} />
            <Confetti count={80} speedMul={1} />
            <BurstOverlay trigger={burstKey} />

            {/* Trofeo */}
            <div className={styles.trofeoWrap}>
              <div className={styles.trofeoGlow} aria-hidden="true" />
              <img
                className={styles.trofeoImg}
                src={trofeoImg}
                alt='trofeo año laboral'
                loading='eager'
              />
            </div>

            {/* Manos aplaudiendo */}
            <div className={`${styles.manos} ${styles.manosLeft}`} aria-hidden="true" />
            <div className={`${styles.manos} ${styles.manosRight}`} aria-hidden="true" />

            {/* 🎀 Listón con mensaje */}
            <Liston
              texto="Gracias por tu dedicación y compromiso con Seguros Altamira."
              color="azul"
            />
          </div>

          <Carousel.Caption>
            <div>
              <h1 className={styles.caption1Aniversario}>
                ¡{anos !== 1 ?  'Felices': 'Feliz'} <span className={styles.yearsPop}>{anos !== 1 ? anos:'aniversario'} {anos !== 1 ? 'años' : ''}</span><br />
                con nosotros, {nombre}!
              </h1>
              {/* ❌ Eliminar el <p className={styles.captionPAniversario}> de aquí */}
            </div>
          </Carousel.Caption>
        </Carousel.Item>
      );
    }

    if (cumpleanos) {
      return (
        <Carousel.Item>
          <div className={styles.divDegradadoCumpleanos}>
            <img
              className={styles.imagenTorta}
              src={cumpleanosImg}
              alt='cumpleaños'
              loading='eager'
            />
            <Sparkles count={20} />
            <Balloons count={30} speedMul={1} />
            <Confetti count={80} speedMul={1} />
            <BurstOverlay trigger={burstKey} />
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
                Todo el equipo de Seguros Altamira te desea un día muy especial.
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
            src={worldcupImg}
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
              style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.6)' }}
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