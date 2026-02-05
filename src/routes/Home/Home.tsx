import { useEffect,useRef, useState } from "react";
import NavbarEmpresa from "../../components/NavbarEmpresa";
import styles from "@/routes/Home/styles/Home.module.css";
import CountUp from "../../components/react-bits/CountUp";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaFileContract, FaReceipt, FaHandHoldingUsd,  FaBuilding, FaBullseye, FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa";
import { FaRoute} from 'react-icons/fa';
import { SiGoogledocs } from "react-icons/si";
import { TbWorld } from "react-icons/tb";
/* import useAuth from  '../auth/AuthProvider' */
import Carrusel from "@/routes/Home/components/Carrusel";
import rutas from '@/assets/webp/rutas.webp';
import logoCostura from '@/assets/webp/logo-costura.webp';
import logoCristal from '@/assets/webp/logo-cristal.webp';
import logoChip from '@/assets/webp/logo-chip.webp';
import ConozcamonosModal from "../Home/components/ConozcamonosModal";
import { useAuth } from "@/auth/AuthProvider";
import { PiCursorClickLight } from "react-icons/pi";
import SomosSeguros from "@/assets/webp/somos-seguros-altamira.webp";
import { IoMdPerson } from "react-icons/io";
const apiUrl = import.meta.env.VITE_API_URL;

function Home() {
  const [vacacionesProcesadas, setVacacionesProcesadas] = useState(0);
  const [permisosProcesados, setPermisosProcesados] = useState(0);
  const { nombres, sexo} = useAuth();
  const [showConozcamonosModal, setShowConozcamonosModal] = useState(false); // <-- 2. Renombra el estado para claridad
  const [statsLoaded, setStatsLoaded] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [expedienteVisible, setExpedienteVisible] = useState(false);
  const expedienteRef = useRef<HTMLDivElement>(null);
  const [animatedItems, setAnimatedItems] = useState<{[key: string]: boolean}>({});

  const handleAnimationEnd = (itemId: string) => {
    setAnimatedItems(prev => ({ ...prev, [itemId]: true }));
  };

  // Lógica de Caché y Observer unificada
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    if (statsRef.current && !statsLoaded) {
      observer = new window.IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            
            const fetchCounts = async () => {
              // 1. Definir claves para el caché
              const CACHE_KEY = 'stats_rrhh_data';
              const CACHE_TIME_KEY = 'stats_rrhh_timestamp';
              const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos en milisegundos

              const cachedData = sessionStorage.getItem(CACHE_KEY);
              const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
              const now = new Date().getTime();

              // 2. Verificar si existe caché y si es válido (menos de 15 min)
              if (cachedData && cachedTime && (now - parseInt(cachedTime) < CACHE_DURATION)) {
                const parsed = JSON.parse(cachedData);
                setVacacionesProcesadas(parsed.totalVacaciones);
                setPermisosProcesados(parsed.totalPermisos);
                setStatsLoaded(true);
                return; // Salimos sin llamar a la API
              }

              // 3. Si no hay caché válido, llamamos a la API
              try {
                const res = await axios.get(`${apiUrl}/estadisticas/TotalVacacionesYPermisos`);
                
                // Actualizamos estado
                setVacacionesProcesadas(res.data.totalVacaciones);
                setPermisosProcesados(res.data.totalPermisos);
                setStatsLoaded(true);

                // 4. Guardamos en caché
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(res.data));
                sessionStorage.setItem(CACHE_TIME_KEY, now.toString());

              } catch (error) {
                console.error("Error fetching counts:", error);
              }
            };
            fetchCounts();
            observer?.disconnect(); 
          }
        },
        { threshold: 0.2 } 
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
          {/* AQUI FALTABA AGREGAR EL ref={statsRef} */}
          <div className={`${styles.div1} ${styles.card}`} ref={statsRef}>
            <h3>Indicadores del personal</h3>
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <CountUp to={vacacionesProcesadas} duration={2} separator="." />
                <span>Total de Vacaciones procesadas</span>
              </div>
              <div className={styles.statItem}>
                <CountUp to={permisosProcesados} duration={2} separator="." />
                <span>Total de Permisos procesados</span>
              </div>
            </div>
          </div>
          <div className={`${styles.div2} ${styles.card}`}  style={{padding: '0px'}}>
            {/* Coloca tu imagen aquí */}
            <img src={SomosSeguros} alt="Imagen de la empresa" style={{objectFit:'cover'}} loading="eager"/>
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
             <img src={logoCostura} alt="Imagen de la empresa 2" className={styles.bentoImageFill}  loading="lazy"/>
          </div>
          <div className={`${styles.div6} ${styles.card} ${styles.shortcutCard}`}>
            <Link to="/expediente/datos" className={styles.shortcutLink}>
                <IoMdPerson size={100}  />
               {/*  <img src ={logoCostura} height={50} width={50}></img> */}
                <span style={{fontSize: '2.5rem'}}>Datos personales</span>
            </Link>
          </div>
        </div>
        {/* <NavidadCard/> */}
        
        <section className={styles.heroFullBleed}>
          <div
            ref={expedienteRef}
            title="Actualiza el expediente"
            className={styles.heroContainer}
            style={{ ['--hero-bg' as any]: rutas ? `url(${rutas})` : 'none' }}
          >
            <div className={styles.heroBgOverlay}></div>
            <div className={styles.heroContent}>
              <p
                className={`${expedienteVisible ? `${styles.fadeInUp} ${styles.fadeInUpDelay1}` : ''} ${styles.heroTitle}`}
              >
                Actualiza tu Rutograma  y <br /> tu Expediente Personal
              </p>
              <p
                className={`${expedienteVisible ? `${styles.fadeInUp} ${styles.fadeInUpDelay2}` : ''} ${styles.heroSubtitle}`}
              >
                Consulta tus datos personales,  actualiza el nuevo rutograma y accede a tus documentos importantes de forma segura y rápida.
              </p>
              <Link to="/expediente/rutograma">
                <button className={`${styles.botton} ${styles.bottonPrimary}`}>
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
            <source media="(max-width: 768px)" srcSet={logoChip}/>
            <img 
              src={logoCristal} 
              alt="Logo de la empresa" 
              className={styles.bentoImageFill}
              loading="lazy"
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
                <a href="https://www.segurosaltamira.com" target="_blank" rel="noopener noreferrer"><TbWorld /></a>
            </div>
            <p>&copy; {new Date().getFullYear()} Seguros Altamira, C.A. Todos los derechos reservados.</p>
        </footer>
      </div>
    </>
  );
}

export default Home;