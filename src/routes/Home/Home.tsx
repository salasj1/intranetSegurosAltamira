import { useEffect,useRef, useState } from "react";
import NavbarEmpresa from "../../components/NavbarEmpresa";
import styles from "@/routes/Home/styles/Home.module.css";
import CountUp from "../../components/react-bits/CountUp";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaFileContract, FaReceipt, FaHandHoldingUsd,  FaBuilding, FaBullseye, FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa";
import { FaRoute} from 'react-icons/fa';
import { SiGoogledocs } from "react-icons/si";
/* import useAuth from  '../auth/AuthProvider' */
import Carrusel from "@/routes/Home/components/Carrusel";
import panfleto from '@/assets/Panfleto.png';

import logoCostura from '@/assets/logo-costura.jpg';
import logoCristal from '@/assets/logo-cristal.jpeg';
import logoChip from '@/assets/logo-chip.png';
import ConozcamonosModal from "../Home/components/ConozcamonosModal";
import { useAuth } from "@/auth/AuthProvider";
import { PiCursorClickLight } from "react-icons/pi";

const apiUrl = import.meta.env.VITE_API_URL;

function Home() {
  const [vacacionesProcesadas, setVacacionesProcesadas] = useState(0);
  const [permisosProcesados, setPermisosProcesados] = useState(0);
  const { nombres, sexo} = useAuth();
  console.log("Nombres del usuario:", nombres); // Verifica que los nombres se están recibiendo correctamente
  const [showConozcamonosModal, setShowConozcamonosModal] = useState(false); // <-- 2. Renombra el estado para claridad
  const [statsLoaded, setStatsLoaded] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [expedienteVisible, setExpedienteVisible] = useState(false);
  const expedienteRef = useRef<HTMLDivElement>(null);
  const [animatedItems, setAnimatedItems] = useState<{[key: string]: boolean}>({});

  const handleAnimationEnd = (itemId: string) => {
    setAnimatedItems(prev => ({ ...prev, [itemId]: true }));
  };

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    if (statsRef.current && !statsLoaded) {
      observer = new window.IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            // Solo ejecuta la consulta la primera vez que es visible
            const fetchCounts = async () => {
              try {
                const res = await axios.get(`${apiUrl}/estadisticas/TotalVacacionesYPermisos`);
                setVacacionesProcesadas(res.data.totalVacaciones);
                setPermisosProcesados(res.data.totalPermisos);
                setStatsLoaded(true);
              } catch (error) {
                console.error("Error fetching counts:", error);
              }
            };
            fetchCounts();
            observer?.disconnect(); // Detiene el observer después de cargar
          }
        },
        { threshold: 0.2 } // 20% visible
      );
      observer.observe(statsRef.current);
    }
    return () => {
      observer?.disconnect();
    };
  }, [statsLoaded]);
  
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    if (expedienteRef.current && !expedienteVisible) {
      observer = new window.IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setExpedienteVisible(true);
            observer?.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(expedienteRef.current);
    }
    return () => {
      observer?.disconnect();
    };
  }, [expedienteVisible]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axios.get(`${apiUrl}/estadisticas/TotalVacacionesYPermisos`);
        setVacacionesProcesadas(res.data.totalVacaciones);
        setPermisosProcesados(res.data.totalPermisos);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

  // ...existing imports...
  const [bentoVisible, setBentoVisible] = useState(false);
  const bentoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    if (bentoRef.current && !bentoVisible) {
      observer = new window.IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setBentoVisible(true);
            observer?.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(bentoRef.current);
    }
    return () => {
      observer?.disconnect();
    };
  }, [bentoVisible]);

  return (
    <>
      <NavbarEmpresa />
      <Carrusel nombres={nombres} sexo={sexo} />
      <div className={styles.homeCanvas}>
        {/* Primer Bento Grid */}
        <div className={styles.parent1}>
          <div className={`${styles.div1} ${styles.card}`}>
            <h3>Estadísticas Clave</h3>
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <CountUp to={vacacionesProcesadas} duration={2} separator="." />
                <span>Vacaciones Procesadas</span>
              </div>
              <div className={styles.statItem}>
                <CountUp to={permisosProcesados} duration={2} separator="." />
                <span>Permisos Procesados</span>
              </div>
            </div>
          </div>
          <div className={`${styles.div2} ${styles.card}`}  style={{padding: '0px'}}>
            {/* Coloca tu imagen aquí */}
            <img src={panfleto} alt="Imagen de la empresa" />
            {/* <h4>Intranet Seguros Altamira</h4> */}
          </div>
          <div className={`${styles.div3} ${styles.card} ${styles.shortcutCard}`}>
             <Link to="/expediente/documentos" className={styles.shortcutLink}>
                <SiGoogledocs size={60} />
                <span style={{fontSize: '1.65rem'}}>Revisa tus Documentos</span>
            </Link>
          </div>
          <div className={`${styles.div4} ${styles.card} ${styles.shortcutCard}`}>
            <Link to="/RecibodePago" className={styles.shortcutLink}>
                <FaReceipt size={80} />
                <span style={{fontSize: '1.65rem'}}>Recibos de Pago</span>
            </Link>
            {/* <Link to="/ConstaciaDeTrabajo" className={styles.shortcutLink}>
                <FaFileContract size={40} />
                <span>Constancia de Trabajo</span>
            </Link> */}
          </div>
          <div className={`${styles.div5} ${styles.card}`} style={{padding: '0px'}}>
             {/* Coloca tu imagen aquí */}
             <img src={logoCostura} alt="Imagen de la empresa 2" className={styles.bentoImageFill}  />
          </div>
          <div className={`${styles.div6} ${styles.card} ${styles.shortcutCard}`}>
            <Link to="/expediente/rutograma" className={styles.shortcutLink}>
                <FaRoute size={100} />
               {/*  <img src ={logoCostura} height={50} width={50}></img> */}
                <span style={{fontSize: '2.5rem'}}>Rutograma</span>
            </Link>
          </div>
        </div>
        <section style={{ backgroundColor: '#003896', width: '110vw'}}>
          {/* 1. CONTENEDOR PRINCIPAL
            Este div ahora sirve como el "lienzo". Se le añade position: 'relative' 
            para que las capas internas (fondo y texto) puedan posicionarse respecto a él.
          */}
          <div
            ref={expedienteRef}
            title="Actualiza el expediente"
            style={{
              position: 'relative',
              width: '100%',
              height: '80vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            {/* 2. CAPA DE FONDO Y OPACIDAD
              Este div se dedica únicamente a mostrar la imagen de fondo con opacidad.
              Es absoluto para que ocupe todo el espacio del padre y se pone detrás con zIndex.
            */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url("https://kinesisco.com/wp-content/uploads/2023/11/automatizacion-procesos-administrar-archivos-manera-eficiente-base-datos-documentos-documentacion-linea.jpg")`, 
                backgroundPosition: 'center center', 
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                opacity: '.35', // La opacidad solo afecta a esta capa.
                zIndex: 1, // Se asegura que esté por debajo del contenido.
                transition: 'background 0.3s, border-radius 0.3s, opacity 0.3s'
              }}
            ></div>

            {/* 3. CAPA DE CONTENIDO (TEXTO)
              Este div es hermano del anterior. Contiene todo el texto.
              Se le da un zIndex mayor para que se muestre por encima de la capa del fondo.
              Ya no necesita el 'opacity: 1'.
            */}
             <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  fontFamily: ' "Gotham", Sans-serif',
                  lineHeight: "1.2",
                  color: "#FFF",
                  textShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  maxWidth: "1000px",
                  width: '100%',
                  textAlign: 'center',
                  padding: '1rem'
                }}
              >
                <p className={expedienteVisible ? `${styles.fadeInUp} ${styles.fadeInUpDelay1}` : ''}  style={{ fontWeight: 100, fontSize: "4.5rem"}}>
                  Actualiza tu expediente
                </p>
                <p className={expedienteVisible ? `${styles.fadeInUp} ${styles.fadeInUpDelay2}` : ''} style={{ fontSize: "2.2rem", fontWeight: 400 , fontFamily: '"Grape Nuts", Sans-serif'}}>
                  Consulta y actualiza tus datos personales, revisa tu rutograma y accede a tus documentos importantes de forma segura y rápida.
                </p>
                <Link to="/expediente/datos">
                  <button
                    className={`${styles.botton} ${styles.bottonPrimary} `}
                  >
                    Dirigete Ya
                  </button>
                </Link>
              </div>
            </div>
      </section>  
      {/* Segundo Bento Grid */}
      <div ref={bentoRef} className={styles.grid}>
        <div
          id="item0"
          className={`${styles.card} ${styles.item0} ${bentoVisible ? 
            animatedItems['item0']
          ? '' // Ya terminó la animación, solo .card
          : `${styles.slideInLeft} ${styles.slideDelay1}` : styles.bentoHiddenLeft}`}
          style={{padding: '0px'}}
            onAnimationEnd={() => handleAnimationEnd('item0')}
        >
          <picture style={{ display: 'flex', width: '100%', height: '100%' }}>
            <source media="(max-width: 768px)" srcSet={logoChip} />
            <img 
              src={logoCristal} 
              alt="Logo de la empresa" 
              className={styles.bentoImageFill}
            />
          </picture>
        </div>
        <div
          id="item1"
          className={`${styles.card} ${styles.item1} ${bentoVisible ?  animatedItems['item1']
          ? '' : `${styles.slideInLeft} ${styles.slideDelay2}` : styles.bentoHiddenLeft}`}
          onAnimationEnd={() => handleAnimationEnd('item1')}
        >
          <h3><FaBullseye /> Misión</h3>
            <p>Ofrecer protección y tranquilidad a nuestros clientes,
               a través de soluciones de seguros innovadoras y un servicio de excelencia,
               respaldados por un equipo humano comprometido y una sólida solvencia financiera.</p>
            <h3><FaBuilding /> Visión</h3>
            <p>Ser la empresa de seguros líder en Venezuela,
               reconocida por nuestra confiabilidad, agilidad y cercanía con el cliente,
               contribuyendo al desarrollo del país y al bienestar de la sociedad.
            </p>
        </div>
        <div
          id="item2"
          className={
            `${styles.card} ${styles.item2} ${
              bentoVisible
                ? animatedItems['item2']
                  ? ''
                  : `${styles.slideInRight} ${styles.slideDelay1}`
                : styles.bentoHiddenRight
            }`
          }
          onAnimationEnd={() => handleAnimationEnd('item2')}
          style={{
            background: "linear-gradient(120deg, #003391 0%, #4f7ccf 60%, #fd8719 100%)", // azul profundo, azul medio, naranja vibrante
            cursor: 'pointer' // <-- 3. Añade cursor pointer para indicar que es clickeable
          }}
          
          onClick={() => setShowConozcamonosModal(true)} // <-- 4. Añade el evento onClick
        >
          <h1 style={{ color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>Conózcamonos
            <PiCursorClickLight style={{marginTop:30}}/>
          </h1>
            <p className={styles.text3}
            >
              Descubre al equipo que impulsa el crecimiento y éxito de nuestra empresa.
            </p>
        </div>
        <div
          id="item3"
              className={
          `${styles.card} ${styles.item3} ${
            bentoVisible
              ? animatedItems['item3']
                ? ''
                : `${styles.slideInRight} ${styles.slideDelay2}`
              : styles.bentoHiddenRight
          }`
        }
        onAnimationEnd={() => handleAnimationEnd('item3')}
        >
          <Link to="/ConstanciaDeTrabajo" className={styles.shortcutLink}>
                <FaFileContract size={60} />
                <span style={{fontSize: '1.65rem'}}>Constancia de Trabajo</span>
            </Link>
        </div>
        <div
          id="item4"
          className={
                `${styles.card} ${styles.item4} ${
                  bentoVisible
                    ? animatedItems['item4']
                      ? ''
                      : `${styles.slideInRight} ${styles.slideDelay3}`
                    : styles.bentoHiddenRight
                }`
              }
              onAnimationEnd={() => handleAnimationEnd('item4')}
        >
          <Link to="/Prestaciones" className={styles.shortcutLink}>
                <FaHandHoldingUsd size={60} />
                <span style={{fontSize: '1.65rem'}}>Prestaciones Sociales</span>
            </Link>
        </div>
      </div>
        
      {/* 5. Renderiza el componente del modal */}
      <ConozcamonosModal 
        show={showConozcamonosModal} 
        onHide={() => setShowConozcamonosModal(false)} 
      />
        
      {/* Footer con Redes Sociales */}
      <footer className={styles.footer}>
            <p>Síguenos en nuestras redes sociales</p>
            <div className={styles.socialLinks}>
                <a href="https://www.linkedin.com/company/seguros-altamira/" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                <a href="https://www.instagram.com/segurosaltamira/" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                <a href="https://www.facebook.com/segurosaltamira" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>   
            </div>
            <p>&copy; {new Date().getFullYear()} Seguros Altamira, C.A. Todos los derechos reservados.</p>
        </footer>
      </div>
    </>
  );
}

export default Home;