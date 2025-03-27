import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CSSTransition } from 'react-transition-group';
import { Link, Navigate } from 'react-router-dom';
import '../css/Login.css';
import { useAuth } from '../auth/AuthProvider';
import axios from 'axios';
import { Mosaic } from "react-loading-indicators";
import styles from '../css/loading.module.css';
function Login() {
    const [inProp, setInProp] = useState(false);
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Nuevo estado para controlar la carga
    const auth = useAuth();
    const nodeRef = useRef(null);

    useEffect(() => {
        setInProp(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true); // Activar el estado de carga
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.post(`${apiUrl}/login`, { username: usuario, password });
            console.log(response?.data);
            const success = await auth.login(usuario, password);
            if (!success) {
                console.log("RESPUESTAS " + response.data.message);
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
            setIsLoading(false); // Desactivar el estado de carga
        }
    };

    if (auth.isAuthenticated) {
        return <Navigate to="/home" />;
    }

    return (
        <form onSubmit={handleSubmit}>
            <CSSTransition in={inProp} nodeRef={nodeRef} timeout={300} classNames="fade" unmountOnExit>
                <div ref={nodeRef} className="d-flex justify-content-center align-items-center vh-100">
                    <div className="card p-4 shadow" style={{ width: '20rem', margin: '0 auto' }}>
                        <div className="text-center">
                            <img src='https://www.segurosaltamira.com/wp-content/uploads/2024/03/logo-head.svg' alt="Logo Empresa" style={{ width: '180px' }} />
                        </div>
                        <div className="">
                            <h1 className="text-center mb-2" style={{ marginLeft: '-2px', color: "#003896" }}>Intranet</h1>
                            <h2 className="text-center mb-3" style={{ marginLeft: '-2px' }}>Iniciar Sesión</h2>
                        </div>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {isLoading && <div className={styles.loadingDocument} style={{display:'flex', flexDirection:'column'}}> <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="medium" text="" textColor="#0d1bff" />
                        <h2 style={{color:"#003391"}}>Cargando </h2></div>}
                        {
                            !isLoading && <>
                        <div className="mb-3">
                            <label htmlFor="usuario" className="form-label">Correo Empresarial</label>
                            <input type="text" className="form-control" id="usuario" placeholder="Ingresa tu correo empresarial" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="current-password" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input type="password" className="form-control" id="password" placeholder="Ingresa tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                                {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
                            </button>
                        </div>
                        <div className="mb-3">
                            <Link to="/change-password-verify" className="btn btn-primary w-100 text-center">
                                Cambiar Contraseña
                            </Link>
                        </div>
                        </>
                        }
                        
                    </div>
                </div>
            </CSSTransition>
        </form>
    );
}

export default Login;