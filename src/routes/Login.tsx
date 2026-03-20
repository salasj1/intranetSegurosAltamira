import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CSSTransition } from 'react-transition-group';
import { Navigate, useNavigate } from 'react-router-dom';
import '../css/Login.css';
import { useAuth } from '../auth/AuthProvider';
import axios from 'axios';
import { Mosaic } from "react-loading-indicators";
import styles from '../css/loading.module.css';
import FloatingLabel from 'react-bootstrap/esm/FloatingLabel';
import Form from 'react-bootstrap/esm/Form';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import { FaEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";
import img from '../assets/webp/logo-login-2.webp';
declare const VANTA: any;

function Login() {
    const [inProp, setInProp] = useState(false);
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const auth = useAuth();
    const navigate = useNavigate();
    const nodeRef = useRef(null);
    const vantaRef = useRef<HTMLDivElement>(null);
    // useRef en lugar de useState para evitar que la actualización
    // dispare una re-ejecución del effect y cree un canvas duplicado.
    const vantaEffectRef = useRef<any>(null);

    useEffect(() => {
        // Inicializar Vanta solo una vez
        if (!vantaEffectRef.current && vantaRef.current) {
            vantaEffectRef.current = VANTA.WAVES({
                el: vantaRef.current,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: window.innerHeight,
                minWidth: window.innerWidth,
                scale: 1,
                scaleMobile: 1.00,
                color: 0x36bb,
                waveSpeed: 1.20,
                zoom: 1.2,


            });
        }

        // Simular un pequeño retraso para cargar el fondo y el contenido
        const timeout = setTimeout(() => {
            setIsLoading(false);
            setInProp(true);
        }, 1000);

        // Actualizar el efecto al cambiar el tamaño de la pantalla
        const handleResize = () => {
            if (vantaEffectRef.current) {
                vantaEffectRef.current.setOptions({
                    minHeight: window.innerHeight,
                    minWidth: window.innerWidth
                });
                vantaEffectRef.current.resize();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (vantaEffectRef.current) {
                vantaEffectRef.current.destroy();
                vantaEffectRef.current = null;
            }
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // [] → se ejecuta UNA SOLA VEZ al montar el componente

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.post(`${apiUrl}/login`, { username: usuario, password });
            const success = await auth.login(usuario, password);
            if (!success) {
                setError(response.data.message);
            }
        } catch (err) {
            console.error(err);
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError(err.response.data.message);
                }
                if (err.message === 'Network Error') {
                    setError('Error en el servidor, por favor intenta más tarde');
                }
            } else {
                console.error(err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (auth.isAuthenticated) {
        if (auth.isAdmin) {
            return <Navigate to="/Admin" />;
        }
        if (auth.cod_emp) {
            const lastValidPath = localStorage.getItem("lastValidPath");
            if (lastValidPath && lastValidPath !== '/' && lastValidPath !== '/login') {
                return <Navigate to={lastValidPath} replace />;
            }
            return <Navigate to="/home" />;
        }
    }

    return (
        <div ref={vantaRef} className="responsive-container">
            {isLoading ? (
                <div className={styles.loadingContainer}>
                    <Mosaic color={["white"]} size="large" />
                </div>
            ) : (
                <>
                    <div className="text-center" style={{ color: 'white', position: 'relative', zIndex: 1 }}>
                        <img src={img} alt="Logo Empresa" style={{ width: '180px', height: '137.33px', marginTop: '2rem', filter: 'drop-shadow(15px 15px 10px rgb(25,50,134))' }} className='logo-text' />
                        <h1 style={{ fontFamily: 'segoe ui, sans-serif', fontSize: '3.2rem' }}>Intranet Seguros Altamira</h1>
                        <hr style={{ borderWidth: '5px', color: 'white', width: '100%', position: 'relative' }}></hr>
                        <p style={{ fontSize: '30px', fontWeight: 'bold' }}>Entendemos la vida</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <CSSTransition in={inProp} nodeRef={nodeRef} timeout={300} classNames="fade" unmountOnExit>
                            <div ref={nodeRef} className="d-flex justify-content-center align-items-center " style={{ zoom: '1.3' }}>
                                <div className="card p-4 shadow" style={{ width: '20rem', margin: '0 auto' }}>
                                    <div className="text-center">
                                        <img src='https://www.segurosaltamira.com/wp-content/uploads/2024/03/logo-head.svg' alt="Logo Empresa" style={{ width: '180px' }} />
                                    </div>
                                    <div>
                                        <h2 className="text-center mb-3">Iniciar Sesión</h2>
                                    </div>
                                    {error && !isLoading && <div className="alert alert-danger">{error}</div>}
                                    {isLoading && <div className={styles.loadingDocument}><Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="medium" /></div>}
                                    {!isLoading && (
                                        <>
                                            <InputGroup size="sm" className="mb-3">
                                                <FloatingLabel label="Correo Empresarial">
                                                    <Form.Control type="text" id="usuario" placeholder="Ingresa tu correo empresarial" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
                                                </FloatingLabel>
                                            </InputGroup>
                                            <InputGroup size="sm" className="mb-3">
                                                <FloatingLabel label="Contraseña">
                                                    <Form.Control
                                                        type={showPassword ? "text" : "password"}
                                                        id="password"
                                                        placeholder="Ingresa tu contraseña"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </FloatingLabel>
                                                <InputGroup.Text>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        style={{ textDecoration: 'none', color: '#003896' }}
                                                    >
                                                        {showPassword ? <FaEye /> : <IoMdEyeOff />}
                                                    </button>
                                                </InputGroup.Text>
                                            </InputGroup>
                                            <div className="mb-3">
                                                <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                                                    {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
                                                </button>
                                            </div>
                                            <div className="mb-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary w-100"
                                                    onClick={() => navigate('/change-password-verify', { state: { email: usuario } })}
                                                >
                                                    Cambiar Contraseña
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CSSTransition>
                    </form>
                </>
            )}
        </div>
    );
}

export default Login;